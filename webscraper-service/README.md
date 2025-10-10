# 🔄 G1 Webscraper Service

Serviço de webscraping automático para importar notícias do portal G1 para o Directus.

## 🎯 Funcionalidades

- ✅ **Conteúdo Completo**: Extrai TODO o conteúdo da matéria original do G1
- ✅ **Formatação Original**: Preserva parágrafos, títulos, listas, citações, etc.
- ✅ **Imagens**: Captura todas as imagens dentro do corpo da notícia
- ✅ **Vídeos**: Converte players do G1 em links com thumbnail
- ✅ **Áudios**: Mantém players de áudio HTML5
- ✅ **Embeds**: Converte TikTok embeds em iframes funcionais
- ✅ **Classes CSS**: Aplica classes personalizadas para formatação consistente
- ✅ **URLs Absolutas**: Converte todas as URLs relativas em absolutas

## 📋 Pré-requisitos

- Node.js 18+
- Directus rodando em `http://localhost:8055`
- Token de autenticação configurado no Directus

## 🚀 Como usar

### Instalação

```bash
cd webscraper-service
npm install
```

### Executar uma vez

```bash
node index.js
```

### Executar em background

```bash
nohup node index.js > webscraper.log 2>&1 &
```

### Parar o serviço

```bash
pkill -f "node index.js"
```

### Usar com PM2 (recomendado para produção)

```bash
npm install -g pm2
pm2 start index.js --name g1-webscraper
pm2 save
pm2 startup
```

## ⚙️ Configuração

O serviço importa automaticamente:

- **Frequência**: A cada 5 minutos
- **Quantidade**: 3 notícias mais recentes do RSS
- **Feed**: G1 Tecnologia (`https://g1.globo.com/rss/g1/tecnologia/`)

Para alterar a frequência, edite a linha:

```javascript
setInterval(run, 5 * 60 * 1000); // Trocar 5 por outro valor em minutos
```

## 📊 O que é importado

Para cada notícia:

- **Título**: Extraído dos metadados OpenGraph
- **Resumo**: Meta description (max 250 caracteres)
- **Conteúdo**: HTML completo do artigo com formatação
- **Imagem Principal**: Meta og:image
- **Imagens no Conteúdo**: Todas preservadas com URLs absolutas
- **Vídeos**: Convertidos em links com thumbnail
- **Áudios**: Players HTML5 preservados
- **Data**: Data de publicação do RSS
- **Categoria**: tecnologia
- **Status**: published
- **Destaque**: Primeira notícia = true

## 🔍 Logs

Os logs ficam em `webscraper.log` quando rodando em background.

Para ver os logs em tempo real:

```bash
tail -f webscraper.log
```

## 🛠️ Troubleshooting

### Erro de permissão ao criar notícias

Certifique-se de que o token está configurado corretamente no arquivo `index.js` e que o usuário tem permissão de criar na coleção `noticias`.

### Conteúdo vazio ou muito curto

Verifique os logs para ver qual seletor CSS está sendo usado. O G1 pode ter mudado a estrutura HTML.

### Notícias duplicadas

O serviço verifica se a notícia já existe pelo slug. Se houver duplicatas, adicione verificação adicional por `link_original`.


