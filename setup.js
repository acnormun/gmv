#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 GMV Sistema - Configuração e Verificação\n');

class GMVSetup {
    constructor() {
        this.results = {
            python: false,
            backend: false,
            frontend: false,
            dependencies: false
        };
    }

    async run() {
        console.log('Verificando pré-requisitos...\n');
        
        await this.checkPython();
        this.checkBackend();
        this.checkFrontend();
        await this.checkDependencies();
        
        this.showResults();
        
        if (Object.values(this.results).every(r => r)) {
            console.log('\n✅ Tudo configurado! Você pode executar:');
            console.log('   npm start        # Modo produção');
            console.log('   npm run dev      # Modo desenvolvimento');
        } else {
            console.log('\n Alguns problemas foram encontrados. Corrija-os antes de prosseguir.');
        }
    }

    async checkPython() {
        console.log('🐍 Verificando Python...');
        
        const commands = ['python', 'python3', 'py'];
        
        for (const cmd of commands) {
            try {
                const result = await this.runCommand(cmd, ['--version']);
                if (result.includes('Python')) {
                    console.log(`✅ ${cmd} encontrado: ${result.trim()}`);
                    this.results.python = true;
                    return;
                }
            } catch (error) {
                continue;
            }
        }
        
        console.log(' Python não encontrado!');
        console.log('💡 Instale Python 3.8+ em: https://python.org');
        this.results.python = false;
    }

    checkBackend() {
        console.log('\n🔧 Verificando Backend...');
        
        const possiblePaths = [
            path.join(__dirname, 'gmv-server'),
            path.join(__dirname, 'backend'),
            path.join(__dirname, '..', 'gmv-server')
        ];
        
        let backendFound = false;
        
        for (const backendPath of possiblePaths) {
            const appPy = path.join(backendPath, 'app.py');
            const requirementsTxt = path.join(backendPath, 'requirements.txt');
            
            if (fs.existsSync(appPy)) {
                console.log(`✅ Backend encontrado: ${backendPath}`);
                console.log(`   - app.py: ${fs.existsSync(appPy) ? '✅' : ''}`);
                console.log(`   - requirements.txt: ${fs.existsSync(requirementsTxt) ? '✅' : ''}`);
                
                backendFound = true;
                this.backendPath = backendPath;
                break;
            }
        }
        
        if (!backendFound) {
            console.log(' Backend não encontrado!');
            console.log('💡 Certifique-se que a pasta gmv-server ou backend existe');
        }
        
        this.results.backend = backendFound;
    }

    checkFrontend() {
        console.log('\n⚛️ Verificando Frontend...');
        
        const possiblePaths = [
            path.join(__dirname, 'gmv-web'),
            path.join(__dirname, 'frontend'),
            path.join(__dirname, '..', 'gmv-web')
        ];
        
        let frontendFound = false;
        let distFound = false;
        
        for (const frontendPath of possiblePaths) {
            const packageJson = path.join(frontendPath, 'package.json');
            const distPath = path.join(frontendPath, 'dist');
            const indexHtml = path.join(distPath, 'index.html');
            
            if (fs.existsSync(packageJson)) {
                console.log(`✅ Frontend encontrado: ${frontendPath}`);
                console.log(`   - package.json: ✅`);
                console.log(`   - dist/: ${fs.existsSync(distPath) ? '✅' : ''}`);
                console.log(`   - dist/index.html: ${fs.existsSync(indexHtml) ? '✅' : ''}`);
                
                frontendFound = true;
                distFound = fs.existsSync(indexHtml);
                this.frontendPath = frontendPath;
                break;
            }
        }
        
        if (!frontendFound) {
            console.log(' Frontend não encontrado!');
            console.log('💡 Certifique-se que a pasta gmv-web ou frontend existe');
        } else if (!distFound) {
            console.log('⚠️ Build do frontend não encontrado');
            console.log('💡 Execute: cd gmv-web && npm run build');
        }
        
        this.results.frontend = frontendFound && distFound;
    }

    async checkDependencies() {
        console.log('\n📦 Verificando Dependências...');
        
        // Verifica node_modules do Electron
        const nodeModules = path.join(__dirname, 'node_modules');
        const electronExists = fs.existsSync(path.join(nodeModules, 'electron'));
        
        console.log(`   - Electron: ${electronExists ? '✅' : ''}`);
        
        if (!electronExists) {
            console.log('💡 Execute: npm install');
        }
        
        // Verifica dependências Python do backend
        if (this.results.backend && this.results.python) {
            try {
                const reqPath = path.join(this.backendPath, 'requirements.txt');
                if (fs.existsSync(reqPath)) {
                    console.log('   - requirements.txt encontrado ✅');
                    console.log('💡 Para instalar: pip install -r backend/requirements.txt');
                }
            } catch (error) {
                console.log('   - Erro ao verificar requirements.txt ');
            }
        }
        
        this.results.dependencies = electronExists;
    }

    showResults() {
        console.log('\n📋 Resumo da Verificação:');
        console.log('=' .repeat(40));
        
        const items = [
            { name: 'Python', status: this.results.python },
            { name: 'Backend (gmv-server)', status: this.results.backend },
            { name: 'Frontend (gmv-web)', status: this.results.frontend },
            { name: 'Dependências', status: this.results.dependencies }
        ];
        
        items.forEach(item => {
            const icon = item.status ? '✅' : '';
            console.log(`${icon} ${item.name}`);
        });
    }

    async runCommand(command, args = []) {
        return new Promise((resolve, reject) => {
            const proc = spawn(command, args, { 
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
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Comando falhou: ${command} ${args.join(' ')}`));
                }
            });
            
            proc.on('error', reject);
        });
    }
}

// Executa se for chamado diretamente
if (require.main === module) {
    const setup = new GMVSetup();
    setup.run().catch(console.error);
}

module.exports = GMVSetup;