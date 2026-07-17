CREATE TABLE usuario_stats (
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE PRIMARY KEY,
    pm NUMERIC(8,2) DEFAULT 0.0, -- Pontos de Mérito
    coins INTEGER DEFAULT 400,   -- Munição física
    prontidao INTEGER DEFAULT 100,
    streak INTEGER DEFAULT 0,    -- Ofensiva activa
    xp INTEGER DEFAULT 0,
    nivel INTEGER DEFAULT 1,
    fase INTEGER DEFAULT 1,      -- Fase actual da ementa (CHQAO)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);