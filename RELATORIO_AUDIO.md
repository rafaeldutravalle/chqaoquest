# Relatório Técnico de Síntese Procedimental de Áudio
## Preparatório CHQAO – *Jornada do Mérito Militar* v2.0

Este relatório apresenta o projeto, a engenharia e as saídas do **Motor de Áudio Dinâmico** (`audioEngine.ts`) do aplicativo preparatório para o concurso CHQAO.

Em conformidade com os mais altos padrões de design de som e otimização para web, o sistema de áudio foi desenvolvido utilizando **Web Audio API pura**, sintetizando frequências e ondas em tempo real. Isso significa que o aplicativo **não carrega arquivos externos de som (.mp3 ou .wav)**, garantindo carregamento instantâneo, independência de conexão e consumo nulo de banda.

---

## 1. Arquitetura de Síntese

O motor de áudio utiliza os blocos básicos da Web Audio API para modular som:
* **Osciladores (`OscillatorNode`):** Geram as ondas sonoras fundamentais (`sine`, `triangle`, `sawtooth`).
* **Nós de Ganho (`GainNode`):** Controlam a amplitude (volume) e desenham as curvas de decaimento envelope (ADSR).
* **Filtros (`BiquadFilterNode`):** Modelam o timbre através de filtros passa-baixa (`lowpass`), passa-faixa (`bandpass`) e pico (`peaking`).
* **Buffers de Ruído (`AudioBuffer`):** Geram ruído branco e marrom programaticamente para efeitos de sopro, atrito ou textura.

---

## 2. Detalhamento das Saídas de Efeitos Sonoros (SFX)

O simulador possui **13 canais de efeitos sonoros programados**:

### ⚔️ Efeitos de Ação e Progresso Acadêmico
1. **`click` (Toque de Botão/Fivela Metálica):**
   * *Configuração:* Onda `triangle` iniciando em $800\text{ Hz}$ e descendo exponencialmente para $150\text{ Hz}$ em apenas $0.08\text{ s}$.
   * *Percepção:* Som rápido e tátil que simula o clique seco de uma fivela ou abotoadura de fardamento militar.

2. **`acerto` (Notificação Padrão!):**
   * *Configuração:* Dois tons puros em sequência (intervalo harmônico de quarta justa): nota Mi5 ($659.25\text{ Hz}$) seguida de Lá5 ($880\text{ Hz}$), passando por um filtro `lowpass` de $2000\text{ Hz}$ para suavizar estalos.
   * *Percepção:* Um toque brilhante, alegre e acolhedor de dupla campainha metálica, celebrando a resposta correta no simulador.

3. **`erro` (Punição Disciplinar/Erro Crítico):**
   * *Configuração:* Superposição de dois osciladores desafinados — onda dente-de-serra (`sawtooth`) em $120\text{ Hz}$ e onda triangular em $123\text{ Hz}$, com atenuação suave ao longo de $0.5\text{ s}$.
   * *Percepção:* Um zunido grave, áspero e dissonante que remete a uma sirene ou campainha de advertência em instruções regulamentares.

4. **`combo` (Toque de Corneta de Infantaria):**
   * *Configuração:* Arpejo militar ascendente usando notas da escala maior: Mi4 ($329.63\text{ Hz}$), Sol4 ($392.00\text{ Hz}$), Dó5 ($523.25\text{ Hz}$) e Mi5 ($659.25\text{ Hz}$), sequenciadas em intervalos de $0.15\text{ s}$ com decaimento suave.
   * *Percepção:* Um toque de clarim ou corneta incentivando a tropa após uma sequência exemplar de acertos.

### 📜 Efeitos Solenes e Administrativos
5. **`medalha` (Soltura de Condecoração):**
   * *Configuração:* Dois componentes simultâneos. Um oscilador agudo ($2200\text{ Hz} \to 1200\text{ Hz}$) simulando o brilho da medalha metálica, e um impacto grave subaquático (`triangle` em $60\text{ Hz} \to 20\text{ Hz}$) para dar peso ao peito do combatente.
   * *Percepção:* O tilintar característico de uma condecoração de metal colidindo levemente com a farda do oficial.

