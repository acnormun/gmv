const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');
const readline = require('readline');

class GMVUninstaller {
    constructor() {
        this.projectPath = __dirname;
        this.appName = 'GMV Sistema';
        this.results = {
            shortcuts: false,
            executable: false,
            dependencies: false,
            cache: false,
            userData: false,
            totalCleaned: 0
        };
    }

    async run() {
        console.log('🗑️  GMV SISTEMA - DESINSTALAÇÃO COMPLETA');
        console.log('========================================\n');
        
        console.log('⚠️  ATENÇÃO: Esta operação irá remover:');
        console.log('• Atalhos da área de trabalho');
        console.log('• Executáveis gerados');
        console.log('• Dependências instaladas');
        console.log('• Cache de build');
        console.log('• Arquivos temporários');
        console.log('');
        
        const keepUserData = await this.askQuestion('🤔 Deseja manter seus dados (processos, configurações)? (s/N): ');
        
        if (!keepUserData.toLowerCase().startsWith('s')) {
            console.log('⚠️  TODOS OS DADOS SERÃO REMOVIDOS PERMANENTEMENTE!');
            const confirmDelete = await this.askQuestion('💀 Tem certeza que deseja continuar? Digite "CONFIRMAR" para prosseguir: ');
            
            if (confirmDelete !== 'CONFIRMAR') {
                console.log('✅ Operação cancelada. Seus dados estão seguros.');
                return;
            }
        }

        console.log('\n🗑️  Iniciando desinstalação...\n');

        try {
            await this.removeShortcuts();
            await this.removeExecutables();
            await this.removeDependencies();
            await this.removeCache();
            
            if (!keepUserData.toLowerCase().startsWith('s')) {
                await this.removeUserData();
            }
            
            await this.showSummary(keepUserData.toLowerCase().startsWith('s'));
        } catch (error) {
            console.error('❌ ERRO NA DESINSTALAÇÃO:', error.message);
            console.log('\n💡 Você pode tentar remover manualmente os arquivos restantes.');
        }
    }

    async removeShortcuts() {
        console.log('🔗 Removendo atalhos...');
        
        const desktopPath = path.join(os.homedir(), 'Desktop');
        const possibleShortcuts = [
            path.join(desktopPath, `${this.appName}.lnk`),
            path.join(desktopPath, `${this.appName}.sh`),
            path.join(desktopPath, `${this.appName}.desktop`)
        ];

        let shortcutsRemoved = 0;

        for (const shortcut of possibleShortcuts) {
            if (fs.existsSync(shortcut)) {
                try {
                    fs.unlinkSync(shortcut);
                    console.log(`✅ Removido: ${path.basename(shortcut)}`);
                    shortcutsRemoved++;
                } catch (error) {
                    console.log(`⚠️  Erro ao remover: ${path.basename(shortcut)}`);
                }
            }
        }

        if (process.platform === 'win32') {
            const startMenuPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs');
            const startMenuShortcut = path.join(startMenuPath, `${this.appName}.lnk`);
            
            if (fs.existsSync(startMenuShortcut)) {
                try {
                    fs.unlinkSync(startMenuShortcut);
                    console.log('✅ Removido do menu iniciar');
                    shortcutsRemoved++;
                } catch (error) {
                    console.log('⚠️  Erro ao remover do menu iniciar');
                }
            }
        }

        this.results.shortcuts = shortcutsRemoved > 0;
        this.results.totalCleaned += shortcutsRemoved;
        
        if (shortcutsRemoved === 0) {
            console.log('ℹ️  Nenhum atalho encontrado');
        }
    }

