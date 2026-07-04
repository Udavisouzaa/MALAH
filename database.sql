-- Executar este código no SQL Editor do Supabase para criar as tabelas da MALAH

-- 1. Criar tabela de Viagens (Viajantes)
CREATE TABLE public.trips (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    type text DEFAULT 'traveler',
    origin text NOT NULL,
    dest text NOT NULL,
    date text NOT NULL,
    company text,
    contact text NOT NULL
);

-- 2. Criar tabela de Encomendas (Remetentes)
CREATE TABLE public.shipments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    type text DEFAULT 'sender',
    item text NOT NULL,
    origin text NOT NULL,
    dest text NOT NULL,
    value text NOT NULL,
    contact text NOT NULL
);

-- 3. Criar tabela de Mensagens (Chat)
CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    match_id text NOT NULL,
    sender_id text NOT NULL,
    text text NOT NULL
);

-- 4. Permissões
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir insert em trips" ON public.trips FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Permitir insert em shipments" ON public.shipments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Permitir insert em messages" ON public.messages FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Permitir select em trips" ON public.trips FOR SELECT TO anon USING (true);
CREATE POLICY "Permitir select em shipments" ON public.shipments FOR SELECT TO anon USING (true);
CREATE POLICY "Permitir select em messages" ON public.messages FOR SELECT TO anon USING (true);
