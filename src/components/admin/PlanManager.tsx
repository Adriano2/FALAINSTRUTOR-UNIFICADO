/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gestão de Planos de assinatura corporativa (recorrência). Permite criar,
 * editar (nome, preço/mês, limite de colaboradores, recursos, destaque) e
 * ativar/desativar planos exibidos na página pública "Planos para Empresas".
 */

import React from 'react';
import { Loader2, Plus, Trash2, Save, Check, Star } from 'lucide-react';
import { adminApi } from '../../api';
import { Plan } from '../../types';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function PlanManager() {
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [savedId, setSavedId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    adminApi.plans().then(setPlans).catch(() => {}).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const patch = (id: string, p: Partial<Plan>) => setPlans((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const save = async (plan: Plan) => {
    setSavingId(plan.id);
    try {
      await adminApi.updatePlan(plan.id, {
        name: plan.name, description: plan.description, priceMonthly: plan.priceMonthly,
        maxEmployees: plan.maxEmployees, features: plan.features, isActive: plan.isActive, highlight: plan.highlight, sortOrder: plan.sortOrder,
      });
      setSavedId(plan.id); setTimeout(() => setSavedId(null), 1800);
    } catch (e) { alert(e instanceof Error ? e.message : 'Falha ao salvar.'); }
    finally { setSavingId(null); }
  };

  const addPlan = async () => {
    try {
      await adminApi.createPlan({ name: 'Novo plano', priceMonthly: 0, maxEmployees: 10, features: [], isActive: false, sortOrder: plans.length + 1 });
      load();
    } catch (e) { alert(e instanceof Error ? e.message : 'Falha ao criar plano.'); }
  };
  const removePlan = async (id: string) => {
    if (!confirm('Remover este plano?')) return;
    setPlans((p) => p.filter((x) => x.id !== id));
    await adminApi.deletePlan(id).catch(() => load());
  };

  const input = 'w-full text-sm p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none';

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Planos de Assinatura</h2>
          <p className="text-xs text-slate-400">Planos corporativos (recorrência mensal) exibidos em "Planos para Empresas".</p>
        </div>
        <button onClick={addPlan} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded bg-blue-600 hover:bg-blue-700 text-white"><Plus className="w-4 h-4" /> Novo plano</button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</p>
      ) : plans.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-10 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">Nenhum plano. Clique em "Novo plano".</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {plans.map((p) => (
            <div key={p.id} className={`bg-white dark:bg-slate-900 border rounded-lg p-4 space-y-3 ${p.highlight ? 'border-emerald-400' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className="flex items-center gap-2">
                <input value={p.name} onChange={(e) => patch(p.id, { name: e.target.value })} className={`${input} font-bold`} />
                <button onClick={() => removePlan(p.id)} className="p-2 text-slate-400 hover:text-rose-500 shrink-0" title="Remover"><Trash2 className="w-4 h-4" /></button>
              </div>
              <input value={p.description} onChange={(e) => patch(p.id, { description: e.target.value })} placeholder="Descrição curta" className={`${input} text-xs`} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Preço/mês (R$)</label>
                  <input type="number" value={p.priceMonthly} onChange={(e) => patch(p.id, { priceMonthly: Number(e.target.value) })} className={input} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Máx. colaboradores</label>
                  <input type="number" value={p.maxEmployees ?? ''} placeholder="∞ (vazio)" onChange={(e) => patch(p.id, { maxEmployees: e.target.value === '' ? null : Number(e.target.value) })} className={input} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Recursos (um por linha)</label>
                <textarea value={p.features.join('\n')} onChange={(e) => patch(p.id, { features: e.target.value.split('\n') })} rows={Math.max(3, p.features.length + 1)} className={`${input} resize-y`} />
              </div>
              <div className="flex items-center gap-3 flex-wrap text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={p.isActive} onChange={(e) => patch(p.id, { isActive: e.target.checked })} /> Ativo</label>
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={p.highlight} onChange={(e) => patch(p.id, { highlight: e.target.checked })} /> <Star className="w-3.5 h-3.5 text-amber-500" /> Destaque</label>
                <span className="text-slate-400">{brl(p.priceMonthly)}/mês</span>
                <button onClick={() => save(p)} disabled={savingId === p.id} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded">
                  {savingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedId === p.id ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />} Salvar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
