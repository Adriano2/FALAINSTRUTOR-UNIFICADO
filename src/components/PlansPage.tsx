/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Planos para Empresas (vitrine pública de assinaturas recorrentes). Mostra os
 * planos ativos; o CTA leva ao contato/WhatsApp para contratação.
 */

import React from 'react';
import { Check, Star, Loader2, ArrowLeft } from 'lucide-react';
import { plansApi } from '../api';
import { Plan } from '../types';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface PlansPageProps {
  onNavigate: (screen: string, extra?: unknown) => void;
  whatsappNumber?: string;
}

export default function PlansPage({ onNavigate, whatsappNumber }: PlansPageProps) {
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => { plansApi.list().then(setPlans).catch(() => {}).finally(() => setLoading(false)); }, []);

  const contact = (plan: Plan) => {
    const digits = (whatsappNumber || '').replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá! Tenho interesse no plano ${plan.name} (${brl(plan.priceMonthly)}/mês) para a minha empresa.`);
    if (digits.length >= 10) window.open(`https://wa.me/${digits}?text=${msg}`, '_blank');
    else onNavigate('home');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <button onClick={() => onNavigate('home')} className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Planos para Empresas</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Mantenha sua equipe em conformidade com as NRs em uma assinatura mensal: treinamentos EaD ilimitados,
          certificados válidos, painel de conformidade e alertas de vencimento.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-slate-400 flex items-center justify-center gap-2 py-16"><Loader2 className="w-5 h-5 animate-spin" /> Carregando planos...</p>
      ) : plans.length === 0 ? (
        <p className="text-center text-slate-400 py-16">Nenhum plano disponível no momento. Fale conosco para um orçamento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p) => (
            <div key={p.id} className={`relative flex flex-col rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-sm ${p.highlight ? 'border-emerald-500 ring-2 ring-emerald-500/30 md:-translate-y-2' : 'border-slate-200 dark:border-slate-800'}`}>
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wide"><Star className="w-3 h-3" /> Mais escolhido</span>
              )}
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{p.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">{p.description}</p>
              <div className="mt-4 mb-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{brl(p.priceMonthly)}</span>
                <span className="text-sm text-slate-400 font-bold">/mês</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">{p.maxEmployees ? `Até ${p.maxEmployees} colaboradores` : 'Colaboradores ilimitados'}</p>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 flex-1">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> {f}</li>
                ))}
              </ul>
              <button
                onClick={() => contact(p)}
                className={`mt-6 w-full py-3 rounded-xl font-bold text-sm cursor-pointer ${p.highlight ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'}`}
              >
                Contratar / Falar com vendas
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-[11px] text-slate-400 mt-10">Precisa de algo sob medida? Fale com o nosso time comercial — montamos um plano para a sua operação.</p>
    </div>
  );
}
