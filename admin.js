import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://keepzepbtsuhaeeospgs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZXB6ZXBidHN1aGFlZW9zcGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTY1MjgsImV4cCI6MjEwNjUzMjUyOH0.YnyYI46OWXwSKOQ6GZ8xkNM5rQg8WOPc8XgMCgLhiqQ';

const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. Verificar se o usuário está logado e se é admin ao carregar a página
async function checkAuth() {
    // Pega o usuário atual diretamente da sessão ativa do Supabase
    const { data: { user }, error: userError } = await _supabase.auth.getUser();
    
    if (userError || !user) {
        console.warn("Erro ou usuário não autenticado:", userError);
        alert("Sessão expirada ou usuário não autenticado. Faça login novamente.");
        window.location.href = 'index.html';
        return;
    }

    console.log("ID do usuário autenticado no navegador:", user.id);

    // Busca o cargo na tabela perfis usando o ID exato
    const { data: profile, error } = await _supabase
        .from('perfis')
        .select('cargo, email, nome')
        .eq('id', user.id)
        .maybeSingle(); // Usamos maybeSingle para evitar erro caso retorne vazio

    console.log("Perfil retornado pelo banco:", profile);
    console.log("Erro do banco (se houver):", error);

    if (error || !profile || profile.cargo !== 'admin') {
        const cargoEncontrado = profile ? profile.cargo : 'Nenhum perfil encontrado';
        alert(`Acesso negado! Cargo encontrado: ${cargoEncontrado} (ID consultado: ${user.id})`);
        window.location.href = 'vendedor.html';
    } else {
        console.log("Acesso autorizado como Administrador!");
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