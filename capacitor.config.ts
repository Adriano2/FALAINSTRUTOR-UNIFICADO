import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Configuração do app nativo (Capacitor) do FalaInstrutor.
 *
 * O app empacota o mesmo front-end React (painéis Aluno, Empresa, Instrutor e
 * Administrador) e consome o backend de produção definido em VITE_API_BASE_URL
 * no momento do build (`npm run build`).
 *
 * `webDir` aponta para o resultado do build do Vite (dist/).
 */
const config: CapacitorConfig = {
  appId: 'br.com.falainstrutor.app',
  appName: 'FalaInstrutor',
  webDir: 'dist',
  backgroundColor: '#0f172a', // navy (mesmo tom do certificado/identidade)
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#0f172a',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
  },
};

export default config;
