# Relatório de Arquitetura e Mapeamento de Arquivos
## Preparatório CHQAO – *Jornada do Mérito Militar* v2.0

Este relatório detalha a organização estrutural do código-fonte do aplicativo preparatório para o Concurso de Habilitação ao Quadro de Acesso a Oficiais (CHQAO). O sistema foi concebido como um ambiente de simulação de carreira militar gamificado, estruturado de forma modular em **React 18+**, **Vite** e **Tailwind CSS**.

---

## 1. Visão Geral da Árvore de Diretórios

O projeto está estruturado em uma arquitetura de camada única para o cliente Single-Page Application (SPA) suportada por um servidor Express integrado para produção. A organização dos arquivos no diretório `./src` é a seguinte:

```text
src/
├── App.tsx                 # Kernel do App (Mesa de Operações e Roteamento de Telas)
├── index.css               # Folha de Estilos Global (Variáveis de Tema e Tailwind CSS)
├── main.tsx                # Ponto de Entrada da Aplicação React
├── types.ts                # Declaração Global de Tipos, Enums e Contratos de Dados
├── components/             # Componentes de Interface e Módulos de Jogo
│   ├── BrazilMap.tsx       # Mapa Estratégico Interativo de Operações
│   ├── CarameloMascot.tsx  # Mascote Operacional (Cão Caramelo de Boina)
│   ├── CommandStore.tsx    # Cantina de Campanha (Loja de Itens por Munição)
│   ├── CustomSoldierSVG.tsx# Motor Vetorial de Customização do Avatar do Usuário
│   ├── DicaDoDia.tsx       # Painel de Diretriz Gramatical e Regulamentar Diária
│   ├── FVMExpandable.tsx   # Ficha de Valorização de Mérito (FVM) Digital Ativa
│   ├── HUD.tsx             # Barra de Informações de Prontidão (Painel de Status)
│   ├── InstructionCenter.tsx# Centro de Instrução (Revisão, Dilemas e Vocabulário)
│   ├── OnboardingFlow.tsx  # Alistamento, Apresentação da Simbologia e Login
│   ├── PromoCeremonial.tsx # Solenidade de Promoção de Patentes com Certificado
│   ├── QuizPanel.tsx       # Simulador de Prova com Análise de Erros e IA Tática
│   ├── Rankings.tsx        # Divisões de Prontidão Semanais (Ligas até Divisão Caxias)
│   └── ServiceRecordTimeline.tsx # Registro Histórico de Alterações de Serviço
└── data/                   # Banco de Dados Local Estático e Parâmetros Estáticos
    ├── dilemas.ts          # Banco de Casos Práticos de Comando (RDE/RISG)
    ├── museum.ts           # Acervo e Cards do Museu Militar ("Baú do Antigão")
    ├── podcasts.ts         # Simulador de Sons de Marcha e Ordens de Comando
    ├── questions.ts        # Banco de Questões Oficiais CHQAO (2021-2025)
    ├── specialties.ts      # Definição das Especialidades/Armas do Exército Brasileiro
    └── tips.ts             # Base de Dados de "Bizu do Dia" e Dicas Gramaticais
```

---

## 2. Detalhamento de Configuração por Página e Componente

### 🖥️ Shell Principal e Roteador Central
#### `src/App.tsx`
* **Função:** Controla o estado centralizador da aplicação, gerenciando o progresso do usuário (`ScoreStats`), as credenciais do militar (`CustomSoldier`), as missões diárias, punições disciplinares e o controle de trilhas sonoras.
* **Principais Configurações:**
  * **Tema Noturno Operacional Auto-Ativo:** Monitora o relógio do sistema para aplicar uma máscara de alto contraste em tons ultra-escuros com redução de intensidade (`brightness-[0.93]`) entre as 19:00h e as 06:00h, reduzindo a fadiga ocular em estudos noturnos. Inclui botão manual de alternância rápida na barra de ferramentas.
  * **Persistência Local:** Sincroniza em tempo real as alterações da FVM e do inventário no `localStorage` do navegador sob o rótulo `chqao_soldier`.
  * **Roteamento de Ciclo de Vida:** Redireciona usuários não registrados diretamente para a tela de Alistamento Militar Inicial (`OnboardingFlow`).

