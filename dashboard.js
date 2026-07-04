/* ==========================================================================
   MALAH DASHBOARD LOGIC
   ========================================================================== */

let currentUserType = 'sender';

function iniciarChat(matchId) {
    window.location.href = `chat.html?match=${matchId}`;
}

// Modal Logic
function abrirModalNovo() {
    document.getElementById('modal-novo').style.display = 'flex';
    const dynamicFields = document.getElementById('modal-dynamic-fields');
    const title = document.getElementById('modal-title');
    
    if (currentUserType === 'sender') {
        title.textContent = 'Novo Envio de Encomenda';
        dynamicFields.innerHTML = `
            <div class="form-group">
                <label>Item a ser enviado</label>
                <input type="text" id="modal-item" class="form-input" placeholder="Ex: Chaves do carro" required>
            </div>
            <div class="form-group">
                <label>Valor Declarado (R$)</label>
                <input type="number" id="modal-value" class="form-input" placeholder="1000" required>
            </div>
        `;
    } else {
        title.textContent = 'Cadastrar Novo Voo';
        dynamicFields.innerHTML = `
            <div class="form-group">
                <label>Data do Voo</label>
                <input type="date" id="modal-date" class="form-input" required>
            </div>
            <div class="form-group">
                <label>Companhia Aérea</label>
                <input type="text" id="modal-company" class="form-input" placeholder="Ex: LATAM" required>
            </div>
        `;
    }
}

function fecharModalNovo() {
    document.getElementById('modal-novo').style.display = 'none';
}

async function salvarNovoRegistro(event) {
    event.preventDefault();
    const btn = document.getElementById('modal-submit-btn');
    btn.textContent = 'Salvando...';
    btn.disabled = true;

    const origin = document.getElementById('modal-origin').value;
    const dest = document.getElementById('modal-dest').value;
    const contact = document.getElementById('modal-contact').value;

    const session = JSON.parse(localStorage.getItem('malah_session') || '{}');

    let leadData = {};
    if (currentUserType === 'sender') {
        const item = document.getElementById('modal-item').value;
        const value = document.getElementById('modal-value').value;
        leadData = { type: 'sender', origin, dest, contact, item, value, user_id: session.id };
    } else {
        const date = document.getElementById('modal-date').value;
        const company = document.getElementById('modal-company').value;
        leadData = { type: 'traveler', origin, dest, contact, date, company, user_id: session.id };
    }

    const { error } = await db.salvarLead(leadData, currentUserType);
    
    if (error) {
        alert("Erro ao salvar: " + error.message);
        btn.textContent = 'Salvar Registro';
        btn.disabled = false;
        return;
    }

    fecharModalNovo();
    window.location.reload(); // Recarrega para mostrar na tabela
}

