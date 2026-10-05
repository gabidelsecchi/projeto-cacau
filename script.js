import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const vendedorPanel = document.getElementById('vendedor-panel');
const loginForm = document.getElementById('login-form');

// --- CONTROLE DE ABAS ---
window.alternarAbaAdmin = function(aba) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-nav .nav-btn').forEach(el => el.classList.remove('active'));

    if (aba === 'usuarios') {
        document.getElementById('tab-usuarios').classList.remove('hidden');
    } else if (aba === 'estoque') {
        document.getElementById('tab-estoque').classList.remove('hidden');
    } else if (aba === 'atribuir') {
        document.getElementById('tab-atribuir').classList.remove('hidden');
    } else if (aba === 'sacolas') {
        document.getElementById('tab-sacolas').classList.remove('hidden');
        carregarSelectsFiltroVendedor();
    } else if (aba === 'lucros') {
        document.getElementById('tab-lucros').classList.remove('hidden');
        calcularRelatorioLucros();
    }
    event.currentTarget.classList.add('active');
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
        alert("Perfil de usuário não encontrado no Firestore.");
    }
}

// --- USUÁRIOS ---
const userForm = document.getElementById('user-form');
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('edit-user-id').value;
    const nome = document.getElementById('user-nome').value;
    const email = document.getElementById('user-email').value;
    const tipo = document.getElementById('user-tipo').value;

    try {
        if (editId) {
            await updateDoc(doc(db, "usuarios", editId), { nome, email, tipo });
            alert("Usuário atualizado com sucesso!");
            cancelarEdicaoUsuario();
        } else {
            await addDoc(collection(db, "usuarios"), { nome, email, tipo });
            alert("Usuário cadastrado com sucesso!");
            userForm.reset();
        }
        carregarListaUsuarios();
    } catch (error) {
        alert("Erro: " + error.message);
    }
});

async function carregarListaUsuarios() {
    const listaDiv = document.getElementById('users-list');
    listaDiv.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "usuarios"));
    let html = "<table><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Ações</th></tr>";
    
    querySnapshot.forEach((docSnap) => {
        const u = docSnap.data();
        const id = docSnap.id;
        html += `<tr>
            <td>${u.nome}</td><td>${u.email}</td><td>${u.tipo}</td>
            <td>
                <div class="action-btns">
                    <button class="warning" onclick="prepararEdicaoUsuario('${id}', '${u.nome}', '${u.email}', '${u.tipo}')">Editar</button>
                    <button class="danger" onclick="excluirUsuario('${id}')">Excluir</button>
                </div>
            </td>
        </tr>`;
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
    if (confirm("Excluir este usuário?")) {
        await deleteDoc(doc(db, "usuarios", id));
        carregarListaUsuarios();
    }
}

// --- ESTOQUE E PRODUTOS ---
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
            await updateDoc(doc(db, "produtos", editId), { nome, categoria, custo, venda, lucro, qtd });
            alert("Produto atualizado!");
            cancelarEdicaoProduto();
        } else {
            await addDoc(collection(db, "produtos"), { nome, categoria, custo, venda, lucro, qtd });
            alert("Produto adicionado ao estoque!");
            productForm.reset();
        }
        carregarEstoque();
    } catch (error) {
        alert("Erro: " + error.message);
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
            <td>${p.categoria}</td><td>${p.nome}</td>
            <td>R$ ${p.custo.toFixed(2)}</td><td>R$ ${p.venda.toFixed(2)}</td>
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
    if (confirm("Excluir este produto?")) {
        await deleteDoc(doc(db, "produtos", id));
        carregarEstoque();
    }
}

// --- ATRIBUIÇÃO E GESTÃO DE SACOLAS ---
const sacolaForm = document.getElementById('sacola-form');
sacolaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const vendedorEmail = document.getElementById('sacola-vendedor').value;
    const produtoId = document.getElementById('sacola-produto').value;
    const qtdAtribuida = parseInt(document.getElementById('sacola-qtd').value);

    try {
        // Busca dados do produto para salvar na sacola
        const prodDoc = await getDoc(doc(db, "produtos", produtoId));
        if (!prodDoc.exists()) {
            alert("Produto não encontrado.");
            return;
        }
        const prodData = prodDoc.data();

        // Salva na coleção "sacolas"
        await addDoc(collection(db, "sacolas"), {
            vendedorEmail,
            produtoId,
            nomeProduto: prodData.nome,
            categoria: prodData.categoria,
            valorVenda: prodData.venda,
            quantidade: qtdAtribuida
        });

        alert("Produto adicionado à sacola do vendedor com sucesso!");
        sacolaForm.reset();
    } catch (error) {
        alert("Erro ao atribuir sacola: " + error.message);
    }
});

