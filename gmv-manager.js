const readline = require('readline');
const { exec } = require('child_process');

class GMVManager {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async run() {
        console.clear();
        await this.showMainMenu();
    }

    async showMainMenu() {
        console.log('🎯 GMV SISTEMA - GERENCIADOR');
        console.log('============================\n');
        
        console.log('Escolha uma opção:\n');
        console.log('📦 INSTALAÇÃO E SETUP:');
        console.log('  1. 🚀 Setup Completo (primeira instalação)');
        console.log('  2. 🔄 Atualizar Sistema');
        console.log('  3. 🛠️  Reinstalar Dependências');
        console.log('');
        console.log('🔨 BUILD E DESENVOLVIMENTO:');
        console.log('  4. ⚡ Build Rápido');
        console.log('  5. 🎯 Build Completo');
        console.log('  6. 🐛 Modo Desenvolvimento');
        console.log('');
        console.log('🧹 LIMPEZA E MANUTENÇÃO:');
        console.log('  7. 🧽 Limpeza Rápida (preserva dados)');
        console.log('  8. 🔥 Reset Completo');
        console.log('  9. 🗑️  Desinstalar Sistema');
        console.log('');
        console.log('ℹ️  INFORMAÇÕES:');
        console.log('  10. 📋 Verificar Status');
        console.log('  11. 📚 Mostrar Ajuda');
        console.log('');
        console.log('  0. ❌ Sair');
        console.log('');

        const choice = await this.askQuestion('Digite sua escolha (0-11): ');
        await this.handleChoice(choice);
    }

    async handleChoice(choice) {
        console.log('');
        
        switch (choice) {
            case '1':
                await this.setupComplete();
                break;
            case '2':
                await this.updateSystem();
                break;
            case '3':
                await this.reinstallDeps();
                break;
            case '4':
                await this.quickBuild();
                break;
            case '5':
                await this.completeBuild();
                break;
            case '6':
                await this.devMode();
                break;
            case '7':
                await this.quickClean();
                break;
            case '8':
                await this.resetComplete();
                break;
            case '9':
                await this.uninstallSystem();
                break;
            case '10':
                await this.checkStatus();
                break;
            case '11':
                await this.showHelp();
                break;
            case '0':
                console.log('👋 Até logo!');
                this.rl.close();
                return;
            default:
                console.log('❌ Opção inválida!');
                await this.waitForEnter();
                await this.showMainMenu();
                return;
        }

        console.log('\n');
        await this.waitForEnter();
        await this.showMainMenu();
    }

    async setupComplete() {
        console.log('🚀 EXECUTANDO SETUP COMPLETO...\n');
        await this.runScript('node setup.js');
    }

    async updateSystem() {
        console.log('🔄 ATUALIZANDO SISTEMA...\n');
        await this.runScript('node update.js');
    }

    async reinstallDeps() {
        console.log('🛠️  REINSTALANDO DEPENDÊNCIAS...\n');
        console.log('1. Limpando dependências antigas...');
        await this.runScript('node clean.js');
        console.log('\n2. Instalando dependências...');
        await this.runScript('npm install');
        await this.runScript('cd frontend && npm install');
    }

    async quickBuild() {
        console.log('⚡ EXECUTANDO BUILD RÁPIDO...\n');
        await this.runScript('node quick-build.js');
    }

    async completeBuild() {
        console.log('🎯 EXECUTANDO BUILD COMPLETO...\n');
        console.log('1. Build do frontend...');
        await this.runScript('cd frontend && npm run build');
        console.log('\n2. Build do Electron...');
        await this.runScript('npm run build');
    }

    async devMode() {
        console.log('🐛 INICIANDO MODO DESENVOLVIMENTO...\n');
        console.log('💡 Pressione Ctrl+C para parar\n');
        await this.runScript('npm run dev');
    }

    async quickClean() {
        console.log('🧽 EXECUTANDO LIMPEZA RÁPIDA...\n');
        await this.runScript('node clean.js');
    }

    async resetComplete() {
        console.log('🔥 RESET COMPLETO...\n');
        const confirm = await this.askQuestion('⚠️  Isso irá limpar TUDO e reinstalar. Continuar? (s/N): ');
        
        if (confirm.toLowerCase().startsWith('s')) {
            console.log('\n1. Limpando sistema...');
            await this.runScript('node clean.js');
            console.log('\n2. Reinstalando...');
            await this.runScript('npm install');
            console.log('\n3. Setup completo...');
            await this.runScript('node setup.js');
        } else {
            console.log('✅ Operação cancelada.');
        }
    }

    async uninstallSystem() {
        console.log('🗑️  DESINSTALANDO SISTEMA...\n');
        await this.runScript('node uninstall.js');
    }

