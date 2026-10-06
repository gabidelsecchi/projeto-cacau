// vendedor.js
document.addEventListener('DOMContentLoaded', () => {
    // Recupera o usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    if (usuarioLogado) {
        // Exibe o nome do vendedor na interface
        document.getElementById('vendedor-nome-display').textContent = usuarioLogado.nome;
        
        // Carrega os itens da sacola deste vendedor específico
        carregarSacolaVendedor(usuarioLogado.id);
    }

    // Botão de Sair do Vendedor
    document.getElementById('btn-logout-vendedor').addEventListener('click', () => {
        localStorage.removeItem('usuarioLogado');
        window.location.href = 'index.html';
    });
});

function carregarSacolaVendedor(vendedorId) {
    const container = document.getElementById('vendedor-sacola-itens');
    
    // Exemplo de busca de sacolas no localStorage
    const sacolas = JSON.parse(localStorage.getItem('sacolasAtivas')) || [];
    const sacolaDoVendedor = sacolas.filter(s => s.vendedorId === vendedorId);

    if (sacolaDoVendedor.length === 0) {
        container.innerHTML = '<p>Sua sacola está vazia no momento.</p>';
        return;
    }

    // Monta a listagem dos produtos na tela do vendedor
    let html = '<ul>';
    sacolaDoVendedor.forEach(item => {
        html += `<li>${item.produtoNome} - Quantidade: ${item.quantidade}</li>`;
    });
    html += '</ul>';
    
    container.innerHTML = html;
}