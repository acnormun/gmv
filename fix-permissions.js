const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

class PermissionFixer {
    constructor() {
        this.projectPath = __dirname;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async run() {
        console.log('🛠️  GMV SISTEMA - CORREÇÃO DE PERMISSÕES');
        console.log('==========================================\n');
        
        console.log('❌ Detectado erro de permissão (EPERM)');
        console.log('Este é um problema comum no Windows relacionado a:');
        console.log('• Antivírus bloqueando arquivos .exe');
        console.log('• Falta de permissões administrativas');
        console.log('• Processos usando os arquivos\n');

        try {
            await this.diagnoseIssue();
            await this.showSolutions();
            await this.attemptFix();
        } catch (error) {
            console.error('❌ Erro durante correção:', error.message);
        } finally {
            this.rl.close();
        }
    }

    async diagnoseIssue() {
        console.log('🔍 Diagnosticando problema...\n');
        
        const nodeModulesPath = path.join(this.projectPath, 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
            console.log('✅ Pasta node_modules encontrada');
            
            const electronPath = path.join(nodeModulesPath, 'electron');
            if (fs.existsSync(electronPath)) {
                console.log('⚠️  Electron parcialmente instalado');
            } else {
                console.log('❌ Electron não instalado');
            }
        } else {
            console.log('❌ Pasta node_modules não encontrada');
        }

        try {
            const processes = await this.runCommand('tasklist /FI "IMAGENAME eq electron.exe"');
            if (processes.includes('electron.exe')) {
                console.log('⚠️  Processos Electron em execução detectados');
            } else {
                console.log('✅ Nenhum processo Electron em execução');
            }
        } catch (error) {
            console.log('ℹ️  Não foi possível verificar processos');
        }

        try {
            const testFile = path.join(this.projectPath, 'test-permissions.txt');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            console.log('✅ Permissões de escrita OK');
        } catch (error) {
            console.log('❌ Problema de permissões de escrita');
        }
    }

    async showSolutions() {
        console.log('\n🔧 SOLUÇÕES DISPONÍVEIS:\n');
        
        console.log('1. 🔄 LIMPEZA E TENTATIVA AUTOMÁTICA');
        console.log('   • Limpa node_modules');
        console.log('   • Mata processos Electron');
        console.log('   • Reinstala com configurações especiais\n');
        
        console.log('2. 🛡️  CONFIGURAÇÃO DO ANTIVÍRUS');
        console.log('   • Adicionar pasta do projeto à exclusão');
        console.log('   • Desativar temporariamente o Windows Defender\n');
        
        console.log('3. 👨‍💼 EXECUÇÃO COMO ADMINISTRADOR');
        console.log('   • Fechar este terminal');
        console.log('   • Abrir novo terminal como administrador');
        console.log('   • Executar o setup novamente\n');
        
        console.log('4. 🏭 INSTALAÇÃO ALTERNATIVA');
        console.log('   • Usar Yarn ao invés do NPM');
        console.log('   • Instalar Electron globalmente primeiro\n');
    }

    async attemptFix() {
        const choice = await this.askQuestion('Escolha uma opção (1-4) ou 0 para sair: ');
        
        switch (choice) {
            case '1':
                await this.automaticFix();
                break;
            case '2':
                await this.antivirusInstructions();
                break;
            case '3':
                await this.adminInstructions();
                break;
            case '4':
                await this.alternativeInstall();
                break;
            case '0':
                console.log('👋 Saindo...');
                return;
            default:
                console.log('❌ Opção inválida');
                await this.attemptFix();
                return;
        }
    }

    async automaticFix() {
        console.log('\n🔄 INICIANDO CORREÇÃO AUTOMÁTICA...\n');
        
        try {
            console.log('1. Finalizando processos Electron...');
            try {
                await this.runCommand('taskkill /F /IM electron.exe');
                console.log('✅ Processos Electron finalizados');
            } catch (error) {
                console.log('ℹ️  Nenhum processo Electron encontrado');
            }

            console.log('\n2. Removendo node_modules...');
            const nodeModulesPath = path.join(this.projectPath, 'node_modules');
            if (fs.existsSync(nodeModulesPath)) {
                console.log('⏳ Isso pode demorar alguns minutos...');
                fs.rmSync(nodeModulesPath, { recursive: true, force: true });
                console.log('✅ node_modules removido');
            } else {
                console.log('ℹ️  node_modules não encontrado');
            }

            console.log('\n3. Limpando cache do npm...');
            await this.runCommand('npm cache clean --force');
            console.log('✅ Cache limpo');

            console.log('\n4. Reinstalando com configurações especiais...');
            console.log('⏳ Isso pode demorar vários minutos...\n');
            
            const npmCommands = [
                'npm config set cache .npm-cache',
                'npm config set prefer-offline false',
                'npm config set audit false',
                'npm install --no-optional --no-package-lock --force'
            ];

            for (const command of npmCommands) {
                console.log(`Executando: ${command}`);
                await this.runCommand(command);
            }

            console.log('\n✅ CORREÇÃO AUTOMÁTICA CONCLUÍDA!');
            console.log('Tente executar o setup novamente.');
            
        } catch (error) {
            console.log('\n❌ Correção automática falhou:', error.message);
            console.log('\n💡 Tente as outras opções:');
            console.log('• Opção 2: Configurar antivírus');
            console.log('• Opção 3: Executar como administrador');
            await this.attemptFix();
        }
    }

    async antivirusInstructions() {
        console.log('\n🛡️  CONFIGURAÇÃO DO ANTIVÍRUS\n');
        
        console.log('WINDOWS DEFENDER:');
        console.log('1. Abra as "Configurações do Windows"');
        console.log('2. Vá em "Atualização e Segurança" → "Segurança do Windows"');
        console.log('3. Clique em "Proteção contra vírus e ameaças"');
        console.log('4. Em "Configurações de proteção contra vírus e ameaças", clique em "Gerenciar configurações"');
        console.log('5. Em "Exclusões", clique em "Adicionar ou remover exclusões"');
        console.log('6. Clique em "Adicionar uma exclusão" → "Pasta"');
        console.log(`7. Adicione esta pasta: ${this.projectPath}`);
        console.log('8. Adicione também: C:\\Users\\[SEU_USUARIO]\\AppData\\Roaming\\npm-cache\n');
        
        console.log('OUTROS ANTIVÍRUS (Avast, AVG, Norton, etc.):');
        console.log('1. Abra seu antivírus');
        console.log('2. Procure por "Exclusões" ou "Exceções"');
        console.log(`3. Adicione esta pasta: ${this.projectPath}`);
        console.log('4. Adicione também a pasta de cache do npm\n');
        
        console.log('ALTERNATIVA TEMPORÁRIA:');
        console.log('1. Desative temporariamente a proteção em tempo real');
        console.log('2. Execute o setup');
        console.log('3. Reative a proteção');
        console.log('4. Adicione as exclusões para uso futuro\n');
        
        const tryAgain = await this.askQuestion('Após configurar o antivírus, deseja tentar novamente? (s/N): ');
        if (tryAgain.toLowerCase().startsWith('s')) {
            await this.automaticFix();
        }
    }

    async adminInstructions() {
        console.log('\n👨‍💼 EXECUÇÃO COMO ADMINISTRADOR\n');
        
        console.log('PASSOS:');
        console.log('1. Feche este terminal/prompt');
        console.log('2. Clique com botão direito no "Prompt de Comando" ou "PowerShell"');
        console.log('3. Selecione "Executar como administrador"');
        console.log('4. Navegue até esta pasta:');
        console.log(`   cd "${this.projectPath}"`);
        console.log('5. Execute um dos comandos:');
        console.log('   node complete-setup.js');
        console.log('   ou');
        console.log('   npm run setup\n');
        
        console.log('ALTERNATIVA (arquivo .bat):');
        
        const batContent = `@echo off
title GMV Sistema - Setup como Administrador
echo Executando setup como administrador...
echo.
cd /d "${this.projectPath}"
node complete-setup.js
echo.
echo Pressione qualquer tecla para fechar...
pause > nul`;

        const batPath = path.join(this.projectPath, 'SETUP-ADMIN.bat');
        fs.writeFileSync(batPath, batContent);
        
        console.log(`✅ Criado arquivo: ${batPath}`);
        console.log('• Clique com botão direito neste arquivo');
        console.log('• Selecione "Executar como administrador"\n');
    }

    async alternativeInstall() {
        console.log('\n🏭 INSTALAÇÃO ALTERNATIVA\n');
        
        const method = await this.askQuestion('Escolha o método (1-Yarn, 2-Electron Global, 3-Manual): ');
        
        switch (method) {
            case '1':
                await this.installWithYarn();
                break;
            case '2':
                await this.installElectronGlobal();
                break;
            case '3':
                await this.manualInstall();
                break;
            default:
                console.log('❌ Opção inválida');
                await this.alternativeInstall();
        }
    }

    async installWithYarn() {
        console.log('\n📦 INSTALAÇÃO COM YARN\n');
        
        try {
            await this.runCommand('yarn --version');
            console.log('✅ Yarn encontrado');
        } catch (error) {
            console.log('⚠️  Yarn não encontrado. Instalando...');
            await this.runCommand('npm install -g yarn');
        }
        
        console.log('\n🔄 Instalando dependências com Yarn...');
        await this.runCommand('yarn install');
        console.log('✅ Dependências instaladas com Yarn!');
    }

    async installElectronGlobal() {
        console.log('\n🌐 INSTALAÇÃO GLOBAL DO ELECTRON\n');
        
        try {
            console.log('1. Instalando Electron globalmente...');
            await this.runCommand('npm install -g electron');
            
            console.log('\n2. Instalando outras dependências...');
            await this.runCommand('npm install --ignore-scripts');
            
            console.log('\n3. Configurando Electron local...');
            await this.runCommand('npm rebuild electron --update-binary');
            
            console.log('✅ Instalação com Electron global concluída!');
        } catch (error) {
            console.log('❌ Falha na instalação global:', error.message);
        }
    }

    async manualInstall() {
        console.log('\n🔧 INSTALAÇÃO MANUAL\n');
        
        console.log('PASSOS MANUAIS:');
        console.log('1. Baixe o Electron manualmente:');
        console.log('   https://github.com/electron/electron/releases');
        console.log('2. Extraia para: node_modules/electron/dist/');
        console.log('3. Execute: npm install --ignore-scripts');
        console.log('4. Execute: npm run build-frontend');
        console.log('5. Execute: npm run build\n');
        
        console.log('OU USE O PORTABLE:');
        console.log('1. Baixe a versão portable do Electron');
        console.log('2. Configure manualmente os caminhos');
        console.log('3. Execute o build diretamente\n');
    }

    async runCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, { shell: true }, (error, stdout, stderr) => {
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
}

if (require.main === module) {
    const fixer = new PermissionFixer();
    fixer.run().catch(console.error);
}

module.exports = PermissionFixer;