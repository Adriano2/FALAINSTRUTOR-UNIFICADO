/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Painel da empresa — Assinatura recorrente (plano corporativo).
 *
 * Mostra o plano atual + status/renovação e permite assinar/trocar de plano.
 * A assinatura é uma cobrança mensal no Asaas; ao assinar, abre a URL da
 * primeira fatura (PIX/Boleto/Cartão). O webhook confirma e marca como ativa.
 */

import React from 'react';
import { Loader2, Star, CheckCircle2, Clock, XCircle, CreditCard } from 'lucide-react';
import { companyApi, plansApi, CompanyDashboardData } from '../api';
import { Plan } from '../types';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  subscription: NonNullable<CompanyDashboardData['company']>['subscription'];
  onChanged: () => void;
}

export default function CompanySubscriptionPanel({ subscription, onChanged }: Props) {
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    plansApi.list().then(setPlans).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const subscribe = async (planId: string) => {
    setBusyId(planId); setError('');
    try {
      const r = await companyApi.subscribe(planId);
      onChanged();
      if (r.url) window.open(r.url, '_blank', 'noopener');
      else alert('Assinatura criada. A primeira fatura será gerada em instantes.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao assinar.');
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async () => {
    if (!confirm('Cancelar a assinatura? A empresa perde os benefícios do plano ao fim do ciclo.')) return;
    setBusyId('cancel'); setError('');
    try {
      await companyApi.cancelSubscription();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao cancelar.');
    } finally {
      setBusyId(null);
    }
  };

  const status = subscription?.status;
  const fmtD = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '—');

  const statusBadge = () => {
    if (status === 'active') return <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle2 className="w-4 h-4" /> Ativa</span>;
    if (status === 'pending') return <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs"><Clock className="w-4 h-4" /> Aguardando 1º pagamento</span>;
    if (status === 'canceled') return <span className="inline-flex items-center gap-1 text-rose-500 font-bold text-xs"><XCircle className="w-4 h-4" /> Cancelada</span>;
    return <span className="text-xs text-slate-400">Sem assinatura</span>;
  };

  return (
    <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" /> Plano corporativo
          </h3>
          <p className="text-xs text-slate-400">Assinatura mensal recorrente (Asaas). Pague a 1ª fatura por PIX, Boleto ou Cartão.</p>
        </div>
        {statusBadge()}
      </div>

      {/* Plano atual */}
      <div className="rounded-lg bg-slate-50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800 p-3 text-sm">
        {subscription?.planName ? (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">{subscription.planName}</span>
              {subscription.priceMonthly != null && <span className="text-slate-500"> — {brl(subscription.priceMonthly)}/mês</span>}
              {status === 'active' && <span className="block text-[11px] text-slate-400">Próxima renovação: {fmtD(subscription.renewsAt)}</span>}
            </div>
            {status !== 'canceled' && (
              <button onClick={cancel} disabled={busyId === 'cancel'} className="text-xs font-bold text-rose-500 hover:text-rose-600 disabled:opacity-60 inline-flex items-center gap-1">
                {busyId === 'cancel' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Cancelar assinatura
              </button>
            )}
          </div>
        ) : (
          <p className="text-slate-400">Nenhum plano contratado. Escolha um plano abaixo.</p>
        )}
      </div>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      {/* Planos disponíveis */}
      {loading ? (
        <p className="text-xs text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando planos...</p>
      ) : plans.length === 0 ? (
        <p className="text-xs text-slate-400">Nenhum plano disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.map((p) => {
            const current = subscription?.planId === p.id && status !== 'canceled';
            return (
              <div key={p.id} className={`rounded-lg border p-3 flex flex-col ${p.highlight ? 'border-emerald-400' : 'border-slate-200 dark:border-slate-800'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 dark:text-white">{p.name}</span>
                  {p.highlight && <Star className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{brl(p.priceMonthly)}<span className="text-xs font-normal text-slate-400">/mês</span></p>
                {p.description && <p className="text-[11px] text-slate-400 mt-1">{p.description}</p>}
                {p.maxEmployees != null && <p className="text-[11px] text-slate-500 mt-1">Até {p.maxEmployees} colaboradores</p>}
                {p.features.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-[11px] text-slate-500 flex-1">
                    {p.features.filter(Boolean).slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-start gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> {f}</li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => subscribe(p.id)}
                  disabled={busyId !== null || current}
                  className={`mt-3 w-full py-2 rounded text-xs font-bold inline-flex items-center justify-center gap-1.5 ${current ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white'} disabled:opacity-60`}
                >
                  {busyId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {current ? 'Plano atual' : subscription?.planName ? 'Trocar para este' : 'Assinar'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
