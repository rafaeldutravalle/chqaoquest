CREATE TABLE usuarios (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    guerra_name VARCHAR(50) NOT NULL,
    specialty_id VARCHAR(30) DEFAULT 'infantaria',
    biotipo VARCHAR(30) DEFAULT 'Atlético',
    skin_tone VARCHAR(30) DEFAULT 'Bronze',
    face_type VARCHAR(30) DEFAULT 'Determinado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);