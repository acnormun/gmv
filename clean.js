const fs = require('fs');
const path = require('path');

class GMVCleaner {
    constructor() {
        this.projectPath = __dirname;
        this.totalCleaned = 0;
    }

    async run() {
        console.log('🧹 GMV SISTEMA - LIMPEZA RÁPIDA');
        console.log('================================\n');
        
        console.log('Esta operação irá limpar:');
        console.log('• Cache de build (dist/, build/)');
        console.log('• Dependências (node_modules/)');
        console.log('• Arquivos temporários');
        console.log('• Frontend compilado');
        console.log('');
        console.log('🔒 PRESERVARÁ:');
        console.log('• Seus dados (pasta data/)');
        console.log('• Configurações (.env)');
        console.log('• Código-fonte');
        console.log('• Atalhos da área de trabalho');
        console.log('');

        try {
            await this.cleanBuildFiles();
            await this.cleanDependencies();
            await this.cleanCache();
            await this.cleanTempFiles();
            await this.showSummary();
        } catch (error) {
            console.error('❌ ERRO NA LIMPEZA:', error.message);
        }
    }

    async cleanBuildFiles() {
        console.log('🗂️  Limpando arquivos de build...');
        
        const buildPaths = [
            path.join(this.projectPath, 'dist'),
            path.join(this.projectPath, 'build'),
            path.join(this.projectPath, 'frontend', 'dist')
        ];

        for (const buildPath of buildPaths) {
            if (fs.existsSync(buildPath)) {
                try {
                    const size = await this.getFolderSize(buildPath);
                    fs.rmSync(buildPath, { recursive: true, force: true });
                    console.log(`✅ Removido: ${path.basename(buildPath)} (${this.formatSize(size)})`);
                    this.totalCleaned += size;
                } catch (error) {
                    console.log(`⚠️  Erro ao remover: ${path.basename(buildPath)}`);
                }
            }
        }
    }

    async cleanDependencies() {
        console.log('\n📚 Limpando dependências...');
        
        const nodeModulesPaths = [
            path.join(this.projectPath, 'node_modules'),
            path.join(this.projectPath, 'frontend', 'node_modules')
        ];

        for (const nodeModulesPath of nodeModulesPaths) {
            if (fs.existsSync(nodeModulesPath)) {
                try {
                    const size = await this.getFolderSize(nodeModulesPath);
                    console.log(`🔄 Removendo ${path.relative(this.projectPath, nodeModulesPath)} (isso pode demorar)...`);
                    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
                    console.log(`✅ Removido: ${path.relative(this.projectPath, nodeModulesPath)} (${this.formatSize(size)})`);
                    this.totalCleaned += size;
                } catch (error) {
                    console.log(`⚠️  Erro ao remover: ${path.relative(this.projectPath, nodeModulesPath)}`);
                }
            }
        }
    }

    async cleanCache() {
        console.log('\n🗂️  Limpando cache...');
        
        const cachePaths = [
            path.join(this.projectPath, '.npm'),
            path.join(this.projectPath, '.yarn'),
            path.join(this.projectPath, '.electron-builder'),
            path.join(this.projectPath, 'backup_env'),
            path.join(this.projectPath, 'frontend', '.vite'),
            path.join(this.projectPath, 'frontend', 'node_modules', '.cache')
        ];

        for (const cachePath of cachePaths) {
            if (fs.existsSync(cachePath)) {
                try {
                    const size = await this.getFolderSize(cachePath);
                    fs.rmSync(cachePath, { recursive: true, force: true });
                    console.log(`✅ Cache removido: ${path.relative(this.projectPath, cachePath)} (${this.formatSize(size)})`);
                    this.totalCleaned += size;
                } catch (error) {
                    console.log(`⚠️  Erro ao remover cache: ${path.relative(this.projectPath, cachePath)}`);
                }
            }
        }
    }

    async cleanTempFiles() {
        console.log('\n🗑️  Limpando arquivos temporários...');
        
        const tempFiles = [
            'package-lock.json',
            'yarn.lock',
            'create_shortcut.vbs',
            'installer.nsh',
            'quick-build.log',
            path.join('frontend', 'package-lock.json'),
            path.join('frontend', 'yarn.lock')
        ];

        let tempFilesRemoved = 0;

        for (const tempFile of tempFiles) {
            const fullPath = path.join(this.projectPath, tempFile);
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                    console.log(`✅ Arquivo temporário removido: ${tempFile}`);
                    tempFilesRemoved++;
                } catch (error) {
                    console.log(`⚠️  Erro ao remover: ${tempFile}`);
                }
            }
        }

        if (tempFilesRemoved === 0) {
            console.log('ℹ️  Nenhum arquivo temporário encontrado');
        }
    }

    async showSummary() {
        console.log('\n✨ LIMPEZA CONCLUÍDA!');
        console.log('=====================\n');
        
        console.log(`💾 Espaço liberado: ${this.formatSize(this.totalCleaned)}`);
        
        console.log('\n📋 ARQUIVOS REMOVIDOS:');
        console.log('✅ Executáveis e builds');
        console.log('✅ Dependências Node.js');
        console.log('✅ Cache de build');
        console.log('✅ Arquivos temporários');
        
        console.log('\n🔒 ARQUIVOS PRESERVADOS:');
        console.log('• Dados do usuário (pasta data/)');
        console.log('• Configurações (.env)');
        console.log('• Código-fonte');
        console.log('• Atalhos da área de trabalho');
        
        console.log('\n🚀 PRÓXIMOS PASSOS:');
        console.log('Para usar o sistema novamente:');
        console.log('1. Execute: npm install');
        console.log('2. Execute: npm run setup');
        console.log('3. Ou execute: node setup.js');
        
        console.log('\n🎉 Sistema limpo e pronto para rebuild!');
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
}

if (require.main === module) {
    const cleaner = new GMVCleaner();
    cleaner.run().catch(console.error);
}

module.exports = GMVCleaner;