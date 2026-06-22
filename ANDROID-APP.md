# App Android — FalaInstrutor

O app Android é gerado com **Capacitor**, empacotando o **mesmo front-end React**
da plataforma. Ou seja, **todos os painéis já funcionam dentro do app**, sem
reescrever nada e tudo interligado ao mesmo backend:

- 👨‍🎓 **Aluno** — cursos, vídeos por módulo, materiais, provas, certificados
- 🏢 **Empresa** — dashboard de conformidade, certificados da equipe, NR-04/CIPA
- 👨‍🏫 **Instrutor** — liberação de provas, vendas, faturamento e comissão
- 🛡️ **Administrador** — gestão completa (cursos, instrutores, empresas, NFS-e,
  auditoria de provas, mapeamento da saúde, etc.)

O app é apenas a "casca" nativa: ele carrega a interface empacotada e conversa
com o backend (Express + PostgreSQL) via HTTPS — exatamente como o site.

---

## Como funciona

| Camada | Onde roda |
|--------|-----------|
| Interface (React/Vite) | Empacotada dentro do APK (`dist/` → `android/.../assets/public`) |
| Backend / API | No seu servidor (Render hoje, ou o VPS futuramente) |
| Banco de dados | PostgreSQL no servidor |

> ⚠️ **Ponto-chave:** dentro do app nativo a interface roda em uma origem local,
> então as chamadas `/api` **precisam apontar para a URL absoluta do backend**.
> Isso é controlado pela variável `VITE_API_BASE_URL` no momento do build.

---

## Pré-requisitos (na sua máquina)

1. **Node.js 18+** (já usado no projeto)
2. **Android Studio** (inclui o Android SDK e o JDK) —
   <https://developer.android.com/studio>
3. Após instalar, abra o Android Studio uma vez e instale o **Android SDK
   Platform** e o **Android SDK Build-Tools** (ele oferece ao abrir).

---

## Gerar o app (passo a passo)

```bash
# 1. Instalar dependências (uma vez)
npm install

# 2. Apontar o app para o backend de produção e sincronizar.
#    Troque pela URL pública real do seu servidor:
VITE_API_BASE_URL="https://falainstrutor.onrender.com" npm run cap:sync

# 3. Abrir o projeto no Android Studio
npm run cap:open
```

No Android Studio:

- **Testar no emulador/celular:** botão ▶ **Run**.
- **Gerar APK de instalação:** menu **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
  O arquivo sai em `android/app/build/outputs/apk/`.
- **Gerar AAB para a Play Store:** menu **Build → Generate Signed Bundle / APK →
  Android App Bundle** (exige um *keystore* de assinatura — veja abaixo).

### Build por linha de comando (opcional)

```bash
# APK release (não assinado) via Gradle
VITE_API_BASE_URL="https://SEU-BACKEND" npm run android:build
# -> android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## Publicar na Google Play

1. Crie um **keystore** de assinatura (uma única vez, guarde com segurança):
   ```bash
   keytool -genkey -v -keystore falainstrutor.keystore \
     -alias falainstrutor -keyalg RSA -keysize 2048 -validity 10000
   ```
   > 🔐 **Nunca** versione o `.keystore` nem a senha no Git. Guarde-os fora do repo.
2. No Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**,
   selecione o keystore e gere o `.aab`.
3. Suba o `.aab` no **Google Play Console** (conta de desenvolvedor: taxa única de US$ 25).

---

## Atualizações

Sempre que o front-end mudar, basta regerar e reenviar:

```bash
VITE_API_BASE_URL="https://SEU-BACKEND" npm run cap:sync
# depois: Run / Build APK / Build AAB no Android Studio
```

Mudanças **só de backend** (regras, dados, novos cursos) **não exigem novo APK** —
o app já consome a API ao vivo.

---

## O que foi adicionado ao projeto

- `capacitor.config.ts` — id `br.com.falainstrutor.app`, nome "FalaInstrutor",
  splash/status bar navy.
- `android/` — projeto nativo gerado pelo Capacitor (versionado; artefatos de
  build ficam no `.gitignore`).
- `src/config.ts` — `apiUrl()` central que respeita `VITE_API_BASE_URL`.
- `src/native.ts` — inicialização nativa (status bar, splash, botão voltar do
  Android). É no-op na web.
- Scripts `npm`: `cap:sync`, `cap:open`, `android:build`, `android:run`.

## Notas

- O ícone e a splash padrão são os do Capacitor. Para a identidade visual do
  FalaInstrutor (escudo), use **Android Studio → Image Asset** ou o pacote
  `@capacitor/assets` apontando para o logo do projeto.
- O backend precisa responder por **HTTPS** (não cleartext) — o app está
  configurado com `allowMixedContent: false`.
