# 📱 Sistema de Push Notifications

Este documento explica como funciona o sistema completo de notificações push do portal de notícias.

## 🎯 Funcionalidade

Quando um usuário clica em **"Eu quero!"** no popup de notificações:

1. O navegador solicita permissão para enviar notificações
2. Se aprovado, o usuário é inscrito no sistema de push notifications
3. A subscrição é salva no Directus
4. **Automaticamente**, sempre que uma nova notícia é criada no Directus, **TODOS os usuários inscritos recebem uma notificação push** contendo:
   - **Título da notícia**
   - **Breve descrição (resumo)**
   - **Logo do portal**
   - **Link direto** para ler a notícia completa

## 📋 Pré-requisitos

Antes de tudo funcionar, você precisa:

### 1. Criar a coleção `push_subscriptions` no Directus

Execute o script SQL no banco de dados PostgreSQL:

```bash
# Conectar ao container do PostgreSQL
docker-compose exec directus-db psql -U directus -d directus

# Copiar e colar o conteúdo de database/migrations/002_push_subscriptions.sql
```

Ou crie manualmente através da interface do Directus:

**Coleção:** `push_subscriptions`

| Campo | Tipo | Requerido | Único |
|-------|------|-----------|-------|
| `id` | UUID | Sim | Sim |
| `endpoint` | Text | Sim | Sim |
| `expiration_time` | BigInteger | Não | Não |
| `keys_p256dh` | Text | Sim | Não |
| `keys_auth` | Text | Sim | Não |
| `user_agent` | Text | Não | Não |
| `created_at` | Timestamp | Não | Não |
| `updated_at` | Timestamp | Não | Não |

### 2. Instalar dependências

```bash
# No diretório /api
cd api
npm install web-push
```

Ou use o package.json que já foi atualizado:

```bash
cd api
npm install
```

### 3. Reiniciar o Directus

Para carregar a extensão do hook:

```bash
docker-compose restart directus
```

## 🔧 Como Funciona

### 1. Frontend (NotificationPopup.tsx)

Quando o usuário aceita as notificações:

1. **Solicita permissão** do navegador
2. **Registra um Service Worker** (`sw.js`)
3. **Cria uma subscrição push** usando o PushManager API
4. **Envia a subscrição** para `/api/push/subscribe`
5. **Salva no Directus** na coleção `push_subscriptions`

### 2. Backend (Hook do Directus)

Quando uma nova notícia é criada (`noticias.items.create`):

1. **Busca a notícia** recém-criada
2. **Busca todas as subscrições** ativas
3. **Monta o payload** da notificação:
   ```json
   {
     "title": "Título da Notícia",
     "body": "Resumo da notícia...",
     "icon": "/api/directus/assets/[imagem_capa_id]",
     "badge": "/favicon.ico",
     "tag": "news-123",
     "data": {
       "url": "https://seu-dominio.com/noticia/slug-da-noticia",
       "noticiaId": "123"
     }
   }
   ```
4. **Envia a notificação** para cada subscrição usando `web-push`
5. **Remove subscrições inválidas** automaticamente (erro 410)

### 3. Service Worker (sw.js)

Quando uma notificação push chega:

1. **Recebe o payload** do servidor
2. **Exibe a notificação** no sistema operacional com:
   - Título
   - Descrição
   - Ícone (logo do portal ou imagem da notícia)
   - Ações ("Ver notícia" / "Dispensar")
3. **Ao clicar**, abre a página da notícia

## 🔑 Chaves VAPID

### Chaves Atuais (Desenvolvimento)

As chaves VAPID atuais são **genéricas** e servem apenas para desenvolvimento:

- **Public Key:** `BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8zaRypE3qv8YYSy1yWL0L9PwbIyDPIY6ZMgcI3gXZhKL0wLyX8Qp9g`
- **Private Key:** `UUxE4PubeL3FTULRzG7b7WpjZ0SyZZz-qJLs5lqA-2g`

### ⚠️ IMPORTANTE: Gerar Chaves para Produção

**ANTES DE COLOCAR EM PRODUÇÃO**, você DEVE gerar suas próprias chaves VAPID:

```bash
# Instalar web-push globalmente
npm install -g web-push

# Gerar novas chaves
web-push generate-vapid-keys

# Resultado:
# Public Key: [sua chave pública]
# Private Key: [sua chave privada]
```

Depois, atualize as chaves em 3 lugares:

1. **NotificationPopup.tsx** (linha 74):
   ```typescript
   const vapidPublicKey = 'SUA_CHAVE_PUBLICA_AQUI';
   ```

