// admin.js

// 1. Função de alternar abas do Admin
window.alternarAbaAdmin = function(abaId) {
    // Esconde todas as abas
    document.querySelectorAll('.admin-tab-content').forEach(aba => {
        aba.classList.add('hidden');
    });
    
    // Remove a classe 'active' de todos os botões da nav
    document.querySelectorAll('.admin-nav .nav-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });

    // Mostra a aba escolhida
    document.getElementById(`tab-${abaId}`).classList.remove('hidden');
    
    // Ativa o botão correspondente
    const botaoAtivo = Array.from(document.querySelectorAll('.admin-nav .nav-btn'))
        .find(btn => btn.getAttribute('onclick').includes(abaId));
    if (botaoAtivo) {
        botaoAtivo.classList.add('active');
        botaoAtivo.setAttribute('aria-selected', 'true');
    }
};

// 2. Botão de Logout
document.getElementById('btn-logout').addEventListener('click', () => {
    if (confirm('Deseja realmente sair do sistema?')) {
        localStorage.removeItem('usuarioLogado');
        window.location.href = 'index.html';
    }
});

// 3. Inicialização dos dados da página do Admin
document.addEventListener('DOMContentLoaded', () => {
    // Aqui você chama suas funções de carregar produtos, usuários e relatórios financeiros
    console.log('Painel Administrativo carregado com sucesso.');
});