/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Captação de Leads: lista os contatos captados na landing de divulgação e pelo
 * agente de IA de vendas, permitindo acompanhar o status do funil.
 */

import React from 'react';
import { Loader2, Trash2, GraduationCap, Building2, Bot, Mail, Phone, RefreshCw } from 'lucide-react';
import { adminLeadsApi, ApiLead } from '../../api';

const STATUS: { value: ApiLead['status']; label: string; cls: string }[] = [
  { value: 'NEW', label: 'Novo', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'CONTACTED', label: 'Contatado', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { value: 'QUALIFIED', label: 'Qualificado', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  { value: 'CONVERTED', label: 'Convertido', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { value: 'DISCARDED', label: 'Descartado', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
];

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

export default function LeadManager() {
  const [leads, setLeads] = React.useState<ApiLead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<ApiLead['status'] | 'ALL'>('ALL');

  const load = React.useCallback(() => {
    setLoading(true);
    adminLeadsApi.list().then((d) => setLeads(Array.isArray(d.leads) ? d.leads : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const setStatus = async (id: string, status: ApiLead['status']) => {
    setLeads((p) => p.map((l) => (l.id === id ? { ...l, status } : l)));
    await adminLeadsApi.updateStatus(id, status).catch(() => load());
  };
  const remove = async (id: string) => {
    if (!confirm('Remover este lead?')) return;
    setLeads((p) => p.filter((l) => l.id !== id));
    await adminLeadsApi.remove(id).catch(() => load());
  };

  const shown = filter === 'ALL' ? leads : leads.filter((l) => l.status === filter);
  const counts = React.useMemo(() => {
    const c: Record<string, number> = { total: leads.length };
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Captação de Leads</h2>
          <p className="text-xs text-slate-400">Contatos da landing de divulgação (/?lp=1) e do agente de IA de vendas.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200">
          <RefreshCw className="w-3.5 h-3.5" /> Atualizar
        </button>
      </div>

      {/* Resumo + filtro */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('ALL')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${filter === 'ALL' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
          Todos ({counts.total ?? 0})
        </button>
        {STATUS.map((s) => (
          <button key={s.value} onClick={() => setFilter(s.value)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${filter === s.value ? 'ring-2 ring-offset-1 ring-slate-400' : ''} ${s.cls}`}>
            {s.label} ({counts[s.value] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</p>
      ) : shown.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-10 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">Nenhum lead {filter !== 'ALL' ? 'neste status' : 'captado ainda'}.</p>
      ) : (
        <div className="space-y-2">
          {shown.map((l) => (
            <div key={l.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {l.type === 'COMPANY' ? <><Building2 className="w-3 h-3" /> Empresa</> : <><GraduationCap className="w-3 h-3" /> Profissional</>}
                  </span>
                  {l.source === 'ai-agent' && <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"><Bot className="w-3 h-3" /> IA</span>}
                  <span className="text-[10px] text-slate-400">{fmtDate(l.createdAt)}</span>
                </div>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-1">{l.name}{l.company ? <span className="text-slate-400 font-normal"> · {l.company}</span> : null}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-500 mt-0.5">
                  {l.email && <a href={`mailto:${l.email}`} className="flex items-center gap-1 hover:text-emerald-600"><Mail className="w-3 h-3" /> {l.email}</a>}
                  {l.phone && <a href={`https://wa.me/55${l.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-600"><Phone className="w-3 h-3" /> {l.phone}</a>}
                  {l.cnpj && <span>CNPJ: {l.cnpj}</span>}
                  {typeof l.employeeCount === 'number' && <span>{l.employeeCount} func.</span>}
                </div>
                {l.interest && <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1"><strong>Interesse:</strong> {l.interest}</p>}
                {l.message && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2"><strong>Obs.:</strong> {l.message}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select value={l.status} onChange={(e) => setStatus(l.id, e.target.value as ApiLead['status'])} className="text-xs p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                  {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <button onClick={() => remove(l.id)} className="p-2 text-slate-400 hover:text-red-500" title="Remover"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
