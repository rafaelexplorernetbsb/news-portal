# 🔧 Extensões do Directus

Este projeto inclui extensões customizadas para o Directus que adicionam funcionalidades especiais ao portal de notícias.

## 📋 Extensões Disponíveis

### 🖥️ Terminal Module (`extensions/terminal`)
- **Tipo:** Module
- **Descrição:** Terminal interativo no admin do Directus
- **Funcionalidades:**
  - Execute comandos reais do sistema operacional
  - Navegação por diretórios (`cd`, `ls`, `pwd`)
  - Histórico de comandos
  - Acesso restrito a administradores

### 🔌 Terminal Endpoint (`extensions/terminal-endpoint`)
- **Tipo:** Endpoint
- **Descrição:** API para execução de comandos do terminal
- **Funcionalidades:**
  - Execução segura de comandos via API
  - Gerenciamento de sessões por usuário
  - Validação de permissões de administrador

### 🔔 Push Notifications (`extensions/push-notifications`)
- **Tipo:** Endpoint
- **Descrição:** Sistema de notificações push
- **Funcionalidades:**
  - Envio de notificações para navegadores
  - Integração com Service Workers
  - Notificações automáticas para novas notícias

## 🚀 Instalação e Compilação

### Método 1: Setup Automático
```bash
# Execute o setup completo (inclui compilação das extensões)
bash setup.sh
```

### Método 2: Compilação Manual
```bash
# Compile apenas as extensões
bash compile-extensions.sh
```

### Método 3: Compilação Individual
```bash
# Terminal Module
cd extensions/terminal
npm install
npm run build

# Terminal Endpoint
cd extensions/terminal-endpoint
npm install
npm run build

# Push Notifications
cd extensions/push-notifications
npm install
npm run build
```

## 🔧 Requisitos

- **Node.js:** 18+ (recomendado 20.x LTS)
- **npm** ou **pnpm**
- **@directus/extensions-sdk:** Instalado globalmente

```bash
# Instalar SDK do Directus
npm install -g @directus/extensions-sdk
```

## 📁 Estrutura das Extensões

```
extensions/
├── terminal/                 # Terminal Module
│   ├── src/
│   │   ├── index.ts         # Definição do módulo
│   │   └── terminal.vue     # Interface do terminal
│   ├── dist/                # Arquivos compilados
│   └── package.json
├── terminal-endpoint/       # Terminal Endpoint
│   ├── src/
│   │   └── index.ts         # API do terminal
│   ├── dist/                # Arquivos compilados
│   └── package.json
└── push-notifications/      # Push Notifications
    ├── src/
    │   ├── index.ts         # Endpoint de notificações
    │   └── webhook.ts       # Webhook para novas notícias
    ├── dist/                # Arquivos compilados
    └── package.json
```

## 🔍 Verificação

### Verificar se as extensões foram compiladas:
```bash
# Verificar arquivos compilados
ls -la extensions/*/dist/index.js
```

### Verificar se o Directus carregou as extensões:
```bash
# Verificar extensões carregadas
curl http://localhost:8055/extensions
```

### Verificar módulos disponíveis:
```bash
# Verificar módulos no admin
curl http://localhost:8055/modules
```

## 🐛 Solução de Problemas

### Terminal não aparece no admin:
1. **Verifique se foi compilado:**
   ```bash
   ls -la extensions/terminal/dist/index.js
   ```

2. **Reinicie o Directus:**
   ```bash
   docker compose restart directus
   ```

3. **Verifique logs:**
   ```bash
   docker compose logs directus | grep -i terminal
   ```

### Erro de compilação:
1. **Instale dependências:**
   ```bash
   cd extensions/terminal
   npm install --legacy-peer-deps
   ```

2. **Instale SDK globalmente:**
   ```bash
   npm install -g @directus/extensions-sdk
   ```

3. **Compile manualmente:**
   ```bash
   npm run build
   ```

### Permissões de administrador:
- O Terminal só aparece para usuários com `admin_access: true`
- Verifique as permissões no Directus Admin

## 🔄 Atualizações

Após fazer alterações nas extensões:

1. **Recompile:**
   ```bash
   bash compile-extensions.sh
   ```

2. **Reinicie o Directus:**
   ```bash
   docker compose restart directus
   ```

3. **Verifique se funcionou:**
   - Acesse `http://localhost:8055/admin/terminal`
   - Faça login como administrador

## 📚 Documentação

- [Directus Extensions SDK](https://docs.directus.io/extensions/)
- [Module Development](https://docs.directus.io/extensions/modules/)
- [Endpoint Development](https://docs.directus.io/extensions/endpoints/)

## 🤝 Contribuição

Para adicionar novas extensões:

1. Crie o diretório em `extensions/nova-extensao/`
2. Configure o `package.json` com o SDK do Directus
3. Implemente a extensão em `src/index.ts`
4. Adicione ao `compile-extensions.sh`
5. Teste e documente

---

**Nota:** As extensões são compiladas automaticamente durante o `setup.sh`, mas podem ser recompiladas manualmente quando necessário.
