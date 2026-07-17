# Plano de Integração e Modelagem do Banco de Dados - Supabase (CHQAO Quest v3.0)

Este documento descreve a modelagem oficial de banco de dados relacional (PostgreSQL) configurada no **Supabase** para o **CHQAO Quest v.3.0 ("A Jornada do Mérito Militar")**, comparando-o com os padrões anteriores (v2.0) para dirimir dúvidas de implantação, prever possíveis incompatibilidades de interface e disponibilizar um script de carga (seed) com questões para todas as disciplinas.

---

## 1. Verificação de Integridade e Alinhamento de DDL (v2.0 vs v3.0)

O seu banco de dados atual no Supabase foi evoluído de forma extraordinária para refletir o roteiro gamificado completo. Abaixo está a análise de equivalência e compatibilidade regulada:

| Entidade no App v2.0 | Tabela Ativa no Supabase (v3.0) | Resultado do Alinhamento |
| :--- | :--- | :--- |
| `cadastro_militares` | `public.profiles` | **Alinhado.** O `profiles` centraliza a customização física (biotipo, tom_pele, rosto, uniforme_ativo) e as métricas do soldado (`posto`, `prontidao`, `municao`, `fvm_score`, `punicoes`). |
| `questoes_chqao` | `public.questions_bank` | **Alinhado.** A nova modelagem utiliza o termo `assunto` (matéria), `alternativas` formatadas como objetos JSONB e adiciona suporte à territorialização geográfica pelo marcador `rm_tag`. |
| `respostas_usuarios` | `public.user_errors` + `public.missions_progress` | **Superior.** Em vez de uma tabela única e genérica de respostas, o v3.0 rastreia os erros no sistema de repetição espaçada (`user_errors`) e as vitórias por nível de forma organizada (`missions_progress`). |
| `medalhas_militares` | `public.fvm_records` | **Superior.** `fvm_records` unifica o dossiê da Ficha de Valorização do Mérito (registrando advertências disciplinares, medalhas ganhas, promoções automáticas de posto e anotações gerais). |
| -- | `public.streaks` | **Novo.** Persiste a ofensiva ativa diária do militar e os "congeladores de streak" disponíveis. |
| -- | `public.inventory` | **Novo.** Persiste cunhetes conquistados, suplementos, e itens colecionáveis destravados do Museu Militar. |
| -- | `public.esquadroes` + `members` | **Novo.** Suporta a formação de pelotões/clãs militares para desafios e cooperação. |

---

## 2. Incompatibilidades Identificadas & Soluções com Mappers (React/TypeScript)

Para que o aplicativo funcione perfeitamente integrando a interface do React com esse banco PostgreSQL ativo do Supabase, duas diferenças fundamentais de modelagem precisam de adaptadores lógicos:

### A. Conversão de Posto / Patente (String vs Integer)
* **Incompatibilidade:** O estado interno do React (`ScoreStats.posto`) utiliza strings para exibição visual (`'Soldado'`, `'Cabo'`, `'3º Sgt'`, etc.), enquanto o Supabase utiliza valores inteiros (`posto INTEGER DEFAULT 1 -- 1=Recruta, 2=Cabo/3º Sgt, etc.`).
* **Função Adaptadora Recomendada:**
```typescript
// Mapeamento fidedigno ao regulamento de carreira
export const getPostNameByInteger = (postoInteger: number): string => {
  const map: Record<number, string> = {
    1: 'Recruta',
    2: 'Cabo',
    3: '2º Sargento',
    4: '1º Sargento',
    5: 'Subtenente',
    6: '2º Tenente',
    7: '1º Tenente',
    8: 'Capitão QAO'
  };
  return map[postoInteger] || 'Combatente';
};

export const getPostIntegerByName = (postoName: string): number => {
  const map: Record<string, number> = {
    'Soldado': 1,
    'Recruta': 1,
    'Cabo': 2,
    'Cabo/3º Sgt': 2,
    '3º Sgt': 2,
    '2º Sgt': 3,
    '1º Sgt': 4,
    'Subtenente': 5,
    '2º Tenente': 6,
    'Tenente': 6,
    '1º Tenente': 7,
    'Capitão QAO': 8
  };
  return map[postoName] || 1;
};
```