---

### 🛡️ Módulo de Apresentação e Alistamento (Pré-Login)
#### `src/components/OnboardingFlow.tsx`
* **Função:** Fornece as páginas de acolhimento e apresentação de objetivos antes do ingresso oficial no simulador, dividida em um roteiro de 8 etapas.
* **Principais Configurações:**
  * **Passo 1 (Página de boas-vindas):** Exibe a logotipo do app (`app-icon.jpg`) e um texto rápido de boas-vindas ao jogo.
  * **Passos 2 e 3 (Metas e Metodologia):** Detalham as mecânicas centrais de gamificação: o Mapa de Operações do EB e a FVM Digital Ativa (Passo 2), a Prontidão Operacional e o Rancho de Recuperação (Passo 3).
  * **Passo 4 (Autenticação Google):** Tela de login simulado seguro para salvar e sincronizar a FVM.
  * **Passos 5 a 8 (Alistamento & Briefing):** Escolha da especialidade militar (Infantaria, Cavalaria, Saúde, Música, etc), tipo de avatar soldado (retratos fardados estáticos nos assets, incluindo indígena) e nome de guerra, além do discurso marcial de boas-vindas e FVM do Capitão Cisplatina.

---

### 📖 Componente "Dica do Dia" (Bizu Gramatical e Militar)
#### `src/components/DicaDoDia.tsx`
* **Função:** Exibe, na tela de boas-vindas do quartel general, um card estratégico de estudo rápido contendo regras fundamentais do CHQAO para incentivar o estudo espontâneo constante.
* **Configuração e Dados (`src/data/tips.ts`):**
  * Consome uma base de dados tipada (`DailyTip[]`) contendo normas críticas de **Gramática** (ex.: regência do verbo assistir, proibição de crase antes de pronomes), **Regulamentos Militares** (RDE, RISG, Estatuto dos Militares) e **História Militar** (Batalha das Tabocas).
  * Oferece um botão interativo de repetição aleatória de diretrizes ("Outro Bizu") com animação de rotação via `motion` e efeitos sonoros dedicados.

---

### 📊 Painel de Provas e Resumo Pós-Quiz de Erros
#### `src/components/QuizPanel.tsx`
* **Função:** Engine de processamento de testes de múltipla escolha oficiais do concurso do CHQAO.
* **Inovações de Análise e Prática de Estudos:**
  * **Relatório de Rendimento de Campanha:** Ao concluir a missão, o painel entra em modo de debriefing pós-quiz. Em vez de apenas apresentar a nota de acertos, compila de forma detalhada em quais **Subtópicos Específicos** o candidato mais falhou (ex.: *Emprego do Sinal de Crase*, *Lei de Licitações e Contratos*, *Bacias Hidrográficas*, *Estatuto dos Militares*).
  * **Plano de Estudo Sugerido:** Apresenta conselhos personalizados e direcionamento temático para que o militar sane suas lacunas no Centro de Instrução antes de enfrentar exames de promoção.
  * **Matriz de Respostas:** Desenha uma matriz visual colorida numerada de 1 a N, permitindo rastrear instantaneamente onde os erros de linha ocorreram.

---

### 🎨 Motor Vetorial de Avatares Dinâmicos
#### `src/components/CustomSoldierSVG.tsx`
* **Função:** Desenha sob demanda o avatar fardado do militar em formato puramente vetorial SVG (independente de imagens externas e com escalabilidade perfeita).
* **Mapeamento de Configuração:**
  * Altera as insígnias do ombro e da gola com base no posto atual do militar (divididos em listras de Cabo, sapatas de Sargentos com divisas douradas, estrelas prateadas de Tenente, e o oficialato de Capitão).
  * Modifica os adereços do uniforme e a cor de destaque conforme a especialidade (ex.: verde-claro para Infantaria, vermelho-fogo para Artilharia, azul-celeste para Aviação, lira dourada para Músicos).
  * Adapta o tom de pele e feição de acordo com as seleções configuradas na FVM.

