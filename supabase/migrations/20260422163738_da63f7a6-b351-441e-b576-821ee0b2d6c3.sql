-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.military_rank AS ENUM ('soldado','cabo','terceiro_sgt','segundo_sgt','primeiro_sgt','subtenente','segundo_ten_qao');
CREATE TYPE public.specialty AS ENUM ('infantaria','artilharia','cavalaria','engenharia','comunicacoes','material_belico','intendencia','saude','topografia','aviacao','musica');
CREATE TYPE public.question_subject AS ENUM ('portugues','geografia','historia','estatuto','risg','rae','rde','licitacoes','cpm','cppm','musica');
CREATE TYPE public.question_difficulty AS ENUM ('easy','medium','hard');

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_id TEXT,
  specialty public.specialty,
  rank public.military_rank NOT NULL DEFAULT 'soldado',
  fvm_score NUMERIC(6,2) NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  gems INTEGER NOT NULL DEFAULT 10,
  energy INTEGER NOT NULL DEFAULT 5,
  energy_max INTEGER NOT NULL DEFAULT 5,
  energy_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- QUESTIONS
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject public.question_subject NOT NULL,
  year INTEGER,
  question_number INTEGER,
  text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  explanation TEXT,
  difficulty public.question_difficulty NOT NULL DEFAULT 'medium',
  min_rank public.military_rank NOT NULL DEFAULT 'soldado',
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read questions" ON public.questions FOR SELECT TO authenticated USING (active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin insert questions" ON public.questions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update questions" ON public.questions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete questions" ON public.questions FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_questions_updated BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_questions_subject_rank ON public.questions(subject, min_rank) WHERE active;

-- MEDALS
CREATE TABLE public.medals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, code)
);
ALTER TABLE public.medals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own medals select" ON public.medals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own medals insert" ON public.medals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- MISSION ATTEMPTS
CREATE TABLE public.mission_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank_target public.military_rank NOT NULL,
  series_index INTEGER NOT NULL,
  correct INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  score NUMERIC(4,2) NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mission_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attempts select" ON public.mission_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own attempts insert" ON public.mission_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed sample questions (Português + Geografia básico)
INSERT INTO public.questions (subject, year, question_number, text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, min_rank) VALUES
('portugues',2024,1,'Assinale a alternativa em que TODAS as palavras estão grafadas corretamente.','Privilégio, beneficente, imprescindível','Previlégio, beneficiente, imprecindível','Privilégio, beneficiente, imprescindível','Previlégio, beneficente, imprecindível','A','As formas corretas são: privilégio, beneficente e imprescindível.','easy','soldado'),
('portugues',2023,2,'Marque a frase em que a concordância verbal está CORRETA.','Fazem dois anos que ingressei no Exército.','Houveram muitos candidatos no concurso.','Se o militar estudar bastante, será aprovado no CHQAO.','Para que a missão fosse cumprida, todos se esforçaram.','D','"Para que a missão fosse cumprida, todos se esforçaram." apresenta concordância correta. As demais têm erros (fazem→faz, houveram→houve).','medium','soldado'),
('portugues',2022,3,'Quanto ao emprego da crase, assinale a alternativa CORRETA.','Vou à Brasília amanhã.','Refiro-me àquela ordem do dia.','Cheguei à uma hora.','Muito obrigado pela sua dedicação.','B','"Àquela" recebe crase pela fusão da preposição "a" com o pronome "aquela".','medium','soldado'),
('geografia',2024,1,'Onde está localizado o ponto culminante do Brasil, o Pico da Neblina?','Serra do Imeri, no Amazonas','Serra do Mar, em São Paulo','Chapada Diamantina, na Bahia','Planalto Central, em Goiás','A','O Pico da Neblina (2.995,30 m) fica na Serra do Imeri, AM, divisa com a Venezuela.','easy','soldado'),
('geografia',2023,2,'A região do Cerrado brasileiro está predominantemente localizada em qual área?','Região Nordeste, nos estados do Piauí e Maranhão','Planalto Central, abrangendo Goiás, MG, MT e MS','Região Sul, no Rio Grande do Sul','Litoral do Sudeste, em ES e RJ','B','O Cerrado é o segundo maior bioma do Brasil, dominante no Planalto Central.','medium','soldado'),
('geografia',2022,3,'Qual o nome do principal rio que corta a região Nordeste do Brasil?','Rio Amazonas','Rio Tocantins','Rio São Francisco','Rio Paraná','C','O Rio São Francisco, "Velho Chico", é o principal rio do Nordeste brasileiro.','easy','soldado');