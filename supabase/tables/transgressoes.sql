CREATE TABLE transgressoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    severity VARCHAR(30) NOT NULL,  -- 'Aviso' | 'Advertência' | 'Punição'
    message TEXT NOT NULL,
    punishment_effect TEXT,         -- Ex: 'Rancho Obrigatório'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);