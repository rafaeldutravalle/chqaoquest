
DROP VIEW IF EXISTS public.weekly_ranking CASCADE;

DELETE FROM public.poll_votes;
DELETE FROM public.polls;
DELETE FROM public.medals;
DELETE FROM public.mission_attempts;
DELETE FROM public.profiles;

DROP TRIGGER IF EXISTS trg_award_medals_after_attempt ON public.mission_attempts;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS rank CASCADE;
ALTER TABLE public.mission_attempts DROP COLUMN IF EXISTS rank_target CASCADE;
ALTER TABLE public.questions DROP COLUMN IF EXISTS min_rank CASCADE;
DROP TYPE IF EXISTS public.military_rank CASCADE;
CREATE TYPE public.military_rank AS ENUM (
  'recruta','soldado','cabo','terceiro_sgt','segundo_sgt','primeiro_sgt',
  'subtenente','segundo_tenente','primeiro_tenente','capitao_qao'
);

DROP TYPE IF EXISTS public.subject CASCADE;
CREATE TYPE public.subject AS ENUM (
  'portugues','geografia','historia','estatuto','risg','rae','rde',
  'licitacoes','cpm','cppm','doutrina','sindicancia','ingles'
);

DROP TYPE IF EXISTS public.specialty CASCADE;
CREATE TYPE public.specialty AS ENUM (
  'infantaria','artilharia','cavalaria','engenharia','comunicacoes',
  'material_belico','intendencia','saude','topografia','aviacao','musica'
);

DROP TYPE IF EXISTS public.liga CASCADE;
CREATE TYPE public.liga AS ENUM (
  'recruta','max_wolf_filho','prata','vilagran_cabrita','bitencourt',
  'mallet','osorio','sampaio','rondon','caxias'
);

DROP TYPE IF EXISTS public.subscription_plan CASCADE;
CREATE TYPE public.subscription_plan AS ENUM ('free','supersub','maxwolf');

DROP TYPE IF EXISTS public.rarity CASCADE;
CREATE TYPE public.rarity AS ENUM ('comum','raro','epico','lendario');

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS energy,
  DROP COLUMN IF EXISTS energy_max,
  DROP COLUMN IF EXISTS energy_updated_at,
  DROP COLUMN IF EXISTS gems,
  DROP COLUMN IF EXISTS fvm_score,
  DROP COLUMN IF EXISTS specialty;

ALTER TABLE public.profiles
  ADD COLUMN rank public.military_rank NOT NULL DEFAULT 'recruta',
  ADD COLUMN specialty public.specialty,
  ADD COLUMN nome_guerra TEXT,
  ADD COLUMN prontidao INT NOT NULL DEFAULT 100,
  ADD COLUMN prontidao_max INT NOT NULL DEFAULT 100,
  ADD COLUMN prontidao_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN pontos_merito NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN punicoes INT NOT NULL DEFAULT 0,
  ADD COLUMN municao INT NOT NULL DEFAULT 50,
  ADD COLUMN account_level INT NOT NULL DEFAULT 1,
  ADD COLUMN streak_dias INT NOT NULL DEFAULT 0,
  ADD COLUMN streak_freezes INT NOT NULL DEFAULT 1,
  ADD COLUMN streak_updated_at DATE,
  ADD COLUMN liga_atual public.liga NOT NULL DEFAULT 'recruta',
  ADD COLUMN plan public.subscription_plan NOT NULL DEFAULT 'free',
  ADD COLUMN region_unlocked TEXT[] NOT NULL DEFAULT ARRAY['cma','cmp']::TEXT[];

ALTER TABLE public.questions DROP COLUMN IF EXISTS subject;
ALTER TABLE public.questions ADD COLUMN subject public.subject NOT NULL DEFAULT 'portugues';
ALTER TABLE public.questions ADD COLUMN min_rank public.military_rank NOT NULL DEFAULT 'recruta';
ALTER TABLE public.questions ADD COLUMN region_code TEXT;

CREATE TABLE public.regions (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  primary_subject public.subject NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read regions" ON public.regions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage regions" ON public.regions FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code TEXT NOT NULL REFERENCES public.regions(code) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject public.subject NOT NULL,
  rank_target public.military_rank NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  num_questions INT NOT NULL DEFAULT 5,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read missions" ON public.missions FOR SELECT TO authenticated
  USING (active = true OR has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "admin manage missions" ON public.missions FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TABLE public.mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  stars INT NOT NULL DEFAULT 0,
  best_score NUMERIC NOT NULL DEFAULT 0,
  attempts_count INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_id)
);
ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own mp select" ON public.mission_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own mp insert" ON public.mission_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own mp update" ON public.mission_progress FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.mission_attempts
  ADD COLUMN rank_target public.military_rank NOT NULL DEFAULT 'recruta',
  ADD COLUMN mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL,
  ADD COLUMN prontidao_used INT NOT NULL DEFAULT 0;

