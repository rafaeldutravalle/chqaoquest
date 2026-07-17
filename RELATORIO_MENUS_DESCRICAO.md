# Relatório de Menus, Mecânicas e Funcionalidades
## Preparatório CHQAO – *Jornada do Mérito Militar* v2.0

Este relatório apresenta a documentação exaustiva e o funcionamento detalhado dos 5 menus principais do simulador CHQAO, descrevendo a interface com o usuário, os subcomponentes, a lógica das engrenagens de gamificação e a integração de dados do aplicativo.

---

## 🧭 Visão Geral do Sistema de Navegação (Sticky Bottom Bar)

A transição entre as áreas operacionais do aplicativo é efetuada por uma barra de navegação persistente e flutuante ancorada no rodapé da aplicação (com exceção das telas de provas ativas, para maximizar o foco do candidato). Cada item possui rótulos explícitos e pequenos subtítulos de apoio visual (micro-copys), acompanhados por feedback sonoro tátil instantâneo ao toque (efeito `click` via `audioEngine`).

| Menu | Nome Exibido | Subtítulo / Apoio | Rota no State (`activeTab`) | Componente React |
| :--- | :--- | :--- | :--- | :--- |
| **QUARTEL** | `Quartel` | `Mapa` | `'cofront'` | `BrazilMap.tsx` |
| **INSTRUÇÃO** | `Instrução` | `Dilemas` | `'instrucao'` | `InstructionCenter.tsx` |
| **DOSSIÊ** | `Dossiê` | `Milestones` | `'record'` | `ServiceRecordTimeline.tsx` |
| **RANKING** | `Ranking` | `FVM Geral` | `'rankings'` | `Rankings.tsx` |
| **LOJA** | `Loja` | `Suprimentos` | `'loja'` | `CommandStore.tsx` |

---

## 1. MENU: QUARTEL (Mesa de Operações Estratégicas)
O **Quartel** é a central de comando estratégico do aplicativo, concebido visualmente como uma Mesa de Operações Militares integrada ao **Mapa Estratégico do Brasil**.

### Como Funciona:
* **Mapa Vetorial Estratégico:** Apresenta uma estilização estilosa do território nacional dividido e colorido de acordo com as fronteiras de **Comandos Militares de Área** reais do Exército Brasileiro.
* **Mapeamento de Matérias (Áreas de Estudo):**
  Cada Comando de Área é guardião e ponto de lançamento de missões de uma matéria oficial do concurso CHQAO:
  1. **Comando Militar da Amazônia (CMA – 12ª RM):** Geografia.
  2. **Comando Militar do Norte (CMN – 8ª RM):** Legislação.
  3. **Comando Militar do Nordeste (CMNE – 6ª, 7ª e 10ª RMs):** História.
  4. **Comando Militar do Planalto (CMP – 11ª RM):** Português.
  5. **Comando Militar do Oeste (CMO – 9ª RM):** Administração.
  6. **Comando Militar do Leste (CML – 1ª e 4ª RMs):** Legislação.
  7. **Comando Militar do Sudeste (CMSE – 2ª RM):** Administração.
  8. **Comando Militar do Sul (CMS – 3ª e 5ª RMs):** Geografia.
* **Validação de Prontidão Operacional:** 
  Antes de iniciar qualquer simulado, o sistema valida se a Prontidão do candidato está acima de $0\%$. Caso o militar esteja exausto ($0\%$), o aplicativo bloqueia o início do teste, emite um aviso visual e o redireciona automaticamente para o **Rancho de Recuperação** para carregar energias.
* **Campanhas de Prova:**
  Ao clicar em uma região liberada para seu posto (patente), o usuário é levado ao simulador de provas (`QuizPanel`), onde deve enfrentar 5 questões selecionadas de forma dinâmica. O sucesso concede Pontos de Mérito (PM) na FVM, pontos de experiência (XP) e Munição para compras.

---

## 2. MENU: INSTRUÇÃO (Centro de Instrução e Treinamentos)
O **Centro de Instrução** é o ambiente multidisciplinar do app voltado a reabilitações táticas, tomada de decisões complexas de comando e imersão cultural na caserna. Ele é subdividido em 5 subabas internas:

### Subabas do Centro de Instrução:
1. **Dilemas do Comandante (`dilemas`):**
   * *Mecânica:* Apresenta dilemas baseados em fatos do cotidiano das Organizações Militares. Cada dilema exibe um contexto, permitindo que o candidato selecione entre duas decisões estruturadas.
   * *Consequências:* Decisões pautadas no Regulamento Disciplinar do Exército (RDE) e no RISG recompensam o militar com acréscimos na FVM. Decisões imprudentes acarretam redução severa de PM e anotações punitivas no prontuário.
2. **Dilemas Éticos de Comando (`etica`):**
   * *Mecânica:* Focado especificamente em integridade, combate a superfaturamentos, prevaricação ou punições coletivas inconstitucionais.
   * *Recompensa:* Estimula o raciocínio crítico necessário para as avaliações de liderança.
3. **Museu Militar - "Baú do Antigão" (`museu`):**
   * *Mecânica:* Um museu virtual onde relíquias da história militar brasileira (medalhas antigas, fardas históricas, insígnias, sabres e documentos) são desbloqueadas.
   * *Propósito:* Funciona como um colecionável de prestígio acadêmico.
4. **Rádio Verde-Oliva (`radio`):**
   * *Mecânica:* Player de áudio procedural que reproduz hinos clássicos, toques de corneta para ordens de marcha e episódios de podcasts estratégicos gravados para massificar conteúdos jurídicos de forma passiva.
