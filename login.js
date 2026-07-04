/* ==========================================================================
   MALAH AUTHENTICATION LOGIC
   ========================================================================== */

let currentMode = 'login'; // 'login' or 'register'

function switchAuthTab(mode) {
    currentMode = mode;
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const registerFields = document.getElementById('register-fields');
    const btnSubmit = document.getElementById('auth-btn');
    const subtitle = document.getElementById('auth-subtitle');
    const errorMsg = document.getElementById('auth-error');

    errorMsg.textContent = ''; // clear errors

    if (mode === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        registerFields.style.display = 'none';
        btnSubmit.textContent = 'Entrar na Plataforma';
        subtitle.textContent = 'Acesse sua conta para continuar';
        document.getElementById('auth-name').required = false;
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        registerFields.style.display = 'block';
        btnSubmit.textContent = 'Criar Conta';
        subtitle.textContent = 'Junte-se à comunidade MALAH';
        document.getElementById('auth-name').required = true;
    }
}

async function handleAuth(event) {
    event.preventDefault();
    const errorMsg = document.getElementById('auth-error');
    const btnSubmit = document.getElementById('auth-btn');
    errorMsg.textContent = '';

    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Aguarde...';

    // Mock authentication delay (would be replaced by actual Supabase auth)
    setTimeout(() => {
        if (currentMode === 'register') {
            const name = document.getElementById('auth-name').value;
            const type = document.getElementById('auth-type').value;
            
            // Mock Register Session
            const userSession = { email, name, type, id: 'user_' + Math.random().toString(36).substr(2, 9) };
            localStorage.setItem('malah_session', JSON.stringify(userSession));
            
            window.location.href = `dashboard.html`;
        } else {
            // Mock Login
            if (email && password) {
                // Generates a new session for the logged in user
                const userSession = { 
                    email, 
                    name: email.split('@')[0], // Usa o início do email como nome
                    type: 'sender', // Default mock type
                    id: 'user_' + Math.random().toString(36).substr(2, 9) 
                };
                localStorage.setItem('malah_session', JSON.stringify(userSession));
                
                window.location.href = `dashboard.html`;
            } else {
                errorMsg.textContent = 'E-mail e senha são obrigatórios.';
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Entrar na Plataforma';
            }
        }
    }, 1200);
}

// Redirect to dashboard if already logged in
window.onload = () => {
    const session = localStorage.getItem('malah_session');
    if (session) {
        const parsed = JSON.parse(session);
        window.location.href = `dashboard.html?userType=${parsed.type}`;
    }
};
