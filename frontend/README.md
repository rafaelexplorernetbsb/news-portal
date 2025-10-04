# News Portal - Frontend

Este é o frontend do News Portal, construído com [Next.js](https://nextjs.org) e integrado com Directus CMS.

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- pnpm (gerenciador de pacotes)
- Docker e Docker Compose (para o backend)
- Git

### Instalação do pnpm
Se você não tem o pnpm instalado:
```bash
# Via npm
npm install -g pnpm

# Via curl (Linux/macOS)
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Via PowerShell (Windows)
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/rafaelexplorernetbsb/news-portal.git
   cd news-portal
   ```

2. **Execute o backend (Directus + PostgreSQL):**
   ```bash
   docker-compose up -d
   ```

3. **Instale as dependências do frontend:**
   ```bash
   cd frontend
   pnpm install
   ```

4. **Configure as variáveis de ambiente (opcional):**
   ```bash
   cp env.example .env.local
   # Edite o arquivo .env.local se necessário
   ```

5. **Execute o servidor de desenvolvimento:**
   ```bash
   pnpm dev
   ```

### Comandos Disponíveis
```bash
# Desenvolvimento
pnpm dev          # Inicia o servidor de desenvolvimento
pnpm build        # Gera build de produção
pnpm start        # Inicia o servidor de produção

# Gerenciamento de dependências
pnpm install      # Instala dependências
pnpm add <pkg>    # Adiciona nova dependência
pnpm remove <pkg> # Remove dependência
```

6. **Acesse a aplicação:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Directus CMS: [http://localhost:8055](http://localhost:8055)

## 🛠️ Solução de Problemas

### Erro do Sentry
Se você encontrar o erro:
```
unhandledRejection Error: Command failed: sentry-cli releases new...
```

**Solução:** O Sentry está desabilitado por padrão no `next.config.ts`. Se o erro persistir:

1. **Crie um arquivo `.env.local` no diretório frontend:**
   ```bash
   cd frontend
   cp env.example .env.local
   ```

2. **Ou desabilite completamente o Sentry:**
   ```bash
   export SENTRY_DSN=""
   export SENTRY_ORG=""
   export SENTRY_PROJECT=""
   ```

### Backend não conecta
Certifique-se de que o Docker Compose está rodando:
```bash
docker-compose ps
```

Se necessário, reinicie os serviços:
```bash
docker-compose down && docker-compose up -d
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
