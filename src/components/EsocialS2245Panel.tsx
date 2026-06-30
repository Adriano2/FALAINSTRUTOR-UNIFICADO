/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Painel da empresa — eSocial S-2245 (Treinamentos e Capacitações).
 *
 * Gera os dados do evento (registros + pendências) das conclusões de cursos
 * marcados como "eSocial", para a empresa importar/transmitir no sistema de
 * folha/eSocial dela. O XML é RASCUNHO: deve ser validado contra o leiaute
 * vigente antes de transmitir. Quem transmite ao eSocial é o empregador.
 */

import React from 'react';
import { Loader2, FileDown, FileSpreadsheet, AlertTriangle, CheckCircle2, ShieldQuestion } from 'lucide-react';
import { companyApi, EsocialS2245Data } from '../api';

export default function EsocialS2245Panel() {
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [data, setData] = React.useState<EsocialS2245Data | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState<'xml' | 'csv' | null>(null);
  const [error, setError] = React.useState('');

  const load = React.useCallback(() => {
    setLoading(true); setError('');
    companyApi.esocialS2245(from || undefined, to || undefined)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Falha ao carregar.'))
      .finally(() => setLoading(false));
  }, [from, to]);

  React.useEffect(() => { load(); }, [load]);

  const download = async (format: 'xml' | 'csv') => {
    setDownloading(format);
    try {
      const blob = await companyApi.esocialS2245Download(format, from || undefined, to || undefined);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'csv' ? 's2245.csv' : 's2245-rascunho.xml';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Falha ao baixar o arquivo.');
    } finally {
      setDownloading(null);
    }
  };

  const records = data?.records ?? [];
  const okCount = records.filter((r) => r.pendencias.length === 0).length;
  const pendCount = records.length - okCount;
  const input = 'text-sm p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none';

  return (
    <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
      <div>
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <ShieldQuestion className="w-4 h-4 text-blue-600" /> eSocial — S-2245 (Treinamentos)
        </h3>
        <p className="text-xs text-slate-400">Treinamentos concluídos pelos seus funcionários, prontos para importar/transmitir no seu sistema de folha/eSocial.</p>
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase block">De</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={input} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase block">Até</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={input} />
        </div>
        <button onClick={load} disabled={loading} className="px-3 py-2 text-xs font-bold rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white inline-flex items-center gap-1.5">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Atualizar
        </button>
        <div className="ml-auto flex gap-2">
          <button onClick={() => download('csv')} disabled={downloading !== null || records.length === 0} className="px-3 py-2 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white inline-flex items-center gap-1.5">
            {downloading === 'csv' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />} Planilha (CSV)
          </button>
          <button onClick={() => download('xml')} disabled={downloading !== null || okCount === 0} className="px-3 py-2 text-xs font-bold rounded bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white inline-flex items-center gap-1.5">
            {downloading === 'xml' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />} XML S-2245 (rascunho)
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      {!loading && (
        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> {okCount} prontos</span>
          {pendCount > 0 && <span className="inline-flex items-center gap-1 text-amber-600"><AlertTriangle className="w-4 h-4" /> {pendCount} com pendência</span>}
        </div>
      )}

      {records.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2">Funcionário</th>
                <th className="py-2">Treinamento</th>
                <th className="py-2">codTreina</th>
                <th className="py-2">Conclusão</th>
                <th className="py-2">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r) => (
                <tr key={r.enrollmentId}>
                  <td className="py-2 font-semibold text-slate-700 dark:text-slate-200">{r.nmTrab}</td>
                  <td className="py-2 text-slate-500">{r.courseCode} — {r.courseName}</td>
                  <td className="py-2 font-mono">{r.codTreiCap ?? '—'}</td>
                  <td className="py-2">{r.dtTreiCap ? new Date(r.dtTreiCap).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'}</td>
                  <td className="py-2">
                    {r.pendencias.length === 0
                      ? <span className="inline-flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Pronto</span>
                      : <span className="inline-flex items-center gap-1 text-amber-600" title={r.pendencias.join(' / ')}><AlertTriangle className="w-3.5 h-3.5" /> {r.pendencias[0]}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && records.length === 0 && !error && (
        <p className="text-xs text-slate-400">Nenhum treinamento eSocial concluído no período. Marque os cursos como "Curso eSocial" na Gestão de Cursos.</p>
      )}

      <p className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
        ⚠️ O XML é um <strong>rascunho</strong> e deve ser validado contra o leiaute vigente do eSocial antes da transmissão. A transmissão ao eSocial é feita pelo empregador (e-CNPJ), no seu sistema de folha.
      </p>
    </div>
  );
}
