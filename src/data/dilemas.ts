import { Dilema } from '../types';

export const DILEMAS: Dilema[] = [
  {
    id: 'dilema_1',
    title: 'Sentinela Dormindo no Posto',
    scenario: 'Durante sua ronda noturna como Oficial de Dia, você flagra um soldado de vigília dormindo na guarita posterior do batalhão. Trata-se de área sensível do depósito de armamento. Como agir conforme as normas disciplinares vigentes (RDE) e o Código Penal Militar (CPM)?',
    options: [
      {
        text: 'Chamar o sargento adjunto para render o soldado, registrá-lo em flagrante delito sob artigo 203 do CPM (dormir em serviço) e encaminhá-lo à prisão disciplinar imediata na guarita.',
        outcome: 'Você seguiu o Código Penal Militar à risca. Dormir em sentinela é crime militar em tempo de paz (Art. 203 CPM). Contudo, a prisão disciplinar imediata sem o devido processo legal (sindicância/FATD) violaria o direito de defesa do RDE.',
        scoreChange: -10,
        penalty: true,
        responseText: 'Ação afobada. Registrar o crime é correto, mas decretar prisão sumária antes do rito de defesa é transgressão de abuso do oficial instaurador!'
      },
      {
        text: 'Acordar o soldado com firmeza, substituí-lo no posto para garantir a segurança da área, recolhê-lo ao alojamento e lavrar o termo de comunicação de transgressão disciplinar para instauração do FATD (Formulário de Apuração de Transgressão Disciplinar).',
        outcome: 'Perfeito! Você restabeleceu a segurança da sentinela primeiro, evitou expor o militar a perigo continuado, colheu as provas materiais necessárias e cumpriu as 72 horas regulamentares de prazo para ampla defesa antes de qualquer punição administrativa.',
        scoreChange: 40,
        penalty: false,
        responseText: 'Decisão Padrão! Zelo operacional e respeito ao rito processual do RDE e RISG.'
      },
      {
        text: 'Deixar passar por se tratar de um soldado exemplar e aplicar apenas uma advertência verbal secreta para manter a moral elevada da tropa sênior.',
        outcome: 'Gravíssimo! Ocultar crime militar ou transgressão disciplinar grave em área sensível de armamento configura prevaricação e conivência de comando.',
        scoreChange: -50,
        penalty: true,
        responseText: 'Decisão desastrosa! Punida com repreensão formal anotada em sua FVM por descumprimento do dever de vigilância.'
      }
    ]
  },
  {
    id: 'dilema_2',
    title: 'A Suspeita de Fraude no Rancho',
    scenario: 'O 1º Sgt Farroupilha reporta que há divergências recorrentes no estoque de carnes do rancho. Ele suspeita que fornecedores terceirizados estão registrando pesos superfaturados no recebimento. Qual o seu procedimento administrativo tático?',
    options: [
      {
        text: 'Convocar imediatamente o fornecedor ao gabinete e reter seus créditos de faturamento mensal até que apresente justificativa por escrito.',
        outcome: 'A retenção unilateral de pagamentos sem processo administrativo formal ou contraditório viola o princípio do pacta sunt servanda e a Lei de Licitações (Lei 14.133/2021).',
        scoreChange: -15,
        penalty: true,
        responseText: 'Erro Processual! A empresa terceirizada pode acionar o batalhão judicialmente por bloqueio irregular de faturamento.'
      },
      {
        text: 'Iniciar imediata auditoria interna surpresa na balança de recebimento, registrar as pesagens diárias com fotos e propor ao Coronel a abertura de uma Sindicância Administrativa para apurar a autoria e materialidade.',
        outcome: 'Excelente! Você colheu indícios preliminares discretos, garantiu a idoneidade da prova e recomendou o instrumento legal correto (Sindicância) para fundamentar qualquer penalidade futura ou rescisão do contrato.',
        scoreChange: 50,
        penalty: false,
        responseText: 'Doutrina Padrão! Sindicância é o processo administrativo correto para apurar irregularidades em contratos ou patrimônio.'
      },
      {
        text: 'Instalar câmeras escondidas no teto do rancho sem autorização judicial e divulgar os trechos no grupo de WhatsApp dos suboficiais para pressionar o fornecedor a confessar.',
        outcome: 'Ilegal. Prova obtida por meios clandestinos infringe a privacidade e gera nulidade jurídica. Além disso, expor militares em mídias infringe frontalmente o estatuto e o regulamento de segurança.',
        scoreChange: -40,
        penalty: true,
        responseText: 'Desastre Tático! Nulidade de prova absoluta e punição disciplinar severa aplicada pelo Capitão Comandante.'
      }
    ]
  }
];
