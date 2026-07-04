/* ==========================================================================
   MALAH SUPABASE CLIENT INITIALIZATION
   ========================================================================== */

// Configuração do Supabase
// IMPORTANTE: Davi, você precisará criar um projeto gratuito em supabase.com
// e substituir essas variáveis pelas chaves reais do seu projeto.
const SUPABASE_URL = 'https://sua-url-aqui.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-aqui';

let supabaseClient = null;

// O objeto 'supabase' vem do script CDN importado no index.html e dashboard.html
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase Client Inicializado.");
} else {
    console.warn("Biblioteca Supabase JS não detectada. Certifique-se de importar o CDN no HTML.");
}

// Módulo de acesso ao Banco de Dados
const db = {
    // Salvar novo registro (Envio ou Voo)
    async salvarLead(dados, tipo) {
        // Se as chaves ainda não foram configuradas, usa o localStorage para simular o DB
        if (!supabaseClient || SUPABASE_URL.includes('sua-url-aqui')) {
            console.log("Supabase Mock: Salvando dados no LocalStorage");
            let currentLeads = JSON.parse(localStorage.getItem('malah_leads') || '[]');
            const novoRegistro = { 
                ...dados, 
                id: 'id_' + Math.random().toString(36).substr(2, 9),
                tipo: tipo,
                status: 'pendente',
                created_at: new Date().toISOString() 
            };
            currentLeads.push(novoRegistro);
            localStorage.setItem('malah_leads', JSON.stringify(currentLeads));
            return { data: [novoRegistro], error: null };
        }

        // Conexão Real com o Banco de Dados
        const tabela = tipo === 'sender' ? 'shipments' : 'trips';
        const { data, error } = await supabaseClient
            .from(tabela)
            .insert([dados])
            .select();
            
        return { data, error };
    },
    
    // Obter lista de registros para o Dashboard
    async listarRegistros(tipo) {
        if (!supabaseClient || SUPABASE_URL.includes('sua-url-aqui')) {
            const todos = JSON.parse(localStorage.getItem('malah_leads') || '[]');
            return { data: todos.filter(item => item.tipo === tipo), error: null };
        }

        const tabela = tipo === 'sender' ? 'shipments' : 'trips';
        const { data, error } = await supabaseClient
            .from(tabela)
            .select('*')
            .order('created_at', { ascending: false });
            
        return { data, error };
    }
};
