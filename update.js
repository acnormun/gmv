const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class GMVUpdater {
    constructor() {
        this.projectPath = __dirname;
        this.backupPath = path.join(this.projectPath, 'backup_env');
    }

    async run() {
        console.log('🔄 GMV SISTEMA - ATUALIZAÇÃO RÁPIDA');
        console.log('==================================\n');

        try {
            await this.backupConfig();
            await this.pullUpdates();
            await this.updateDependencies();
            await this.rebuild();
            await this.restoreConfig();
            await this.showSummary();
        } catch (error) {
            console.error('❌ ERRO NA ATUALIZAÇÃO:', error.message);
            console.log('\n🔧 SOLUÇÕES:');
            console.log('1. Execute o setup completo: node setup.js');
            console.log('2. Ou restaure o backup: cp backup_env/.env .env');
            process.exit(1);
        }
    }

    async backupConfig() {
        console.log('💾 Fazendo backup das configurações...');
        
        const envPath = path.join(this.projectPath, '.env');
        const dataPath = path.join(this.projectPath, 'data');
        
        if (!fs.existsSync(this.backupPath)) {
            fs.mkdirSync(this.backupPath, { recursive: true });
        }

        if (fs.existsSync(envPath)) {
            fs.copyFileSync(envPath, path.join(this.backupPath, '.env'));
            console.log('✅ Backup do .env criado');
        }

        if (fs.existsSync(dataPath)) {
            await this.copyDirectory(dataPath, path.join(this.backupPath, 'data'));
            console.log('✅ Backup dos dados criado');
        }
    }

    async pullUpdates() {
        console.log('\n📥 Baixando atualizações...');
        
        try {
            await this.runCommand('git status');
            const pullOutput = await this.runCommand('git pull');
            console.log('✅ Atualizações baixadas');
            
            if (pullOutput.includes('Already up to date')) {
                console.log('ℹ️ Nenhuma atualização disponível');
            } else {
                console.log('🆕 Novas atualizações aplicadas');
            }
        } catch (error) {
            console.log('⚠️ Não foi possível atualizar via Git');
            console.log('💡 Você pode estar usando uma versão baixada manualmente');
        }
    }

    async updateDependencies() {
        console.log('\n📦 Atualizando dependências...');
        
        console.log('🔄 Atualizando dependências do Electron...');
        await this.runCommand('npm install');
        console.log('✅ Dependências do Electron atualizadas');

        const frontendPath = path.join(this.projectPath, 'frontend');
        if (fs.existsSync(frontendPath)) {
            console.log('🔄 Atualizando dependências do frontend...');
            await this.runCommand('npm install', { cwd: frontendPath });
            console.log('✅ Dependências do frontend atualizadas');
        }

        const requirementsPath = path.join(this.projectPath, 'backend', 'requirements.txt');
        if (fs.existsSync(requirementsPath)) {
            console.log('🔄 Atualizando dependências do backend...');
            try {
                await this.runCommand('pip install -r requirements.txt', { 
                    cwd: path.join(this.projectPath, 'backend') 
                });
                console.log('✅ Dependências do backend atualizadas');
            } catch (error) {
                console.log('⚠️ Erro ao atualizar dependências Python, mas continuando...');
            }
        }
    }

    async rebuild() {
        console.log('\n🔨 Reconstruindo o projeto...');
        
        try {
            await this.runCommand('npm run clean');
            console.log('✅ Builds anteriores limpos');
        } catch (error) {
            console.log('⚠️ Erro ao limpar builds anteriores');
        }

        const frontendPath = path.join(this.projectPath, 'frontend');
        if (fs.existsSync(frontendPath)) {
            console.log('🔄 Reconstruindo frontend...');
            await this.runCommand('npm run build', { cwd: frontendPath });
            console.log('✅ Frontend reconstruído');
        }

        console.log('🔄 Reconstruindo Electron...');
        console.log('⏳ Isso pode demorar alguns minutos...');
        await this.runCommand('npm run build');
        console.log('✅ Electron reconstruído');

        const distPath = path.join(this.projectPath, 'dist');
        if (fs.existsSync(distPath)) {
            const files = fs.readdirSync(distPath);
            const exeFile = files.find(f => f.endsWith('.exe') || f.endsWith('.AppImage') || f.endsWith('.dmg'));
            if (exeFile) {
                console.log(`✅ Novo executável: ${exeFile}`);
            }
        }
    }

    async restoreConfig() {
        console.log('\n🔄 Restaurando configurações...');
        
        const envBackup = path.join(this.backupPath, '.env');
        const dataBackup = path.join(this.backupPath, 'data');
        
        if (fs.existsSync(envBackup)) {
            fs.copyFileSync(envBackup, path.join(this.projectPath, '.env'));
            console.log('✅ Configurações restauradas');
        }

        const dataPath = path.join(this.projectPath, 'data');
        if (!fs.existsSync(dataPath) && fs.existsSync(dataBackup)) {
            await this.copyDirectory(dataBackup, dataPath);
            console.log('✅ Dados restaurados');
        }
    }

    async showSummary() {
        console.log('\n🎉 ATUALIZAÇÃO CONCLUÍDA!');
        console.log('=========================\n');
        
        try {
            const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8'));
            console.log(`📦 Versão atual: ${packageJson.version}`);
        } catch (error) {
            console.log('📦 Versão: não detectada');
        }

        const distPath = path.join(this.projectPath, 'dist');
        if (fs.existsSync(distPath)) {
            const files = fs.readdirSync(distPath);
            console.log('\n📁 Arquivos atualizados:');
            files.forEach(file => {
                const filePath = path.join(distPath, file);
                const stats = fs.statSync(filePath);
                const size = (stats.size / 1024 / 1024).toFixed(1);
                console.log(`   • ${file} (${size} MB)`);
            });
        }

        console.log('\n🚀 PRONTO PARA USO:');
        console.log('• Execute o atalho na área de trabalho');
        console.log('• Ou execute o arquivo na pasta dist/');
        console.log('• Suas configurações e dados foram preservados');
        
        console.log('\n💾 BACKUP CRIADO EM:');
        console.log(`• ${this.backupPath}`);
        console.log('• Para restaurar manualmente: cp backup_env/.env .env');
        
        console.log('\n✨ Sistema atualizado com sucesso!');
    }

    async copyDirectory(src, dest) {
        fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                await this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
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
    const updater = new GMVUpdater();
    updater.run().catch(console.error);
}

module.exports = GMVUpdater;