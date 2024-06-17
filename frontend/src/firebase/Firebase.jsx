import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "bookbuddy-1e299.firebaseapp.com",
  projectId: "bookbuddy-1e299",
  storageBucket: "bookbuddy-1e299.appspot.com",
  messagingSenderId: "354432271530",
  appId: "1:354432271530:web:83b08fc4845cc572e27cd3",
};

const app = initializeApp(firebaseConfig);
export default app;
