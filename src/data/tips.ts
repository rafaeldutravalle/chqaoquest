export interface DailyTip {
  id: string;
  category: 'Gramática' | 'Militar' | 'História' | 'Doutrina';
  title: string;
  source: string; // Ex: RISG, CPM, RDE, Manual de Redação
  content: string;
  bizu: string; // A highly actionable study rule
}

export const DAILY_TIPS: DailyTip[] = [
  {
    id: 'tip_1',
    category: 'Gramática',
    title: 'Crases Proibidas Antes de Pronomes Pessoais',
    source: 'NGB (Nomenclatura Gramatical Brasileira)',
    content: 'Nunca se utiliza crase antes de pronomes pessoais do caso reto (eu, tu, ele...) ou oblíquos (mim, ti, si), bem como pronomes de tratamento de cunho geral (Vossa Senhoria, Vossa Excelência).',
    bizu: 'Bizu: Se a palavra seguinte for "mim" ou "ela", a crase é ERRO GRAVE na redação militar!'
  },
  {
    id: 'tip_2',
    category: 'Militar',
    title: 'Uso Prático da Prisão Disciplinar',
    source: 'Regulamento Disciplinar do Exército (RDE) - Art. 24',
    content: 'A prisão disciplinar consiste na obrigação de o militar permanecer em local próprio e designado pelo comandante, sem prejuízo de suas obrigações de instrução e serviços ordinários.',
    bizu: 'Bizu: Lembre-se, a prisão disciplinar não suspende o serviço de escala ordinário do transgressor.'
  },
  {
    id: 'tip_3',
    category: 'Gramática',
    title: 'Concordância Verbal do Verbo "Fazer"',
    source: 'Manual de Redação da Presidência da República',
    content: 'O verbo "fazer", quando empregado para indicar tempo transcorrido ou fenômeno climático, é impessoal. Portanto, conjuga-se estritamente na 3ª pessoa do singular.',
    bizu: 'Bizu: Nunca diga ou escreva "Fazem dez anos da portaria". O correto é "Faz dez anos". Caso clássico de pegadinha do CHQAO!'
  },
  {
    id: 'tip_4',
    category: 'Militar',
    title: 'Hierarquia e Antiguidade com Empate de Turma',
    source: 'Estatuto dos Militares (Lei 6.880/80) - Art. 17',
    content: 'A antiguidade em cada posto ou graduação é regulada pela data da promoção ou nomeação. Em caso de empate de datas na mesma turma de formação, a precedência é ditada pela classificação de término do curso.',
    bizu: 'Bizu: A média de curso de formação do militar define sua precedência perante pares promovidos na mesma data!'
  },
  {
    id: 'tip_5',
    category: 'História',
    title: 'A Batalha das Tabocas na Insurreição Pernambucana',
    source: 'História Militar do Brasil (Batalha de 1645)',
    content: 'Em 3 de agosto de 1645, no Monte das Tabocas, as forças luso-brasileiras lideradas por João Fernandes Vieira derrotaram uma divisão holandesa numericamente superior, utilizando o fator surpresa tática do terreno de bambuzais.',
    bizu: 'Bizu: Considerada um dos marcos geradores do sentimento de pátria e do Exército Brasileiro.'
  },
  {
    id: 'tip_6',
    category: 'Gramática',
    title: 'Regência Crítica do Verbo "Assistir"',
    source: 'Norma Culta da Língua Portuguesa',
    content: 'O verbo "assistir", no sentido de presenciar ou testemunhar (ex: assistir a formatura), exige obrigatoriamente a preposição "a". No sentido de prestar socorro (ex: assistir o doente), o uso de preposição é facultativo.',
    bizu: 'Bizu: "Assistir à instrução" tem crase obrigatória, pois instrução é substantivo feminino regido pela preposição "a"!'
  },
  {
    id: 'tip_7',
    category: 'Militar',
    title: 'Procedimento Contra Sentinela Sonolenta',
    source: 'Regulamento de Interno e de Serviços Gerais (RISG)',
    content: 'Dormir em serviço de sentinela constitui crime militar previsto no Código Penal Militar (Art. 203) e transgressão disciplinar grave sob a égide do RDE.',
    bizu: 'Bizu: O sargento de serviço deve recolher o militar imediatamente e lavrar o termo de flagrante.'
  },
  {
    id: 'tip_8',
    category: 'Doutrina',
    title: 'Funções Administrativas do Fiscal de Contrato',
    source: 'Lei nº 14.133/21 (Nova Lei de Licitações)',
    content: 'O fiscal administrativa acompanha a execução de obras e serviços licitados, devendo registrar todas as ocorrências e encaminhar relatórios de glosa de faturas em caso de descumprimento contratual.',
    bizu: 'Bizu: Erros de fiscalização de contrato acarretam responsabilidade civil e administrativa perante a AGU e o TCU.'
  }
];
