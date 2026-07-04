/* ==========================================================================
   MALAH DASHBOARD LOGIC
   ========================================================================== */

function iniciarChat(matchId) {
    window.location.href = `chat.html?match=${matchId}`;
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

    // Fetch Data
    const { data, error } = await db.listarRegistros(userType);

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
        const resultOpp = await db.listarRegistros(oppositeType);
        const oppositeData = resultOpp.data || [];
        
        if (oppositeData && oppositeData.length > 0) {
            const matches = oppositeData.filter(opp => {
                return data.some(my => my.origin === opp.origin && my.dest === opp.dest);
            });

            if (matches.length > 0) {
                matchesBody.innerHTML = '';
                matches.forEach(match => {
                    const tr = document.createElement('tr');
                    const desc = oppositeType === 'sender' ? (match.item || 'Pacote de Valor') : `Voo: ${match.date}`;
                    tr.innerHTML = `
                        <td><strong>${desc}</strong></td>
                        <td>${match.origin}</td>
                        <td>${match.dest}</td>
                        <td><button class="btn btn-sm btn-primary" onclick="iniciarChat('${match.id}')">Iniciar Chat</button></td>
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
