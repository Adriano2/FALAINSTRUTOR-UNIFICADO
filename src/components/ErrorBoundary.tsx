/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Limite de erro (Error Boundary): evita a "tela branca" quando um componente
 * lança um erro de renderização. Mostra uma mensagem amigável e registra o erro
 * (ponto de integração futuro para um monitor como o Sentry).
 */

import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';
import type { ReactNode } from 'react';

function Fallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-4 shadow-sm">
        <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">Algo deu errado</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ocorreu um erro inesperado nesta tela. Você pode recarregar a página para continuar.
        </p>
        <button
          onClick={() => { resetErrorBoundary(); window.location.reload(); }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg cursor-pointer"
        >
          Recarregar
        </button>
      </div>
    </div>
  );
}

export default function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      onError={(error, info) => console.error('[ErrorBoundary]', error, info)}
    >
      {children}
    </ReactErrorBoundary>
  );
}
