const fs = require('fs');
const path = require('path');

console.log('⚡ PREPARAÇÃO RÁPIDA PARA ELECTRON');
console.log('==================================\n');

const vueProjectPath = __dirname;
const electronProjectPath = path.dirname(__dirname);

function log(message, status = 'info') {
    const icons = { success: '✅', error: '', warning: '⚠️', info: 'ℹ️' };
    console.log(`${icons[status]} ${message}`);
}

function copyDirectory(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function prepareFrontend() {
    const sourcePath = path.join(vueProjectPath, 'dist');
    const targetPath = path.join(electronProjectPath, 'frontend', 'dist');
    if (!fs.existsSync(sourcePath)) {
        log('Build Vue não encontrado! Execute npm run build primeiro', 'error');
        return false;
    }
    try {
        log('Copiando frontend para estrutura Electron...');
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { recursive: true, force: true });
        }
        copyDirectory(sourcePath, targetPath);
        const indexPath = path.join(targetPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            log('Frontend preparado com sucesso!', 'success');
            log(`Arquivos copiados para: ${targetPath}`);
            console.log('\n📋 PRÓXIMOS PASSOS:');
            console.log('1. cd .. (voltar para pasta principal)');
            console.log('2. node main.js --dev (testar Electron)');
            console.log('3. npm run build (gerar executável)');
            return true;
        } else {
            throw new Error('index.html não encontrado após cópia');
        }
    } catch (error) {
        log(`Erro: ${error.message}`, 'error');
        return false;
    }
}

prepareFrontend();