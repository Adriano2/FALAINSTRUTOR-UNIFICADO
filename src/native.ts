/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Inicialização específica do app nativo (Capacitor / Android).
 *
 * Tudo aqui é "no-op" quando rodando no navegador (web): os plugins só são
 * importados e acionados quando a aplicação está dentro do app nativo, então
 * o site continua funcionando exatamente igual.
 *
 * - StatusBar: cor navy combinando com a identidade visual.
 * - SplashScreen: esconde a splash assim que o React monta.
 * - Botão voltar do Android: volta no histórico ou minimiza o app na raiz.
 */
import { isNativeApp } from './config';

export async function initNativeApp(): Promise<void> {
  if (!isNativeApp()) return;

  try {
    const [{ StatusBar, Style }, { SplashScreen }, { App }] = await Promise.all([
      import('@capacitor/status-bar'),
      import('@capacitor/splash-screen'),
      import('@capacitor/app'),
    ]);

    await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    await StatusBar.setBackgroundColor({ color: '#0f172a' }).catch(() => {});
    await SplashScreen.hide().catch(() => {});

    // Botão "voltar" físico/gestual do Android.
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack || window.history.length > 1) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch {
    // Plugins indisponíveis (ambiente web) — ignora silenciosamente.
  }
}
