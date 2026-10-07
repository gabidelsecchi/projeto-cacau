import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://keepzepbtsuhaeeospgs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZXB6ZXBidHN1aGFlZW9zcGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTY1MjgsImV4cCI6MjEwNjUzMjUyOH0.YnyYI46OWXwSKOQ6GZ8xkNM5rQg8WOPc8XgMCgLhiqQ';

const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let sacola = [];

// 1. Verificar autenticação e carregar nome do vendedor
async function checkAuth() {
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    const { data: profile, error } = await _supabase
        .from('perfis')
        .select('nome, cargo')
        .eq('id', session.user.id)
        .single();

    if (error || !profile) {
        alert('Erro ao carregar dados do usuário.');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-greeting').textContent = `Olá, ${profile.nome}`;
}

checkAuth();

// 2. Botão de Logout
document.getElementById('btn-logout').addEventListener('click', async () => {
    await _supabase.auth.signOut();
    window.location.href = 'index.html';
});

// 3. Carregar Produtos do Supabase
async function carregarProdutos() {
    const produtosGrid = document.getElementById('produtos-grid');
    
    const { data: produtos, error } = await _supabase
        .from('produtos')
        .select('*');

    if (error) {
        produtosGrid.innerHTML = '<p>Erro ao carregar o estoque.</p>';
        console.error(error);
        return;
    }

    if (produtos.length === 0) {
        produtosGrid.innerHTML = '<p>Nenhum produto cadastrado no estoque ainda.</p>';
        return;
    }

    produtosGrid.innerHTML = '';
    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.innerHTML = `
            <img src="${produto.imagem_url || 'https://via.placeholder.com/150'}" alt="${produto.nome}">
            <h3>${produto.nome}</h3>
            <p class="descricao">${produto.descricao || ''}</p>
            <p class="preco">R$ ${Number(produto.preco).toFixed(2)}</p>
            <p class="estoque">Estoque: ${produto.estoque}</p>
            <button class="btn-primary" onclick="window.adicionarSacola(${produto.id}, '${produto.nome}', ${produto.preco}, ${produto.estoque})">Adicionar à Sacola</button>
        `;
        produtosGrid.appendChild(card);
    });
}

// 4. Lógica da Sacola (Adicionar item)
window.adicionarSacola = function(id, nome, preco, estoqueMax) {
    const itemExistente = sacola.find(item => item.id === id);

    if (itemExistente) {
        if (itemExistente.quantidade < estoqueMax) {
            itemExistente.quantidade++;
        } else {
            alert('Quantidade máxima disponível em estoque atingida!');
            return;
        }
    } else {
        sacola.push({ id, nome, preco, quantidade: 1, estoqueMax });
    }

    atualizarSacolaUI();
};

// 5. Atualizar Interface da Sacola
function atualizarSacolaUI() {
    const bagItems = document.getElementById('bag-items');
    const bagTotalValue = document.getElementById('bag-total-value');
    const btnFinalizar = document.getElementById('btn-finalizar-venda');

    if (sacola.length === 0) {
        bagItems.innerHTML = '<p class="empty-bag">A sacola está vazia.</p>';
        bagTotalValue.textContent = '0.00';
        btnFinalizar.disabled = true;
        return;
    }

    bagItems.innerHTML = '';
    let total = 0;

    sacola.forEach((item, index) => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;

        const div = document.createElement('div');
        div.className = 'bag-item';
        div.innerHTML = `
            <span>${item.nome} (x${item.quantidade})</span>
            <span>R$ ${subtotal.toFixed(2)}</span>
            <button onclick="window.removerSacola(${index})" class="btn-remove">X</button>
        `;
        bagItems.appendChild(div);
    });

    bagTotalValue.textContent = total.toFixed(2);
    btnFinalizar.disabled = false;
}

// Remover item da sacola
window.removerSacola = function(index) {
    sacola.splice(index, 1);
    atualizarSacolaUI();
};

// Inicializa o carregamento dos produtos
carregarProdutos();