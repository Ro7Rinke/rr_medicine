# Configuração do Service Worker para Actions de Notificação

## O que é Service Worker?

Um Service Worker é um script JavaScript que roda em background e intercepta eventos de notificação push. Ele é necessário para processar as ações ("Tomei" / "Pulei") que o usuário clica na notificação.

## Como Implementar

### 1. Criar arquivo `public/sw.js`

```javascript
// Escuta eventos de click nas notificações
self.addEventListener('notificationclick', (event) => {
  const { action, notification } = event;
  const doseId = notification.data.doseId;

  // Mapeia ação para envio ao servidor
  const actionMap = {
    taken: 'taken',
    skipped: 'skipped',
  };

  // Envia resposta ao servidor
  event.waitUntil(
    fetch('http://localhost:3001/push/actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Token JWT do usuário
      },
      body: JSON.stringify({
        doseId,
        action: actionMap[action],
      }),
    })
      .then(() => {
        notification.close();
        // Opcional: Abrir a aplicação
        clients.matchAll({ type: 'window' }).then((windowClients) => {
          if (windowClients.length > 0) {
            windowClients[0].focus();
          } else {
            clients.openWindow('/');
          }
        });
      })
      .catch((error) => console.error('Erro ao processar ação:', error))
  );
});

// Escuta quando a notificação é fechada sem ação
self.addEventListener('notificationclose', (event) => {
  console.log('Notificação fechada sem ação:', event.notification.tag);
});
```

### 2. Registrar Service Worker no Frontend

No seu arquivo principal (ex: `main.ts` ou `App.tsx`):

```typescript
// Registra o Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('public/sw.js')
    .then((registration) => {
      console.log('Service Worker registrado com sucesso:', registration);
    })
    .catch((error) => {
      console.error('Erro ao registrar Service Worker:', error);
    });
}
```

### 3. Solicitar Permissão de Notificação

```typescript
// Quando usuário faz login ou em um onboarding
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações');
    return;
  }

  if (Notification.permission === 'granted') {
    // Já tem permissão
    subscribeUserToPush();
    return;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      subscribeUserToPush();
    }
  }
}
```

### 4. Inscrever Usuário em Push (depois de registrar Service Worker)

```typescript
async function subscribeUserToPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.PUBLIC_VAPID_KEY),
  });

  // Enviar subscription para o servidor
  const response = await fetch('http://localhost:3001/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth')),
    }),
  });

  console.log('Usuário inscrito em push notifications');
}

// Funções auxiliares
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
```

## Fluxo Completo

1. ✅ **Backend envia notificação com actions** → `sendDoseNotification()`
2. ✅ **Service Worker intercepta** → Event listener `notificationclick`
3. ✅ **Usuário clica em "Tomei" ou "Pulei"**
4. ✅ **Service Worker envia POST para `/push/actions`**
5. ✅ **Backend atualiza `DoseEvent` com status e `responded_at`**
6. ✅ **Notificação é fechada**

## Debug

Para testar no desenvolvimento:

```bash
# No DevTools do navegador:
# 1. Abra a aba "Application"
# 2. Vá para "Service Workers"
# 3. Procure pelo seu service worker registrado
# 4. Use "Start the worker" se estiver parado
# 5. Monitore os eventos em Console
```

## Variáveis de Ambiente

Certifique-se de que no seu `.env.local`:

```
VITE_PUBLIC_VAPID_KEY=sua_chave_publica_aqui
```

A chave pública VAPID já está configurada no backend em `process.env.VAPID_PUBLIC_KEY`.
