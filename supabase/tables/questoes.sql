CREATE TABLE questoes (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'Português', 'Geografia', etc.
    text TEXT NOT NULL,            -- Pergunta/Enunciado
    options TEXT[] NOT NULL,       -- Array de alternativas
    correct_answer INTEGER NOT NULL, -- Index correto (0 a 4)
    explanation TEXT,             -- Explicação profunda/IA
    difficulty VARCHAR(20) DEFAULT 'Médio',
    year VARCHAR(4) DEFAULT '2025'
);