6. **`cunhete` (Abertura de Baú de Munição):**
   * *Configuração:* Ranger de baixa frequência de onda `triangle` ($40\text{ Hz} \to 350\text{ Hz}$) em $0.4\text{ s}$, simulando o ranger da madeira seca sob tensão física.
   * *Percepção:* Ranger pesado de baú ou caixa de munição de madeira abrindo na cantina.

7. **`carimbo` (Petição Deferida / Carimbada de Dossiê):**
   * *Configuração:* Impacto de oscilador triangular ($90\text{ Hz} \to 10\text{ Hz}$) decaindo em $0.2\text{ s}$, somado a um surto curto de ruído branco de baixa frequência ($450\text{ Hz}$ `lowpass` com decaimento de $0.1\text{ s}$).
   * *Percepção:* Som abafado, seco e autoritário com a textura áspera e fricção de um carimbo pesado oficial pressionado contra papel de requerimento.

8. **`alarme` (Estado de Alerta Máximo):**
   * *Configuração:* Oscilador de onda dente-de-serra (`sawtooth`) com modulação de frequência de rampa linear cíclica ($600\text{ Hz} \to 800\text{ Hz} \to 600\text{ Hz}$ em $0.4\text{ s}$).
   * *Percepção:* Sirene clássica de base militar ou quartel, sinalizando penalidade grave de Prontidão.

### 🐕 Efeitos de Personagens e Detalhes
9. **`voice_caramelo` (Latido do Mascote Caramelo):**
   * *Configuração:* Síntese em duplo latido ("Au au!"). Combina um oscilador triangular centralizado de baixa frequência ($180\text{ Hz} \to 75\text{ Hz}$) e ruído branco filtrado por um passa-faixa (`bandpass` de $320\text{ Hz}$ e $Q=2.5$). O segundo latido é disparado após $105\text{ ms}$ com afinação ainda menor ($160\text{ Hz} \to 65\text{ Hz}$).
   * *Percepção:* Um latido rouco, encorpado, natural e simpático do cão vira-lata Caramelo usando boina de campanha.

10. **`typewriter` (Teclas da Máquina de Escrever Olivetti):**
    * *Configuração:* Pulso transitório super curto de tom puro em $1100\text{ Hz}$ com decaimento exponencial de $0.03\text{ s}$.
    * *Percepção:* O clique tátil e mecânico de máquinas antigas de datilografia de seção militar.

11. **`fanfarra` (Marcha Militar Triunfal):**
    * *Configuração:* Acordes de metais brilhantes construídos com pares de osciladores ligeiramente desafinados em coro (`sawtooth` e `triangle` sobrepostos) tocando a escala majestosa Dó4 ($261.63\text{ Hz}$), Mi4 ($329.63\text{ Hz}$), Sol4 ($392.00\text{ Hz}$) e Dó5 ($523.25\text{ Hz}$).
    * *Percepção:* Fanfarra militar gloriosa, acionada em comemorações de promoção ou conclusão de ciclo.

12. **`bizu` (Zoom do Binóculo de Campanha):**
    * *Configuração:* Varredura exponencial rápida e ascendente de onda senoidal pura ($400\text{ Hz} \to 1600\text{ Hz}$) em $0.35\text{ s}$.
    * *Percepção:* Efeito sonoro de transição rápida ou descoberta de um "bizu" importante.

13. **`radio_tuning` (Sintonização de Rádio de Campanha):**
    * *Configuração:* Três bipes de código Morse agudos ($1000\text{ Hz} \dots 1200\text{ Hz}$) curtos sequenciais sobrepostos a um sweep de ruído branco filtrado em passa-faixa (`bandpass` ressonador modulado linearmente de $800\text{ Hz}$ a $2500\text{ Hz}$ e retornando para $1200\text{ Hz}$).
    * *Percepção:* O som nostálgico e tático de rádio militar sintonizando e transmitindo dados durante a reprodução de podcasts.