async function carregarSelectsFiltroVendedor() {
    const selectFiltro = document.getElementById('filtro-vendedor-sacola');
    const selectAtribuir = document.getElementById('sacola-vendedor');
    selectFiltro.innerHTML = '<option value="">Selecione o Vendedor</option>';
    selectAtribuir.innerHTML = '<option value="">Selecione o Vendedor</option>';

    const querySnapshot = await getDocs(collection(db, "usuarios"));
    querySnapshot.forEach((docSnap) => {
        const u = docSnap.data();
        if (u.tipo === 'vendedor') {
            selectFiltro.innerHTML += `<option value="${u.email}">${u.nome} (${u.email})</option>`;
            selectAtribuir.innerHTML += `<option value="${u.email}">${u.nome} (${u.email})</option>`;
        }
    });
}

window.carregarSacolasAdmin = async function() {
    const vendedorEmail = document.getElementById('filtro-vendedor-sacola').value;
    const container = document.getElementById('admin-sacolas-conteudo');
    if (!vendedorEmail) {
        container.innerHTML = "<p>Selecione um vendedor acima.</p>";
        return;
    }

    container.innerHTML = "<p>Carregando sacola...</p>";
    const q = query(collection(db, "sacolas"), where("vendedorEmail", "==", vendedorEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        container.innerHTML = "<p>Este vendedor não possui itens na sacola no momento.</p>";
        return;
    }

    let html = "<table><tr><th>Produto</th><th>Categoria</th><th>Preço Venda</th><th>Qtd na Sacola</th><th>Ações</th></tr>";
    querySnapshot.forEach((docSnap) => {
        const item = docSnap.data();
        const id = docSnap.id;
        html += `<tr>
            <td>${item.nomeProduto}</td>
            <td>${item.categoria}</td>
            <td>R$ ${item.valorVenda.toFixed(2)}</td>
            <td><input type="number" id="qtd-sacola-${id}" value="${item.quantidade}" style="width: 70px; margin-bottom: 0;"></td>
            <td>
                <div class="action-btns">
                    <button class="warning" onclick="atualizarQtdSacola('${id}')">Salvar</button>
                    <button class="danger" onclick="removerItemSacola('${id}')">Remover</button>
                </div>
            </td>
        </tr>`;
    });
    html += "</table>";
    container.innerHTML = html;
}

window.atualizarQtdSacola = async function(id) {
    const novaQtd = parseInt(document.getElementById(`qtd-sacola-${id}`).value);
    if (isNaN(novaQtd) || novaQtd < 1) {
        alert("Insira uma quantidade válida.");
        return;
    }
    try {
        await updateDoc(doc(db, "sacolas", id), { quantidade: novaQtd });
        alert("Quantidade atualizada na sacola!");
        carregarSacolasAdmin();
    } catch (error) {
        alert("Erro ao atualizar: " + error.message);
    }
}

window.removerItemSacola = async function(id) {
    if (confirm("Deseja retirar este item da sacola do vendedor?")) {
        try {
            await deleteDoc(doc(db, "sacolas", id));
            alert("Item removido da sacola!");
            carregarSacolasAdmin();
        } catch (error) {
            alert("Erro ao remover: " + error.message);
        }
    }
}

// --- RELATÓRIO DE LUCROS ---
async function calcularRelatorioLucros() {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    let custoTotal = 0;
    let vendaTotal = 0;
    let lucroTotal = 0;

    querySnapshot.forEach((docSnap) => {
        const p = docSnap.data();
        const qtd = p.qtd || 0;
        custoTotal += (p.custo * qtd);
        vendaTotal += (p.venda * qtd);
        lucroTotal += (p.lucro * qtd);
    });

    document.getElementById('relatorio-custo-total').innerText = `R$ ${custoTotal.toFixed(2)}`;
    document.getElementById('relatorio-venda-total').innerText = `R$ ${vendaTotal.toFixed(2)}`;
    document.getElementById('relatorio-lucro-total').innerText = `R$ ${lucroTotal.toFixed(2)}`;
}

// --- PAINEL DO VENDEDOR ---
async function carregarSacolaVendedor(emailVendedor) {
    const container = document.getElementById('vendedor-sacola-itens');
    container.innerHTML = "<p>Carregando sua sacola...</p>";

    const q = query(collection(db, "sacolas"), where("vendedorEmail", "==", emailVendedor));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        container.innerHTML = "<p>Sua sacola está vazia no momento. Aguarde o Administrador adicionar produtos.</p>";
        return;
    }

    let html = "<table><tr><th>Produto</th><th>Categoria</th><th>Valor de Venda</th><th>Quantidade Disponível</th></tr>";
    querySnapshot.forEach((docSnap) => {
        const item = docSnap.data();
        html += `<tr>
            <td>${item.nomeProduto}</td>
            <td>${item.categoria}</td>
            <td style="font-weight: bold; color: var(--primary-color);">R$ ${item.valorVenda.toFixed(2)}</td>
            <td>${item.quantidade} unidades</td>
        </tr>`;
    });
    html += "</table>";
    container.innerHTML = html;
}

function carregarDadosAdmin() {
    carregarListaUsuarios();
    carregarEstoque();
}