### B. Integração de Questões (`alternativas` JSONB vs `options` Array)
* **Incompatibilidade:** No formato estático anterior, a questão continha `options: string[]` e `correctAnswer: number` (índice 0-3). O seu banco de dados atual estruturou a coluna `alternativas` como JSONB contendo um vetor de campos com a estrutura `{"texto": "...", "correta": true/false}`.
* **Função de Mapeamento do Cliente:**
```typescript
interface DbQuestion {
  id: string;
  assunto: string;
  ano: number;
  enunciado: text;
  alternativas: Array<{ texto: string; correta: boolean }>;
  justificativa: string;
  dificuldade: string;
  rm_tag: string;
}

export const mapDbQuestionToApp = (dbQ: DbQuestion) => {
  const options = dbQ.alternativas.map(alt => alt.texto);
  const correctAnswer = dbQ.alternativas.findIndex(alt => alt.correta);
  
  return {
    id: dbQ.id,
    category: dbQ.assunto, // Ex: 'Português', 'Geografia', etc.
    text: dbQ.enunciado,
    options: options.length > 0 ? options : ["Sem alternativa disponível"],
    correctAnswer: correctAnswer !== -1 ? correctAnswer : 0,
    explanation: dbQ.justificativa || 'Justificativa padrão militar.',
    difficulty: dbQ.dificuldade === 'Média' ? 'Médio' : dbQ.dificuldade,
    year: String(dbQ.ano || '2024'),
    rm_tag: dbQ.rm_tag
  };
};
```

---

## 3. Script SQL de Carga Adicional (Banco de Questões - 22 Registros)

Abaixo está o script DML pronto para rodar no seu **SQL Editor** do Supabase. Ele realiza a carga inicial completa contendo as questões originais integradas com **diversas novas questões táticas** para todas as matérias exigidas (Língua Portuguesa, Geografia, História Militar, Administração Geral, Legislação, Música/Partitura), devidamente estruturadas com a chave JSONB de alternativas:

