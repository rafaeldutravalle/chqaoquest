-- =========================================
-- POLLS (enquetes diárias)
-- =========================================
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT,
  option_d TEXT,
  active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_polls_active_date ON public.polls(active_date DESC);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read polls" ON public.polls
FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin insert polls" ON public.polls
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin update polls" ON public.polls
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin delete polls" ON public.polls
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- POLL VOTES
-- =========================================
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  choice CHAR(1) NOT NULL CHECK (choice IN ('A','B','C','D')),
  voted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id)
);
CREATE INDEX idx_poll_votes_poll ON public.poll_votes(poll_id);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own votes select" ON public.poll_votes
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "own votes insert" ON public.poll_votes
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Função pública para agregar resultados (sem expor quem votou no quê)
CREATE OR REPLACE FUNCTION public.poll_results(_poll_id UUID)
RETURNS TABLE(choice CHAR(1), votes BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT choice, COUNT(*)::BIGINT
  FROM public.poll_votes
  WHERE poll_id = _poll_id
  GROUP BY choice;
$$;

-- =========================================
-- RANKING SEMANAL (view)
-- =========================================
CREATE OR REPLACE VIEW public.weekly_ranking
WITH (security_invoker = true) AS
SELECT
  p.user_id,
  p.display_name,
  p.avatar_id,
  p.rank,
  COALESCE(SUM(ma.score), 0) AS week_fvm,
  COUNT(ma.id) AS missions_done
FROM public.profiles p
LEFT JOIN public.mission_attempts ma
  ON ma.user_id = p.user_id
  AND ma.completed_at >= date_trunc('week', now())
GROUP BY p.user_id, p.display_name, p.avatar_id, p.rank
ORDER BY week_fvm DESC;

-- =========================================
-- MEDALHAS AUTOMÁTICAS
-- =========================================
CREATE OR REPLACE FUNCTION public.award_medals_after_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_attempts INT;
  v_distinct_ranks INT;
  v_perfect_count INT;
BEGIN
  -- Marechal Osório: 100% em uma missão de Cabo
  IF NEW.rank_target = 'cabo' AND NEW.total > 0 AND NEW.correct = NEW.total THEN
    INSERT INTO public.medals (user_id, code, name)
    VALUES (NEW.user_id, 'osorio', 'Marechal Osório')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Brigadeiro Sampaio: 100% em uma missão de 3º Sgt
  IF NEW.rank_target = 'terceiro_sgt' AND NEW.total > 0 AND NEW.correct = NEW.total THEN
    INSERT INTO public.medals (user_id, code, name)
    VALUES (NEW.user_id, 'sampaio', 'Brigadeiro Sampaio')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Tamandaré: 5 missões perfeitas (qualquer posto)
  SELECT COUNT(*) INTO v_perfect_count
  FROM public.mission_attempts
  WHERE user_id = NEW.user_id AND total > 0 AND correct = total;
  IF v_perfect_count >= 5 THEN
    INSERT INTO public.medals (user_id, code, name)
    VALUES (NEW.user_id, 'tamandare', 'Almirante Tamandaré')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Duque de Caxias: completou Soldado, Cabo e 3º Sgt
  SELECT COUNT(DISTINCT rank_target) INTO v_distinct_ranks
  FROM public.mission_attempts
  WHERE user_id = NEW.user_id
    AND rank_target IN ('soldado','cabo','terceiro_sgt');
  IF v_distinct_ranks >= 3 THEN
    INSERT INTO public.medals (user_id, code, name)
    VALUES (NEW.user_id, 'caxias', 'Duque de Caxias')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Estêvão Leitão de Carvalho: 25 missões totais
  SELECT COUNT(*) INTO v_total_attempts
  FROM public.mission_attempts WHERE user_id = NEW.user_id;
  IF v_total_attempts >= 25 THEN
    INSERT INTO public.medals (user_id, code, name)
    VALUES (NEW.user_id, 'leitao', 'Estêvão Leitão de Carvalho')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Garante unicidade de medalha por usuário
ALTER TABLE public.medals
  ADD CONSTRAINT medals_user_code_unique UNIQUE (user_id, code);

CREATE TRIGGER trg_award_medals
AFTER INSERT ON public.mission_attempts
FOR EACH ROW
EXECUTE FUNCTION public.award_medals_after_attempt();