2. **send-push-notifications.ts** (linhas 5-6):
   ```typescript
   const VAPID_PUBLIC_KEY = 'SUA_CHAVE_PUBLICA_AQUI';
   const VAPID_PRIVATE_KEY = 'SUA_CHAVE_PRIVADA_AQUI';
   ```

3. **Variáveis de Ambiente** (recomendado):
   Crie em `.env` ou `.env.local`:
   ```
   VAPID_PUBLIC_KEY=SUA_CHAVE_PUBLICA_AQUI
   VAPID_PRIVATE_KEY=SUA_CHAVE_PRIVADA_AQUI
   VAPID_SUBJECT=mailto:seu-email@dominio.com
   ```

## 🚀 Como Testar

### 1. Iniciar o sistema

```bash
# Iniciar Directus e banco de dados
docker-compose up -d

# Iniciar o frontend
cd frontend
npm run dev
```

### 2. Aceitar notificações

1. Acesse o portal (http://localhost:3000)
2. Aguarde o popup aparecer
3. Clique em **"Eu quero!"**
4. Aceite as permissões no navegador

### 3. Criar uma nova notícia

1. Acesse o Directus (http://localhost:8055)
2. Faça login com `admin@example.com` / `admin123`
3. Vá em **"Notícias"**
4. Clique em **"Criar Item"**
5. Preencha:
   - Título
   - Resumo (será mostrado na notificação)
   - Slug
   - Imagem de capa (opcional)
   - Categoria
   - Conteúdo
6. Clique em **"Salvar"**

### 4. Verificar a notificação

Em alguns segundos, você deve ver uma **notificação do sistema** com:

- ✅ Título da notícia
- ✅ Resumo
- ✅ Logo do portal
- ✅ Ao clicar, abre a página da notícia

## 📊 Monitoramento

### Verificar subscrições ativas

No Directus:
1. Acesse a coleção **"Push Subscriptions"**
2. Veja todos os usuários inscritos

### Logs do sistema

```bash
# Ver logs do Directus
docker-compose logs -f directus

# Procurar por:
# - "Notificação enviada para: ..."
# - "Notificações push enviadas para X subscrições"
# - "Subscrição inválida removida: ..."
```

### Console do navegador

Abra o DevTools:
- **Aceitar notificações:** "Subscrição salva com sucesso!"
- **Erro ao salvar:** "Erro ao salvar subscrição no servidor"
- **Receber push:** Verifique a aba "Application" > "Service Workers"

## 🔧 Troubleshooting

### Notificações não aparecem

1. **Verifique permissões:** No navegador, vá em "Configurações" > "Privacidade e segurança" > "Notificações" e certifique-se de que o site tem permissão.

2. **Verifique o Service Worker:** Abra DevTools > Application > Service Workers e confirme que `sw.js` está registrado e ativo.

3. **Verifique a subscrição:** No console, execute:
   ```javascript
   navigator.serviceWorker.ready.then(reg => 
     reg.pushManager.getSubscription().then(sub => console.log(sub))
   );
   ```

4. **Verifique os logs do Directus:**
   ```bash
   docker-compose logs directus | grep "push"
   ```

### Hook não está executando

1. **Reinicie o Directus:**
   ```bash
   docker-compose restart directus
   ```

2. **Verifique se a extensão foi compilada:**
   ```bash
   ls -la api/src/extensions/hooks/
   ```

3. **Verifique os logs:**
   ```bash
   docker-compose logs directus | tail -50
   ```

### Subscrições não são salvas

1. **Verifique se a coleção existe:** No Directus, procure por "push_subscriptions"

2. **Verifique o endpoint:** Abra DevTools > Network e procure por `/api/push/subscribe`

3. **Verifique erros no console:** Abra DevTools > Console

## 📝 Arquivos Importantes

- **Frontend:**
  - `/frontend/components/NotificationPopup.tsx` - Popup de permissão
  - `/frontend/public/sw.js` - Service Worker
  - `/frontend/app/api/push/subscribe/route.ts` - API para salvar subscrições

- **Backend:**
  - `/api/src/extensions/hooks/send-push-notifications.ts` - Hook que envia notificações
  - `/api/package.json` - Dependências (inclui `web-push`)
  - `/database/migrations/002_push_subscriptions.sql` - Migração da tabela

## 🎉 Pronto!

Agora seu portal de notícias tem um sistema completo de **push notifications** que:

✅ Solicita permissão do usuário de forma elegante
✅ Salva subscrições no Directus
✅ Envia notificações automaticamente quando novas notícias são criadas
✅ Exibe notificações com título, descrição e logo
✅ Abre a notícia ao clicar
✅ Remove subscrições inválidas automaticamente

---

**Desenvolvido para o Portal de Notícias - Crônica Digital**

