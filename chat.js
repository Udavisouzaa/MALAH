/* ==========================================================================
   MALAH REAL-TIME CHAT LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    // Auth Guard
    const sessionStr = localStorage.getItem('malah_session');
    if (!sessionStr) {
        window.location.href = 'login.html';
        return;
    }
    const session = JSON.parse(sessionStr);

    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('match') || 'demo_match';
    
    const partnerNameEl = document.getElementById('chat-partner-name');
    const messagesEl = document.getElementById('chat-messages');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');

    const partnerName = session.type === 'sender' ? 'Viajante Verificado' : 'Remetente Verificado';
    partnerNameEl.textContent = partnerName;

    // Helper to render message
    const renderMessage = (text, type) => {
        const div = document.createElement('div');
        div.className = `message ${type}`;
        div.textContent = text;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    // Load history from Supabase
    async function carregarMensagens() {
        const { data, error } = await db.buscarMensagens(matchId);
        if (data && data.length > 0) {
            // Clear mock messages, keep the system warning
            messagesEl.innerHTML = '<div class="message system">O chat MALAH é criptografado. Nunca transfira valores fora da plataforma.</div>';
            
            data.forEach(msg => {
                const type = msg.sender_id === session.id ? 'sent' : 'received';
                renderMessage(msg.text, type);
            });
        }
    }

    await carregarMensagens();

    // Polling for new messages (Since we don't have Supabase Realtime enabled by default)
    setInterval(carregarMensagens, 3000);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
            // Optimistic UI update
            renderMessage(text, 'sent');
            input.value = '';
            
            // Send to DB
            await db.enviarMensagem(matchId, session.id, text);
        }
    });
});
