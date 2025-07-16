@echo off
title GMV Sistema - Correcao de Permissoes
color 0E

echo.
echo  ========================================
echo    GMV SISTEMA - CORRECAO DE PERMISSOES
echo  ========================================
echo.
echo  Detectado erro de permissao (EPERM)
echo.
echo  Este script ira tentar corrigir:
echo  - Problemas de antivirus
echo  - Falta de permissoes
echo  - Processos em execucao
echo  - Cache corrompido
echo.
echo  Pressione qualquer tecla para iniciar a correcao...
pause > nul

echo.
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    pause
    exit /b 1
)
echo OK: Node.js encontrado

echo.
echo [2/5] Finalizando processos Electron...
taskkill /F /IM electron.exe >nul 2>&1
echo OK: Processos finalizados

echo.
echo [3/5] Removendo node_modules (pode demorar)...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo OK: node_modules removido
) else (
    echo OK: node_modules nao existia
)

echo.
echo [4/5] Limpando cache do npm...
npm cache clean --force
echo OK: Cache limpo

echo.
echo [5/5] Executando script de correcao...
echo.
node fix-permissions.js

echo.
echo  ========================================
echo    CORRECAO CONCLUIDA!
echo  ========================================
echo.
echo  Se ainda houver problemas:
echo  1. Execute este arquivo como ADMINISTRADOR
echo  2. Adicione a pasta ao antivirus (exclusoes)
echo  3. Tente SETUP.bat novamente
echo.
echo  Pressione qualquer tecla para finalizar...
pause > nul

exit /b 0