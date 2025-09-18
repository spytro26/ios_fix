import { initializeApp, getApps, getApp } from "firebase/app";
import "firebase/compat/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
    apiKey: "AIzaSyA1AhcHvYfeAClJEIssiSssEbnpKifeQ-8",
    authDomain: "enzo-d373f.firebaseapp.com",
    projectId: "enzo-d373f",
    storageBucket: "enzo-d373f.firebasestorage.app",
    messagingSenderId: "553571608389",
    appId: "1:553571608389:web:1059436d6512bd5fa8402c",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize compat app if needed for third-party libraries
if (typeof window !== 'undefined' && !window.firebase?.apps?.length) {
  import('firebase/compat/app').then((firebase) => {
    if (!firebase.default.apps.length) {
      firebase.default.initializeApp(firebaseConfig);
    }
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;