/* ==========================================================================
   MALAH DASHBOARD LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    // Determine user type from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('userType') || 'sender'; // Default to sender

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
});
