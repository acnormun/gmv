const { app, BrowserWindow, dialog, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const net = require('net')
const fs = require('fs');
const os = require('os');
const treeKill = require('tree-kill');

const BACKEND_PORT = 5000;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
const FRONTEND_DEV_PORT = 5173;
const FRONTEND_DEV_URL = `http://localhost:${FRONTEND_DEV_PORT}`;

let backendProcess = null;
let mainWindow = null;
let loadingWindow = null;
let isQuitting = false;

const isPackaged = app.isPackaged;
const isDev = process.argv.includes('--dev') || !isPackaged;

const logFile = path.join(os.homedir(), 'gmv-app.log');
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    try {
        fs.appendFileSync(logFile, logMessage + '\n');
    } catch (error) {
    }
}

log('=== GMV Sistema Iniciando ===');
log(`Modo: ${isDev ? 'Desenvolvimento' : 'Produção'}`);
log(`Empacotado: ${isPackaged}`);

function findBackendPath() {
    const possiblePaths = [
        path.join(__dirname, 'gmv-server'),
        path.join(__dirname, 'backend'),
        path.join(__dirname, '..', 'gmv-server'),
        path.join(process.resourcesPath, 'backend'),
        path.join(process.resourcesPath, 'gmv-server'),
        path.join(process.resourcesPath, 'app', 'backend'),
        path.join(process.resourcesPath, 'app', 'gmv-server'),
        path.join(path.dirname(process.execPath), 'backend'),
        path.join(path.dirname(process.execPath), 'gmv-server')
    ];
    for (const backendPath of possiblePaths) {
        const appPy = path.join(backendPath, 'app.py');
        if (fs.existsSync(appPy)) {
            log(`Backend encontrado: ${backendPath}`);
            return backendPath;
        }
    }
    log('ERRO: Backend não encontrado!');
    return null;
}

function findFrontendPath() {
    const possiblePaths = [
        path.join(__dirname, 'gmv-web', 'dist'),
        path.join(__dirname, 'frontend', 'dist'),
        path.join(__dirname, '..', 'gmv-web', 'dist'),
        path.join(process.resourcesPath, 'frontend', 'dist'),
        path.join(process.resourcesPath, 'gmv-web', 'dist'),
        path.join(process.resourcesPath, 'app', 'frontend', 'dist'),
        path.join(process.resourcesPath, 'app', 'gmv-web', 'dist')
    ];
    for (const frontendPath of possiblePaths) {
        const indexHtml = path.join(frontendPath, 'index.html');
        if (fs.existsSync(indexHtml)) {
            log(`Frontend encontrado: ${frontendPath}`);
            return frontendPath;
        }
    }
    log('Frontend dist não encontrado, tentando modo dev...');
    return null;
}

async function findPython() {
    const commands = ['python', 'python3', 'py'];
    for (const cmd of commands) {
        try {
            const result = await new Promise((resolve, reject) => {
                const proc = spawn(cmd, ['--version'], { 
                    stdio: 'pipe',
                    shell: true 
                });
                let output = '';
                proc.stdout.on('data', (data) => {
                    output += data.toString();
                });
                proc.stderr.on('data', (data) => {
                    output += data.toString();
                });
                proc.on('close', (code) => {
                    if (code === 0 && output.includes('Python')) {
                        resolve({ command: cmd, version: output.trim() });
                    } else {
                        reject(new Error(`Código de saída: ${code}`));
                    }
                });
            });
            log(`Python encontrado: ${result.command} (${result.version})`);
            return result.command;
        } catch (error) {
            continue;
        }
    }
    throw new Error('Python não encontrado no sistema');
}

async function startBackend() {
    const backendPath = findBackendPath();
    if (!backendPath) {
        throw new Error('Backend não encontrado');
    }
    const pythonCmd = await findPython();
    const appPy = path.join(backendPath, 'app.py');
    log(`Iniciando backend: ${pythonCmd} ${appPy}`);
    const proc = spawn(pythonCmd, [appPy], {
        cwd: backendPath,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        env: {
            ...process.env,
            PYTHONUNBUFFERED: '1',
            PYTHONIOENCODING: 'UTF-8',
            PYTHONUTF8: '1',
            PORT: BACKEND_PORT.toString()
        }
    });
    proc.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
            log(`[BACKEND] ${output}`);
        }
    });
    proc.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output && !output.includes('WARNING')) {
            log(`[BACKEND ERROR] ${output}`);
        }
    });
    proc.on('close', (code) => {
        log(`Backend encerrado com código: ${code}`);
        if (!isQuitting && code !== 0) {
            dialog.showErrorBox('Erro', 'O servidor backend parou inesperadamente');
        }
    });
    return proc;
}

