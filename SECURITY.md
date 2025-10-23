# 🔒 Arquitetura de Segurança

Este documento explica como a segurança foi implementada no Portal de Notícias.

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐
│   Navegador     │
│   (Cliente)     │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  Next.js        │ ← Frontend (porta 3000)
│  (Frontend)     │
└────────┬────────┘
         │ Server-Side
         ↓
┌─────────────────┐
│  Proxy API      │ ← /app/api/directus/[...path]/route.ts
│  (Next.js API)  │ ← /app/api/push/subscribe/route.ts
└────────┬────────┘
         │ Internal Network
         ↓
┌─────────────────┐
│   Directus      │ ← Backend CMS (porta 8055)
│   (Backend)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  PostgreSQL     │ ← Banco de Dados
│  + Redis        │ ← Cache
└─────────────────┘
```

## 🔐 Credenciais e Autenticação

### 1. **Usuário Admin do Directus**

**Propósito:** Login no painel administrativo do Directus

**Configuração:**
```bash
# No arquivo .env
DIRECTUS_ADMIN_EMAIL=admin@seudominio.com
DIRECTUS_ADMIN_PASSWORD=senha_admin_forte
```

**Uso:**
- Acessar https://api.seudominio.com/admin
- Fazer login com essas credenciais
- Gerenciar notícias, categorias, autores, etc.

### 2. **Usuário Proxy (Frontend → Directus)**

**Propósito:** O frontend precisa acessar o Directus para buscar notícias públicas

**Problema:** Não podemos expor tokens/credenciais no client-side (navegador)

**Solução:** Proxy server-side que faz autenticação internamente

**Configuração (2 opções):**

#### Opção A: Usar mesmas credenciais do Admin (Simples)

```bash
# No arquivo .env - apenas configure o admin
DIRECTUS_ADMIN_EMAIL=admin@seudominio.com
DIRECTUS_ADMIN_PASSWORD=senha_admin_forte

# O proxy automaticamente usará essas credenciais
```

**Vantagem:** Configuração mais simples  
**Desvantagem:** Admin e proxy usam mesmas credenciais

#### Opção B: Criar usuário específico para proxy (Recomendado)

1. Faça login no Directus Admin
2. Vá em "Settings" → "Users & Roles"
3. Crie um novo usuário:
   - Email: `proxy@seudominio.com`
   - Senha: Senha forte diferente
   - Role: Administrator (ou custom role com acesso de leitura)

4. Configure no `.env`:
```bash
# Admin (para você fazer login)
DIRECTUS_ADMIN_EMAIL=admin@seudominio.com
DIRECTUS_ADMIN_PASSWORD=senha_admin_forte

# Proxy (para o frontend acessar a API)
DIRECTUS_PROXY_EMAIL=proxy@seudominio.com
DIRECTUS_PROXY_PASSWORD=senha_proxy_forte
```

**Vantagem:** Separação de responsabilidades e maior segurança  
**Desvantagem:** Mais um usuário para gerenciar

## 🛡️ Camadas de Segurança Implementadas

### 1. **Proxy Server-Side**

✅ **Tokens nunca são expostos no client-side**
- O navegador NUNCA vê tokens do Directus
- Autenticação acontece no servidor Next.js
- Requisições são proxy-adas de forma segura

### 2. **CORS Configurado**

✅ **Apenas origens permitidas podem acessar a API**
```javascript
'Access-Control-Allow-Origin': '*' // Em dev
'Access-Control-Allow-Origin': 'https://seudominio.com' // Em prod
```

### 3. **HTTPS Obrigatório em Produção**

✅ **Push Notifications requerem HTTPS**
✅ **Dados criptografados em trânsito**
✅ **Certificados SSL via Let's Encrypt**

### 4. **Credenciais em Variáveis de Ambiente**

✅ **Nunca no código-fonte**
✅ **Arquivo .env não é versionado (gitignore)**
✅ **Cada ambiente tem suas próprias credenciais**

### 5. **Service Worker Seguro**

✅ **Não expõe tokens**
✅ **Registrado apenas via HTTPS em produção**
✅ **Valida origem das notificações**

## 🔑 Fluxo de Autenticação

### Frontend Público (Usuário final)

```
1. Usuário acessa https://seudominio.com
2. Frontend busca notícias via /api/directus/items/noticias
3. Proxy Next.js:
   - Autentica com Directus usando DIRECTUS_PROXY_EMAIL/PASSWORD
   - Obtém token (válido por 1 hora, em cache)
   - Faz requisição ao Directus com esse token
   - Retorna dados ao frontend
