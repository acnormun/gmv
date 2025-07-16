# GMV Sistema - Setup Completo

## 🚀 Instalação Rápida

### 1. Clone o Repositório
```bash
git clone [URL_DO_REPOSITORIO]
cd gmv-sistema
```

### 2. Execute o Setup Automático

#### Windows
```batch
SETUP.bat
```

#### Linux/Mac
```bash
chmod +x setup.sh
./setup.sh
```

#### Ou Manual (qualquer SO)
```bash
node setup.js
```

## ✅ O que o Setup Faz

1. **Verifica pré-requisitos**
   - Node.js (obrigatório)
   - Python (obrigatório)
   - Estrutura do projeto

2. **Configura o ambiente**
   - Cria arquivo `.env` com configurações padrão
   - Cria estrutura de pastas (`data/`, `data/processos/`, `data/dat/`)
   - Cria arquivo de triagem inicial

3. **Instala dependências**
   - Dependências do Electron (`npm install`)
   - Dependências do frontend (`npm install`)
   - Dependências do backend Python (`pip install`)

4. **Faz o build completo**
   - Build do frontend Vue.js
   - Build do executável Electron

5. **Cria atalho na área de trabalho**
   - Windows: arquivo `.lnk`
   - Linux/Mac: script executável

## 📋 Pré-requisitos

### Node.js
- **Windows**: https://nodejs.org/
- **Linux**: `sudo apt install nodejs npm` (Ubuntu/Debian)
- **Mac**: `brew install node`

### Python
- **Windows**: https://python.org/
- **Linux**: `sudo apt install python3 python3-pip` (Ubuntu/Debian)
- **Mac**: `brew install python`

## 🎯 Após o Setup

### Estrutura de Arquivos
```
gmv-sistema/
├── dist/                   # Executável gerado
├── data/                   # Dados do sistema
│   ├── processos/         # Arquivos markdown dos processos
│   ├── dat/               # Arquivos .dat
│   └── triagem.md         # Tabela de triagem
├── .env                   # Configurações do ambiente
└── setup.js      # Script de setup
```

### Como Usar
1. **Execute o atalho na área de trabalho**
2. **Ou navegue para `dist/` e execute o `.exe`**
3. **Configure as pastas no arquivo `.env` se necessário**

## ⚙️ Configuração Personalizada

### Arquivo `.env`
```env
# Arquivo principal de triagem
PATH_TRIAGEM=./data/triagem.md

# Pasta dos arquivos markdown
PASTA_DESTINO=./data/processos

# Pasta dos arquivos .dat
PASTA_DAT=./data/dat

# Token do GitHub (opcional)
GITHUB_TOKEN=seu_token_aqui
```

### Caminhos Absolutos (Windows)
```env
PATH_TRIAGEM=C:/GMV_Data/triagem.md
PASTA_DESTINO=C:/GMV_Data/processos
PASTA_DAT=C:/GMV_Data/dat
```

### Caminhos Absolutos (Linux/Mac)
```env
PATH_TRIAGEM=/home/usuario/GMV_Data/triagem.md
PASTA_DESTINO=/home/usuario/GMV_Data/processos
PASTA_DAT=/home/usuario/GMV_Data/dat
```

## 🔧 Manutenção

### Atualizar o Sistema
```bash
git pull
# Windows
SETUP.bat

# Linux/Mac
./setup.sh
```

### Reconfigurar
1. Edite o arquivo `.env`
2. Execute `node setup.js`

### Debug/Desenvolvimento
```bash
npm run dev
```

### Limpar e Reconstruir
```bash
npm run clean
node setup.js
```

## 🚨 Solução de Problemas

### Erro: "Node.js não encontrado"
- Instale Node.js: https://nodejs.org/
- Reinicie o terminal/cmd

### Erro: "Python não encontrado"
- Instale Python: https://python.org/
- No Windows, marque "Add to PATH" durante a instalação

### Erro: "Executável não foi criado"
```bash
# Limpe e tente novamente
npm run clean
rm -rf node_modules
npm install
node setup.js
```

### Erro: "Dependências Python falharama"
```bash
# Tente manualmente
cd backend
pip install -r requirements.txt
# ou
pip3 install -r requirements.txt
```

### Erro: "Atalho não foi criado"
- No Windows: Execute como administrador
- No Linux/Mac: Verifique permissões da área de trabalho

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do setup
2. Confira se todos os pré-requisitos estão instalados
3. Tente executar os comandos manualmente
4. Verifique permissões de pasta

## 🎉 Pronto!

Após executar o setup, o GMV Sistema estará completamente configurado e pronto para uso. Basta executar o atalho na área de trabalho ou o executável na pasta `dist/`.

---

**Desenvolvido para facilitar a instalação em múltiplas máquinas** 🚀