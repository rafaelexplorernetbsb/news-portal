# 🕷️ Gerenciamento de Webscrapers

Este documento descreve como usar os scripts de gerenciamento de webscrapers do portal de notícias.

## 📋 Visão Geral

O sistema possui 6 webscrapers que coletam notícias automaticamente de diferentes fontes:

- **G1 Tecnologia** (`g1.js`)
- **Folha de S.Paulo** (`folha.js`)
- **UOL Tecnologia** (`uol.js`)
- **Tecmundo** (`tecmundo.js`)
- **Metrópoles** (`metropoles.js`)
- **Olhar Digital** (`olhar-digital.js`)

## 🚀 Scripts Disponíveis

### 1. Iniciar Todos os Webscrapers

```bash
./start-webscrapers.sh
```

**Funcionalidades:**
- ✅ Verifica se o Directus está rodando
- ✅ Para webscrapers já em execução (evita duplicidade)
- ✅ Cria diretório de logs automaticamente
- ✅ Inicia todos os 6 webscrapers em background
- ✅ Registra PID de cada processo
- ✅ Exibe resumo de sucesso/falha

**Logs:** Salvos em `logs/webscrapers/[nome].log`

---

### 2. Parar Todos os Webscrapers

```bash
./stop-webscrapers.sh
```

**Funcionalidades:**
- ✅ Para webscrapers via PID files
- ✅ Tenta parada graciosa primeiro (SIGTERM)
- ✅ Força parada se necessário (SIGKILL)
- ✅ Limpa PID files órfãos
- ✅ Verifica e mata processos restantes
- ✅ Exibe resumo de sucesso/falha

---

### 3. Ver Status dos Webscrapers

```bash
./status-webscrapers.sh
```

**Funcionalidades:**
- ✅ Mostra status de cada webscraper (rodando/parado)
- ✅ Exibe PID, tempo de atividade e tamanho do log
- ✅ Lista processos node relacionados
- ✅ Verifica conexão com Directus
- ✅ Exibe resumo geral

**Exemplo de saída:**

```
G1 Tecnologia:           ✓ Rodando  │ PID: 12345  │ Uptime: 01:23:45  │ Log: 2.5M
Folha de S.Paulo:        ✗ Parado    │ Não iniciado
```

---

## 📂 Estrutura de Arquivos

```
news-portal/
├── start-webscrapers.sh       # Script para iniciar todos
├── stop-webscrapers.sh        # Script para parar todos
├── status-webscrapers.sh      # Script para ver status
├── webscraper-service/        # Diretório dos webscrapers
│   ├── g1.js
│   ├── folha.js
│   ├── uol.js
│   ├── tecmundo.js
│   ├── metropoles.js
│   └── olhar-digital.js
└── logs/webscrapers/          # Logs e PIDs (criado automaticamente)
    ├── g1.log
    ├── g1.pid
    ├── folha.log
    ├── folha.pid
    └── ...
```

---

## 🔧 Comandos Úteis

### Ver logs em tempo real (todos):
```bash
tail -f logs/webscrapers/*.log
```

### Ver log de um webscraper específico:
```bash
tail -f logs/webscrapers/g1.log
```

### Iniciar um webscraper específico manualmente:
```bash
cd webscraper-service
node g1.js
```

### Parar um webscraper específico:
```bash
# Via PID file
kill $(cat logs/webscrapers/g1.pid)

# Ou via nome do processo
pkill -f "g1.js"
```

---

## ⚙️ Requisitos

### Antes de Usar os Scripts:

1. **Directus deve estar rodando:**
   ```bash
   docker-compose up -d
   ```

2. **Variáveis de ambiente configuradas:**
   - `webscraper-service/.env` deve existir com `DIRECTUS_TOKEN`

3. **Dependências instaladas:**
   ```bash
   cd webscraper-service
   npm install
   ```

---

## 🎯 Fluxo de Trabalho Recomendado

### Inicialização:
```bash
# 1. Iniciar Directus
docker-compose up -d

# 2. Aguardar Directus ficar pronto
sleep 10

# 3. Verificar status
./status-webscrapers.sh

# 4. Iniciar webscrapers
./start-webscrapers.sh

# 5. Verificar se iniciaram
./status-webscrapers.sh
```

### Monitoramento:
```bash
# Ver status periodicamente
watch -n 5 ./status-webscrapers.sh

# Ou monitorar logs
tail -f logs/webscrapers/*.log
```

### Parada:
```bash
# Parar webscrapers
./stop-webscrapers.sh

# Verificar se pararam
./status-webscrapers.sh

# Parar Directus (se necessário)
docker-compose down
```

---

## 🐛 Resolução de Problemas

### Problema: "Directus não está rodando"
**Solução:**
```bash
docker-compose up -d
sleep 10
./start-webscrapers.sh
```

### Problema: Webscraper não inicia
**Solução:**
```bash
# Ver erro no log
tail -f logs/webscrapers/[nome].log

# Verificar .env
cat webscraper-service/.env

# Testar manualmente
cd webscraper-service
node g1.js
```

### Problema: PID file órfão
**Solução:**
```bash
# O script de status já remove automaticamente
./status-webscrapers.sh

# Ou remover manualmente
rm logs/webscrapers/*.pid
```

### Problema: Processos duplicados
**Solução:**
```bash
# Parar todos
./stop-webscrapers.sh

# Verificar
./status-webscrapers.sh

# Reiniciar
./start-webscrapers.sh
```

---

## 📊 Informações Técnicas

### Como os Scripts Funcionam:

1. **start-webscrapers.sh:**
   - Usa `nohup` para manter processo rodando após logout
   - Redireciona stdout/stderr para arquivo de log
   - Salva PID em arquivo `.pid`
   - Executa em background com `&`

2. **stop-webscrapers.sh:**
   - Lê PID de arquivo `.pid`
   - Envia SIGTERM primeiro (parada graciosa)
   - Envia SIGKILL se necessário (parada forçada)
   - Limpa PID files

3. **status-webscrapers.sh:**
   - Verifica se processo está ativo via `ps -p $PID`
   - Calcula uptime do processo
   - Obtém tamanho do arquivo de log
   - Verifica saúde do Directus

---

## 🎨 Códigos de Cores

- 🟢 **Verde**: Sucesso, rodando
- 🔴 **Vermelho**: Erro, parado
- 🟡 **Amarelo**: Aviso
- 🔵 **Azul**: Informação
- 🟦 **Ciano**: Headers, títulos

---

## ✨ Dicas

1. **Sempre verifique o status antes de iniciar** para evitar duplicidade
2. **Monitore os logs** para identificar problemas rapidamente
3. **Use `tail -f`** para ver logs em tempo real
4. **Automatize** com cron jobs se necessário
5. **Reinicie** os webscrapers periodicamente para evitar memory leaks

---

## 📝 Notas Importantes

- ⚠️ **Não execute múltiplas instâncias** do mesmo webscraper
- ⚠️ **Directus deve estar acessível** em `http://localhost:8055`
- ⚠️ **Token válido** é necessário em `webscraper-service/.env`
- ⚠️ **Logs podem crescer** - considere rotação de logs
- ⚠️ **PIDs são temporários** - perdem validade após reboot

---

**Última Atualização:** 2025
**Versão:** 1.0