4. Frontend renderiza notícias
5. Usuário NUNCA vê o token
```

### Admin (Você/Equipe)

```
1. Você acessa https://api.seudominio.com/admin
2. Faz login com DIRECTUS_ADMIN_EMAIL/PASSWORD
3. Directus cria sessão autenticada
4. Você gerencia o conteúdo
5. Suas credenciais são completamente independentes do proxy
```

## ⚙️ Configuração Recomendada para Produção

### Arquivo `.env` Completo

```bash
# Database
DIRECTUS_DB_PASSWORD=senha_db_muito_forte_123!@#

# Admin (para login no painel)
DIRECTUS_ADMIN_EMAIL=admin@cronicadigital.com
DIRECTUS_ADMIN_PASSWORD=SenhaAdm1n!Forte@2025

# Proxy (para o frontend acessar API)
DIRECTUS_PROXY_EMAIL=proxy@cronicadigital.com
DIRECTUS_PROXY_PASSWORD=SenhaProxy!Forte@2025

# URLs
DIRECTUS_URL=https://api.cronicadigital.com
NEXT_PUBLIC_SITE_URL=https://cronicadigital.com

# Chaves (geradas)
DIRECTUS_KEY=abc123...
DIRECTUS_SECRET=xyz789...
```

### Criar Usuário Proxy no Directus

1. Login no Admin: https://api.seudominio.com/admin
2. Email: `admin@cronicadigital.com`
3. Senha: `SenhaAdm1n!Forte@2025`
4. Ir em Users → Create New User:
   - First Name: Proxy
   - Last Name: API
   - Email: `proxy@cronicadigital.com`
   - Password: `SenhaProxy!Forte@2025`
   - Role: Administrator
5. Save

Agora o sistema está completamente separado:
- **Admin:** Você faz login e gerencia conteúdo
- **Proxy:** Frontend acessa API de forma segura
- **Público:** Usuários veem notícias sem ver credenciais

## ✅ Checklist de Segurança

Antes de ir para produção:

- [ ] HTTPS configurado e funcionando
- [ ] Certificados SSL válidos (Let's Encrypt)
- [ ] Senhas fortes configuradas (mín. 16 caracteres)
- [ ] Chaves DIRECTUS_KEY e DIRECTUS_SECRET geradas (openssl rand -base64 32)
- [ ] Chaves VAPID geradas (npx web-push generate-vapid-keys)
- [ ] Arquivo .env com permissões corretas (chmod 600 .env)
- [ ] Usuário proxy criado (ou usar admin)
- [ ] CORS configurado para domínio específico
- [ ] Rate limiting habilitado
- [ ] Logs de acesso configurados
- [ ] Backup automático configurado
- [ ] Firewall configurado (apenas portas 80, 443 abertas)

## 🚨 O Que NUNCA Fazer

❌ **NUNCA** commite o arquivo `.env` no git  
❌ **NUNCA** use senhas fracas em produção  
❌ **NUNCA** exponha tokens no client-side  
❌ **NUNCA** desabilite HTTPS em produção  
❌ **NUNCA** use chaves padrão em produção  
❌ **NUNCA** compartilhe credenciais em texto plano  

## ✅ O Que Sempre Fazer

✅ **SEMPRE** use HTTPS em produção  
✅ **SEMPRE** gere novas chaves para cada ambiente  
✅ **SEMPRE** use senhas fortes e únicas  
✅ **SEMPRE** monitore logs de acesso  
✅ **SEMPRE** faça backup regular  
✅ **SEMPRE** mantenha dependências atualizadas  

---

**Se seguir essas práticas, seu portal estará seguro!** 🔒

