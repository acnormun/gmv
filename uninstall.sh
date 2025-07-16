#!/bin/bash

# GMV Sistema - Desinstalação Completa para Linux/Mac
# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
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
echo -e "${RED}${BOLD}"
echo "  ========================================"
echo "    GMV SISTEMA - DESINSTALAÇÃO"
echo "  ========================================"
echo -e "${NC}"
echo
echo "  ATENÇÃO: Este script irá remover:"
echo "  - Atalhos da área de trabalho"
echo "  - Executáveis gerados"
echo "  - Dependências instaladas"
echo "  - Cache de build"
echo "  - Arquivos temporários"
echo
echo "  Você poderá escolher manter seus dados"
echo "  (processos, configurações, etc.)"
echo
echo -e "${YELLOW}Pressione ENTER para continuar ou Ctrl+C para cancelar...${NC}"
read

echo
log "[1/2] Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log "OK: Node.js encontrado - $NODE_VERSION"
else
    error "Node.js não encontrado!"
    echo
    error "O script de desinstalação precisa do Node.js"
    error "Instale Node.js:"
    error "  - Ubuntu/Debian: sudo apt install nodejs npm"
    error "  - CentOS/RHEL: sudo yum install nodejs npm"
    error "  - macOS: brew install node"
    error "  - Ou baixe em: https://nodejs.org/"
    echo
    error "Ou remova os arquivos manualmente:"
    error "  - Pasta dist/"
    error "  - Pasta node_modules/"
    error "  - Pasta frontend/node_modules/"
    error "  - Atalhos da área de trabalho"
    echo
    exit 1
fi

echo
log "[2/2] Executando desinstalação..."
echo

# Executa o script Node.js
if node uninstall.js; then
    log "Desinstalação concluída com sucesso!"
else
    error "Falha na desinstalação!"
    echo
    error "Você pode tentar remover manualmente:"
    error "  - Pasta dist/"
    error "  - Pasta build/"
    error "  - Pasta node_modules/"
    error "  - Pasta frontend/node_modules/"
    error "  - Pasta frontend/dist/"
    error "  - Atalhos da área de trabalho"
    error "  - Pasta data/ (se desejar)"
    echo
    exit 1
fi

echo
echo -e "${GREEN}${BOLD}"
echo "  ========================================"
echo "    DESINSTALAÇÃO CONCLUÍDA!"
echo "  ========================================"
echo -e "${NC}"
echo
echo "  O GMV Sistema foi removido do sistema."
echo
echo "  Para reinstalar no futuro:"
echo "  1. Execute: ./setup.sh"
echo "  2. Ou execute: node setup.js"
echo
echo -e "${BLUE}Pressione ENTER para finalizar...${NC}"
read

exit 0