document.addEventListener('DOMContentLoaded', async () => {
    // Auth Guard
    const sessionStr = localStorage.getItem('malah_session');
    if (!sessionStr) {
        window.location.href = 'login.html';
        return;
    }
    const session = JSON.parse(sessionStr);

    // Determine user type from session
    const userType = session.type || 'sender';
    currentUserType = userType;
    
    // Update Profile Name
    const pageTitle = document.getElementById('page-title');
    if (pageTitle && session.name) {
        pageTitle.textContent = `Olá, ${session.name.split(' ')[0]}`;
    }

    // UI Elements
    const badge = document.getElementById('user-role-badge');
    const recordsLabel = document.getElementById('records-label');
    const tableTitle = document.getElementById('table-title');
    const tableHead = document.getElementById('table-head');
    const tableBody = document.getElementById('table-body');
    const stat1Title = document.getElementById('stat1-title');
    const stat1Val = document.getElementById('stat1-val');

    // Configure UI based on User Type
    if (userType === 'sender') {
        badge.textContent = 'Painel do Remetente';
        recordsLabel.textContent = 'Meus Envios';
        tableTitle.textContent = 'Envios Recentes';
        stat1Title.textContent = 'Pacotes em Trânsito';
        tableHead.innerHTML = `
            <th>Item</th>
            <th>Origem</th>
            <th>Destino</th>
            <th>Status</th>
        `;
    } else {
        badge.textContent = 'Painel do Viajante';
        recordsLabel.textContent = 'Meus Voos';
        tableTitle.textContent = 'Voos Cadastrados';
        stat1Title.textContent = 'Voos Ativos';
        tableHead.innerHTML = `
            <th>Data</th>
            <th>Origem</th>
            <th>Destino</th>
            <th>Status</th>
        `;
    }

    // Fetch Data (Only mine)
    const { data, error } = await db.listarMeusRegistros(userType, session.id);

    if (error) {
        tableBody.innerHTML = `<tr><td colspan="4" style="color: #ef4444; padding: 20px;">Erro ao carregar dados.</td></tr>`;
        return;
    }

    // Populate Table
    if (data && data.length > 0) {
        stat1Val.textContent = data.length;
        tableBody.innerHTML = ''; // Clear loading

        data.forEach(item => {
            const tr = document.createElement('tr');
            
            if (userType === 'sender') {
                tr.innerHTML = `
                    <td><strong>${item.item || 'Item'}</strong></td>
                    <td>${item.origin}</td>
                    <td>${item.dest}</td>
                    <td><span class="status-badge status-pendente">Aguardando Viajante</span></td>
                `;
            } else {
                tr.innerHTML = `
                    <td><strong>${item.date}</strong></td>
                    <td>${item.origin}</td>
                    <td>${item.dest}</td>
                    <td><span class="status-badge status-pendente">Aguardando Pacote</span></td>
                `;
            }
            tableBody.appendChild(tr);
        });
    } else {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">Nenhum registro encontrado.</td></tr>`;
    }

    // --- MATCHMAKING LOGIC ---
    const matchesSection = document.getElementById('matches-section');
    const matchesBody = document.getElementById('matches-body');
    const navMatches = document.getElementById('nav-matches');

    if (navMatches) {
        navMatches.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('nav-records').classList.remove('active');
            navMatches.classList.add('active');
            matchesSection.style.display = 'block';
        });
        
        document.getElementById('nav-records').addEventListener('click', (e) => {
            e.preventDefault();
            navMatches.classList.remove('active');
            document.getElementById('nav-records').classList.add('active');
            matchesSection.style.display = 'none';
        });
    }

    if (data && data.length > 0) {
        const oppositeType = userType === 'sender' ? 'traveler' : 'sender';
        const resultOpp = await db.listarTodosRegistros(oppositeType);
        const oppositeData = resultOpp.data || [];
        
        if (oppositeData && oppositeData.length > 0) {
            const matches = [];
            oppositeData.forEach(opp => {
                // Matchmaking Aberto: Permite qualquer match independente de aeroporto (Fase 7)
                const myMatch = data.length > 0 ? data[0] : null; 
                if (myMatch) {
                    matches.push({ opp, myMatch });
                }
            });

            if (matches.length > 0) {
                matchesBody.innerHTML = '';
                matches.forEach(match => {
                    const opp = match.opp;
                    const my = match.myMatch;
                    const tr = document.createElement('tr');
                    const desc = oppositeType === 'sender' ? (opp.item || 'Pacote de Valor') : `Voo: ${opp.date}`;
                    
                    // Garantir que a Sala de Chat seja a mesma para ambos (sempre: IDRemetente_IDViajante)
                    const matchRoomId = userType === 'sender' ? my.id + '_' + opp.id : opp.id + '_' + my.id;
                    
                    tr.innerHTML = `
                        <td><strong>${desc}</strong></td>
                        <td>${opp.origin}</td>
                        <td>${opp.dest}</td>
                        <td><button class="btn btn-sm btn-primary" onclick="iniciarChat('${matchRoomId}')">Iniciar Chat</button></td>
                    `;
                    matchesBody.appendChild(tr);
                });
            } else {
                matchesBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">Nenhum match encontrado no momento. Avisaremos quando surgir!</td></tr>`;
            }
        } else {
            matchesBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">Nenhum match encontrado no momento. Avisaremos quando surgir!</td></tr>`;
        }
    }

    // Polling de Notificações
    async function checkNotifications() {
        const { data } = await db.verificarNovasMensagens(session.id);
        const badgeMsg = document.getElementById('msg-badge');
        const toast = document.getElementById('toast-notification');
        
        if (badgeMsg) {
            if (data && data.length > 0) {
                badgeMsg.style.display = 'inline-block';
                
                // Show Toast if it's not already visible
                if (toast && toast.style.display === 'none') {
                    toast.style.display = 'block';
                    setTimeout(() => toast.style.transform = 'translateY(0)', 50); // slide up
                    
                    // Hide after 5 seconds
                    setTimeout(() => {
                        toast.style.transform = 'translateY(100px)'; // slide down
                        setTimeout(() => toast.style.display = 'none', 300);
                    }, 5000);
                }
            } else {
                badgeMsg.style.display = 'none';
            }
        }
    }
    setInterval(checkNotifications, 5000);

    // Switch Mode Logic
    const switchBtn = document.getElementById('nav-switch-mode');
    const switchLabel = document.getElementById('switch-mode-label');
    if (userType === 'sender') {
        if (switchLabel) switchLabel.textContent = 'Mudar p/ Viajante';
    } else {
        if (switchLabel) switchLabel.textContent = 'Mudar p/ Remetente';
    }
    
    if (switchBtn) {
        switchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const newType = userType === 'sender' ? 'traveler' : 'sender';
            session.type = newType;
            localStorage.setItem('malah_session', JSON.stringify(session));
            
            // Also update in users list so it persists across logins
            let users = JSON.parse(localStorage.getItem('malah_users') || '{}');
            if (users[session.email]) {
                users[session.email].type = newType;
                localStorage.setItem('malah_users', JSON.stringify(users));
            }
            
            window.location.reload();
        });
    }

    // Logout Logic
    const logoutBtn = document.querySelector('.nav-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('malah_session');
            window.location.href = 'index.html';
        });
    }
});
