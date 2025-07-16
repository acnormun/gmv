@echo off
title GMV Sistema - Desinstalacao Completa
color 0C

echo.
echo  ========================================
echo    GMV SISTEMA - DESINSTALACAO
echo  ========================================
echo.
echo  ATENCAO: Este script ira remover:
echo  - Atalhos da area de trabalho
echo  - Executaveis gerados
echo  - Dependencias instaladas
echo  - Cache de build
echo  - Arquivos temporarios
echo.
echo  Voce podera escolher manter seus dados
echo  (processos, configuracoes, etc.)
echo.
echo  Pressione qualquer tecla para continuar...
echo  Ou feche esta janela para cancelar.
pause > nul

echo.
echo [1/2] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo.
    echo O script de desinstalacao precisa do Node.js
    echo Instale Node.js em: https://nodejs.org/
    echo.
    echo Ou remova os arquivos manualmente:
    echo - Pasta dist/
    echo - Pasta node_modules/
    echo - Pasta frontend/node_modules/
    echo - Atalhos da area de trabalho
    echo.
    pause
    exit /b 1
)
echo OK: Node.js encontrado

echo.
echo [2/2] Executando desinstalacao...
echo.
node uninstall.js
if %errorlevel% neq 0 (
    echo.
    echo ERRO: Falha na desinstalacao!
    echo.
    echo Voce pode tentar remover manualmente:
    echo - Pasta dist/
    echo - Pasta build/
    echo - Pasta node_modules/
    echo - Pasta frontend/node_modules/
    echo - Pasta frontend/dist/
    echo - Atalhos da area de trabalho
    echo - Pasta data/ (se desejar)
    echo.
    pause
    exit /b 1
)

echo.
echo  ========================================
echo    DESINSTALACAO CONCLUIDA!
echo  ========================================
echo.
echo  O GMV Sistema foi removido do sistema.
echo.
echo  Para reinstalar no futuro:
echo  1. Execute SETUP.bat
echo  2. Ou execute: node setup.js
echo.
echo  Pressione qualquer tecla para finalizar...
pause > nul

exit /b 0