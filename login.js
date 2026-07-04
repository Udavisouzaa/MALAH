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
            const userSession = { email, name, type, id: 'user_' + Date.now() };
            localStorage.setItem('malah_session', JSON.stringify(userSession));
            
            window.location.href = `dashboard.html?userType=${type}`;
        } else {
            // Mock Login
            if (email && password) {
                let type = 'sender'; // Default
                const existingSession = localStorage.getItem('malah_session');
                
                if (existingSession) {
                    const session = JSON.parse(existingSession);
                    type = session.type || 'sender';
                } else {
                    // Create dummy session if none exists to let them in for demo
                    localStorage.setItem('malah_session', JSON.stringify({ email, name: 'Usuário Demo', type, id: 'user_demo' }));
                }
                
                window.location.href = `dashboard.html?userType=${type}`;
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
