# Publicar na Play Store (Capacitor + AdMob)

O projeto já tem `@capacitor/core`, `@capacitor/android` e `capacitor.config.ts` configurados.

## 1. Exportar para o GitHub
Use **GitHub → Connect** no topo da Lovable e clone o repositório.

## 2. Pré-requisitos locais
- Node 18+
- Android Studio (Android SDK)
- JDK 17

## 3. Gerar o app Android
```bash
npm install
npx cap add android
npm run build
npx cap sync android
npx cap open android
```
No Android Studio: **Build → Generate Signed Bundle/APK** → escolha **AAB**, crie a chave de assinatura. Suba o `.aab` na Play Console.

## 4. Hot-reload no desenvolvimento
`capacitor.config.ts` aponta para o preview Lovable. Antes do build de produção, **remova o bloco `server`** do arquivo.

## 5. Integrar Google AdMob
```bash
npm i @capacitor-community/admob
npx cap sync android
```
No `AndroidManifest.xml`:
```xml
<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"
           android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
```
Substitua o mock em `src/components/game/AdRewardDialog.tsx` por:
```ts
import { AdMob } from '@capacitor-community/admob';
await AdMob.initialize();
await AdMob.prepareRewardVideoAd({ adId: 'ca-app-pub-…/…' });
await AdMob.showRewardVideoAd();
```

## 6. Login Google nativo
No Google Cloud crie OAuth Client ID **Android** com o SHA-1 da sua keystore e configure em **Lovable Cloud → Auth Settings → Google**.

Mais: https://lovable.dev/blogs/capacitor
