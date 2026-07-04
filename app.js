/* ==========================================================================
   MALAH INTERACTIVE JAVASCRIPT LOGIC
   ========================================================================== */

// 1. Tab switching for the Hero Form Widget
function switchTab(userType) {
    const tabSender = document.getElementById('tab-sender');
    const tabTraveler = document.getElementById('tab-traveler');
    const formSender = document.getElementById('form-sender');
    const formTraveler = document.getElementById('form-traveler');
    const successState = document.getElementById('form-success');

    // Reset success state if visible
    successState.style.display = 'none';

    if (userType === 'sender') {
        tabSender.classList.add('active');
        tabTraveler.classList.remove('active');
        formSender.classList.add('active');
        formTraveler.classList.remove('active');
    } else {
        tabTraveler.classList.add('active');
        tabSender.classList.remove('active');
        formTraveler.classList.add('active');
        formSender.classList.remove('active');
    }
}

// 2. Toggle "Como Funciona" workflow tabs
function toggleWorkflow(userType) {
    const btnSender = document.getElementById('btn-flow-sender');
    const btnTraveler = document.getElementById('btn-flow-traveler');
    const flowSender = document.getElementById('flow-sender');
    const flowTraveler = document.getElementById('flow-traveler');

    if (userType === 'sender') {
        btnSender.classList.add('active');
        btnTraveler.classList.remove('active');
        flowSender.classList.add('active');
        flowTraveler.classList.remove('active');
    } else {
        btnTraveler.classList.add('active');
        btnSender.classList.remove('active');
        flowTraveler.classList.add('active');
        flowSender.classList.remove('active');
    }
}

// 3. Calculator Range Slider UI updates
function updateRangeValue(value) {
    const rangeDisplay = document.getElementById('range-val-display');
    const formatted = Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    rangeDisplay.textContent = formatted;
}

// 4. Calculate estimates in real-time
function calculateEstimates() {
    const urgencySelect = document.getElementById('calc-urgency');
    const urgency = urgencySelect ? urgencySelect.value : 'comum';

    let totalSenderCost = 100;
    let travelerReward = 70;
    let speedLabel = "Até 3 dias";

    if (urgency === 'urgente') {
        totalSenderCost = 180;
        travelerReward = 130;
        speedLabel = "Mesmo Dia";
    }

    // Format results to standard Brazilian currency (R$)
    const formattedCost = totalSenderCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formattedReward = travelerReward.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Update DOM
    document.getElementById('calc-sender-cost').textContent = formattedCost;
    document.getElementById('calc-traveler-reward').textContent = formattedReward;
    
    const badge = document.getElementById('calc-speed-badge');
    if (badge) badge.textContent = `Velocidade: ${speedLabel}`;
}

// 5. Handle submission & persistence
async function handleFormSubmit(event, formType) {
    event.preventDefault();

    let leadData = {};
    let successMessageText = '';

    if (formType === 'sender') {
        const item = document.getElementById('sender-item').value;
        const origin = document.getElementById('sender-origin').value;
        const dest = document.getElementById('sender-dest').value;
        const urgency = document.getElementById('sender-urgency').value;
        const contact = document.getElementById('sender-contact').value;

        leadData = { type: 'sender', item, origin, dest, urgency, contact };
        successMessageText = `Cadastro feito com sucesso! Encontramos viajantes ativos de ${origin} para ${dest}. Você será redirecionado para o WhatsApp para combinar os detalhes.`;
    } else {
        const origin = document.getElementById('traveler-origin').value;
        const dest = document.getElementById('traveler-dest').value;
        const date = document.getElementById('traveler-date').value;
        const company = document.getElementById('traveler-company').value;
        const contact = document.getElementById('traveler-contact').value;

        leadData = { type: 'traveler', origin, dest, date, company, contact };
        successMessageText = `Voo cadastrado! Já temos envios agendados de ${origin} para ${dest} na companhia ${company}. Você será redirecionado para o WhatsApp para ver as encomendas.`;
    }

    // Change Button State to Loading
    const btn = event.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Processando...';
    btn.disabled = true;

    // Save lead data using db object from supabaseClient.js
    const result = await db.salvarLead(leadData, formType);

    btn.textContent = originalText;
    btn.disabled = false;

    if (result.error) {
        console.error("Erro ao salvar:", result.error);
        alert("Erro do banco de dados: " + (result.error.message || JSON.stringify(result.error)));
        return;
    }

    // Redirect to Dashboard
    window.location.href = `dashboard.html?userType=${formType}`;
}

// 6. Reset form to switch back from success state
function resetFormState() {
    const successState = document.getElementById('form-success');
    const tabSender = document.getElementById('tab-sender');

    successState.style.display = 'none';
    
    // Default back to sender form
    switchTab('sender');
    
    // Clear fields
    document.getElementById('form-sender').reset();
    document.getElementById('form-traveler').reset();
}

// 7. Mobile menu simple toggle
document.addEventListener('DOMContentLoaded', () => {
    // Initial calculation on page load
    calculateEstimates();

    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('open');
        });
    }
});