CREATE TABLE public.leagues_weekly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  liga public.liga NOT NULL,
  group_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (week_start, liga, group_index)
);
ALTER TABLE public.leagues_weekly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read leagues" ON public.leagues_weekly FOR SELECT TO authenticated USING (true);

CREATE TABLE public.league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES public.leagues_weekly(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  xp_week INT NOT NULL DEFAULT 0,
  position INT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (league_id, user_id)
);
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read league members" ON public.league_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "own league member insert" ON public.league_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own league member update" ON public.league_members FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.daily_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  goal_value INT NOT NULL,
  goal_subject public.subject,
  reward_municao INT NOT NULL DEFAULT 30,
  reward_xp INT NOT NULL DEFAULT 50
);
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read dm" ON public.daily_missions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage dm" ON public.daily_missions FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TABLE public.user_daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  daily_mission_id UUID NOT NULL REFERENCES public.daily_missions(id) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0,
  claimed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, daily_mission_id)
);
ALTER TABLE public.user_daily_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own udp" ON public.user_daily_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_cunhetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  rarity public.rarity NOT NULL DEFAULT 'comum',
  source TEXT NOT NULL,
  opened BOOLEAN NOT NULL DEFAULT false,
  contents JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_cunhetes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cunhetes" ON public.user_cunhetes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.museum_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  era TEXT,
  rarity public.rarity NOT NULL DEFAULT 'comum',
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.museum_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read museum" ON public.museum_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage museum" ON public.museum_cards FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TABLE public.user_museum_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  card_id UUID NOT NULL REFERENCES public.museum_cards(id) ON DELETE CASCADE,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, card_id)
);
ALTER TABLE public.user_museum_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own museum" ON public.user_museum_cards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.dilemmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  context TEXT NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT,
  option_d TEXT,
  best_answer CHAR(1) NOT NULL,
  explanation TEXT,
  subject public.subject,
  min_rank public.military_rank NOT NULL DEFAULT 'segundo_sgt',
  active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.dilemmas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read dilemmas" ON public.dilemmas FOR SELECT TO authenticated
  USING (active OR has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "admin manage dilemmas" ON public.dilemmas FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TABLE public.tropa_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.tropa_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read stories" ON public.tropa_stories FOR SELECT TO authenticated
  USING (active OR has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "admin manage stories" ON public.tropa_stories FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TABLE public.store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price_municao INT NOT NULL DEFAULT 0,
  rarity public.rarity NOT NULL DEFAULT 'comum',
  active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read store" ON public.store_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage store" ON public.store_items FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TABLE public.user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.store_items(id) ON DELETE CASCADE,
  qty INT NOT NULL DEFAULT 1,
  equipped BOOLEAN NOT NULL DEFAULT false,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own inv" ON public.user_inventory FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  plan public.subscription_plan NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'inactive',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sub select" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE public.caramelo_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  text TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.caramelo_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read caramelo" ON public.caramelo_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage caramelo" ON public.caramelo_messages FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

DROP FUNCTION IF EXISTS public.regen_energy_tick();
CREATE OR REPLACE FUNCTION public.regen_prontidao_tick()
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE affected INT;
BEGIN
  WITH upd AS (
    UPDATE public.profiles
    SET prontidao = LEAST(prontidao + 25, prontidao_max),
        prontidao_updated_at = now()
    WHERE prontidao < prontidao_max
      AND prontidao_updated_at < now() - INTERVAL '4 hours'
      AND plan = 'free'
    RETURNING 1
  )
  SELECT COUNT(*) INTO affected FROM upd;
  RETURN affected;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, prontidao, prontidao_max, municao, rank)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    100, 100, 50, 'recruta'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  INSERT INTO public.subscriptions (user_id, plan, status) VALUES (NEW.id, 'free', 'inactive');
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.award_medals_after_attempt()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_perfect_count INT; v_distinct_ranks INT; v_total INT;
BEGIN
  IF NEW.rank_target = 'cabo' AND NEW.score >= 9.5 THEN
    INSERT INTO public.medals (user_id, code, name) VALUES (NEW.user_id, 'osorio', 'Marechal Osório') ON CONFLICT DO NOTHING;
  END IF;
  IF NEW.rank_target = 'segundo_sgt' AND NEW.score >= 9.6 THEN
    INSERT INTO public.medals (user_id, code, name) VALUES (NEW.user_id, 'corpo_tropa', 'Corpo de Tropa') ON CONFLICT DO NOTHING;
  END IF;
  IF NEW.rank_target = 'subtenente' AND NEW.score >= 9.8 THEN
    INSERT INTO public.medals (user_id, code, name) VALUES (NEW.user_id, 'pacificador', 'Pacificador') ON CONFLICT DO NOTHING;
  END IF;
  IF NEW.rank_target = 'segundo_tenente' AND NEW.score >= 9.9 THEN
    INSERT INTO public.medals (user_id, code, name) VALUES (NEW.user_id, 'maxwolf', 'Max-Wolf') ON CONFLICT DO NOTHING;
  END IF;
  IF NEW.rank_target = 'primeiro_tenente' AND NEW.score >= 9.9 THEN
    INSERT INTO public.medals (user_id, code, name) VALUES (NEW.user_id, 'da_vitoria', 'da Vitória') ON CONFLICT DO NOTHING;
  END IF;
  IF NEW.rank_target = 'capitao_qao' AND NEW.score >= 9.9 THEN
    INSERT INTO public.medals (user_id, code, name) VALUES (NEW.user_id, 'comando_dourado', 'Comando Dourado') ON CONFLICT DO NOTHING;
  END IF;

  SELECT COUNT(*) INTO v_perfect_count FROM public.mission_attempts
   WHERE user_id = NEW.user_id AND total > 0 AND correct = total;
  IF v_perfect_count >= 5 THEN
    INSERT INTO public.medals (user_id, code, name) VALUES (NEW.user_id, 'tamandare', 'Almirante Tamandaré') ON CONFLICT DO NOTHING;
  END IF;

  SELECT COUNT(DISTINCT rank_target) INTO v_distinct_ranks FROM public.mission_attempts WHERE user_id = NEW.user_id;
  IF v_distinct_ranks >= 7 THEN
    INSERT INTO public.medals (user_id, code, name) VALUES (NEW.user_id, 'caxias', 'Duque de Caxias') ON CONFLICT DO NOTHING;
  END IF;

  SELECT COUNT(*) INTO v_total FROM public.mission_attempts WHERE user_id = NEW.user_id;
  IF v_total >= 25 THEN
    INSERT INTO public.medals (user_id, code, name) VALUES (NEW.user_id, 'leitao', 'Estêvão Leitão de Carvalho') ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER trg_award_medals_after_attempt
AFTER INSERT ON public.mission_attempts
FOR EACH ROW EXECUTE FUNCTION public.award_medals_after_attempt();

INSERT INTO public.regions (code, name, short_name, description, icon, primary_subject, display_order) VALUES
  ('cma','Comando Militar da Amazônia','CMA','Selva, biomas e fronteira norte','🌳','geografia',1),
  ('cmp','Comando Militar do Planalto','CMP','Capital e centro do poder','🏛️','portugues',2),
  ('cmne','Comando Militar do Nordeste','CMNE','Sertão, semiárido e história colonial','🌵','historia',3),
  ('cms','Comando Militar do Sul','CMS','Pampa, clima e revoluções','🐎','geografia',4),
  ('cmse','Comando Militar do Sudeste','CMSE','Polo administrativo do Exército','⚙️','estatuto',5),
  ('cmo','Comando Militar do Oeste','CMO','Pantanal e gestão administrativa','🏞️','rae',6),
  ('cmn','Comando Militar do Norte','CMN','Justiça militar e amazônia oriental','⚖️','cpm',7),
  ('cml','Comando Militar do Leste','CML','Litoral e doutrina','⚓','doutrina',8),
  ('coter','Comando de Operações Terrestres','COTER','Doutrina e operações conjuntas','🎯','doutrina',9),
  ('brasilia','Brasília – Prova Final','PF','Simulado final do CHQAO','🏆','portugues',10);

INSERT INTO public.caramelo_messages (category, text) VALUES
  ('combo','Padrão, comandante! Está num combo de mestre!'),
  ('streak_lost','Perdemos a missão de ontem, campeão. Bora dar o gás hoje!'),
  ('daily_done','Missão Cumprida! Sua FVM agradece o reforço.'),
  ('promotion','Sentido! Promoção concedida — apresente-se ao novo posto!'),
  ('rancho','Baixa ao Rancho. Vamos recuperar a Prontidão e voltar ao combate.'),
  ('idle','Comandante, sua FVM está aguardando o reforço de hoje! O Rancho está logo ali.');
