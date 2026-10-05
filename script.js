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
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('edit-user-id').value;
    const nome = document.getElementById('user-nome').value;
    const email = document.getElementById('user-email').value;
    const senha = document.getElementById('user-senha').value;
    const tipo = document.getElementById('user-tipo').value;

    try {
        if (editId) {
            const userRef = doc(db, "usuarios", editId);
            await updateDoc(userRef, { nome, email, tipo });
            alert("Usuário atualizado com sucesso!");
            cancelarEdicaoUsuario();
        } else {
            await addDoc(collection(db, "usuarios"), { nome, email, tipo });
            alert("Usuário cadastrado com sucesso!");
            userForm.reset();
        }
        carregarListaUsuarios();
    } catch (error) {
        alert("Erro ao salvar usuário: " + error.message);
    }
});

async function carregarListaUsuarios() {
    const listaDiv = document.getElementById('users-list');
    const selectVendedor = document.getElementById('sacola-vendedor');
    listaDiv.innerHTML = "";
    selectVendedor.innerHTML = '<option value="">Selecione o Vendedor</option>';

    const querySnapshot = await getDocs(collection(db, "usuarios"));
    let html = "<table><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Ações</th></tr>";
    
    querySnapshot.forEach((docSnap) => {
        const u = docSnap.data();
        const id = docSnap.id;
        html += `<tr>
            <td>${u.nome}</td>
            <td>${u.email}</td>
            <td>${u.tipo}</td>
            <td>
                <div class="action-btns">
                    <button class="warning" onclick="prepararEdicaoUsuario('${id}', '${u.nome}', '${u.email}', '${u.tipo}')">Editar</button>
                    <button class="danger" onclick="excluirUsuario('${id}')">Excluir</button>
                </div>
            </td>
        </tr>`;
        if (u.tipo === 'vendedor') {
            selectVendedor.innerHTML += `<option value="${u.email}">${u.nome}</option>`;
        }
    });
    html += "</table>";
    listaDiv.innerHTML = html;
}

window.prepararEdicaoUsuario = function(id, nome, email, tipo) {
    document.getElementById('edit-user-id').value = id;
    document.getElementById('user-nome').value = nome;
    document.getElementById('user-email').value = email;
    document.getElementById('user-senha').value = "******";
    document.getElementById('user-tipo').value = tipo;
    
    document.getElementById('user-form-title').innerText = "Editar Usuário";
    document.getElementById('btn-salvar-user').innerText = "Salvar Alterações";
    document.getElementById('btn-cancelar-user').classList.remove('hidden');
}

window.cancelarEdicaoUsuario = function() {
    document.getElementById('edit-user-id').value = "";
    userForm.reset();
    document.getElementById('user-form-title').innerText = "Cadastrar Novo Usuário";
    document.getElementById('btn-salvar-user').innerText = "Cadastrar Usuário";
    document.getElementById('btn-cancelar-user').classList.add('hidden');
}

window.excluirUsuario = async function(id) {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
        try {
            await deleteDoc(doc(db, "usuarios", id));
            alert("Usuário excluído com sucesso!");
            carregarListaUsuarios();
        } catch (error) {
            alert("Erro ao excluir: " + error.message);
        }
    }
}

// --- GERENCIAMENTO DE ESTOQUE E PRODUTOS (COM EDITAR E EXCLUIR) ---
const productForm = document.getElementById('product-form');
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('edit-prod-id').value;
    const nome = document.getElementById('prod-nome').value;
    const categoria = document.getElementById('prod-categoria').value;
    const custo = parseFloat(document.getElementById('prod-custo').value);
    const venda = parseFloat(document.getElementById('prod-venda').value);
    const qtd = parseInt(document.getElementById('prod-qtd').value);
    const lucro = venda - custo;

    try {
        if (editId) {
            const prodRef = doc(db, "produtos", editId);
            await updateDoc(prodRef, { nome, categoria, custo, venda, lucro, qtd });
            alert("Produto atualizado com sucesso!");
            cancelarEdicaoProduto();
        } else {
            await addDoc(collection(db, "produtos"), { nome, categoria, custo, venda, lucro, qtd });
            alert("Produto adicionado ao estoque!");
            productForm.reset();
        }
        carregarEstoque();
    } catch (error) {
        alert("Erro ao salvar produto: " + error.message);
    }
});

async function carregarEstoque() {
    const stockList = document.getElementById('stock-list');
    const selectProduto = document.getElementById('sacola-produto');
    stockList.innerHTML = "";
    selectProduto.innerHTML = '<option value="">Selecione o Produto</option>';

    const querySnapshot = await getDocs(collection(db, "produtos"));
    let html = "<table><tr><th>Categoria</th><th>Produto</th><th>Custo</th><th>Venda</th><th>Lucro Unit.</th><th>Qtd</th><th>Ações</th></tr>";

    querySnapshot.forEach((docSnap) => {
        const p = docSnap.data();
        const id = docSnap.id;
        html += `<tr>
            <td>${p.categoria}</td>
            <td>${p.nome}</td>
            <td>R$ ${p.custo.toFixed(2)}</td>
            <td>R$ ${p.venda.toFixed(2)}</td>
            <td style="color: green; font-weight: bold;">R$ ${p.lucro.toFixed(2)}</td>
            <td>${p.qtd}</td>
            <td>
                <div class="action-btns">
                    <button class="warning" onclick="prepararEdicaoProduto('${id}', '${p.nome}', '${p.categoria}', ${p.custo}, ${p.venda}, ${p.qtd})">Editar</button>
                    <button class="danger" onclick="excluirProduto('${id}')">Excluir</button>
                </div>
            </td>
        </tr>`;
        selectProduto.innerHTML += `<option value="${docSnap.id}">${p.categoria} - ${p.nome} (Estoque: ${p.qtd})</option>`;
    });
    html += "</table>";
    stockList.innerHTML = html;
}

window.prepararEdicaoProduto = function(id, nome, categoria, custo, venda, qtd) {
    document.getElementById('edit-prod-id').value = id;
    document.getElementById('prod-nome').value = nome;
    document.getElementById('prod-categoria').value = categoria;
    document.getElementById('prod-custo').value = custo;
    document.getElementById('prod-venda').value = venda;
    document.getElementById('prod-qtd').value = qtd;

    document.getElementById('product-form-title').innerText = "Editar Produto";
    document.getElementById('btn-salvar-prod').innerText = "Salvar Alterações";
    document.getElementById('btn-cancelar-prod').classList.remove('hidden');
}

window.cancelarEdicaoProduto = function() {
    document.getElementById('edit-prod-id').value = "";
    productForm.reset();
    document.getElementById('product-form-title').innerText = "Adicionar Produto ao Estoque";
    document.getElementById('btn-salvar-prod').innerText = "Salvar Produto";
    document.getElementById('btn-cancelar-prod').classList.add('hidden');
}

window.excluirProduto = async function(id) {
    if (confirm("Tem certeza que deseja excluir este produto do estoque?")) {
        try {
            await deleteDoc(doc(db, "produtos", id));
            alert("Produto excluído com sucesso!");
            carregarEstoque();
        } catch (error) {
            alert("Erro ao excluir: " + error.message);
        }
    }
}

function carregarDadosAdmin() {
    carregarListaUsuarios();
    carregarEstoque();
}

async function carregarSacolaVendedor(emailVendedor) {
    const container = document.getElementById('vendedor-sacola-itens');
    container.innerHTML = "<p>Sua sacola está pronta para receber os itens atribuídos pelo Administrador.</p>";
}