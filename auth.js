import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Substitua com as suas credenciais reais do projeto do Supabase
const SUPABASE_URL = 'https://keepzepbtsuhaeeospgs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZXB6ZXBidHN1aGFlZW9zcGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTY1MjgsImV4cCI6MjEwNjUzMjUyOH0.YnyYI46OWXwSKOQ6GZ8xkNM5rQg8WOPc8XgMCgLhiqQ';

const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    try {
        // 1. Faz o login no Supabase Auth
        const { data: authData, error: authError } = await _supabase.auth.signInWithPassword({
            email: email,
            password: senha,
        });

        if (authError) throw authError;

        const user = authData.user;

        // 2. Busca o cargo do usuário na tabela de perfis personalizada
        const { data: profileData, error: profileError } = await _supabase
            .from('perfis')
            .select('cargo') // ajuste para o nome correto da sua tabela de perfis
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        // 3. Redireciona com base no cargo
        alert('Login realizado com sucesso!');
        if (profileData.cargo === 'admin') {
            window.location.href = 'admin.html'; // Página do Administrador
        } else {
            window.location.href = 'vendedor.html'; // Página do Vendedor
        }

    } catch (error) {
        alert('Erro ao fazer login: ' + error.message);
        console.error(error);
    }
});