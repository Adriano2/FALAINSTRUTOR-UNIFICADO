/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Vencimentos: lista os certificados emitidos com a validade calculada e
 * permite disparar os alertas de renovação (e-mail ao aluno + resumo WhatsApp).
 */

import React from 'react';
import { Loader2, RefreshCw, Mail, Send, AlertTriangle, Clock, CheckCircle2, Download } from 'lucide-react';
import { adminApi, ApiExpiration } from '../../api';

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—');

export default function ExpirationsManager() {
  const [rows, setRows] = React.useState<ApiExpiration[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [notifying, setNotifying] = React.useState(false);
  const [filter, setFilter] = React.useState<'all' | 'expiring' | 'expired'>('all');
  const [msg, setMsg] = React.useState('');

  const load = React.useCallback(() => {
    setLoading(true);
    adminApi.expirations().then((d) => setRows(Array.isArray(d.expirations) ? d.expirations : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const notify = async () => {
    if (!confirm('Enviar alertas de renovação por e-mail aos alunos com certificado vencendo/vencido?')) return;
    setNotifying(true); setMsg('');
    try {
      const r = await adminApi.notifyExpirations(30);
      setMsg(`Alertas enviados: ${r.sent} (de ${r.candidates} elegíveis).`);
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Falha ao enviar alertas.');
    } finally { setNotifying(false); }
  };

  const shown = rows.filter((r) => (filter === 'all' ? r.status !== 'valid' || true : r.status === filter));
  const counts = {
    expiring: rows.filter((r) => r.status === 'expiring').length,
    expired: rows.filter((r) => r.status === 'expired').length,
    valid: rows.filter((r) => r.status === 'valid').length,
  };

  const exportCsv = () => {
    const head = 'Aluno;E-mail;Empresa;Curso;Certificado;Validade;DiasRestantes;Situacao\n';
    const body = shown.map((r) => [r.studentName, r.studentEmail, r.company ?? '', `${r.courseCode} ${r.courseName}`, r.certificateCode ?? '', fmt(r.validUntil), r.daysLeft ?? '', r.status].join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([head + body], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'vencimentos.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const badge = (s: ApiExpiration['status']) =>
    s === 'expired' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
    : s === 'expiring' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Vencimentos de Certificados</h2>
          <p className="text-xs text-slate-400">Validade = data de liberação + validade do curso. Dispare alertas de renovação por e-mail (e resumo no WhatsApp).</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"><RefreshCw className="w-3.5 h-3.5" /> Atualizar</button>
          <button onClick={exportCsv} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"><Download className="w-3.5 h-3.5" /> CSV</button>
          <button onClick={notify} disabled={notifying} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white">
            {notifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Enviar alertas
          </button>
        </div>
      </div>

      {msg && <p className="text-xs text-emerald-600 font-semibold">{msg}</p>}

      <div className="flex flex-wrap gap-2">
        {([['all', `Todos (${rows.length})`], ['expiring', `A vencer (${counts.expiring})`], ['expired', `Vencidos (${counts.expired})`]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${filter === k ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{label}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</p>
      ) : shown.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-10 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">Nenhum certificado {filter !== 'all' ? 'neste status' : 'com validade'} encontrado.</p>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr><th className="p-2.5">Aluno</th><th className="p-2.5">Empresa</th><th className="p-2.5">Treinamento</th><th className="p-2.5 text-center">Validade</th><th className="p-2.5 text-center">Situação</th><th className="p-2.5 text-right">Contato</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {shown.map((r) => (
                  <tr key={r.enrollmentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                    <td className="p-2.5"><span className="font-bold text-slate-900 dark:text-white">{r.studentName}</span><span className="block text-[10px] text-slate-400">{r.studentEmail}</span></td>
                    <td className="p-2.5 text-slate-500">{r.company ?? '—'}</td>
                    <td className="p-2.5"><span className="font-bold text-amber-500">{r.courseCode}</span> <span className="text-slate-600 dark:text-slate-300">{r.courseName}</span></td>
                    <td className="p-2.5 text-center font-semibold text-slate-700 dark:text-slate-200">{fmt(r.validUntil)}<span className="block text-[10px] text-slate-400">{r.daysLeft != null ? (r.daysLeft < 0 ? `${-r.daysLeft}d atrás` : `em ${r.daysLeft}d`) : ''}</span></td>
                    <td className="p-2.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold ${badge(r.status)}`}>
                        {r.status === 'expired' ? <AlertTriangle className="w-3 h-3" /> : r.status === 'expiring' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {r.status === 'expired' ? 'Vencido' : r.status === 'expiring' ? 'A vencer' : 'Válido'}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <a href={`mailto:${r.studentEmail}?subject=${encodeURIComponent('Renovação do treinamento ' + r.courseCode)}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline font-bold"><Mail className="w-3.5 h-3.5" /> E-mail</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
