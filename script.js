import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Credenciais do Firebase configuradas
const firebaseConfig = {
    apiKey: "AIzaSyC98-4Ebs8p5ZWWglVI-XNvuYDBUxwv6Fs",
    authDomain: "gestaocacau-6b6e5.firebaseapp.com",
    projectId: "gestaocacau-6b6e5",
    storageBucket: "gestaocacau-6b6e5.firebasestorage.app",
    messagingSenderId: "524165694734",
    appId: "1:524165694734:web:92bd448a39338529e3435f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Seletores do DOM
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const vendedorPanel = document.getElementById('vendedor-panel');
const loginForm = document.getElementById('login-form');

// --- CONTROLE DE ABAS DO ADMIN ---
window.alternarAbaAdmin = function(aba) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-nav .nav-btn').forEach(el => el.classList.remove('active'));

    if (aba === 'usuarios') {
        document.getElementById('tab-usuarios').classList.remove('hidden');
        event.currentTarget.classList.add('active');
    } else if (aba === 'estoque') {
        document.getElementById('tab-estoque').classList.remove('hidden');
        event.currentTarget.classList.add('active');
    } else if (aba === 'sacolas') {
        document.getElementById('tab-sacolas').classList.remove('hidden');
        event.currentTarget.classList.add('active');
    }
}

// --- AUTENTICAÇÃO ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        verificarPerfilUsuario(userCredential.user);
    } catch (error) {
        alert("Erro ao entrar: " + error.message);
    }
});

document.getElementById('btn-logout').addEventListener('click', () => { signOut(auth); });
document.getElementById('btn-logout-vendedor').addEventListener('click', () => { signOut(auth); });

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add('hidden');
        verificarPerfilUsuario(user);
    } else {
        loginSection.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        vendedorPanel.classList.add('hidden');
    }
});

async function verificarPerfilUsuario(user) {
    const q = query(collection(db, "usuarios"), where("email", "==", user.email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        const dadosUser = querySnapshot.docs[0].data();
        if (dadosUser.tipo === 'admin') {
            adminPanel.classList.remove('hidden');
            carregarDadosAdmin();
        } else {
            vendedorPanel.classList.remove('hidden');
            document.getElementById('vendedor-nome-display').innerText = dadosUser.nome;
            carregarSacolaVendedor(user.email);
        }
    } else {
        alert("Perfil de usuário não encontrado na base de dados de permissões do Firestore.");
    }
}

// --- GERENCIAMENTO DE USUÁRIOS (COM EDITAR E EXCLUIR) ---
const userForm = document.getElementById('user-form');
userForm.addEventListener('submit', async (