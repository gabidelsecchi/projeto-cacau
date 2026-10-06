// auth.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const senha = document.getElementById('login-senha').value.trim();

        // Exemplo: Recuperando usuários salvos no localStorage (ou use sua lógica existente)
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        
        // Se for o primeiro acesso e não houver usuários cadastrados, crie um admin padrão para teste:
        if (usuarios.length === 0 && email === 'admin@cacaushow.com' && senha === '123456') {
            const adminPadrao = { id: 1, nome: 'Administrador', email, senha, tipo: 'admin' };
            usuarios.push(adminPadrao);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }

        // Buscar o usuário correspondente
        const usuarioEncontrado = usuarios.find(u => u.email === email && u.senha === senha);

        if (usuarioEncontrado) {
            // Salva o usuário logado na sessão do navegador
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));

            // Redireciona com base no tipo de perfil
            if (usuarioEncontrado.tipo === 'admin') {
                window.location.href = 'admin.html';
            } else if (usuarioEncontrado.tipo === 'vendedor') {
                window.location.href = 'vendedor.html';
            }
        } else {
            alert('E-mail ou senha incorretos!');
        }
    });
});