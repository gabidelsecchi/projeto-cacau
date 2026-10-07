import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://keepzepbtsuhaeeospgs.supabase.co';
const SUPABASE_ANON_KEY = 'SeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZXB6ZXBidHN1aGFlZW9zcGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTY1MjgsImV4cCI6MjEwNjUzMjUyOH0.YnyYI46OWXwSKOQ6GZ8xkNM5rQg8WOPc8XgMCgLhiqQ';

const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. Verificar se o usuário está logado e se é admin ao carregar a página
async function checkAuth() {
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    // Verifica o cargo na tabela perfis
    const { data: profile, error } = await _supabase
        .from('perfis')
        .select('cargo')
        .eq('id', session.user.id)
        .single();

    if (error || !profile || profile.cargo !== 'admin') {
        alert('Acesso negado! Área exclusiva para administradores.');
        window.location.href = 'vendedor.html';
    }
}

checkAuth();

// 2. Botão de Logout
document.getElementById('btn-logout').addEventListener('click', async () => {
    await _supabase.auth.signOut();
    window.location.href = 'index.html';
});

// 3. Cadastrar novo usuário (Vendedor ou Admin)
const createUserForm = document.getElementById('create-user-form');
createUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('new-email').value;
    const password = document.getElementById('new-senha').value;
    const nome = document.getElementById('new-nome').value;
    const cargo = document.getElementById('new-cargo').value;

    try {
        // Criação de usuário via Auth do Supabase
        // Nota: Por segurança do Supabase, o ideal para criar múltiplos usuários é via painel ou função Edge, 
        // mas podemos usar o signUp ou convite. Como estamos criando diretamente:
        const { data, error } = await _supabase.auth.signUp({
            email,
            password
        });

        if (error) throw error;

        const userId = data.user.id;

        // Insere os dados na tabela perfis correspondente
        const { error: profileError } = await _supabase
            .from('perfis')
            .insert([{ id: userId, nome, email, cargo }]);

        if (profileError) throw profileError;

        alert(`Usuário ${nome} criado com sucesso!`);
        createUserForm.reset();

    } catch (error) {
        alert('Erro ao criar usuário: ' + error.message);
        console.error(error);
    }
});