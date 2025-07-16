const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const os = require('os');

class GMVCompleteSetup {
    constructor() {
        this.projectPath = __dirname;
        this.appName = 'GMV Sistema';
        this.exeName = 'GMV Sistema.exe';
        this.results = {
            node: false,
            python: false,
            dependencies: false,
            backend: false,
            frontend: false,
            build: false,
            shortcut: false
        };
    }

    async run() {
        console.log('🚀 GMV SISTEMA - SETUP COMPLETO');
        console.log('================================\n');
        try {
            await this.checkPrerequisites();
            await this.setupEnvironment();
            await this.installDependencies();
            await this.buildProject();
            await this.createShortcut();
            await this.finalMessage();
        } catch (error) {
            console.error('❌ ERRO NO SETUP:', error.message);
            process.exit(1);
        }
    }

    async checkPrerequisites() {
        console.log('🔍 Verificando pré-requisitos...');
        try {
            const nodeVersion = await this.runCommand('node --version');
            console.log(`✅ Node.js: ${nodeVersion.trim()}`);
            this.results.node = true;
        } catch (error) {
            console.log('❌ Node.js não encontrado');
            console.log('💡 Instale Node.js em: https://nodejs.org/');
            throw new Error('Node.js é obrigatório');
        }
        try {
            const pythonVersion = await this.runCommand('python --version');
            console.log(`✅ Python: ${pythonVersion.trim()}`);
            this.results.python = true;
        } catch (error) {
            try {
                const pythonVersion = await this.runCommand('python3 --version');
                console.log(`✅ Python3: ${pythonVersion.trim()}`);
                this.results.python = true;
            } catch (error2) {
                console.log('❌ Python não encontrado');
                console.log('💡 Instale Python em: https://python.org/');
                throw new Error('Python é obrigatório');
            }
        }
        const requiredDirs = ['backend', 'frontend'];
        for (const dir of requiredDirs) {
            if (fs.existsSync(path.join(this.projectPath, dir))) {
                console.log(`✅ Pasta ${dir} encontrada`);
            } else {
                console.log(`❌ Pasta ${dir} não encontrada`);
                throw new Error(`Estrutura do projeto incompleta: falta pasta ${dir}`);
            }
        }
    }

    async setupEnvironment() {
        console.log('\n⚙️ Configurando ambiente...');
        const envPath = path.join(this.projectPath, '.env');
        if (!fs.existsSync(envPath)) {
            const envContent = `# Configurações do GMV Sistema
# Edite os caminhos conforme necessário para este PC

# Arquivo principal de triagem (será criado se não existir)
PATH_TRIAGEM=./data/triagem.md

# Pasta onde ficam os arquivos markdown dos processos
PASTA_DESTINO=./data/processos

# Pasta onde ficam os arquivos .dat
PASTA_DAT=./data/dat

# Token do GitHub (opcional, para atualizações)
GITHUB_TOKEN=seu_token_aqui
`;
            fs.writeFileSync(envPath, envContent);
            console.log('✅ Arquivo .env criado');
        }
        const dataDirs = ['data', 'data/processos', 'data/dat'];
        for (const dir of dataDirs) {
            const fullPath = path.join(this.projectPath, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                console.log(`✅ Pasta ${dir} criada`);
            }
        }
        const triagemPath = path.join(this.projectPath, 'data', 'triagem.md');
        if (!fs.existsSync(triagemPath)) {
            const triagemContent = `# Tabela de Processos

| Nº Processo | Tema | Data da Distribuição | Responsável | Status | Última Atualização | Suspeitos | Comentários |
|-------------|------|-----------------------|-------------|--------|----------------------|-----------|-------------|

`;
            fs.writeFileSync(triagemPath, triagemContent);
            console.log('✅ Arquivo de triagem criado');
        }
    }

    async installDependencies() {
        console.log('\n📦 Instalando dependências...');
        console.log('🔄 Instalando dependências do Electron...');
        await this.runCommand('npm install', { cwd: this.projectPath });
        console.log('✅ Dependências do Electron instaladas');
        const frontendPath = path.join(this.projectPath, 'frontend');
        if (fs.existsSync(frontendPath)) {
            console.log('🔄 Instalando dependências do frontend...');
            await this.runCommand('npm install', { cwd: frontendPath });
            console.log('✅ Dependências do frontend instaladas');
        }
        const backendPath = path.join(this.projectPath, 'backend');
        const requirementsPath = path.join(backendPath, 'requirements.txt');
        if (fs.existsSync(requirementsPath)) {
            console.log('🔄 Instalando dependências do backend...');
            try {
                await this.runCommand('pip install -r requirements.txt', { cwd: backendPath });
                console.log('✅ Dependências do backend instaladas');
            } catch (error) {
                try {
                    await this.runCommand('pip3 install -r requirements.txt', { cwd: backendPath });
                    console.log('✅ Dependências do backend instaladas (pip3)');
                } catch (error2) {
                    console.log('⚠️ Erro ao instalar dependências Python, mas continuando...');
                }
            }
        }
        this.results.dependencies = true;
    }