---

## 3. Trilhas Sonoras de Fundo (BGM)

O motor de áudio gera loops dinâmicos de trilhas sonoras adaptativas à tela corrente:

### 🏠 1. Tema do Quartel General (`qg`)
* **Mecânica:** Combina um bumbo rítmico simulando marcha militar (oscilador triangular de $55\text{ Hz} \to 15\text{ Hz}$ a cada 4 tempos) com cliques agudos rápidos e filtrados (simulando a caixa de snare). Em sobreposição, um oscilador senoidal em oitava alta simula uma melodia folclórica de flauta pífano tocada na escala pentatônica maior.
* **Estilo:** Solene, inspiradora, focada e cadenciada.

### 🧭 2. Tema de Missões de Prova (`missao`)
* **Mecânica:** Pulso de tensionamento rítmico rápido. Inclui um bumbo tático procedural triangular ($50\text{ Hz} \to 15\text{ Hz}$ a cada 4 compassos) e uma linha de baixo pulsante em dente-de-serra (`sawtooth` com corte de filtro de $110\text{ Hz}$) que alterna entre $45\text{ Hz}$ e $55\text{ Hz}$. A cada 16 compassos, uma onda senoidal de sweep de tensão lenta de $220\text{ Hz} \to 140\text{ Hz}$ cria atmosfera de contagem regressiva e tomada de decisão estratégica.
* **Estilo:** Sombrio, tenso, tático e de foco intelectual.

### ⛺ 3. Tema do Rancho de Recuperação (`rancho`)
* **Mecânica:** Ritmo de blues acústico composto por linhas de baixo andantes na escala de Lá menor Blues ($110\text{ Hz} \dots 164\text{ Hz}$) tocadas com ondas triangulares. Os acordes de violão de aço dedilhados (osciladores senoidais em Lá7: $220\text{ Hz} \dots 392\text{ Hz}$) recebem uma simulação procedural de eco e atraso (delay), onde cada nota é duplicada $200\text{ ms}$ mais tarde com amplitude atenuada para simular reflexão acústica.
* **Estilo:** Descontraído, acolhedor e focado no repouso mental para o candidato restabelecer sua prontidão operacional.

---

## 4. Gerador de Ruído de Fundo Imersivo (Immersion Ambience)

Para militares que desejam maior foco, o aplicativo dispõe de um **gerador de ambiência física**:
* **Física da Síntese:** Gera um buffer de áudio contínuo de ruído estocástico que passa por dois filtros simultâneos: um passa-baixas de frequências de corte em $260\text{ Hz}$ e um filtro de pico centrado em $95\text{ Hz}$ com ganho de $+5\text{ dB}$.
* **Efeitos de Evento Aleatórios:** Em intervalos aleatórios de ~1.9 segundos, o gerador introduz pequenos sons orgânicos flutuantes:
  * Batidas metálicas curtas e fracas em $1400\text{ Hz} \dots 2100\text{ Hz}$ (para simular o distante barulho de talheres de alumínio na cozinha ou refeitório).
  * Batidas triangulares surdas e abafadas em frequências ultra-baixas ($45\text{ Hz} \dots 70\text{ Hz}$) para simular passos distantes de marcha ou vibrações de jipes nas proximidades do alojamento.
* **Resultado:** Reduz estímulos externos reais através de mascaramento sonoro agradável (ruído de caserna relaxante).

---

## 5. Controles Dinâmicos de Volume

O sistema foi atualizado para suportar controle de volume individualizado:
* **Música de Fundo (BGM):** Um slider no painel de áudio permite atenuar dinamicamente a melodia e bateria procedurais das trilhas de caserna.
* **Efeitos Sonoros (SFX):** Ajustável em tempo real para permitir bipes e toques sutis durante os estudos noturnos.
* **Persistência:** As preferências de volume são mantidas sob as chaves `chqao_bgm_vol` e `chqao_sfx_vol` no `localStorage`.
