# 📦 Gerar APK e AAB assinados (Play Store)

> ⚠️ Este processo **deve ser executado na sua máquina** (Windows 10).
> A Lovable é um IDE web — não compila binários Android.

---

## 0. Pré-requisitos (instalar uma vez)

| Software | Versão | Link |
|---|---|---|
| Node.js | 18 LTS+ | https://nodejs.org |
| JDK | 17 (Temurin) | https://adoptium.net |
| Android SDK | cmdline-tools + platform 34 + build-tools 34.0.0 | https://developer.android.com/studio#command-tools |
| Git | qualquer | https://git-scm.com |

Variáveis de ambiente Windows (Sistema → Variáveis de Ambiente):
```
JAVA_HOME    = C:\Program Files\Eclipse Adoptium\jdk-17...
ANDROID_HOME = C:\Android\sdk
Path += %JAVA_HOME%\bin
Path += %ANDROID_HOME%\platform-tools
Path += %ANDROID_HOME%\cmdline-tools\latest\bin
```

Aceite as licenças:
```bash
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

---

## 1. Baixar o projeto do GitHub

```bash
git clone https://github.com/SEU_USUARIO/SEU_REPO.git
cd SEU_REPO
npm install
```

---

## 2. Preparar `capacitor.config.ts` para produção

Abra `capacitor.config.ts` e **comente o bloco `server`** (senão o APK
continuará carregando do preview Lovable):

```ts
const config: CapacitorConfig = {
  appId: 'app.lovable.66b04218ef294e3698d19031327f268c',
  appName: 'CHQAO Quest',
  webDir: 'dist',
  // server: {  ← COMENTAR para produção
  //   url: '...',
  //   cleartext: true,
  // },
};
```

---

## 3. Configurar AdMob (obrigatório se for monetizar)

Edite `.env` na raiz:
```
VITE_ADMOB_REWARDED_ID=ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ
```

---

## 4. Build web + sincronizar Android

```bash
npm run build
npx cap add android       # só na primeira vez
npx cap sync android
```

Depois do `cap add android`, edite
`android/app/src/main/AndroidManifest.xml` e adicione dentro de
`<application>`:
```xml
<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"
           android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
```

---

## 5. Criar a chave de assinatura (uma vez na vida — GUARDE COM A VIDA)

```bash
keytool -genkey -v -keystore chqao-release.jks -alias chqao ^
  -keyalg RSA -keysize 2048 -validity 10000
```
Mova o arquivo `chqao-release.jks` para `android/app/`.

> 🔐 **Perdeu a keystore = nunca mais consegue atualizar o app na Play Store.**
> Faça backup em 2 lugares (HD externo + nuvem privada).

---

## 6. Configurar assinatura no Gradle

Crie `android/keystore.properties` (NÃO commitar):
```properties
storeFile=chqao-release.jks
storePassword=SUA_SENHA
keyAlias=chqao
keyPassword=SUA_SENHA
```

Adicione ao `.gitignore`:
```
android/keystore.properties
android/app/chqao-release.jks
```

Edite `android/app/build.gradle`, no topo (antes de `android {`):
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Dentro do bloco `android { ... }`:
```gradle
signingConfigs {
    release {
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

---

## 7. Versionamento (a cada release)

Em `android/app/build.gradle`:
```gradle
defaultConfig {
    ...
    versionCode 2          // sempre +1 a cada upload
    versionName "1.0.1"    // visível ao usuário
}
```

---

## 8. Gerar os arquivos finais

```bash
cd android

# APK assinado (testes, instalação manual)
.\gradlew assembleRelease
# saída: android/app/build/outputs/apk/release/app-release.apk

# AAB assinado (Play Store EXIGE este formato)
.\gradlew bundleRelease
# saída: android/app/build/outputs/bundle/release/app-release.aab
```

---

## 9. Publicar na Play Store

1. https://play.google.com/console (taxa única US$ 25)
2. Criar app → preencher ficha (descrição, prints, ícone 512×512, banner 1024×500)
3. Política de privacidade (link público obrigatório)
4. Classificação etária + público-alvo
5. Produção → Criar nova versão → upload do `.aab`
6. Revisão Google: 1–7 dias

---

## 10. Atualizar o app depois

```bash
git pull
npm install
npm run build
npx cap sync android
cd android
.\gradlew bundleRelease   # lembrar de subir versionCode!
```

---

## ❗ Erros comuns

| Erro | Solução |
|---|---|
| `SDK location not found` | Crie `android/local.properties` com `sdk.dir=C:\\Android\\sdk` |
| `Tela branca no APK` | Esqueceu de comentar o bloco `server` no `capacitor.config.ts` |
| `INSTALL_PARSE_FAILED_NO_CERTIFICATES` | APK não assinado — use `assembleRelease`, não `assembleDebug` |
| `Login Google não funciona` | Cadastre o SHA-1 da keystore no Google Cloud Console + Lovable Cloud → Auth |

Pegar SHA-1 da sua keystore:
```bash
keytool -list -v -keystore android/app/chqao-release.jks -alias chqao
```
