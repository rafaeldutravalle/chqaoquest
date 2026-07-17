import { Specialty } from '../types';

export const SPECIALTIES: Specialty[] = [
  {
    id: 'infantaria',
    name: 'Infantaria',
    badge: 'INF',
    color: '#3B5E30', // Forest Green
    weapon: 'Fuzis cruzados',
    voiceText: 'A infantaria é a rainha das batalhas.',
    detail: 'Coldre no cinto de guarnição',
    description: 'Especialistas em combate em qualquer terreno, focados em táticas de campo, progressão sob fogo e patrulhas.'
  },
  {
    id: 'artilharia',
    name: 'Artilharia',
    badge: 'ART',
    color: '#8B4513', // Bronze/Brown
    weapon: 'Canhão',
    voiceText: 'Fogo de supressão e precisão.',
    detail: 'Banda de munição tática no cinto',
    description: 'Arma do fogo apoiada pelas comunicações, responsável pelo planejamento de fogos de apoio e balística.'
  },
  {
    id: 'cavalaria',
    name: 'Cavalaria',
    badge: 'CAV',
    color: '#B22222', // Deep Red
    weapon: 'Cavalo e sabre',
    voiceText: 'Velocidade e choque.',
    detail: 'Botas altas de montaria reforçadas',
    description: 'Unidades mecanizadas focadas no reconhecimento avançado, velocidade, manobra blindada e surpresa.'
  },
  {
    id: 'engenharia',
    name: 'Engenharia',
    badge: 'ENG',
    color: '#4682B4', // Steel Blue
    weapon: 'Torre de castelo',
    voiceText: 'Construir e destruir.',
    detail: 'Capacete de proteção no braço',
    description: 'Especialistas em mobilidade, contramobilidade e proteção estrutural das forças de combate.'
  },
  {
    id: 'material_belico',
    name: 'Mat. Bélico',
    badge: 'MAT',
    color: '#D2691E', // Rust / Cooper
    weapon: 'Bomba',
    voiceText: 'Logística de guerra.',
    detail: 'Mochila tática de ferramentas pesadas',
    description: 'Logística avançada, manutenção de blindados, armamento pesado e coordenação de suprimentos de munição.'
  },
  {
    id: 'comunicacoes',
    name: 'Comunicações',
    badge: 'COM',
    color: '#FF8C00', // Signal Gold / Orange
    weapon: 'Raio elétrico',
    voiceText: 'A voz do comando.',
    detail: 'Fone de ouvido tático no pescoço',
    description: 'Responsáveis pelo enlace de dados, antenas de campanha, guerra eletrônica e criptografia.'
  },
  {
    id: 'saude',
    name: 'Saúde',
    badge: 'SAU',
    color: '#A52A2A', // Medical Crimson
    weapon: 'Caduceu',
    voiceText: 'Salvar vidas na linha de frente.',
    detail: 'Braçadeira vermelha da Cruz de Malta',
    description: 'Atendimento de emergência tática, medicina preventiva militar e saneamento de tropa.'
  },
  {
    id: 'aviacao',
    name: 'Aviação',
    badge: 'AV',
    color: '#2F4F4F', // Dark Slate
    weapon: 'Asa',
    voiceText: 'Domínio dos céus.',
    detail: 'Óculos de aviador clássicos na testa',
    description: 'Operações helitransportadas, assalto aéreo e logística tática por asas rotativas.'
  },
  {
    id: 'topografia',
    name: 'Topografia',
    badge: 'TOP',
    color: '#C5A059', // Brass Gold
    weapon: 'Bússola',
    voiceText: 'O terreno é nosso aliado.',
    detail: 'Coleção de mapas dobrados no bolso',
    description: 'Cartografia digital, reconhecimento de rotas estratégico e georreferenciamento de artilharia.'
  },
  {
    id: 'intendencia',
    name: 'Intendência',
    badge: 'INT',
    color: '#6A5ACD', // Purple/Slate Blue
    weapon: 'Carroça',
    voiceText: 'Suprimentos garantem a vitória.',
    detail: 'Prancheta tática administrativa na mão',
    description: 'Arma da logística de suprimento de alimentação, fardamento, finanças e contratações do Exército.'
  },
  {
    id: 'musica',
    name: 'Música',
    badge: 'MUS',
    color: '#DAA520', // Golden Lira
    weapon: 'Lira',
    voiceText: 'A alma do Exército em notas.',
    detail: 'Instrumento de sopro pequeno ao lado',
    description: 'Orientação de bandas militares, hinos pátrios, ordens sonoras e moral de tropa.'
  }
];
