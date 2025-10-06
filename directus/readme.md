# 📰 News Portal

Um portal de notícias moderno construído com **Directus CMS** e **Next.js**, oferecendo uma experiência completa de gerenciamento de conteúdo e exibição de notícias.

## 🚀 Características

- **Backend:** Directus CMS com PostgreSQL
- **Frontend:** Next.js 15 com TypeScript
- **Styling:** Tailwind CSS
- **Containerização:** Docker e Docker Compose
- **Gerenciamento de Pacotes:** pnpm

## 📋 Funcionalidades

### 🎯 Frontend
- ✅ Homepage com notícias em destaque
- ✅ Páginas de categoria com filtros
- ✅ Páginas individuais de notícias
- ✅ Sistema de busca
- ✅ Design responsivo e moderno
- ✅ SEO otimizado

### 🔧 Backend (Directus CMS)
- ✅ Gerenciamento de notícias
- ✅ Sistema de autores
- ✅ Categorização de conteúdo
- ✅ Upload de imagens
- ✅ API REST completa
- ✅ Interface administrativa

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- pnpm (gerenciador de pacotes)
- Docker e Docker Compose
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

### Setup Rápido

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/rafaelexplorernetbsb/news-portal.git
   cd news-portal
   ```

2. **Execute o backend (Directus + PostgreSQL):**
   ```bash
   docker-compose up -d
   ```

3. **Configure as coleções, dados de demonstração e token de API:**
   ```bash
   ./fix-all-collections.sh
   ```

4. **Instale e execute o frontend:**
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

5. **Acesse a aplicação:**
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Directus CMS:** [http://localhost:8055](http://localhost:8055)

## 📊 Dados de Demonstração

O script `setup-demo-data.sh` importa automaticamente:

- **5 categorias:** Política, Economia, Tecnologia, Esportes, Cultura
- **4 autores:** Jornalistas de exemplo com biografias
- **10 notícias:** Artigos de demonstração com conteúdo completo

### Conteúdo das Notícias
- Notícias em destaque e regulares
- Diferentes categorias e autores
- Datas de publicação variadas
- Conteúdo realista e profissional

## 🎯 Comandos Úteis

### Desenvolvimento
```bash
# Frontend
pnpm dev          # Servidor de desenvolvimento
pnpm build        # Build de produção
pnpm start        # Servidor de produção

# Backend
docker-compose up -d        # Iniciar serviços
docker-compose down         # Parar serviços
docker-compose logs -f      # Ver logs
```

### Gerenciamento de Dados
```bash
# Configurar coleções, dados de demonstração e token de API
./fix-all-collections.sh

# Apenas dados de demonstração e token (se coleções já existirem)
./setup-demo-data.sh

# Gerar apenas token de API
./generate-token.sh

# Backup do banco
docker exec directus-postgres-1 pg_dump -U postgres -d directus > backup.sql

# Restaurar backup
docker exec -i directus-postgres-1 psql -U postgres -d directus < backup.sql
```

## 🛠️ Solução de Problemas

### Erro do Sentry
Se você encontrar o erro:
```
unhandledRejection Error: Command failed: sentry-cli releases new...
```

**Solução:** O Sentry está desabilitado por padrão. Se o erro persistir:

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
```bash
# Verificar status dos containers
docker-compose ps

# Reiniciar serviços
docker-compose down && docker-compose up -d

# Ver logs de erro
docker-compose logs directus
docker-compose logs postgres
```

### Coleções não aparecem no "Modelo de dados"
Se as coleções (autores, categorias, noticias) não aparecerem no Directus:

```bash
# Execute o script de correção
./fix-all-collections.sh
```

Este script:
- Cria as tabelas diretamente no banco
- Configura os metadados do Directus
- Importa dados de demonstração
- Gera token de API válido
- Configura o frontend automaticamente
- Reinicia o Directus

### Erro "Erro ao carregar noticias" no Frontend
Se o frontend mostrar erro de carregamento:

```bash
# Reconfigure tudo com token válido
./fix-all-collections.sh

# Ou apenas gere um novo token
./generate-token.sh
```

O script automaticamente:
- Gera um token de API válido
- Configura o arquivo `frontend/.env.local`
- Resolve problemas de autenticação

### Problemas de permissão
```bash
# Executar script de configuração
node apply-permissions.js
node create-collections.js
```

## 📁 Estrutura do Projeto

```
news-portal/
├── frontend/                 # Aplicação Next.js
│   ├── app/                 # Páginas da aplicação
│   ├── components/          # Componentes React
│   ├── lib/                 # Utilitários e configurações
│   └── public/              # Arquivos estáticos
├── docker-compose.yml       # Configuração dos containers
├── database_schema.sql      # Schema do banco de dados
├── demo_data.sql           # Dados de demonstração
├── setup-demo-data.sh      # Script de configuração
├── apply-permissions.js    # Configuração de permissões
└── create-collections.js   # Criação de coleções
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Directus](https://directus.io/) - CMS headless
- [Next.js](https://nextjs.org/) - Framework React
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [PostgreSQL](https://postgresql.org/) - Banco de dados

---

**Desenvolvido com ❤️ por [Rafael Soares](https://github.com/rafaelexplorernetbsb)**
