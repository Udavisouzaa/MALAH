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

-- 3. Desabilitar RLS temporariamente para o MVP (Permite leitura/escrita pública)
-- ATENÇÃO: Quando a plataforma crescer, precisaremos habilitar a Segurança a Nível de Linha (RLS)
ALTER TABLE public.trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments DISABLE ROW LEVEL SECURITY;
