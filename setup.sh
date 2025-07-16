#!/bin/bash

# GMV Sistema - Setup Completo para Linux/Mac
# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Banner
echo -e "${GREEN}"
echo "  ========================================"
echo "    GMV SISTEMA - SETUP AUTOMATICO"
echo "  ========================================"
echo -e "${NC}"
echo
echo "  Este script vai:"
echo "  - Verificar pré-requisitos"
echo "  - Instalar dependências"
echo "  - Fazer build do projeto"
echo "  - Criar atalho na área de trabalho"
echo "  - Deixar tudo pronto para uso"
echo
read -p "Pressione ENTER para continuar..."

echo
log "[1/5] Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log "OK: Node.js encontrado - $NODE_VERSION"
else
    error "Node.js não encontrado!"
    error "Instale Node.js:"
    error "  - Ubuntu/Debian: sudo apt install nodejs npm"
    error "  - CentOS/RHEL: sudo yum install nodejs npm"
    error "  - macOS: brew install node"
    error "  - Ou baixe em: https://nodejs.org/"
    exit 1
fi

echo
log "[2/5] Verificando Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    log "OK: Python encontrado - $PYTHON_VERSION"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    log "OK: Python encontrado - $PYTHON_VERSION"
else
    error "Python não encontrado!"
    error "Instale Python:"
    error "  - Ubuntu/Debian: sudo apt install python3 python3-pip"
    error "  - CentOS/RHEL: sudo yum install python3 python3-pip"
    error "  - macOS: brew install python"
    error "  - Ou baixe em: https://python.org/"
    exit 1
fi

echo
log "[3/5] Executando setup completo..."
info "Isso pode demorar alguns minutos..."
echo

# Executa o script Node.js
if node setup.js; then
    log "Setup Node.js concluído com sucesso!"
else
    error "Falha no setup!"
    error "Verifique os erros acima."
    exit 1
fi

echo
log "[4/5] Verificando se o executável foi criado..."
if ls dist/*.AppImage &> /dev/null 2>&1 || ls dist/*.dmg &> /dev/null 2>&1 || ls dist/*.deb &> /dev/null 2>&1; then
    log "OK: Executável criado com sucesso!"
    EXECUTABLE=$(ls dist/*.AppImage dist/*.dmg dist/*.deb 2>/dev/null | head -1)
    info "Executável: $EXECUTABLE"
else
    error "Executável não foi criado!"
    error "Verifique a pasta dist/"
    exit 1
fi

echo
log "[5/5] Finalizando..."
echo
echo -e "${GREEN}"
echo "  ========================================"
echo "    SETUP CONCLUÍDO COM SUCESSO!"
echo "  ========================================"
echo -e "${NC}"
echo
echo "  O GMV Sistema está pronto para uso!"
echo
echo "  COMO USAR:"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "  - Execute: ./dist/*.AppImage"
    echo "  - Ou instale: sudo dpkg -i dist/*.deb"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  - Abra o arquivo .dmg na pasta dist/"
    echo "  - Arraste o app para Applications"
fi
echo
echo "  ARQUIVOS IMPORTANTES:"
echo "  - Executável: dist/"
echo "  - Configuração: .env"
echo "  - Dados: data/"
echo
echo "  Para atualizar no futuro:"
echo "  git pull"
echo "  ./setup.sh"
echo
echo "  Pressione ENTER para abrir a pasta dist..."
read

# Abre a pasta dist
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open dist/ 2>/dev/null || nautilus dist/ 2>/dev/null || echo "Abra manualmente: dist/"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open dist/
fi

log "Setup finalizado! 🎉"
exit 0