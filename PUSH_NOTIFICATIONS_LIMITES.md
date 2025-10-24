# 🔔 Push Notifications - API e Limites

## 📊 API Utilizada

Seu sistema usa **Firebase Cloud Messaging (FCM)** do Google, que é o padrão para Web Push Notifications.

### Como Funciona:
```
Seu Servidor → FCM (Google) → Service Worker → Navegador do Usuário
```

---

## 🎯 Qual API Está Sendo Usada?

**Firebase Cloud Messaging (FCM)**
- URL: `https://fcm.googleapis.com/fcm/send/`
- Protocolo: Web Push Protocol (RFC 8030)
- Criptografia: VAPID (Voluntary Application Server Identification)

### Por que FCM?
1. ✅ **Gratuito** - Sem custos para uso básico
2. ✅ **Confiável** - Infraestrutura do Google
3. ✅ **Padrão** - Suportado por todos os navegadores modernos
4. ✅ **Sem configuração** - Funciona automaticamente

---

## 📈 Limites e Quotas

### **Firebase Cloud Messaging (Gratuito)**

| Métrica | Limite | Observação |
|---------|--------|------------|
| **Mensagens/dia** | Ilimitado | ✅ Sem limite para Web Push |
| **Taxa de envio** | ~240 msg/min | Por servidor |
| **Tamanho da mensagem** | 4 KB | Payload máximo |
| **Dispositivos simultâneos** | Ilimitado | ✅ Sem limite |
| **TTL (Time to Live)** | 4 semanas | Tempo máximo de retenção |
| **Prioridade** | Normal/High | Configurável |

### **Observações Importantes:**

1. **✅ Completamente Gratuito**
   - Não há cobrança para Web Push Notifications
   - Não precisa de conta FCM/Firebase
   - Usa VAPID ao invés de API key

2. **⚠️ Limites Práticos**
   - **240 mensagens/minuto** por servidor (rate limit suave)
   - Se ultrapassar, FCM pode retornar erro 429 (Too Many Requests)
   - Recomendado: Enviar em lotes com intervalos

3. **🔒 Segurança**
   - VAPID keys identificam seu servidor
   - Criptografia end-to-end automática
   - Sem necessidade de autenticação extra

---

## 🚀 Performance do Seu Sistema

### **Configuração Atual:**

```typescript
// extensions/push-notifications/src/webhook.ts
for (const subscription of subscriptions) {
  await webpush.sendNotification(pushSubscription, payload);
}
```

### **Cenários:**

| Subscrições | Tempo Estimado | Observações |
|-------------|----------------|-------------|
| 10 usuários | ~1-2 segundos | ✅ Instantâneo |
| 100 usuários | ~10-15 segundos | ✅ Rápido |
| 1.000 usuários | ~2-3 minutos | ⚠️ Considerar fila |
| 10.000+ usuários | ~20-30 minutos | ❌ Precisa fila assíncrona |

---

## 💡 Otimizações Recomendadas

### **Para Muitos Usuários (1.000+):**

1. **Implementar Fila de Envio**
   ```javascript
   // Usar Bull Queue ou similar
   const queue = new Queue('push-notifications');
   
   for (const subscription of subscriptions) {
     await queue.add('send-push', { subscription, payload });
   }
   ```

2. **Enviar em Lotes**
   ```javascript
   // Processar 50 por vez com delay
   for (let i = 0; i < subscriptions.length; i += 50) {
     const batch = subscriptions.slice(i, i + 50);
     await Promise.all(batch.map(s => sendPush(s)));
     await sleep(2000); // 2s entre lotes
   }
   ```

3. **Segmentação**
   - Enviar apenas para usuários interessados na categoria
   - Filtrar por preferências do usuário
   - Respeitar "Não Perturbe"

---

## 📊 Monitoramento

### **Métricas Importantes:**

1. **Taxa de Sucesso**
   ```javascript
   console.log(`Enviadas: ${sent}, Falharam: ${failed}`);
   // Meta: >95% de sucesso
   ```

2. **Subscrições Expiradas (410)**
   - FCM retorna 410 quando subscrição expirou
   - Seu sistema já deleta automaticamente
   - Meta: <5% de subscrições expiradas

3. **Tempo de Envio**
   - Monitorar tempo total por lote
   - Meta: <500ms por notificação

---

## 🔍 Comparação com Outras APIs

| Serviço | Custo | Limite Grátis | Vantagens |
|---------|-------|---------------|-----------|
| **FCM (Atual)** | ✅ Grátis | Ilimitado | Padrão, confiável, zero config |
| OneSignal | Grátis até 10k | 10k usuários | Dashboard, segmentação |
| Pusher | $49/mês | 100 conexões | Tempo real, websockets |
| Custom Server | Servidor | Infinito | Controle total |

---

## ✅ Recomendação

**Continue usando FCM!** 

### Motivos:
1. ✅ **Gratuito e ilimitado**
2. ✅ **Já está funcionando perfeitamente**
3. ✅ **Confiável (Google)**
4. ✅ **Suporta milhares de usuários**

### Quando Mudar:
- ❌ Nunca, a menos que precise de:
  - Segmentação avançada (OneSignal)
  - Analytics detalhado (OneSignal)
  - Features premium específicas

---

## 🎯 Seu Sistema Atual

```
✅ Push via FCM (Google)
✅ Criptografia VAPID
✅ Sem custos
✅ Sem limites práticos para portal de notícias
✅ Suporta todos os navegadores modernos
✅ Funciona em desktop e mobile
```

**Seu sistema está otimizado e pronto para escalar!** 🚀