    async removeExecutables() {
        console.log('\n📦 Removendo executáveis...');
        
        const distPath = path.join(this.projectPath, 'dist');
        const buildPath = path.join(this.projectPath, 'build');
        
        let executablesRemoved = 0;

        if (fs.existsSync(distPath)) {
            try {
                const distSize = await this.getFolderSize(distPath);
                fs.rmSync(distPath, { recursive: true, force: true });
                console.log(`✅ Pasta dist removida (${this.formatSize(distSize)})`);
                executablesRemoved++;
                this.results.totalCleaned += distSize;
            } catch (error) {
                console.log('⚠️  Erro ao remover pasta dist');
            }
        }

        if (fs.existsSync(buildPath)) {
            try {
                const buildSize = await this.getFolderSize(buildPath);
                fs.rmSync(buildPath, { recursive: true, force: true });
                console.log(`✅ Pasta build removida (${this.formatSize(buildSize)})`);
                executablesRemoved++;
                this.results.totalCleaned += buildSize;
            } catch (error) {
                console.log('⚠️  Erro ao remover pasta build');
            }
        }

        this.results.executable = executablesRemoved > 0;
        
        if (executablesRemoved === 0) {
            console.log('ℹ️  Nenhum executável encontrado');
        }
    }

    async removeDependencies() {
        console.log('\n📚 Removendo dependências...');
        
        let dependenciesRemoved = 0;

        const nodeModulesPath = path.join(this.projectPath, 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
            try {
                const nodeModulesSize = await this.getFolderSize(nodeModulesPath);
                console.log('🔄 Removendo node_modules (isso pode demorar)...');
                fs.rmSync(nodeModulesPath, { recursive: true, force: true });
                console.log(`✅ node_modules removido (${this.formatSize(nodeModulesSize)})`);
                dependenciesRemoved++;
                this.results.totalCleaned += nodeModulesSize;
            } catch (error) {
                console.log('⚠️  Erro ao remover node_modules');
            }
        }

        const frontendNodeModules = path.join(this.projectPath, 'frontend', 'node_modules');
        if (fs.existsSync(frontendNodeModules)) {
            try {
                const frontendSize = await this.getFolderSize(frontendNodeModules);
                fs.rmSync(frontendNodeModules, { recursive: true, force: true });
                console.log(`✅ frontend/node_modules removido (${this.formatSize(frontendSize)})`);
                dependenciesRemoved++;
                this.results.totalCleaned += frontendSize;
            } catch (error) {
                console.log('⚠️  Erro ao remover frontend/node_modules');
            }
        }

        const frontendDist = path.join(this.projectPath, 'frontend', 'dist');
        if (fs.existsSync(frontendDist)) {
            try {
                const frontendDistSize = await this.getFolderSize(frontendDist);
                fs.rmSync(frontendDist, { recursive: true, force: true });
                console.log(`✅ frontend/dist removido (${this.formatSize(frontendDistSize)})`);
                dependenciesRemoved++;
                this.results.totalCleaned += frontendDistSize;
            } catch (error) {
                console.log('⚠️  Erro ao remover frontend/dist');
            }
        }

        this.results.dependencies = dependenciesRemoved > 0;
        
        if (dependenciesRemoved === 0) {
            console.log('ℹ️  Nenhuma dependência encontrada');
        }
    }