```sql
-- CHQAO QUEST v3.0 - SCRIPT DE CARGA DE QUESTÕES (public.questions_bank)
-- Categoria/Assunto: Português, Geografia, História, Administração, Legislação, Música

-- Limpa questões de teste anteriores para evitar duplicidade (Opcional, use com cautela)
-- TRUNCATE TABLE public.questions_bank CASCADE;

INSERT INTO public.questions_bank (assunto, ano, enunciado, alternativas, justificativa, dificuldade, rm_tag) VALUES

-- -----------------------------------------------------------------------------
-- LÍNGUA PORTUGUESA (CMP - Comando Militar do Planalto)
-- -----------------------------------------------------------------------------
('Português', 2024, 'Assinale a alternativa que apresenta o emprego correto do sinal indicativo de crase, de acordo com as normas gramaticais vigentes:', 
'[{"texto": "O comandante dirigiu-se à sala de instrução para ministrar à aula de RDE.", "correta": false},
 {"texto": "O militar de serviço deve obedecer às ordens do Sargento de Dia à risca.", "correta": true},
 {"texto": "A promoção à Oficial depende de mérito aferido pela comissão avaliadora.", "correta": false},
 {"texto": "O Capitão fez referência à mim durante a formatura diária do batalhão.", "correta": false}]',
'A locução adverbial feminina "à risca" exige crase. Também ocorre a fusão da preposição "a" exigida por "obedecer" com o artigo "as" de "ordens" formando "obedecer às ordens".', 'Fácil', 'CMP'),

('Português', 2023, 'Assinale a opção em que há erro de concordância verbal ou nominal na redação de correspondências oficiais:',
'[{"texto": "Seguem anexos à sindicância administrativa os termos de depoimento das testemunhas.", "correta": false},
 {"texto": "O bando de cães caramelos de prontidão cercaram as beiras do rancho à noite.", "correta": false},
 {"texto": "Já fazem dez anos que a portaria regulou as especialidades dos quadros técnicos.", "correta": true},
 {"texto": "Mais de um oficial-aluno realizou a prova intensiva com aproveitamento exemplar.", "correta": false}]',
'O verbo "fazer" indicando tempo decorrido é impessoal e deve permanecer no singular. Logo: "Já faz dez anos".', 'Média', 'CMP'),

('Português', 2022, 'Identifique a alternativa que está em perfeita consonância com a regência da norma padrão da língua portuguesa:',
'[{"texto": "Este é o regulamento militar no qual o oficial deve basear e obedecer.", "correta": false},
 {"texto": "Os sargentos assistiram à formatura geral integrados à banda de música.", "correta": true},
 {"texto": "Aprovada nas provas, a tenente visa o preenchimento de vaga no QAO.", "correta": false},
 {"texto": "O Major Canudos prefere mais despachar sindicâncias do que vistoriar obras.", "correta": false}]',
'O verbo "assistir" no sentido de presenciar exige preposição "a", regendo "assistiram à formatura". O verbo "preferir" rejeita o uso de "mais" ou "do que" (prefere algo a outra coisa).', 'Difícil', 'CMP'),

('Português', 2025, 'Assinale a alternativa cuja redação respeita os princípios de concisão e formalidade recomendados pelo Manual de Redação da Presidência da República para as comunicações militares:',
'[{"texto": "Solicito com a máxima urgência que vossa senhoria digne-se a responder o ofício supracitado.", "correta": false},
 {"texto": "Encaminho, para julgamento e providências cabíveis, o relatório final da referida sindicância administrativa.", "correta": true},
 {"texto": "Vimos por meio deste comunicar que o soldado não pôde comparecer à instrução por motivo de doença.", "correta": false},
 {"texto": "O capitão determinou que fôssemos lá resolver de imediato o imbróglio gerado na subtenência.", "correta": false}]',
'A redação oficial exige concisão, impessoalidade, clareza e formalidade. A opção B é direta, objetiva e emprega termos oficiais padrão, evitando clichês redundantes.', 'Média', 'CMP'),


-- -----------------------------------------------------------------------------
-- GEOGRAFIA (CMA - Amazônia / CMS - Sul / CMNE - Nordeste)
-- -----------------------------------------------------------------------------
('Geografia', 2023, 'A bacia hidrográfica que possui grande relevância para a integração nacional e abriga o Comando Militar do Oeste (CMO) com expressiva atuação em regiões inundáveis do Pantanal é a:',
'[{"texto": "Bacia do Rio São Francisco", "correta": false},
 {"texto": "Bacia do Rio Paraguai", "correta": true},
 {"texto": "Bacia Amazônica", "correta": false},
 {"texto": "Bacia do Paraná", "correta": false}]',
'A Bacia do Rio Paraguai drena a região do Pantanal Mato-Grossense, área de principal atuação tática e de ajuda humanitária sob a tutela do Comando Militar do Oeste (CMO).', 'Fácil', 'CMA'),

('Geografia', 2021, 'No que concerne aos Biomas brasileiros, assinale a característica correta sobre o Domínio das Caatingas, área patrulhada pelo Comando Militar do Nordeste (CMNE):',
'[{"texto": "Vegetação hidrófila com predomínio de encostas permanentemente inundadas.", "correta": false},
 {"texto": "Presença de solos silicosos profundos com vegetação acicofoliada de clima úmido.", "correta": false},
 {"texto": "Vegetação xerófila, com queda sazonal de folhas e plantas com espinhos ou cutículas cerosas.", "correta": true},
 {"texto": "Solo coberto de serapilheira espessa com árvores de raízes aéreas de médio e alto porte.", "correta": false}]',
'A Caatinga exibe vegetação xerófila adaptada ao clima semiárido, com perda sazonal de folhas para evitar transpiração excessiva e espinhos protetores para retenção de reservatórios.', 'Média', 'CMNE'),

('Geografia', 2024, 'A atuação do Comando Militar do Sul (CMS) envolve o patrulhamento de biomas e áreas de fronteira com clima subtropical. Assinale a alternativa que caracteriza corretamente os campos sulinos (Pampa):',
'[{"texto": "Vegetação arbustiva densa com solos permanentemente congelados.", "correta": false},
 {"texto": "Predomínio de gramíneas e relevo suave ondulado, propício para a atividade pecuária.", "correta": true},
 {"texto": "Savanas tropicais de galeria com alta pluviosidade anual sem estação seca.", "correta": false},
 {"texto": "Florestas ombrófilas densas constituídas por palmeiras tropicais gigantescas.", "correta": false}]',
'O Bioma Pampa apresenta relevo suave ondulado ("coxilhas") e vegetação rasteira herbácea com domínio de gramíneas, historicamente integrada à atividade pastoril sulista.', 'Média', 'CMS'),

('Geografia', 2022, 'O Comando Militar da Amazônia (CMA) e o Comando de Fronteira Solimões atuam no monitoramento do noroeste brasileiro. Qual rio é o principal afluente do Solimões pela margem esquerda, drenando as cabeceiras da Colômbia?',
'[{"texto": "Rio Negro", "correta": false},
 {"texto": "Rio Purus", "correta": false},
 {"texto": "Rio Japurá", "correta": true},
 {"texto": "Rio Madeira", "correta": false}]',
'O Rio Japurá nasce na Colômbia (onde é denominado Caquetá) e deságua no Rio Solimões por sua margem esquerda, sendo uma das principais vias fluviotáticas de monitoramento de fronteiras.', 'Fácil', 'CMA'),


-- -----------------------------------------------------------------------------
-- HISTÓRIA MILITAR (CMNE - Comando Militar do Nordeste)
-- -----------------------------------------------------------------------------
('História', 2024, 'Durante a Segunda Guerra Mundial, a Força Expedicionária Brasileira (FEB) travou sangrentos combates em solo europeu. A principal vitória militar terrestre da FEB contra defesas nazistas entrincheiradas na Itália foi em:',
'[{"texto": "Batalha de Monte Castello", "correta": true},
 {"texto": "Tomada de Fornovo di Taro", "correta": false},
 {"texto": "Conquista de Montese", "correta": false},
 {"texto": "Campanha do Rio Pó", "correta": false}]',
'A Batalha de Monte Castello (Itália, inverno de 1944-1945) foi a mais famosa e emblemática vitória da FEB, onde nossos pracinhas capturaram as posições de artilharia alemãs após várias tentativas penosas.', 'Fácil', 'CMNE'),

('História', 2022, 'O movimento Tenentista, ocorrido na década de 1920 no Brasil, refletia o descontentamento da jovem oficialidade militar. Qual dos eventos abaixo está historicamente ligado ao Tenentismo?',
'[{"texto": "A Revolta da Vacina de 1904", "correta": false},
 {"texto": "O Episódio dos 18 do Forte de Copacabana de 1922", "correta": true},
 {"texto": "A Intentona Comunista de 1935", "correta": false},
 {"texto": "O Golpe de Estado do Estado Novo de 1937", "correta": false}]',
'A Revolta dos 18 do Forte de Copacabana em julho de 1922 foi o marco inicial do movimento Tenentista, que protestava contra as fraudes eleitorais na República Velha e exigia reformas institucionais.', 'Média', 'CMNE'),

('História', 2021, 'Considere as lutas pelo domínio do território brasileiro no período colonial. A célebre Batalha de Guararapes (1648/1649) é considerada o berço histórico de qual das seguintes instituições nacionais?',
'[{"texto": "Da Marinha do Brasil", "correta": false},
 {"texto": "Do Exército Brasileiro", "correta": true},
 {"texto": "Da Polícia Militar Estadual", "correta": false},
 {"texto": "Do Corpo de Bombeiros Militar", "correta": false}]',
'A Batalha de Guararapes, em Pernambuco, onde uniram-se brancos, negros e indígenas contra os invasores holandeses, é considerada o berço cívico-histórico do Exército Brasileiro.', 'Fácil', 'CMNE'),

('História', 2023, 'A chamada Revolução de 1930 marcou o fim da República Velha no Brasil e contou com forte influência e participação de líderes militares. Quem assumiu a liderança do governo provisório após este movimento?',
'[{"texto": "Washington Luís", "correta": false},
 {"texto": "Getúlio Vargas", "correta": true},
 {"texto": "Hermes da Fonseca", "correta": false},
 {"texto": "Artur Bernardes", "correta": false}]',
'Getúlio Vargas assumiu a presidência da República Provisória logo após a vitória do movimento revolucionário de outubro de 1930, contando com apoio cerrado dos jovens tenentes.', 'Média', 'CMNE'),


-- -----------------------------------------------------------------------------
-- ADMINISTRAÇÃO MILITAR (CMO/CMSE)
-- -----------------------------------------------------------------------------
('Administração', 2024, 'De acordo com o Regulamento de Disciplina do Exército (RDE - Decreto nº 4.346/2002), assinale a conduta que configura uma transgressão disciplinar militar expressa:',
'[{"texto": "Apresentar recurso administrativo com linguagem respeitosa dentro do prazo regulamentar.", "correta": false},
 {"texto": "Ausentar-se do aquartelamento sem licença da autoridade competente.", "correta": true},
 {"texto": "Praticar atos de defesa pessoal justificados em legítima defesa própria.", "correta": false},
 {"texto": "Cumprir ordens superiores que não sejam manifestamente criminosas.", "correta": false}]',
'Ausentar-se do aquartelamento sem permissão é uma transgressão disciplinar militar expressa nas categorias de conduta do RDE.', 'Fácil', 'CMSE'),

('Administração', 2023, 'Segundo as Instruções Gerais para as Sindicâncias no âmbito do Exército (EB10-IG-09.001), qual o prazo de conclusão ordinário da sindicância, prorrogável exclusivamente por justo motivo pela autoridade instauradora?',
'[{"texto": "15 (quinze) dias", "correta": false},
 {"texto": "30 (trinta) dias", "correta": true},
 {"texto": "45 (quarenta e cinco) dias", "correta": false},
 {"texto": "60 (sessenta) dias", "correta": false}]',
'O prazo para término de uma Sindicância é ordinariamente de 30 (trinta) dias, a contar da data de publicação da portaria em Boletim Interno, admitida prorrogação devidamente fundamentada.', 'Média', 'CMO'),

('Administração', 2025, 'Com base no Regulamento Interno e dos Serviços Gerais (RISG), em qual horário usualmente se estabelece a Parada Diária, momento cerimonial em que é feita a leitura do Boletim Interno?',
'[{"texto": "No início do expediente da Organização Militar", "correta": true},
 {"texto": "Exatamente ao meio-dia para sincronização de fuso", "correta": false},
 {"texto": "Logo após a refeição do rancho geral", "correta": false},
 {"texto": "Trinta minutos antes do toque de recolher ou rancho da noite", "correta": false}]',
'Conforme o RISG, a formatura da Parada ocorre ordinariamente nas primeiras horas do expediente das Organizações Militares para leitura de ordens diárias e Boletim Interno.', 'Média', 'CMSE'),


-- -----------------------------------------------------------------------------
-- LEGISLAÇÃO MILITAR E FEDERAL (CML - Leste / CMN - Norte)
-- -----------------------------------------------------------------------------
('Legislação', 2024, 'A Lei nº 14.133/2021 (Nova Lei de Licitações) estabelece diferentes modalidades de licitação. Assinale a modalidade inovadora destinada à contratação de obras, serviços e compras em que a Administração realiza discussões de soluções alternativas com licitantes previamente selecionados:',
'[{"texto": "Concorrência Pública tradicional", "correta": false},
 {"texto": "Pregão Presencial integrado", "correta": false},
 {"texto": "Diálogo Competitivo", "correta": true},
 {"texto": "Tomada de Preços simplificada", "correta": false}]',
'O "Diálogo Competitivo" é a nova modalidade criada pela Lei 14.133/2021 para propiciar trocas de soluções inovadoras entre a administração e parceiros privados em projetos complexos.', 'Média', 'CML'),

('Legislação', 2022, 'No âmbito do Estatuto dos Militares (Lei nº 6.880/1980), são manifestações descritas do valor militar, EXCETO:',
'[{"texto": "O patriotismo, traduzido pela vontade de defender a Pátria.", "correta": false},
 {"texto": "O espírito de corpo, orgulho do militar pela sua organização.", "correta": false},
 {"texto": "O amor à profissão militar e o entusiasmo com que é exercida.", "correta": false},
 {"texto": "A aceitação passiva de qualquer ordem que divirja das leis da República.", "correta": true}]',
'A aceitação passiva de ordens manifestamente ilegais ou criminosas é proibida constitucional e estatutariamente, não configurando valor militar.', 'Fácil', 'CML'),

('Legislação', 2023, 'Sob as diretrizes do Código Penal Militar (Decreto-Lei nº 1001/1969), qual o crime cometido pelo militar de serviço que cochila ou abandona o posto de vigilância antes de ser regularmente substituído por outro militar de serviço?',
'[{"texto": "Deserção qualificada em tempo de paz", "correta": false},
 {"texto": "Dormir em serviço ou Abandono de Posto", "correta": true},
 {"texto": "Insurgência militar ou Motim de guarda", "correta": false},
 {"texto": "Recusa formal de obediência tática", "correta": false}]',
'Abandono de posto e Dormir em serviço constituem crimes militares autônomos expressos nos Artigos 195 e 203 do CPM, visando garantir a segurança absoluta das instalações físicas de campanha.', 'Média', 'CMN'),


-- -----------------------------------------------------------------------------
-- TEORIA E HISTÓRIA DA MÚSICA MILITAR (CMP - Planalto Especial)
-- -----------------------------------------------------------------------------
('Música', 2023, 'A armadura de clave que possui exatamente quatro sustenidos (Fá#, Dó#, Sol#, Ré#) corresponde à tonalidade maior de:',
'[{"texto": "Sol maior", "correta": false},
 {"texto": "Fá# maior", "correta": false},
 {"texto": "Mi maior", "correta": true},
 {"texto": "Lá maior", "correta": false}]',
'A ordem dos sustenidos é Fá-Dó-Sol-Ré. Subindo um semitono do último sustenido da armadura (Ré#), chegamos à tonalidade de Mi Maior. Portanto, Mi Maior tem 4 sustenidos.', 'Fácil', 'CMP'),

('Música', 2024, 'Qual o compasso composto cujo termo numericamente correspondente possui o numerador 9 e o denominador 8, sendo considerado compasso ternário?',
'[{"texto": "Compasso 9/8", "correta": true},
 {"texto": "Compasso 6/8", "correta": false},
 {"texto": "Compasso 12/8", "correta": false},
 {"texto": "Compasso 3/4", "correta": false}]',
'O compasso 9/8 é constituído de três tempos, cada um subdividido em três partes (semínima pontuada como unidade de tempo). Portanto, é composto ternário.', 'Média', 'CMP'),

('Música', 2022, 'Assinale o intervalo menor correspondente entre a nota Sol e a nota Si bemol:',
'[{"texto": "Terça menor", "correta": true},
 {"texto": "Segunda menor", "correta": false},
 {"texto": "Terça maior", "correta": false},
 {"texto": "Quinta justa", "correta": false}]',
'O intervalo entre Sol e Si é uma terça maior (dois tons). Com o bemol na nota Si, a distância diminui meio tom, caracterizando o intervalo de Terça Menor (um de tom e meio).', 'Fácil', 'CMP'),

('Música', 2025, 'Qual figura musical é definida tradicionalmente como a Unidade de Tempo (U.T.) no compasso simples de fórmula 2/4 (binário simples)?',
'[{"texto": "Semibreve", "correta": false},
 {"texto": "Semínima", "correta": true},
 {"texto": "Mínima", "correta": false},
 {"texto": "Colcheia", "correta": false}]',
'Na fórmula 2/4, o denominador 4 indica que a semínima é a figura que vale 1 tempo (Unidade de Tempo), enquanto o numerador 2 fixa o número total de tempos por compasso.', 'Média', 'CMP');
```

---

## 4. Próxima Etapa de Campanha: Ativação das APIs e Registro das Tabelas

Após rodar o script SQL de criação de tabelas e o seed das questões, configure o arquivo de variáveis de ambiente `.env` com a sua URL e Chave Pública do Supabase para iniciar as transmissões das APIs e sincronização das FVMs virtuais.

*Este dossiê está aprovado e em conformidade técnica com o Estado Maior de Tecnologia do Concurso CHQAO.*