    async buildProject() {
        console.log('\n🔨 Construindo o projeto...');
        const frontendPath = path.join(this.projectPath, 'frontend');
        if (fs.existsSync(frontendPath)) {
            console.log('🔄 Fazendo build do frontend...');
            await this.runCommand('npm run build', { cwd: frontendPath });
            console.log('✅ Build do frontend concluído');
        }
        console.log('🔄 Fazendo build do Electron...');
        console.log('⏳ Isso pode demorar alguns minutos...');
        await this.runCommand('npm run build', { cwd: this.projectPath });
        console.log('✅ Build do Electron concluído');
        const distPath = path.join(this.projectPath, 'dist');
        if (fs.existsSync(distPath)) {
            const files = fs.readdirSync(distPath);
            const exeFile = files.find(f => f.endsWith('.exe'));
            if (exeFile) {
                console.log(`✅ Executável criado: ${exeFile}`);
                this.results.build = true;
            }
        }
        if (!this.results.build) {
            throw new Error('Executável não foi criado');
        }
    }

    async createShortcut() {
        console.log('\n🔗 Criando atalho na área de trabalho...');
        const distPath = path.join(this.projectPath, 'dist');
        const files = fs.readdirSync(distPath);
        const exeFile = files.find(f => f.endsWith('.exe'));
        if (!exeFile) {
            throw new Error('Executável não encontrado para criar atalho');
        }
        const exePath = path.join(distPath, exeFile);
        const desktopPath = path.join(os.homedir(), 'Desktop');
        const shortcutPath = path.join(desktopPath, `${this.appName}.lnk`);
        if (process.platform === 'win32') {
            const vbsScript = `
Set objShell = CreateObject("WScript.Shell")
Set objShortcut = objShell.CreateShortcut("${shortcutPath}")
objShortcut.TargetPath = "${exePath}"
objShortcut.WorkingDirectory = "${path.dirname(exePath)}"
objShortcut.Description = "GMV Sistema - Gestão de Processos"
objShortcut.Save
`;
            const vbsPath = path.join(this.projectPath, 'create_shortcut.vbs');
            fs.writeFileSync(vbsPath, vbsScript);
            try {
                await this.runCommand(`cscript "${vbsPath}"`);
                fs.unlinkSync(vbsPath);
                console.log('✅ Atalho criado na área de trabalho');
                this.results.shortcut = true;
            } catch (error) {
                console.log('⚠️ Não foi possível criar atalho automaticamente');
                console.log(`💡 Você pode criar manualmente: ${exePath}`);
            }
        } else {
            const shortcutContent = `#!/bin/bash
cd "${path.dirname(exePath)}"
./"${exeFile}"
`;
            const shortcutPath = path.join(desktopPath, `${this.appName}.sh`);
            fs.writeFileSync(shortcutPath, shortcutContent);
            fs.chmodSync(shortcutPath, '755');
            console.log('✅ Script executável criado na área de trabalho');
            this.results.shortcut = true;
        }
    }

    async finalMessage() {
        console.log('\n🎉 SETUP CONCLUÍDO COM SUCESSO!');
        console.log('================================\n');
        const summary = [
            { name: 'Node.js', status: this.results.node },
            { name: 'Python', status: this.results.python },
            { name: 'Dependências', status: this.results.dependencies },
            { name: 'Build', status: this.results.build },
            { name: 'Atalho', status: this.results.shortcut }
        ];
        console.log('📋 RESUMO:');
        summary.forEach(item => {
            const icon = item.status ? '✅' : '❌';
            console.log(`${icon} ${item.name}`);
        });
        console.log('\n🚀 COMO USAR:');
        console.log('1. Execute o atalho na área de trabalho');
        console.log('2. Ou navegue para a pasta dist/ e execute o .exe');
        console.log('3. Configure as pastas no arquivo .env se necessário');
        console.log('\n📁 ARQUIVOS IMPORTANTES:');
        console.log(`• Executável: ./dist/`);
        console.log(`• Configuração: ./.env`);
        console.log(`• Dados: ./data/`);
        console.log(`• Triagem: ./data/triagem.md`);
        console.log('\n🔧 MANUTENÇÃO:');
        console.log('• Para atualizar: git pull && node setup.js');
        console.log('• Para reconfigurar: edite o arquivo .env');
        console.log('• Para debug: npm run dev');
        console.log('\n✨ O GMV Sistema está pronto para uso!');
    }

    async runCommand(command, options = {}) {
        return new Promise((resolve, reject) => {
            const proc = exec(command, {
                ...options,
                shell: true,
                stdio: 'pipe'
            });
            let output = '';
            let error = '';
            proc.stdout?.on('data', (data) => {
                output += data.toString();
            });
            proc.stderr?.on('data', (data) => {
                error += data.toString();
            });
            proc.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Comando falhou: ${command}\n${error}`));
                }
            });
            proc.on('error', reject);
        });
    }
}

if (require.main === module) {
    const setup = new GMVCompleteSetup();
    setup.run().catch(console.error);
}

module.exports = GMVCompleteSetup;