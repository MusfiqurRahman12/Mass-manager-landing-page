// src/lib/firebase.ts
// Firebase app initialization for Mess Manager

import { initializeApp } from "firebase/app";
import { getMessaging, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCcDcNa6FQ8M3tMBPWO4mi2oX8MauhjEi8",
  authDomain: "messsync-b6721.firebaseapp.com",
  projectId: "messsync-b6721",
  storageBucket: "messsync-b6721.firebasestorage.app",
  messagingSenderId: "219566091900",
  appId: "1:219566091900:web:6ad50ee60213793c50a3f9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Messaging is only available in a real browser environment (not SSR/Node)
let messaging: Messaging | null = null;
try {
  messaging = getMessaging(app);
} catch {
  // Service workers not supported in this environment
}

export { app, messaging };
