import { useEffect, useRef } from 'react';
import api from '../services/api';

/**
 * Registra el service worker, pide permiso de notificaciones
 * y suscribe el dispositivo al servidor.
 *
 * Solo se activa cuando el usuario está autenticado (isAuthenticated === true).
 */
export function usePushNotifications(isAuthenticated) {
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || subscribedRef.current) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    let swRegistration = null;

    async function setup() {
      try {
        // 1. Registrar (o reutilizar) el service worker
        swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        await navigator.serviceWorker.ready;

        // 2. Verificar/pedir permiso
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // 3. Obtener la clave pública VAPID del servidor
        const { publicKey } = await api.get('/push/vapid-public-key');

        // 4. Crear (o recuperar) la suscripción Push
        const existing = await swRegistration.pushManager.getSubscription();
        const subscription = existing || await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        // 5. Enviar la suscripción al backend
        const sub = subscription.toJSON();
        await api.post('/push/subscribe', {
          endpoint: sub.endpoint,
          keys: sub.keys,
        });

        subscribedRef.current = true;
      } catch (err) {
        // No interrumpir la app si falla el push (es opcional)
        console.warn('[Push] No se pudo suscribir:', err.message);
      }
    }

    setup();

    return () => {
      // No desregistramos al desmontar para no perder la suscripción en cada render
    };
  }, [isAuthenticated]);
}

// Helper: convierte la clave VAPID (base64 URL) a Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
