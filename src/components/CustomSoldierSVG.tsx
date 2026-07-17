import React from 'react';

interface CustomSoldierSVGProps {
  skinTone: string;
  faceType: string;
  biotipo: string;
  specialtyId?: string;
  currentFase?: number;
  className?: string;
}

export const CustomSoldierSVG: React.FC<CustomSoldierSVGProps> = ({
  skinTone,
  faceType,
  biotipo,
  specialtyId = 'infantaria',
  currentFase = 0,
  className = 'w-48 h-48'
}) => {
  // Map skin tones to hex codes
  const skinColors: { [key: string]: string } = {
    'Claro': '#FFD5B4',
    'Bronze': '#DE9F6D',
    'Pardo': '#D2B48C',
    'Moreno': '#8D5524',
    'Escuro': '#4A2A0C'
  };

  const skin = skinColors[skinTone] || '#FFD5B4';

  // Render Dynamic Military Rank Badge based on currentFase (0=Recruta, 1=Cabo, etc)
  const renderRankInsignia = () => {
    switch (currentFase) {
      case 1: // Cabo
        return (
          <g id="rank-insignia" transform="translate(100, 194) scale(0.9)">
            {/* Chevrons */}
            <path d="M -6 -3 L 0 0 L 6 -3" fill="none" stroke="#FFE000" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M -6 1 L 0 4 L 6 1" fill="none" stroke="#FFE000" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        );
      case 2: // 3º Sargento
        return (
          <g id="rank-insignia" transform="translate(100, 193) scale(0.9)">
            {/* 3 Chevrons */}
            <path d="M -6 -4 L 0 -1 L 6 -4" fill="none" stroke="#FFE000" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M -6 -1 L 0 2 L 6 -1" fill="none" stroke="#FFE000" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M -6 2 L 0 5 L 6 2" fill="none" stroke="#FFE000" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );
      case 3: // 2º Sargento
        return (
          <g id="rank-insignia" transform="translate(100, 192) scale(0.9)">
            {/* Chevrons and small star */}
            <path d="M -6 -1 L 0 1.5 L 6 -1" fill="none" stroke="#FFE000" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M -6 1.5 L 0 4 L 6 1.5" fill="none" stroke="#FFE000" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M -6 4 L 0 6.5 L 6 4" fill="none" stroke="#FFE000" strokeWidth="1.8" strokeLinecap="round" />
            <polygon points="0,-6 -1.5,-3 1.5,-3" fill="#C5A059" />
          </g>
        );
      case 4: // 1º Sargento
        return (
          <g id="rank-insignia" transform="translate(100, 191) scale(0.9)">
            {/* Chevrons and stars */}
            <path d="M -6 0 L 0 2 L 6 0" fill="none" stroke="#FFE000" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M -6 2.5 L 0 4.5 L 6 2.5" fill="none" stroke="#FFE000" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M -6 5 L 0 7 L 6 5" fill="none" stroke="#FFE000" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="-2.5" cy="-4" r="1.2" fill="#FFE000" />
            <circle cx="2.5" cy="-4" r="1.2" fill="#FFE000" />
          </g>
        );
      case 5: // Subtenente
        return (
          <g id="rank-insignia" transform="translate(100, 195) scale(0.95)">
            {/* Gold lozenge (Losango de Subtenente) */}
            <polygon points="0,-6 5,0 0,6 -5,0" fill="#FFE000" stroke="#FFD700" strokeWidth="0.8" />
            <polygon points="0,-3 2.5,0 0,3 -2.5,0" fill="#353B18" />
          </g>
        );
      case 6: // 2º Tenente
        return (
          <g id="rank-insignia" transform="translate(100, 196) scale(0.9)">
            {/* One glorious gold star represent official rank */}
            <polygon points="0,-5 1.5,-1.5 5,-1.5 2,1 3.5,4.5 0,2.5 -3.5,4.5 -2,1 -5,-1.5 -1.5,-1.5" fill="#FFE000" stroke="#FFD700" strokeWidth="0.5" />
          </g>
        );
      case 7: // 1º Tenente
        return (
          <g id="rank-insignia" transform="translate(100, 196) scale(0.8)">
            {/* Two gold stars */}
            <g transform="translate(-4, 0)">
              <polygon points="0,-5 1.5,-1.5 5,-1.5 2,1 3.5,4.5 0,2.5 -3.5,4.5 -2,1 -5,-1.5 -1.5,-1.5" fill="#FFE000" stroke="#FFD700" strokeWidth="0.5" />
            </g>
            <g transform="translate(4, 0)">
              <polygon points="0,-5 1.5,-1.5 5,-1.5 2,1 3.5,4.5 0,2.5 -3.5,4.5 -2,1 -5,-1.5 -1.5,-1.5" fill="#FFE000" stroke="#FFD700" strokeWidth="0.5" />
            </g>
          </g>
        );
      case 8: // Capitão QAO
        return (
          <g id="rank-insignia" transform="translate(100, 196) scale(0.7)">
            {/* Three gold stars arranged in triangle */}
            <g transform="translate(-5, 2.5)">
              <polygon points="0,-5 1.5,-1.5 5,-1.5 2,1 3.5,4.5 0,2.5 -3.5,4.5 -2,1 -5,-1.5 -1.5,-1.5" fill="#FFE000" stroke="#FFD700" strokeWidth="0.5" />
            </g>
            <g transform="translate(5, 2.5)">
              <polygon points="0,-5 1.5,-1.5 5,-1.5 2,1 3.5,4.5 0,2.5 -3.5,4.5 -2,1 -5,-1.5 -1.5,-1.5" fill="#FFE000" stroke="#FFD700" strokeWidth="0.5" />
            </g>
            <g transform="translate(0, -4.5)">
              <polygon points="0,-5 1.5,-1.5 5,-1.5 2,1 3.5,4.5 0,2.5 -3.5,4.5 -2,1 -5,-1.5 -1.5,-1.5" fill="#FFE000" stroke="#FFD700" strokeWidth="0.5" />
            </g>
          </g>
        );
      default: // Recruta (Fase 0 or unassigned)
        return (
          <g id="rank-insignia" transform="translate(100, 195) scale(0.9)">
            {/* Bare single horizontal line bar */}
            <line x1="-4" y1="0" x2="4" y2="0" stroke="#777" strokeWidth="1.2" strokeDasharray="1 1" />
          </g>
        );
    }
  };

  // Map neck & shoulder scale according to biotipo
  let shoulderWidth = 140;
  let neckWidth = 36;
  let shoulderY = 165;

  if (biotipo === 'Robust' || biotipo === 'Robusto') {
    shoulderWidth = 158;
    neckWidth = 42;
  } else if (biotipo === 'Magro') {
    shoulderWidth = 125;
    neckWidth = 32;
  } else if (biotipo === 'Compacto') {
    shoulderWidth = 130;
    neckWidth = 34;
    shoulderY = 170;
  } else if (biotipo === 'Alto') {
    shoulderWidth = 145;
    neckWidth = 35;
    shoulderY = 160;
  } else if (biotipo === 'Atlético' || biotipo === 'Atletico') {
    shoulderWidth = 142;
    neckWidth = 38;
    shoulderY = 165;
  }

  // Get specialty badge or visual item
  const getSpecialtyAddon = () => {
    switch (specialtyId) {
      case 'infantaria':
        return (
          <g id="infantaria-gear" transform="translate(0, 0)">
            {/* Tactical shotgun ammo bandolier over shoulder */}
            <path d="M 64 210 L 132 172" stroke="#1C1C1C" strokeWidth="6" strokeLinecap="round" />
            <rect x="74" y="196" width="3.5" height="5.5" fill="#D21F3C" stroke="#FFE000" strokeWidth="0.5" transform="rotate(-30 74 196)" />
            <rect x="86" y="189" width="3.5" height="5.5" fill="#D21F3C" stroke="#FFE000" strokeWidth="0.5" transform="rotate(-30 86 189)" />
            <rect x="98" y="182" width="3.5" height="5.5" fill="#D21F3C" stroke="#FFE000" strokeWidth="0.5" transform="rotate(-30 98 182)" />
            <rect x="110" y="175" width="3.5" height="5.5" fill="#D21F3C" stroke="#FFE000" strokeWidth="0.5" transform="rotate(-30 110 175)" />
          </g>
        );
      case 'artilharia':
        return (
          <g id="artilharia-badge" transform="translate(0, 0)">
            {/* Golden cross artilharia cannon pins on the jacket collars */}
            <circle cx="81" cy="178" r="2" fill="#FFE000" />
            <line x1="77" y1="178" x2="85" y2="178" stroke="#FFE000" strokeWidth="1.2" />
            <circle cx="119" cy="178" r="2" fill="#FFE000" />
            <line x1="115" y1="178" x2="123" y2="178" stroke="#FFE000" strokeWidth="1.2" />
          </g>
        );
      case 'cavalaria':
        return (
          <g id="cavalaria-scarf">
            {/* Red scarf under collar */}
            <path d="M 85 167 Q 100 175 115 167 L 100 185 Z" fill="#B22222" stroke="#7A1515" strokeWidth="1.2" />
          </g>
        );
      case 'engenharia':
        return (
          <g id="engenharia-helmet" transform="translate(138, 175) scale(0.75)">
            {/* Steel blue safety helmet on side chest */}
            <path d="M 0 5 A 8 8 0 0 1 16 5 Z" fill="#4682B4" stroke="#1C1C1C" strokeWidth="1" />
            <rect x="-2" y="5" width="20" height="2" fill="#4682B4" stroke="#1C1C1C" strokeWidth="1" />
          </g>
        );
      case 'material_belico':
        return (
          <g id="material-belico-wrench" transform="translate(58, 186) scale(0.85)">
            {/* Metal wrench handle sticking out from tactical pouch */}
            <line x1="0" y1="18" x2="8" y2="0" stroke="#7A8B99" strokeWidth="3.2" strokeLinecap="round" />
            <circle cx="8" cy="0" r="4" fill="#3D454B" stroke="#76818A" strokeWidth="0.8" />
            <rect x="5.5" y="-1.5" width="5" height="3" fill="#1C1C1C" />
          </g>
        );
      case 'comunicacoes':
        // Headphone silhouette around the neck
        return (
          <g id="communications-headphones">
            {/* Left ear cup */}
            <rect x="52" y="115" width="12" height="24" rx="4" fill="#1C1C1C" />
            {/* Right ear cup */}
            <rect x="136" y="115" width="12" height="24" rx="4" fill="#1C1C1C" />
            {/* Arch around neck */}
            <path d="M 58 135 Q 100 160 142 135" fill="none" stroke="#2B2B2B" strokeWidth="4" />
          </g>
        );
      case 'saude':
        // Red cross arm shield
        return (
          <g id="health-brassard" transform="translate(-10, 0)">
            {/* White circle on left sleeve */}
            <circle cx="48" cy="180" r="14" fill="#FFFFFF" stroke="#D21F3C" strokeWidth="1.5" />
            {/* Red Cross */}
            <rect x="45" y="171" width="6" height="18" fill="#D21F3C" />
            <rect x="39" y="177" width="18" height="6" fill="#D21F3C" />
          </g>
        );
      case 'aviacao':
        // Aviator goggles on beret or forehead
        return (
          <g id="aviation-goggles" transform="translate(0, -6)">
            {/* Strap */}
            <path d="M 64 54 Q 100 50 136 54" fill="none" stroke="#1F1F1F" strokeWidth="3" />
            {/* Goggle lense frames */}
            <rect x="76" y="44" width="22" height="16" rx="4" fill="#2D3B36" stroke="#C5A059" strokeWidth="1.5" />
            <rect x="102" y="44" width="22" height="16" rx="4" fill="#2D3B36" stroke="#C5A059" strokeWidth="1.5" />
            {/* Glass glint */}
            <line x1="80" y1="48" x2="88" y2="56" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
            <line x1="106" y1="48" x2="114" y2="56" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
          </g>
        );
      case 'topografia':
        return (
          <g id="topografia-maps" transform="translate(56, 188) scale(0.85)">
            {/* Map scroll tucked in the chest pocket */}
            <rect x="0" y="0" width="11" height="18" rx="1.5" fill="#EADCA6" stroke="#5C543B" strokeWidth="1" />
            <line x1="3" y1="0" x2="3" y2="18" stroke="#8A4A1C" strokeWidth="0.8" strokeDasharray="1 1" />
            <line x1="8" y1="0" x2="8" y2="18" stroke="#8A4A1C" strokeWidth="0.8" strokeDasharray="1 1" />
          </g>
        );
      case 'intendencia':
        return (
          <g id="intendencia-pen" transform="translate(134, 185) scale(0.9)">
            {/* Tucked admin tactical pen on pocket slip */}
            <rect x="0" y="0" width="3" height="14" fill="#1A2118" stroke="#FFE000" strokeWidth="0.8" />
            <line x1="0.5" y1="4" x2="0.5" y2="9" stroke="#FFE000" strokeWidth="0.5" />
          </g>
        );
      case 'musica':
        // Gold lyre badge pin on right collar
        return (
          <g id="music-lyre" transform="translate(132, 172) scale(0.6)">
            <path d="M 5 0 L 15 0 L 15 15 L 5 15 Z" fill="#C5A059" />
            <circle cx="10" cy="10" r="5" fill="#DAA520" />
          </g>
        );
      default:
        return null;
    }
  };

  // Expression paths based on faceType
  const renderFaceDetails = () => {
    switch (faceType) {
      case 'Determinado':
        return (
          <g id="face-determined">
            {/* Stern eyebrows */}
            <path d="M 72 82 Q 80 81 86 85" fill="none" stroke="#291a10" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 128 82 Q 120 81 114 85" fill="none" stroke="#291a10" strokeWidth="2.5" strokeLinecap="round" />
            {/* Analytical intense eyes */}
            <circle cx="79" cy="89" r="3.5" fill="#1A1A1A" />
            <circle cx="121" cy="89" r="3.5" fill="#1A1A1A" />
            {/* Determinated closed mouth line */}
            <path d="M 88 111 Q 100 111 112 111" fill="none" stroke="#5C3A21" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'Amigável':
        return (
          <g id="face-friendly">
            {/* Soft eyebrows */}
            <path d="M 71 83 Q 80 79 87 82" fill="none" stroke="#291a10" strokeWidth="2" strokeLinecap="round" />
            <path d="M 129 83 Q 120 79 113 82" fill="none" stroke="#291a10" strokeWidth="2" strokeLinecap="round" />
            {/* Friendly smiling eyes */}
            <ellipse cx="79" cy="89" rx="4" ry="3.5" fill="#1A1A1A" />
            <ellipse cx="121" cy="89" rx="4" ry="3.5" fill="#1A1A1A" />
            <path d="M 76 86 Q 79 84 82 86" fill="none" stroke="#444" strokeWidth="1" />
            <path d="M 118 86 Q 121 84 124 86" fill="none" stroke="#444" strokeWidth="1" />
            {/* Slight smile helper cheeks */}
            <path d="M 85 110 Q 100 118 115 110" fill="none" stroke="#5C3A21" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'Sério':
        return (
          <g id="face-serious">
            {/* Level military eyebrows */}
            <line x1="71" y1="82" x2="87" y2="82" stroke="#291a10" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="113" y1="82" x2="129" y2="82" stroke="#291a10" strokeWidth="2.5" strokeLinecap="round" />
            {/* Focused small eyes */}
            <circle cx="79" cy="88" r="3" fill="#1A1A1A" />
            <circle cx="121" cy="88" r="3" fill="#1A1A1A" />
            {/* Straight rigid mouth */}
            <line x1="90" y1="110" x2="110" y2="110" stroke="#5C3A21" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'Experiente':
        return (
          <g id="face-experienced">
            {/* Wrinkle/Expressive eyebrows */}
            <path d="M 71 82 Q 80 83 87 81" fill="none" stroke="#291a10" strokeWidth="2" strokeLinecap="round" />
            <path d="M 129 82 Q 120 83 113 81" fill="none" stroke="#291a10" strokeWidth="2" strokeLinecap="round" />
            {/* Attentive squinted eyes */}
            <ellipse cx="79" cy="89" rx="4" ry="2.5" fill="#1A1A1A" />
            <ellipse cx="121" cy="89" rx="4" ry="2.5" fill="#1A1A1A" />
            {/* Experienced beard shadow or moustache stubble */}
            <path d="M 84 105 Q 100 108 116 105" fill="none" stroke="#756255" strokeWidth="3" opacity="0.4" />
            {/* Solid mustache */}
            <path d="M 86 106 Q 100 111 114 106 L 110 111 Q 100 114 90 111 Z" fill="#3D2B1F" />
            {/* Wise mouth line */}
            <path d="M 89 113 Q 100 114 111 113" fill="none" stroke="#5C3A21" strokeWidth="2" strokeLinecap="round" />
            {/* Eye corner lines */}
            <line x1="68" y1="88" x2="72" y2="89" stroke="#4E342E" strokeWidth="1" />
            <line x1="132" y1="88" x2="128" y2="89" stroke="#4E342E" strokeWidth="1" />
          </g>
        );
      case 'Jovem':
        return (
          <g id="face-young">
            {/* Arched soft brows */}
            <path d="M 72 80 Q 80 77 87 81" fill="none" stroke="#291a10" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 128 80 Q 120 77 113 81" fill="none" stroke="#291a10" strokeWidth="1.8" strokeLinecap="round" />
            {/* Big curios eyes */}
            <circle cx="79" cy="88" r="4.5" fill="#1A1A1A" />
            <circle cx="121" cy="88" r="4.5" fill="#1A1A1A" />
            {/* Tiny highlight dot in pupil */}
            <circle cx="77.5" cy="86.5" r="1.2" fill="#FFFFFF" />
            <circle cx="119.5" cy="86.5" r="1.2" fill="#FFFFFF" />
            {/* Simple small smile */}
            <path d="M 88 109 Q 100 115 112 109" fill="none" stroke="#5C3A21" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg 
      viewBox="0 0 200 210" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} overflow-visible`}
      style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))' }}
    >
      <defs>
        <pattern id="camo-pattern-avatar" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
          {/* Base Olive Drab background */}
          <rect width="40" height="40" fill="#4B5320" />
          {/* Dark Forest Green shapes */}
          <path d="M 0 5 Q 8 0, 15 8 T 30 5 T 40 10 L 40 0 L 0 0 Z" fill="#2E3314" opacity="0.9"/>
          <path d="M 5 25 Q 15 20, 22 28 T 40 22 Q 30 38, 10 35 Z" fill="#1B1E0A" opacity="0.95"/>
          {/* Flat clay-brown camo blobs */}
          <path d="M 25 15 Q 32 10, 36 18 T 28 28 Z" fill="#5E4E30" opacity="0.7"/>
          <path d="M 3 18 Q 8 10, 15 15 T 8 28 Z" fill="#5E4E30" opacity="0.7"/>
        </pattern>
      </defs>

      {/* Background backing glow shadow circle */}
      <circle cx="100" cy="110" r="85" fill="#242D22" opacity="0.4" />

      {/* SHAPE 1: SHOULDERS & UNIFORM (Biotipo adjustable) */}
      <g id="shoulders-assembly">
        {/* Olive Green Jacket - Camouflaged with camo pattern */}
        <path 
          d={`M ${100 - shoulderWidth/2} 210 Q ${100 - shoulderWidth/2 + 10} ${shoulderY} 100 ${shoulderY} Q ${100 + shoulderWidth/2 - 10} ${shoulderY} ${100 + shoulderWidth/2} 210 Z`} 
          fill="url(#camo-pattern-avatar)" 
          stroke="#2A3012" 
          strokeWidth="3.5" 
        />

        {/* Tactical vest details */}
        <path 
          d={`M ${100 - shoulderWidth/2.5} 210 L ${100 - xMultiplier(shoulderWidth, 0.25)} 188 L ${100 + xMultiplier(shoulderWidth, 0.25)} 188 L ${100 + shoulderWidth/2.5} 210 Z`} 
          fill="#353B18" 
          stroke="#252A11" 
          strokeWidth="2" 
        />

        {/* Brazil Flag Badge on Left Arm */}
        <rect x="156" y="190" width="18" height="12" rx="1.5" fill="#108035" stroke="#FFFFFF" strokeWidth="0.5" />
        <polygon points="159,196 165,192 171,196 165,200" fill="#FFE000" />
        <circle cx="165" cy="196" r="2.5" fill="#002C82" />

        {/* Exército Brasileiro embroidered tag */}
        <rect x="52" y="195" width="48" height="7" rx="1" fill="#1A2118" stroke="#3A4637" strokeWidth="0.5" />
        <text 
          x="76" 
          y="201" 
          fill="#E8E4D9" 
          fontSize="4" 
          fontFamily="monospace" 
          fontWeight="bold" 
          textAnchor="middle" 
          letterSpacing="0.2"
        >
          EXÉRCITO BRASILEIRO
        </text>

        {/* Collar tabs - Rank Insignia placeholders */}
        <path d="M 85 168 L 74 186 L 86 181 Z" fill="#3D451C" stroke="#2A2F13" strokeWidth="1" />
        <path d="M 115 168 L 126 186 L 114 181 Z" fill="#3D451C" stroke="#2A2F13" strokeWidth="1" />

        {/* Silver stars/bars on collar tabs */}
        <circle cx="80" cy="177" r="1.5" fill="#E8E4D9" />
        <circle cx="120" cy="177" r="1.5" fill="#E8E4D9" />

        {/* Dynamic center-chest rank/insignia */}
        {renderRankInsignia()}
      </g>

      {/* SHAPE 2: NECK (Width based on Biotipo) */}
      <rect 
        x={100 - neckWidth / 2} 
        y="125" 
        width={neckWidth} 
        height="45" 
        fill={skin} 
        stroke="#4E342E" 
        strokeWidth="3.5" 
      />
      {/* Neck shadow collar scoop */}
      <path d={`M ${100 - neckWidth / 2} 150 Q 100 162 ${100 + neckWidth / 2} 150`} fill="none" stroke="#261205" strokeWidth="4" opacity="0.3" />

      {/* SHAPE 3: FACE / HEAD */}
      <g id="head-assembly">
        {/* Ear Left */}
        <ellipse cx="58" cy="98" rx="7" ry="9" fill={skin} stroke="#4E342E" strokeWidth="3" />
        <ellipse cx="58" cy="98" rx="3.5" ry="5.5" fill="none" stroke="#4E342E" strokeWidth="1.5" opacity="0.5" />

        {/* Ear Right */}
        <ellipse cx="142" cy="98" rx="7" ry="9" fill={skin} stroke="#4E342E" strokeWidth="3" />
        <ellipse cx="142" cy="98" rx="3.5" ry="5.5" fill="none" stroke="#4E342E" strokeWidth="1.5" opacity="0.5" />

        {/* Main Head Base */}
        <path 
          d="M 64 80 Q 56 122 100 134 Q 144 122 136 80 Q 136 50 100 50 Q 64 50 64 80 Z" 
          fill={skin} 
          stroke="#4E342E" 
          strokeWidth="3.5" 
        />

        {/* Nose */}
        <path d="M 96 95 Q 100 93 104 95 Q 101 103 100 103 Q 99 103 96 95 Z" fill="none" stroke="#5C3A21" strokeWidth="2" strokeLinecap="round" />

        {/* Eyes & Mouth (Rendered based on selected face) */}
        {renderFaceDetails()}
      </g>

      {/* SHAPE 4: MILITARY BERET (Farda Boina) - Green with Gold Emblem */}
      <g id="beret-assembly">
        {/* Dynamic sweeping shape of military beret slanted towards the right */}
        <path 
          d="M 58 64 Q 52 48 83 34 Q 120 18 143 36 Q 148 56 130 65 Q 105 66 64 64 Z" 
          fill="#3B451B" 
          stroke="#2A3012" 
          strokeWidth="3.5" 
        />
        {/* Beret dark band */}
        <path 
          d="M 64 63 Q 100 66 136 63" 
          fill="none" 
          stroke="#1F1F1F" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />
        {/* Gold-Rimmed Brazilian Shield Emblem on Left-side of Beret (screen left, screen x=75) */}
        <g id="beret-shield" transform="translate(74, 45) scale(0.95)">
          {/* Shield outline */}
          <circle cx="0" cy="6" r="6" fill="#0E3982" stroke="#C5A059" strokeWidth="1.2" />
          {/* Inner details symbol */}
          <polygon points="0,2 -2,6 2,6" fill="#F8E300" />
          <polygon points="0,10 -2,6 2,6" fill="#228822" />
          <circle cx="0" cy="6" r="1.5" fill="#FFFFFF" />
        </g>
      </g>

      {/* SHAPE 5: SPECIALTY VISUAL ADDON DETAIL */}
      {getSpecialtyAddon()}
    </svg>
  );
};

// Helper for shoulder width scaling
function xMultiplier(val: number, fraction: number): number {
  return Math.round(val * fraction);
}
