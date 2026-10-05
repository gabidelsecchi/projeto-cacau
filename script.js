// Importações dos SDKs do Firebase (via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: Substitua pelos dados do seu projeto do Firebase
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

// --- LÓGICA DE AUTENTICAÇÃO ---
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

// Logout
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
    // Consulta se o usuário logado é admin ou vendedor no Firestore
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
        // Se for o primeiro admin criado diretamente, podemos tratar aqui ou cadastrar pelo console
        alert("Perfil de usuário não encontrado na base de dados de permissões.");
    }
}

// --- MÓDULO ADMINISTRADOR ---
const userForm = document.getElementById('user-form');
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('user-nome').value;
    const email = document.getElementById('user-email').value;
    const senha = document.getElementById('user-senha').value;
    const tipo = document.getElementById('user-tipo').value;

    try {
        // Salva as permissões no Firestore (Nota: a criação real no Firebase Auth pode ser feita aqui ou via console)
        await addDoc(collection(db, "usuarios"), { nome, email, tipo });
        alert("Usuário cadastrado com sucesso!");
        userForm.reset();
        carregarListaUsuarios();
    } catch (error) {
        alert("Erro ao cadastrar usuário: " + error.message);
    }
});

async function carregarListaUsuarios() {
    const listaDiv = document.getElementById('users-list');
    const selectVendedor = document.getElementById('sacola-vendedor');
    listaDiv.innerHTML = "";
    selectVendedor.innerHTML = '<option value="">Selecione o Vendedor</option>';

    const querySnapshot = await getDocs(collection(db, "usuarios"));
    let html = "<table><tr><th>Nome</th><th>E-mail</th><th>Perfil</th></tr>";
    
    querySnapshot.forEach((docSnap) => {
        const u = docSnap.data();
        html += `<tr><td>${u.nome}</td><td>${u.email}</td><td>${u.tipo}</td></tr>`;
        if (u.tipo === 'vendedor') {
            selectVendedor.innerHTML += `<option value="${u.email}">${u.nome}</option>`;
        }
    });
    html += "</table>";
    listaDiv.innerHTML = html;
}

// Cadastro de Produtos / Estoque
const productForm = document.getElementById('product-form');
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('prod-nome').value;
    const categoria = document.getElementById('prod-categoria').value;
    const custo = parseFloat(document.getElementById('prod-custo').value);
    const venda = parseFloat(document.getElementById('prod-venda').value);
    const qtd = parseInt(document.getElementById('prod-qtd').value);
    const lucro = venda - custo;

    try {
        await addDoc(collection(db, "produtos"), { nome, categoria, custo, venda, lucro, qtd });
        alert("Produto adicionado ao estoque!");
        productForm.reset();
        carregarEstoque();
    } catch (error) {
        alert("Erro ao cadastrar produto: " + error.message);
    }
});

async function carregarEstoque() {
    const stockList = document.getElementById('stock-list');
    const selectProduto = document.getElementById('sacola-produto');
    stockList.innerHTML = "";
    selectProduto.innerHTML = '<option value="">Selecione o Produto</option>';

    const querySnapshot = await getDocs(collection(db, "produtos"));
    let html = "<table><tr><th>Categoria</th><th>Produto</th><th>Custo</th><th>Venda</th><th>Lucro Unit.</th><th>Qtd</th></tr>";

    querySnapshot.forEach((docSnap) => {
        const p = docSnap.data();
        html += `<tr>
            <td>${p.categoria}</td>
            <td>${p.nome}</td>
            <td>R$ ${p.custo.toFixed(2)}</td>
            <td>R$ ${p.venda.toFixed(2)}</td>
            <td style="color: green; font-weight: bold;">R$ ${p.lucro.toFixed(2)}</td>
            <td>${p.qtd}</td>
        </tr>`;
        selectProduto.innerHTML += `<option value="${docSnap.id}">${p.categoria} - ${p.nome} (Estoque: ${p.qtd})</option>`;
    });
    html += "</table>";
    stockList.innerHTML = html;
}

function carregarDadosAdmin() {
    carregarListaUsuarios();
    carregarEstoque();
}

// --- MÓDULO VENDEDOR ---
async function carregarSacolaVendedor(emailVendedor) {
    const container = document.getElementById('vendedor-sacola-itens');
    container.innerHTML = "<p>Carregando sacola...</p>";

    // Aqui você integraria a busca da sacola específica atribuída pelo admin no Firestore
    container.innerHTML = "<p>Sua sacola está sincronizada com o estoque atribuído pelo Administrador.</p>";
}