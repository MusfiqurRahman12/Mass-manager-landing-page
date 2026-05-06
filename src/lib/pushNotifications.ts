// src/lib/pushNotifications.ts
// Utility functions for requesting permission, getting FCM token,
// and registering it with the backend.

import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";
import apiClient from "../services/apiClient";

const VAPID_KEY = "BJo0lrDM7Lr7Z5-IQeE4_ywdpxC90c5d992hIVHrdxpU1wHl6L6YA6sM7hLDFkSOXAtjpwT7O719dxFNx63-3As";

/**
 * Requests notification permission from the browser, obtains the FCM token,
 * and registers it with the backend.
 * 
 * @returns "granted" | "denied" | "unsupported"
 */
export async function requestAndRegisterPushToken(): Promise<"granted" | "denied" | "unsupported"> {
  if (!("Notification" in window) || !messaging) {
    return "unsupported";
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      return "denied";
    }

    // Ensure the service worker is registered and up to date
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    await registration.update(); // Force check for updates
    
    // Wait for the service worker to be fully active
    if (!registration.active) {
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (registration.active) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      const lastToken = localStorage.getItem("fcm_token");
      if (lastToken === token) {
        console.debug("FCM token already registered.");
        return "granted";
      }

      // Send token to our backend
      await apiClient.post("/notifications/register-fcm-token", { token });
      localStorage.setItem("fcm_token", token);
      console.debug("FCM token registered with backend.");
    }

    return "granted";
  } catch (error) {
    console.error("Failed to register push token:", error);
    return "denied";
  }
}

/**
 * Remove the FCM token from the backend (call on logout).
 */
export async function unregisterPushToken(): Promise<void> {
  try {
    await apiClient.delete("/notifications/unregister-fcm-token");
    localStorage.removeItem("fcm_token");
  } catch {
    // Best effort — don't throw on logout
  }
}

/**
 * Listen for foreground push messages and call a handler.
 * Returns an unsubscribe function.
 */
export function onForegroundMessage(
  handler: (payload: { title?: string; body?: string }) => void
): () => void {
  if (!messaging) return () => { };

  const unsubscribe = onMessage(messaging, (payload) => {
    const { title, body } = payload.notification ?? {};
    handler({ title, body });
  });

  return unsubscribe;
}
