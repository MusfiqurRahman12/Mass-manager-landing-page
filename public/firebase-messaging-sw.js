// public/firebase-messaging-sw.js
// This Service Worker handles background push notifications from Firebase.
// It MUST be placed in the /public directory so it's served at the root scope.

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCcDcNa6FQ8M3tMBPWO4mi2oX8MauhjEi8",
  authDomain: "messsync-b6721.firebaseapp.com",
  projectId: "messsync-b6721",
  storageBucket: "messsync-b6721.firebasestorage.app",
  messagingSenderId: "219566091900",
  appId: "1:219566091900:web:6ad50ee60213793c50a3f9",
});

const messaging = firebase.messaging();

// Handle background messages (when the app tab is not focused)
messaging.onBackgroundMessage((payload) => {
  const { title = "Mess Manager", body = "You have a new notification." } =
    payload.notification ?? {};

  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "mess-manager-notification", // collapse duplicate notifications
  });
});
