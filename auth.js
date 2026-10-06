// Exemplo simplificado dentro do auth.js
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    // ... sua lógica para buscar o usuário no banco/localStorage ...
    // Suponha que você encontrou o usuário e ele é um objeto:
    // const usuario = { nome: "Ana", email: "...", tipo: "admin" ou "vendedor" };

    // Salvamos na sessão do navegador
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

    // Redireciona com base no tipo
    if (usuario.tipo === 'admin') {
        window.location.href = 'admin.html';
    } else if (usuario.tipo === 'vendedor') {
        window.location.href = 'vendedor.html';
    }
});