5. **Rancho de Recuperação (`rancho`):**
   * *Mecânica:* Destinado aos militares fatigados (com baixa Prontidão). Permite restabelecer a Prontidão Operacional através de duas mecânicas:
     * **Missão de Reabilitação Rápida:** Resolver pequenas questões curtas de fixação. Cada acerto recupera a energia do militar.
     * **Vídeo de Instrução de Campanha:** Assistir a uma simulação de vídeo instrutivo tático para ganhar energia imediata.

---

## 3. MENU: DOSSIÊ (Registro de Serviço & Evolução da FVM)
O **Dossiê** é a ficha consolidada de serviço do militar, onde são expostos os progressos de carreira, pontuações acadêmicas e o prontuário disciplinar.

### Componentes Internos e Como Funciona:
* **Gráfico de Rendimento de Mérito (Recharts):**
  * Desenha um gráfico de linhas dinâmico que plota a evolução dos Pontos de Mérito (PM) do candidato ao longo das semanas de estudo.
  * Compara graficamente a pontuação atual do militar com a **Linha de Corte** recomendada para aprovação, fornecendo clareza sobre o nível de prontidão em relação à concorrência real.
* **Linha do Tempo de Carreira (Service Timeline & Patentes):**
  * Mostra as 9 patentes militares representadas na jornada do CHQAO, destacando o progresso atual com base nos requisitos de Pontos de Mérito acumulados:
    1. **Recruta** ($0\text{ PM}$) – Alistamento e ingresso básico.
    2. **Cabo** ($100\text{ PM}$) – Domínio topográfico inicial.
    3. **3º Sargento** ($250\text{ PM}$) – Adjunto militar e Medalha Marechal Osório.
    4. **2º Sargento** ($400\text{ PM}$) – Auxiliar de administração e Medalha de Bronze.
    5. **1º Sargento** ($600\text{ PM}$) – Cogerente e Medalha Corpo de Tropa.
    6. **Subtenente** ($800\text{ PM}$) – Fiscal de contratos e Medalha Marechal Trompowsky.
    7. **2º Tenente** ($1000\text{ PM}$) – Ingresso ao oficialato militar e Medalha Max Wolf.
    8. **1º Tenente** ($1200\text{ PM}$) – Promoção acadêmica por bravura intelectual.
    9. **Capitão QAO** ($1500\text{ PM}$) – O topo da carreira militar virtual e entrega de Espada de Ouro.
* **Quadro de Medalhas e Condecorações:** Exibe condecorações desbloqueadas conforme metas específicas cumpridas na FVM.
* **Histórico de Alterações (Warning Logs):** Anotações oficiais automáticas relatando punições, serviços extraordinários prestados e elogios recebidos.

---

## 4. MENU: RANKING (Divisões de Prontidão)
O menu de **Ranking** estimula a competitividade saudável e a camaradagem, simulando as listagens unificadas de mérito do Exército Brasileiro.

### Como Funciona:
* **Filtros de Visualização Dinâmicos:**
  * **Turma de Acesso Geral:** Lista o posicionamento global de todos os candidatos do simulador baseados na somatória de seus Pontos de Mérito (PM).
  * **Minha Arma/Especialidade:** Filtra a listagem de competidores para exibir apenas os militares que pertencem à mesma especialidade técnica do usuário (ex.: Infantaria, Cavalaria, Saúde, Engenharia, Música), espelhando o formato de concorrência por vagas do certame original do CHQAO.
* **Feedback Motivacional de Posição:**
  * Exibe um destaque de topo mostrando a classificação atual do usuário (ex.: *#4 de 10 Combatentes*) e a distância exata em pontos para alcançar a meta de Capitão QAO ($1500\text{ PM}$).
* **Atualização de Rede (Realimentar):**
  * Botão de recarga integrado que aciona o efeito sonoro de sintonia metálica e reclassifica os competidores simulados de forma responsiva.

---

## 5. MENU: LOJA (Intendência de Campanha)
A **Loja** (ou Intendência) é a cantina de suprimentos operacionais do aplicativo, onde as Munições acumuladas como recompensa de estudo são transacionadas por itens cruciais para a sobrevivência do dossiê.

### Suprimentos Disponíveis para Aquisição:
1. **Carregação de Bizu Tático (Custo: ₢150):**
   * *Efeito:* Adiciona $1$ Bizu ao inventário do militar. Permite excluir uma alternativa nitidamente incorreta em questões de simulados difíceis no Quartel.
2. **Congelador de Ofensiva (Custo: ₢200):**
   * *Efeito:* Protege e congela a ofensiva diária de dias consecutivos estudados (`streak`) contra quebras acidentais em dias em que o militar não conseguir efetuar login.
3. **Kit de Prontidão Imediata (Custo: ₢300):**
   * *Efeito:* Recarrega instantaneamente a barra de Prontidão Operacional do militar de volta para $100\%$, removendo o estado de fadiga sem precisar passar pelo Rancho.
4. **Créditos de IA Tática (Custo: ₢400):**
   * *Efeito:* Fornece 5 consultas adicionais para a engine de IA Tática do simulador, que disseca e analisa os motivos detalhados de erros cometidos em simulados acadêmicos.

---

Com esta arquitetura de menus bem delineada, os candidatos encontram uma plataforma que alia rigor militar à fluidez gamificada de excelência visual e sonora!
