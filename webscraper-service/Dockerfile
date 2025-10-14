# ========================================
# DOCKERFILE PARA WEBSCRAPER SERVICE
# ========================================

FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar Puppeteer para usar Chromium do Alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Criar diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S webscraper -u 1001

# Criar diretório de logs
RUN mkdir -p /app/logs && chown -R webscraper:nodejs /app

# Mudar para usuário não-root
USER webscraper

# Expor porta (se necessário)
EXPOSE 3001

# Comando padrão
CMD ["node", "g1.js"]
