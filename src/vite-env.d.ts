/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL absoluta do backend de produção (usada no app Android/Capacitor). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
