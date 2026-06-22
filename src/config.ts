/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Configuração de ambiente do front-end.
 *
 * No site (web) o front e a API são servidos pela mesma origem, então as
 * chamadas usam caminho relativo (`/api/...`) e API_BASE fica vazio.
 *
 * No app Android (Capacitor) o WebView roda em uma origem local
 * (https://localhost / file://), que NÃO tem o backend. Por isso o app
 * precisa apontar para a URL absoluta do servidor de produção, definida
 * em tempo de build pela variável de ambiente VITE_API_BASE_URL.
 *
 * Ex.: VITE_API_BASE_URL=https://falainstrutor.onrender.com
 */
export const API_BASE: string = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

/** Monta a URL completa de um endpoint da API (com ou sem base absoluta). */
export const apiUrl = (path: string): string => `${API_BASE}/api${path.startsWith('/') ? path : `/${path}`}`;

/** true quando rodando dentro do app nativo (Capacitor). */
export const isNativeApp = (): boolean =>
  typeof (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform === 'function' &&
  (window as unknown as { Capacitor: { isNativePlatform: () => boolean } }).Capacitor.isNativePlatform();