    async removeCache() {
        console.log('\n🗂️  Removendo cache...');
        
        let cacheRemoved = 0;

        const cacheFiles = [
            'package-lock.json',
            'yarn.lock',
            '.npm',
            '.yarn',
            'backup_env',
            '.electron-builder',
            path.join('frontend', 'package-lock.json'),
            path.join('frontend', 'yarn.lock'),
            path.join('frontend', '.vite')
        ];

        for (const cacheFile of cacheFiles) {
            const fullPath = path.join(this.projectPath, cacheFile);
            if (fs.existsSync(fullPath)) {
                try {
                    const isDirectory = fs.statSync(fullPath).isDirectory();
                    if (isDirectory) {
                        const cacheSize = await this.getFolderSize(fullPath);
                        fs.rmSync(fullPath, { recursive: true, force: true });
                        console.log(`✅ Cache removido: ${cacheFile} (${this.formatSize(cacheSize)})`);
                        this.results.totalCleaned += cacheSize;
                    } else {
                        fs.unlinkSync(fullPath);
                        console.log(`✅ Arquivo removido: ${cacheFile}`);
                    }
                    cacheRemoved++;
                } catch (error) {
                    console.log(`⚠️  Erro ao remover: ${cacheFile}`);
                }
            }
        }

        const tempFiles = [
            'create_shortcut.vbs',
            'installer.nsh',
            'quick-build.log'
        ];

        for (const tempFile of tempFiles) {
            const fullPath = path.join(this.projectPath, tempFile);
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                    console.log(`✅ Arquivo temporário removido: ${tempFile}`);
                    cacheRemoved++;
                } catch (error) {
                    console.log(`⚠️  Erro ao remover: ${tempFile}`);
                }
            }
        }

        this.results.cache = cacheRemoved > 0;
        
        if (cacheRemoved === 0) {
            console.log('ℹ️  Nenhum cache encontrado');
        }
    }

    async removeUserData() {
        console.log('\n💀 Removendo dados do usuário...');
        
        const userDataPaths = [
            path.join(this.projectPath, 'data'),
            path.join(this.projectPath, '.env'),
            path.join(this.projectPath, '.env.local'),
            path.join(this.projectPath, '.env.production')
        ];

        let userDataRemoved = 0;

        for (const dataPath of userDataPaths) {
            if (fs.existsSync(dataPath)) {
                try {
                    const isDirectory = fs.statSync(dataPath).isDirectory();
                    if (isDirectory) {
                        const dataSize = await this.getFolderSize(dataPath);
                        fs.rmSync(dataPath, { recursive: true, force: true });
                        console.log(`✅ Pasta removida: ${path.basename(dataPath)} (${this.formatSize(dataSize)})`);
                        this.results.totalCleaned += dataSize;
                    } else {
                        fs.unlinkSync(dataPath);
                        console.log(`✅ Arquivo removido: ${path.basename(dataPath)}`);
                    }
                    userDataRemoved++;
                } catch (error) {
                    console.log(`⚠️  Erro ao remover: ${path.basename(dataPath)}`);
                }
            }
        }

        this.results.userData = userDataRemoved > 0;
        
        if (userDataRemoved === 0) {
            console.log('ℹ️  Nenhum dado do usuário encontrado');
        }
    }

    async showSummary(keepUserData) {
        console.log('\n🎯 DESINSTALAÇÃO CONCLUÍDA!');
        console.log('============================\n');
        
        const summary = [
            { name: 'Atalhos removidos', status: this.results.shortcuts },
            { name: 'Executáveis removidos', status: this.results.executable },
            { name: 'Dependências removidas', status: this.results.dependencies },
            { name: 'Cache limpo', status: this.results.cache },
            { name: 'Dados do usuário removidos', status: this.results.userData }
        ];

        console.log('📋 RESUMO:');
        summary.forEach(item => {
            const icon = item.status ? '✅' : '⚪';
            console.log(`${icon} ${item.name}`);
        });

        console.log(`\n💾 Total de espaço liberado: ${this.formatSize(this.results.totalCleaned)}`);
        
        if (keepUserData) {
            console.log('\n🔒 DADOS PRESERVADOS:');
            console.log('• Arquivo .env (configurações)');
            console.log('• Pasta data/ (processos e triagem)');
            console.log('• Código-fonte do projeto');
            console.log('\n💡 Para reinstalar: execute setup.js novamente');
        } else {
            console.log('\n🗑️  TUDO REMOVIDO:');
            console.log('• Executáveis e builds');
            console.log('• Dependências e cache');
            console.log('• Dados e configurações');
            console.log('• Atalhos da área de trabalho');
            console.log('\n💡 Para reinstalar: execute setup.js');
        }

        console.log('\n🧹 LIMPEZA MANUAL ADICIONAL:');
        console.log('• Verifique a área de trabalho');
        console.log('• Limpe a lixeira do sistema');
        console.log('• Reinicie o sistema se necessário');
        
        console.log('\n✨ GMV Sistema desinstalado com sucesso!');
    }

    async getFolderSize(folderPath) {
        let size = 0;
        try {
            const files = fs.readdirSync(folderPath);
            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    size += await this.getFolderSize(filePath);
                } else {
                    size += stats.size;
                }
            }
        } catch (error) {
        }
        return size;
    }

    formatSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }

    async askQuestion(question) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer);
            });
        });
    }
}

if (require.main === module) {
    const uninstaller = new GMVUninstaller();
    uninstaller.run().catch(console.error);
}

module.exports = GMVUninstaller;