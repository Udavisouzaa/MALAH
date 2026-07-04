/* ==========================================================================
   MALAH SUPABASE CLIENT INITIALIZATION
   ========================================================================== */

// Configuração do Supabase
// IMPORTANTE: Davi, você precisará criar um projeto gratuito em supabase.com
// e substituir essas variáveis pelas chaves reais do seu projeto.
const SUPABASE_URL = 'https://gptkqwkdajclgiyhardo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qf-AcMYaIMkMAJxbztTVnw_vqe56lf7';

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
    
    // Obter lista de MEUS registros
    async listarMeusRegistros(tipo, userId) {
        if (!supabaseClient) return { data: [], error: null };
        const tabela = tipo === 'sender' ? 'shipments' : 'trips';
        const { data, error } = await supabaseClient
            .from(tabela)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return { data, error };
    },

    // Obter lista de TODOS os registros (Para o Matchmaking)
    async listarTodosRegistros(tipo) {
        if (!supabaseClient) return { data: [], error: null };
        const tabela = tipo === 'sender' ? 'shipments' : 'trips';
        const { data, error } = await supabaseClient
            .from(tabela)
            .select('*')
            .order('created_at', { ascending: false });
        return { data, error };
    },
    
    // Enviar mensagem no chat
    async enviarMensagem(matchId, senderId, text) {
        if (!supabaseClient) return { data: null, error: null };
        return await supabaseClient.from('messages').insert([{ match_id: matchId, sender_id: senderId, text }]);
    },

    // Buscar mensagens do chat
    async buscarMensagens(matchId) {
        if (!supabaseClient) return { data: [], error: null };
        return await supabaseClient.from('messages').select('*').eq('match_id', matchId).order('created_at', { ascending: true });
    },

    // Verificar se há novas mensagens (Notificações)
    async verificarNovasMensagens(userId) {
        if (!supabaseClient) return { data: [], error: null };
        // Retorna mensagens onde o userId não é o remetente (alguém mandou para mim)
        // Isso é uma simplificação para o MVP. Idealmente verificaríamos "lidas/não lidas" por sala.
        const d = new Date();
        d.setMinutes(d.getMinutes() - 5); // Mensagens dos últimos 5 minutos
        const past = d.toISOString();

        return await supabaseClient.from('messages')
            .select('*')
            .neq('sender_id', userId)
            .gte('created_at', past)
            .limit(1);
    }
};
