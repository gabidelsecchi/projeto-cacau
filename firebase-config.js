// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-firestore.js";

// Suas credenciais do projeto Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC98-4Ebs8p5ZWWglVI-XNvuYDBUxwv6Fs",
    authDomain: "gestaocacau-6b6e5.firebaseapp.com",
    projectId: "gestaocacau-6b6e5",
    storageBucket: "gestaocacau-6b6e5.firebasestorage.app",
    messagingSenderId: "524165694734",
    appId: "1:524165694734:web:92bd448a39338529e3435f"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);