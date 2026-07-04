/* ==========================================================================
   MALAH CHAT LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Auth Guard
    const sessionStr = localStorage.getItem('malah_session');
    if (!sessionStr) {
        window.location.href = 'login.html';
        return;
    }
    const session = JSON.parse(sessionStr);

    // Get match info
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('match');
    
    const partnerNameEl = document.getElementById('chat-partner-name');
    const messagesEl = document.getElementById('chat-messages');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');

    // Simulate Partner Name
    const partnerName = session.type === 'sender' ? 'Viajante Verificado' : 'Remetente Verificado';
    partnerNameEl.textContent = partnerName;

    // Load initial messages
    const addMessage = (text, type) => {
        const div = document.createElement('div');
        div.className = `message ${type}`;
        div.textContent = text;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    setTimeout(() => {
        addMessage(`Olá! O sistema da MALAH conectou nossa viagem/envio. Podemos combinar os detalhes da entrega no aeroporto?`, 'received');
    }, 500);
    
    if (session.type === 'traveler') {
        setTimeout(() => {
            addMessage('Eu chego no aeroporto com 2 horas de antecedência. Podemos nos encontrar no portão de embarque para fazermos o lacre de segurança da ANAC e tirar a foto?', 'received');
        }, 2000);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
            addMessage(text, 'sent');
            input.value = '';
            
            // Mock auto-reply
            setTimeout(() => {
                addMessage('Perfeito! Aguardando você realizar o pagamento de garantia na plataforma para fecharmos negócio de forma segura.', 'received');
            }, 2500);
        }
    });
});
