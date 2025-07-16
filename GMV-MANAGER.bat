@echo off
title GMV Sistema - Gerenciador
color 0B

echo.
echo  ========================================
echo    GMV SISTEMA - GERENCIADOR
echo  ========================================
echo.

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Instale Node.js em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

node gmv-manager.js

pause > nul
exit /b 0