    async checkStatus() {
        console.log('📋 VERIFICANDO STATUS DO SISTEMA...\n');
        
        const fs = require('fs');
        const path = require('path');
        
        console.log('📁 ESTRUTURA DO PROJETO:');
        const requiredDirs = ['backend', 'frontend', 'gmv-server'];
        for (const dir of requiredDirs) {
            const exists = fs.existsSync(path.join(__dirname, dir));
            console.log(`  ${exists ? '✅' : '❌'} ${dir}/`);
        }
        
        console.log('\n📄 ARQUIVOS IMPORTANTES:');
        const requiredFiles = ['.env', 'package.json', 'main.js'];
        for (const file of requiredFiles) {
            const exists = fs.existsSync(path.join(__dirname, file));
            console.log(`  ${exists ? '✅' : '❌'} ${file}`);
        }
        
        console.log('\n🔨 BUILDS:');
        const distExists = fs.existsSync(path.join(__dirname, 'dist'));
        const frontendDistExists = fs.existsSync(path.join(__dirname, 'frontend', 'dist'));
        console.log(`  ${distExists ? '✅' : '❌'} Executável (dist/)`);
        console.log(`  ${frontendDistExists ? '✅' : '❌'} Frontend (frontend/dist/)`);
        
        console.log('\n📦 DEPENDÊNCIAS:');
        const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
        const frontendNodeModulesExists = fs.existsSync(path.join(__dirname, 'frontend', 'node_modules'));
        console.log(`  ${nodeModulesExists ? '✅' : '❌'} Node.js (node_modules/)`);
        console.log(`  ${frontendNodeModulesExists ? '✅' : '❌'} Frontend (frontend/node_modules/)`);
        
        console.log('\n💾 DADOS:');
        const dataExists = fs.existsSync(path.join(__dirname, 'data'));
        const envExists = fs.existsSync(path.join(__dirname, '.env'));
        console.log(`  ${dataExists ? '✅' : '❌'} Pasta de dados (data/)`);
        console.log(`  ${envExists ? '✅' : '❌'} Configurações (.env)`);

        console.log('\n🔧 PRÉ-REQUISITOS:');
        try {
            await this.runCommand('node --version');
            console.log('  ✅ Node.js');
        } catch (error) {
            console.log('  ❌ Node.js');
        }
        
        try {
            await this.runCommand('python --version');
            console.log('  ✅ Python');
        } catch (error) {
            try {
                await this.runCommand('python3 --version');
                console.log('  ✅ Python3');
            } catch (error2) {
                console.log('  ❌ Python');
            }
        }
    }

    async showHelp() {
        console.log('📚 AJUDA DO GMV SISTEMA\n');
        
        console.log('🚀 PRIMEIROS PASSOS:');
        console.log('  1. Execute "Setup Completo" para primeira instalação');
        console.log('  2. Use "Build Rápido" para gerar executável');
        console.log('  3. Execute o .exe na pasta dist/\n');
        
        console.log('🔧 COMANDOS MANUAIS:');
        console.log('  node setup.js  # Setup completo');
        console.log('  node quick-build.js     # Build rápido');
        console.log('  node update.js          # Atualizar');
        console.log('  node clean.js           # Limpeza');
        console.log('  node uninstall.js       # Desinstalar');
        console.log('  npm run dev             # Desenvolvimento\n');
        
        console.log('📁 ESTRUTURA:');
        console.log('  dist/           # Executáveis gerados');
        console.log('  data/           # Seus dados e processos');
        console.log('  frontend/       # Interface Vue.js');
        console.log('  backend/        # Servidor Python');
        console.log('  .env            # Configurações\n');
        
        console.log('🆘 PROBLEMAS COMUNS:');
        console.log('  • Node.js não encontrado: instale em nodejs.org');
        console.log('  • Python não encontrado: instale em python.org');
        console.log('  • Build falha: use "Limpeza Rápida" e tente novamente');
        console.log('  • Sistema corrompido: use "Reset Completo"\n');
        
        console.log('📞 SUPORTE:');
        console.log('  • Use "Verificar Status" para diagnóstico');
        console.log('  • Verifique logs dos scripts para erros');
        console.log('  • Tente "Reset Completo" em último caso');
    }

    async runScript(command) {
        return new Promise((resolve, reject) => {
            const proc = exec(command, { shell: true });
            
            proc.stdout.on('data', (data) => {
                process.stdout.write(data);
            });
            
            proc.stderr.on('data', (data) => {
                process.stderr.write(data);
            });
            
            proc.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    console.log(`\n❌ Comando falhou com código: ${code}`);
                    resolve();
                }
            });
        });
    }

    async runCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    async askQuestion(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    async waitForEnter() {
        await this.askQuestion('Pressione ENTER para continuar...');
    }
}

if (require.main === module) {
    const manager = new GMVManager();
    manager.run().catch(console.error);
}

module.exports = GMVManager;