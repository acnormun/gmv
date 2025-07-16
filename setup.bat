@echo off
title GMV Sistema - Setup Completo
color 0A

echo.
echo  ========================================
echo    GMV SISTEMA - SETUP AUTOMATICO
echo  ========================================
echo.
echo  Este script vai:
echo  - Verificar pre-requisitos
echo  - Instalar dependencias
echo  - Fazer build do projeto
echo  - Criar atalho na area de trabalho
echo  - Deixar tudo pronto para uso
echo.
echo  Pressione qualquer tecla para continuar...
pause > nul

echo.
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Instale Node.js em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo OK: Node.js encontrado

echo.
echo [2/5] Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    python3 --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERRO: Python nao encontrado!
        echo Instale Python em: https://python.org/
        echo.
        pause
        exit /b 1
    )
)
echo OK: Python encontrado

echo.
echo [3/5] Executando setup completo...
echo Isso pode demorar alguns minutos...
echo.
node setup.js
if %errorlevel% neq 0 (
    echo.
    echo ERRO: Falha no setup!
    echo Verifique os erros acima.
    echo.
    pause
    exit /b 1
)

echo.
echo [4/5] Verificando se o executavel foi criado...
if exist "dist\*.exe" (
    echo OK: Executavel criado com sucesso!
) else (
    echo ERRO: Executavel nao foi criado!
    echo Verifique a pasta dist/
    pause
    exit /b 1
)

echo.
echo [5/5] Finalizando...
echo.
echo  ========================================
echo    SETUP CONCLUIDO COM SUCESSO!
echo  ========================================
echo.
echo  O GMV Sistema esta pronto para uso!
echo.
echo  COMO USAR:
echo  - Execute o atalho na area de trabalho
echo  - Ou va na pasta dist/ e execute o .exe
echo.
echo  ARQUIVOS IMPORTANTES:
echo  - Executavel: dist/
echo  - Configuracao: .env
echo  - Dados: data/
echo.
echo  Para atualizar no futuro:
echo  git pull
echo  SETUP.bat
echo.
echo  Pressione qualquer tecla para finalizar...
pause > nul

echo.
echo Abrindo pasta dist...
explorer dist

exit /b 0