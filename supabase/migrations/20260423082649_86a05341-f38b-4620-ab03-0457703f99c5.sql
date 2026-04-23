-- Atualiza trigger de medalhas com as novas conquistas
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

  -- Brigadeiro do Jenipapo: 100% em uma missão de 2º Sgt
  IF NEW.rank_target = 'segundo_sgt' AND NEW.total > 0 AND NEW.correct = NEW.total THEN
    INSERT INTO public.medals (user_id, code, name)
    VALUES (NEW.user_id, 'jenipapo', 'Brigadeiro do Jenipapo')
    ON CONFLICT DO NOTHING;
  END IF;

  -- General Sampaio: 100% em uma missão de 1º Sgt
  IF NEW.rank_target = 'primeiro_sgt' AND NEW.total > 0 AND NEW.correct = NEW.total THEN
    INSERT INTO public.medals (user_id, code, name)
    VALUES (NEW.user_id, 'general_sampaio', 'General Sampaio')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Patrono da Arma: 100% em uma missão de Subtenente
  IF NEW.rank_target = 'subtenente' AND NEW.total > 0 AND NEW.correct = NEW.total THEN
    INSERT INTO public.medals (user_id, code, name)
    VALUES (NEW.user_id, 'patrono', 'Patrono da Arma')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Tamandaré: 5 missões perfeitas
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

  -- Marechal Hermes: passou por todos os postos
  SELECT COUNT(DISTINCT rank_target) INTO v_distinct_ranks
  FROM public.mission_attempts WHERE user_id = NEW.user_id;
  IF v_distinct_ranks >= 6 THEN
    INSERT INTO public.medals (user_id, code, name)
    VALUES (NEW.user_id, 'hermes', 'Marechal Hermes')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Espada de Honra: alcançou o posto final (2º Ten QAO)
  IF NEW.rank_target = 'segundo_ten_qao' AND NEW.total > 0 AND NEW.correct = NEW.total THEN
    INSERT INTO public.medals (user_id, code, name)
    VALUES (NEW.user_id, 'espada_honra', 'Espada de Honra')
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

-- Função de regeneração de energia (chamada por edge function via cron)
CREATE OR REPLACE FUNCTION public.regen_energy_tick()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected INT;
BEGIN
  WITH upd AS (
    UPDATE public.profiles
    SET energy = LEAST(energy + 1, energy_max),
        energy_updated_at = now()
    WHERE energy < energy_max
      AND energy_updated_at < now() - INTERVAL '30 minutes'
    RETURNING 1
  )
  SELECT COUNT(*) INTO affected FROM upd;
  RETURN affected;
END;
$$;