---

### 🧭 Painel de Controle de Status e Prontidão (HUD)
#### `src/components/HUD.tsx`
* **Função:** Componente de topo fixo que fornece telemetria em tempo real das condições de saúde funcional do candidato.
* **Métricas Apresentadas:**
  * **FVM (Pontos de Mérito):** Representação do histórico militar acumulado.
  * **Prontidão Operacional %:** Barra de vidas do app. Erros no simulador consomem 20% da prontidão. Ao atingir 0%, o usuário é transferido ao "Rancho" para realizar treinamento obrigatório de recuperação.
  * **Munição:** Saldo de moedas virtuais para gastos na cantina de campanha.

---

### 🗺️ Mapa de Operações Estratégicas
#### `src/components/BrazilMap.tsx`
* **Função:** Mapa do Brasil em projeção militar estratégica subdividido por Regiões Militares.
* **Configuração:** O progresso do usuário libera conquistas geográficas. Para realizar o teste de Geografia, o avatar viaja pelo CMA (Comando Militar da Amazônia); para História, viaja pelo CMSE (Comando Militar do Sudeste), fornecendo contexto geopolítico ao aprendizado.

---

### 📚 Centro de Instrução e Treinamentos
#### `src/components/InstructionCenter.tsx`
* **Função:** Contém os módulos auxiliares para ganho extra de mérito e reabilitação de prontidão.
* **Componentes Anexados:**
  * **Rancho de Recuperação:** Lições rápidas de fixação de erros obrigatórias para militares fatigados que zeraram sua barra de prontidão.
  * **Dilemas do Comandante (`src/data/dilemas.ts`):** Jogos de simulação de tomada de decisão baseados em sindicâncias reais, RDE e RAE, onde cada escolha altera a reputação militar.
  * **Dicionário Técnico & Auditório:** Treinamento de audição de ordens de marcha e terminologia jurídica militar.

---

### 🎖️ Solenidades e Certificação de Patentes
#### `src/components/PromoCeremonial.tsx`
* **Função:** Palco virtual para promoção de postos militares ao concluir as provas de fase do CHQAO (Cabo, 3º Sgt, 2º Sgt, 1º Sgt, Subtenente, Tenente e Capitão QAO).
* **Configuração:** Emite um Certificado Digital de Promoção oficial assinado pelo Comando do Batalhão, listando a especialidade técnica do militar, o seu Nome de Guerra e a média final de mérito, pronto para compartilhamento social.

---

## 3. Estruturas de Dados Tipadas (`src/types.ts`)

A integridade do simulador de carreira é protegida por contratos estritos em TypeScript. Seguem os tipos centrais:

```typescript
export interface CustomSoldier {
  guerraName: string;         // Nome de Guerra do militar
  specialtyId: string;        // ID da Arma do EB (ex.: 'infantaria')
  skinTone: string;           // Tom de pele escolhido
  faceType: string;           // Estilo do rosto (ex.: 'Determinado')
  biotipo: string;            // Biotipo (ex.: 'Atlético')
}

export interface ScoreStats {
  xp: number;                 // Experiência secundária para rankings
  pm: number;                 // PONTOS DE MÉRITO (FVM) - Métrica central
  prontidao: number;          // Prontidão funcional (0 a 100%)
  municao: number;            // Saldo de moeda virtual
  fase: number;               // Índice da fase atual (0 a 8)
  streak: number;             // Ofensiva de dias consecutivos ("Missão Cumprida")
}
```

---

Este ecossistema de arquivos confere ao aplicativo preparatório do **CHQAO** uma base robusta, modular e imersiva, unindo diversão, fidelidade cultural e alta performance acadêmica.
