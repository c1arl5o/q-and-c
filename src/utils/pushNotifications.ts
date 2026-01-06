// Push notification utilities

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered successfully:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications are not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  console.log('Notification permission:', permission);
  return permission;
}

export async function subscribeToPush(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  if (!VAPID_PUBLIC_KEY) {
    console.error('VAPID public key is not configured');
    return null;
  }

  try {
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource,
    });

    console.log('Push subscription successful:', subscription);
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export async function savePushSubscription(
  subscription: PushSubscription,
  userId: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/save-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription');
    }

    console.log('Subscription saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving subscription:', error);
    return false;
  }
}

export async function sendPushNotification(
  targetUserId: string,
  title: string,
  body: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetUserId,
        title,
        body,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send push notification');
    }

    console.log('Push notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}
