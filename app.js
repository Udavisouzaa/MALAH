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
    const routeSelect = document.getElementById('calc-route');
    const valueInput = document.getElementById('calc-value');
    
    const route = routeSelect.value;
    const itemValue = Number(valueInput.value);

    // Business Rules Mocking
    // Route multipliers (simulating distance and demand)
    const routeRates = {
        'FLN-CGH': { baseFee: 80, travelerRewardPercent: 0.65 },
        'CGH-SDU': { baseFee: 65, travelerRewardPercent: 0.65 },
        'FLN-SDU': { baseFee: 95, travelerRewardPercent: 0.65 },
        'GRU-BSB': { baseFee: 110, travelerRewardPercent: 0.60 },
        'CGH-FLN': { baseFee: 80, travelerRewardPercent: 0.65 },
        'BSB-FLN': { baseFee: 120, travelerRewardPercent: 0.60 }
    };

    const rateConfig = routeRates[route] || { baseFee: 80, travelerRewardPercent: 0.65 };

    // Taxa de facilitação com base no valor do item (1.5% do valor)
    const facilitationFee = itemValue * 0.015;
    
    // Custo total para o remetente (Taxa base da rota + Taxa de facilitação)
    const totalSenderCost = rateConfig.baseFee + facilitationFee;
    
    // Recompensa do viajante (Percentual da taxa base + incentivo pelo manuseio de valor)
    const baseReward = rateConfig.baseFee * rateConfig.travelerRewardPercent;
    const valueBonus = facilitationFee * 0.45; // Viajante recebe 45% da taxa pelo cuidado com o item
    const travelerReward = baseReward + valueBonus;

    // Format results to standard Brazilian currency (R$)
    const formattedCost = totalSenderCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formattedReward = travelerReward.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formattedCoverage = itemValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

    // Update DOM
    document.getElementById('calc-sender-cost').textContent = formattedCost;
    document.getElementById('calc-traveler-reward').textContent = formattedReward;
    document.getElementById('calc-coverage').textContent = formattedCoverage;
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
        const value = document.getElementById('sender-value').value;
        const contact = document.getElementById('sender-contact').value;

        leadData = { type: 'sender', item, origin, dest, value, contact, timestamp: new Date().toISOString() };
        successMessageText = `Cadastro feito com sucesso! Encontramos viajantes ativos de ${origin} para ${dest}. Você será redirecionado para o WhatsApp para combinar os detalhes.`;
    } else {
        const origin = document.getElementById('traveler-origin').value;
        const dest = document.getElementById('traveler-dest').value;
        const date = document.getElementById('traveler-date').value;
        const company = document.getElementById('traveler-company').value;
        const contact = document.getElementById('traveler-contact').value;

        leadData = { type: 'traveler', origin, dest, date, company, contact, timestamp: new Date().toISOString() };
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
        alert("Ocorreu um erro ao processar seu cadastro. Tente novamente.");
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
