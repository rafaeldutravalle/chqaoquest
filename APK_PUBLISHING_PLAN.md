# Plano de Compilação Mobile (APK/AAB) e Publicação nas Lojas - CHQAO Quest

Este manual de campanha consolida o passo a passo técnico necessário para empacotar o aplicativo **CHQAO Quest** e publicá-lo publicamente na loja oficial **Google Play Store**.

---

## 1. Do Web/React para Híbrido (Capacitor/Cordova)
Caso decida empacotar o código Web React existente para um APK híbrido ultra-rápido, utilizaremos o **CapacitorJS**:

```bash
# 1. Instalar dependências essenciais do Capacitor
npm install @capacitor/core @capacitor/cli

# 2. Inicializar configuração do aplicativo
npx cap init "CHQAO Quest" "com.chqao.quest" --web-dir=dist

# 3. Adicionar plataforma Android
npm install @capacitor/android
npx cap add android

# 4. Compilar código React Web e sincronizar recursos
npm run build
npx cap sync
```

A partir deste momento, o projeto do Android nativo estará presente no diretório `./android` da aplicação.

---

## 2. Geração da Chave Única de Lançamento (Keystore)
A segurança cadastral de atualizações do app exige uma chave única de criptografia. Gere o arquivo de assinatura com o utilitário `keytool` do Java SDK:

```bash
keytool -genkey -v -keystore chqao-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias chqao_key_alias
```

*Nota: Armazene o arquivo `chqao-release-key.jks` em local seguro de backup. Sem ele, atualizações futuras do app na loja de aplicativos tornam-se impossíveis.*

---

## 3. Configurações de Compilação no Gradle (`build.gradle`)
Edite o arquivo `./android/app/build.gradle` para ler as variáveis de assinatura seguras e ativando o **Proguard** para minificação (protegendo o código contra engenharia reversa):

```groovy
android {
    ...
    signingConfigs {
        release {
            storeFile file("caminho/para/chqao-release-key.jks")
            storePassword System.getenv("CHQAO_RELEASE_KEY_PASSWORD")
            keyAlias "chqao_key_alias"
            keyPassword System.getenv("CHQAO_RELEASE_KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}
```

---

## 4. Comandos de Geração do Aplicativo

No terminal, acesse o diretório `./android` e execute as tarefas Gradle correspondentes ao seu intuito de campanha:

```bash
# Para gerar o arquivo de teste local (APK):
./gradlew assembleRelease
# Caminho de saída: ./android/app/build/outputs/apk/release/app-release.apk

# Para gerar o arquivo oficial de distribuição nas lojas (AAB):
./gradlew bundleRelease
# Caminho de saída: ./android/app/build/outputs/bundle/release/app-release.aab
```

---

## 5. Roteiro de Publicação na Google Play Store

### Fase A: Preparação cadastral do App
1. Acesse o [Google Play Console](https://play.google.com/console) e registe-se como Desenvolvedor.
2. Inicie a criação de um novo aplicativo:
   - **Nome:** CHQAO Quest
   - **Idioma padrão:** Português (Brasil)
   - **Tipo:** Aplicativo
   - **Preço:** Gratuito (com compras no app)

### Fase B: Declarações e Consentimento
1. **Classificação etária:** Responda ao questionário selecionando a categoria *Educacional/Trivia*. O app receberá classificação livre (L).
2. **Acesso ao aplicativo:** Forneça dados de acesso de testes (crie um militar padrão fictício como "Cabo Silva" com prontidão ativa) para que os revisores do Google consigam validar a FVM.
3. **Público-alvo:** Selecione faixa etária superior a 18 anos devido ao foco voltado ao público militar sênior (concurso CHQAO).
4. **Política de Privacidade:** Adicione o link da política garantindo que nenhum dado real de identidade de corporações militares é extraído.

### Fase C: Produção e Envio
1. Vá até o menu **Produção** e crie uma nova versão (Release).
2. Arraste e solte o arquivo `.aab` criado na etapa de compilação acima.
3. Adicione as Notas da Versão:
   - *"Lançamento inicial do CHQAO Quest v2.0 - Jornada do Mérito Militar. Sistema de FVM, Simuladores de Dilema de Comando e mapas interativos habilitados."*
4. Envie o aplicativo para revisão! O processo costuma durar de **3 a 7 dias úteis** no primeiro lançamento.

---
*Manual desenvolvido em conformidade com as diretrizes de publicação mobile de campanha de treinamento militar.*
