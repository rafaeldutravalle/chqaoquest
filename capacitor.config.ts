import type { CapacitorConfig } from '@capacitor/cli';

// IMPORTANTE: Para gerar o APK/AAB de produção, comente ou remova o bloco
// `server` abaixo. Ele só serve para hot-reload durante o desenvolvimento.
// Sem remover, o app instalado continuará carregando do preview Lovable
// em vez do bundle empacotado em `dist/`.
const config: CapacitorConfig = {
  appId: 'app.lovable.66b04218ef294e3698d19031327f268c',
  appName: 'CHQAO Quest',
  webDir: 'dist',
  server: {
    url: 'https://66b04218-ef29-4e36-98d1-9031327f268c.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;