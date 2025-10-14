# ⚡ Quick Start - Portal de Notícias

## 🚀 Setup em 1 Comando

```bash
git clone https://github.com/seu-usuario/portal-noticias.git
cd portal-noticias
./setup.sh dev
```

**Pronto!** Em 2-3 minutos você terá um portal completo rodando.

**Nota**: O script inicia o Docker automaticamente se necessário. Se preferir iniciar manualmente:
```bash
./start-docker.sh
```

## 🎯 O que Você Ganha

### ✅ Backend Completo:
- **Directus API** rodando em http://localhost:8055
- **Banco PostgreSQL** configurado
- **Redis** para cache
- **Usuário admin** criado automaticamente
- **Schema** aplicado automaticamente

### ✅ Frontend Moderno:
- **Next.js** rodando em http://localhost:3000
- **Design responsivo**
- **SEO otimizado**
- **Páginas de notícias**

### ✅ Webscrapers Automáticos:
- **G1** coletando notícias de tecnologia
- **Folha** coletando notícias de tecnologia
- **Olhar Digital** coletando notícias
- **Coleta automática** a cada 5 minutos

## 🌐 Acessos

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | - |
| **API** | http://localhost:8055 | - |
| **Admin** | http://localhost:8055/admin | admin@example.com / admin123 |

## 🔧 Comandos Essenciais

```bash
# Verificar se tudo está funcionando
./health-check.sh

# Parar tudo
./stop.sh

# Reiniciar
./setup.sh dev

# Ver logs
tail -f logs/*.log

# Status dos containers
docker-compose ps
```

## 🚨 Se Algo Der Errado

### Problema: Porta ocupada
```bash
# O script resolve automaticamente, mas se precisar:
./stop.sh
./setup.sh dev
```

### Problema: Container não inicia
```bash
# Verificar logs
docker-compose logs directus

# Reconstruir
docker-compose down
docker-compose up --build -d
```

### Problema: Frontend não carrega
```bash
# Verificar se API está funcionando
curl http://localhost:8055/server/ping

# Reiniciar frontend
cd frontend && npm run dev
```

## 📊 Monitoramento

```bash
# Health check completo
./health-check.sh

# Logs em tempo real
tail -f logs/g1.log
tail -f logs/frontend.log

# Status dos containers
docker-compose ps
```

## 🎉 Pronto!

Após executar `./setup.sh dev`:

1. ✅ **Backend** rodando (Directus + PostgreSQL + Redis)
2. ✅ **Frontend** rodando (Next.js)
3. ✅ **Webscrapers** coletando notícias automaticamente
4. ✅ **Admin** configurado (admin@example.com / admin123)
5. ✅ **Schema** aplicado automaticamente

**Seu portal de notícias está 100% funcional!** 🚀