async function waitForBackend(
    url,
    { maxAttempts = 60, initialDelay = 5000 } = {}
) {
    if (initialDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, initialDelay));
    }
    for (let i = 0; i < maxAttempts; i++) {
        try {
            await new Promise((resolve, reject) => {
                const { hostname, port } = new URL(url);
                const socket = net.connect(port, hostname);
                socket.once('connect', () => {
                    socket.destroy();
                    const req = http.get(`${url}/health`, (res) => {
                        res.resume();
                        if (res.statusCode === 200) {
                            resolve();
                        } else {
                            reject(new Error(`Status ${res.statusCode}`));
                        }
                    });
                    req.on('error', reject);
                    req.setTimeout(2000, () => {
                        req.destroy();
                        reject(new Error('Timeout'));
                    });
                });
                socket.once('error', reject);
                socket.setTimeout(2000, () => {
                    socket.destroy();
                    reject(new Error('Timeout'));
                });
            });
            log('Backend respondendo!');
            return true;
        } catch (error) {
            if (i === maxAttempts - 1) {
                throw new Error('Backend não respondeu a tempo');
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

async function checkFrontendDev() {
    try {
        await new Promise((resolve, reject) => {
            const req = http.get(FRONTEND_DEV_URL, resolve);
            req.on('error', reject);
            req.setTimeout(2000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
        });
        log('Frontend dev server detectado');
        return true;
    } catch (error) {
        return false;
    }
}

function createLoadingWindow() {
    log('Abrindo janela de carregamento...');
    loadingWindow = new BrowserWindow({
        width: 300,
        height: 200,
        frame: false,
        resizable: false,
        show: false,
        webPreferences: {
            contextIsolation: true,
            devTools: false
        }
    });
    const loadingPath = path.join(__dirname, 'assets', 'loading.html');
    loadingWindow.loadFile(loadingPath)
        .then(() => {
            if (loadingWindow) {
                loadingWindow.show();
            }
        })
        .catch(err => {
            log(`Erro ao carregar loading: ${err.message}`);
        });
    loadingWindow.on('closed', () => {
        loadingWindow = null;
    });
}

async function createWindow() {
    log('Criando janela principal...');
    const frontendDevRunning = await checkFrontendDev();
    let loadUrl;
    if (isDev && frontendDevRunning) {
        loadUrl = FRONTEND_DEV_URL;
        log('Carregando frontend do servidor de desenvolvimento');
    } else {
        const frontendPath = findFrontendPath();
        if (!frontendPath) {
            throw new Error('Frontend não encontrado. Execute o build do frontend primeiro.');
        }
        const indexPath = path.join(frontendPath, 'index.html');
        loadUrl = `file://${indexPath}`;
        log(`Carregando frontend do arquivo: ${indexPath}`);
    }
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            devTools: true,
            webSecurity: false
        },
        show: false,
        title: 'GMV Sistema',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        titleBarStyle: 'default'
    });
    if (!isDev) {
        Menu.setApplicationMenu(null);
    }
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (loadingWindow) {
            loadingWindow.close();
        }
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
        log('Janela exibida');
    });
    try {
        if (loadUrl.startsWith('file://')) {
            await mainWindow.loadFile(loadUrl.replace('file://', ''));
        } else {
            await mainWindow.loadURL(loadUrl);
        }
        log('Frontend carregado com sucesso');
    } catch (error) {
        log(`Erro ao carregar frontend: ${error.message}`);
        throw error;
    }
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F12' || 
            (input.control && input.shift && input.key === 'I')) {
            mainWindow.webContents.toggleDevTools();
        }
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
        log('Janela fechada');
    });
}

async function cleanupProcesses() {
    if (backendProcess && !backendProcess.killed) {
        log('Encerrando processo backend...');
        try {
            await new Promise((resolve) => {
                treeKill(backendProcess.pid, 'SIGTERM', (err) => {
                    if (err) {
                        log(`Erro ao encerrar backend: ${err.message}`);
                        treeKill(backendProcess.pid, 'SIGKILL', resolve);
                    } else {
                        log('Backend encerrado com sucesso');
                        resolve();
                    }
                });
            });
        } catch (error) {
            log(`Erro na limpeza: ${error.message}`);
        }
        backendProcess = null;
    }
}

app.whenReady().then(async () => {
    try {
        log('Electron pronto, iniciando aplicação...');
        createLoadingWindow();
        log('Iniciando backend...');
        backendProcess = await startBackend();
        log('Aguardando backend...');
        await new Promise(resolve => setTimeout(resolve,15000 ));
        await waitForBackend(BACKEND_URL);
        log('Criando janela...');
        await createWindow();
        log('=== GMV Sistema iniciado com sucesso ===');
    } catch (error) {
        log(`ERRO CRÍTICO: ${error.message}`);
        const errorMsg = `Falha ao iniciar o GMV Sistema:\n\n${error.message}\n\nVerifique:\n• Python está instalado\n• Dependências do backend instaladas\n• Frontend foi compilado (npm run build)\n\nLog: ${logFile}`;
        dialog.showErrorBox('Erro de Inicialização', errorMsg);
        await cleanupProcesses();
        app.quit();
    }
});

app.on('window-all-closed', async () => {
    log('Todas as janelas foram fechadas');
    isQuitting = true
    await cleanupProcesses();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', async (event) => {
    if (!isQuitting) {
        event.preventDefault();
        isQuitting = true;
        log('Encerrando aplicação...');
        await cleanupProcesses();
        setTimeout(() => {
            app.exit(0);
        }, 1000);
    }
});

app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createLoadingWindow();
        await createWindow();
    }
});

process.on('uncaughtException', async (error) => {
    log(`UNCAUGHT EXCEPTION: ${error.message}`);
    await cleanupProcesses();
    app.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    log(`UNHANDLED REJECTION: ${reason}`);
});

log('main.js carregado');