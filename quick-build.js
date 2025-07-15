// quick-build.js - Build rápido sem ícones
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 BUILD RÁPIDO DO GMV SISTEMA');
console.log('==============================\n');

// Cria diretório build se não existir (para o installer.nsh)
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
    console.log('📁 Diretório build criado');
}

// Cria arquivo installer.nsh básico
const nsisScript = `; Script básico do instalador
!define PRODUCT_NAME "GMV Sistema"
!define PRODUCT_VERSION "1.0.0"

RequestExecutionLevel user
ShowInstDetails show

Section "Principal" SecMain
    DetailPrint "Instalando GMV Sistema..."
SectionEnd

Function .onInstSuccess
    MessageBox MB_YESNO "Instalação concluída!$\\r$\\n$\\r$\\nDeseja executar o GMV Sistema?" IDNO NoRun
        Exec "$INSTDIR\\GMV Sistema.exe"
    NoRun:
FunctionEnd
`;

const nsisPath = path.join(buildDir, 'installer.nsh');
fs.writeFileSync(nsisPath, nsisScript);
console.log('✅ Script do instalador criado');

console.log('\n🔨 Iniciando build...');
console.log('Isso pode demorar alguns minutos...\n');

// Executa o build
const buildProcess = exec('npm run build', (error, stdout, stderr) => {
    if (error) {
        console.error('❌ ERRO NO BUILD:');
        console.error(error.message);
        
        console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
        console.log('1. Verifique se todas as dependências estão instaladas:');
        console.log('   npm install');
        console.log('');
        console.log('2. Tente limpar e reinstalar:');
        console.log('   rm -rf node_modules');
        console.log('   npm install');
        console.log('');
        console.log('3. Se ainda não funcionar, tente build direto:');
        console.log('   npx electron-builder');
        
        return;
    }
    
    if (stderr && !stderr.includes('WARNING')) {
        console.log('\n⚠️ AVISOS/ERROS:');
        console.log(stderr);
    }
    
    console.log('\n✅ BUILD CONCLUÍDO!');
    console.log('==================');
    
    // Verifica se os arquivos foram criados
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir);
        console.log('\n📦 Arquivos criados em dist/:');
        files.forEach(file => {
            const filePath = path.join(distDir, file);
            const stats = fs.statSync(filePath);
            const size = (stats.size / 1024 / 1024).toFixed(1);
            
            if (file.endsWith('.exe')) {
                console.log(`   🎯 ${file} (${size} MB) ← EXECUTE ESTE`);
            } else {
                console.log(`   📄 ${file} (${size} MB)`);
            }
        });
        
        console.log('\n🎉 SUCESSO!');
        console.log('===========');
        console.log('1. Execute o instalador .exe na pasta dist/');
        console.log('2. Durante a instalação, marque "Criar atalho na área de trabalho"');
        console.log('3. O app será instalado e criará o atalho automaticamente');
        
    } else {
        console.log('\n❌ Pasta dist/ não foi criada');
        console.log('Verifique os erros acima');
    }
});

// Mostra output em tempo real
buildProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
});

buildProcess.stderr.on('data', (data) => {
    // Só mostra erros reais, não warnings
    const output = data.toString();
    if (output.includes('ERROR') || output.includes('FATAL')) {
        process.stderr.write(data);
    }
});