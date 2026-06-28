/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gestão Pedagógica (admin): monitora o progresso dos alunos em tempo real —
 * minutagem assistida por treinamento, logs de acesso (login), notas, datas de
 * conclusão e a hora de emissão do certificado (liberação da prova pelo instrutor).
 */

import React from 'react';
import { Loader2, RefreshCw, GraduationCap, Clock, Activity, ScrollText, Download, Search, Building2, ShieldX, Ban, Check } from 'lucide-react';
import { pedagogicalApi, PedagogicalRow, PedagogicalLogin, PedagogicalAccessWindow, AccessSchedule, adminApi } from '../../api';

const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
// Texto legível da janela de acesso de uma empresa.
const describeSchedule = (s: AccessSchedule): string => {
  const windows = s.windows && s.windows.length ? s.windows : [{ days: s.days, start: s.start, end: s.end }];
  return windows
    .map((w) => {
      const days = w.days && w.days.length ? w.days.slice().sort().map((d) => DOW[d]).join('/') : 'Todos os dias';
      const time = w.start && w.end ? ` ${w.start}–${w.end}` : '';
      return `${days}${time}`;
    })
    .join('; ');
};

const fmtDateTime = (iso: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Converte segundos em "Xh Ymin" / "Ymin" / "Zs".
const fmtDuration = (sec: number): string => {
  if (!sec || sec <= 0) return '0 min';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m} min`;
  return `${sec}s`;
};

export default function PedagogicalMonitor() {
  const [rows, setRows] = React.useState<PedagogicalRow[]>([]);
  const [logins, setLogins] = React.useState<PedagogicalLogin[]>([]);
  const [accessWindows, setAccessWindows] = React.useState<PedagogicalAccessWindow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updatedAt, setUpdatedAt] = React.useState<Date | null>(null);
  const [auto, setAuto] = React.useState(true);
  const [q, setQ] = React.useState('');
  const [tab, setTab] = React.useState<'alunos' | 'logs'>('alunos');

  const load = React.useCallback(async () => {
    try {
      const data = await pedagogicalApi.load();
      setRows(data.rows ?? []);
      setLogins(data.logins ?? []);
      setAccessWindows(data.accessWindows ?? []);
      setUpdatedAt(new Date());
    } catch { /* mantém os dados anteriores */ }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  // Revogação (etapa 2 — definitiva, só admin) e rejeição da solicitação.
  const revoke = async (r: PedagogicalRow) => {
    if (!window.confirm(`REVOGAR DEFINITIVAMENTE o certificado de ${r.studentName} (${r.courseCode})?\nO certificado deixará de ser válido na validação pública. Esta ação é permanente.`)) return;
    try { await adminApi.revokeCertificate(r.id); await load(); } catch (e) { alert(e instanceof Error ? e.message : 'Falha ao revogar.'); }
  };
  const rejectRevocation = async (r: PedagogicalRow) => {
    try { await adminApi.rejectRevocation(r.id); await load(); } catch (e) { alert(e instanceof Error ? e.message : 'Falha ao rejeitar.'); }
  };

  // Monitoramento "em tempo real": atualiza a cada 30s quando ligado.
  React.useEffect(() => {
    if (!auto) return;
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [auto, load]);

  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return r.studentName.toLowerCase().includes(s) || r.courseCode.toLowerCase().includes(s) || r.courseName.toLowerCase().includes(s) || (r.studentCpf ?? '').includes(s);
  });

  const stats = {
    alunos: new Set(rows.map((r) => r.studentEmail)).size,
    matriculas: rows.length,
    concluidos: rows.filter((r) => r.passed).length,
    certificados: rows.filter((r) => r.released && r.certificateCode).length,
    horas: Math.round(rows.reduce((a, r) => a + (r.watchedSeconds || 0), 0) / 360) / 10,
  };

  const exportCsv = () => {
    const head = ['Aluno', 'CPF', 'E-mail', 'Treinamento', 'Progresso(%)', 'Minutagem', '1º Acesso', 'Início Prova', 'Fim Prova', 'Nota(%)', 'Aprovado', 'Liberado', 'Emissão Certificado', 'Certificado'];
    const lines = filtered.map((r) => [
      r.studentName, r.studentCpf, r.studentEmail, `${r.courseCode} - ${r.courseName}`, r.progress,
      fmtDuration(r.watchedSeconds), fmtDateTime(r.firstAccessAt), fmtDateTime(r.examStartedAt), fmtDateTime(r.examFinishedAt),
      r.examScore ?? '', r.passed ? 'Sim' : 'Não', r.released ? 'Sim' : 'Não', fmtDateTime(r.releasedAt), r.certificateCode ?? '',
    ].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'));
    const blob = new Blob(['﻿' + [head.join(';'), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'gestao_pedagogica.csv'; a.click();
    URL.revokeObjectURL(a.href);
  };

  const th = 'text-left p-2 font-black uppercase text-[9px] text-slate-400 tracking-wide whitespace-nowrap';
  const td = 'p-2 text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" /> Gestão Pedagógica
          </h2>
          <p className="text-xs text-slate-400">Monitore o progresso dos alunos em tempo real: minutagem assistida, logs de acesso, notas, conclusão e emissão do certificado.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">{updatedAt ? `Atualizado ${updatedAt.toLocaleTimeString('pt-BR')}` : ''}</span>
          <button onClick={() => setAuto((v) => !v)} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold border ${auto ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
            <Activity className="w-3.5 h-3.5" /> Tempo real {auto ? 'ON' : 'OFF'}
          </button>
          <button onClick={load} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white"><RefreshCw className="w-3.5 h-3.5" /> Atualizar</button>
        </div>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { l: 'Alunos', v: stats.alunos },
          { l: 'Matrículas', v: stats.matriculas },
          { l: 'Aprovados', v: stats.concluidos },
          { l: 'Certificados', v: stats.certificados },
          { l: 'Horas assistidas', v: `${stats.horas}h` },
        ].map((c) => (
          <div key={c.l} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
            <p className="text-[10px] font-bold uppercase text-slate-400">{c.l}</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{c.v}</p>
          </div>
        ))}
      </div>

      {/* Solicitações de revogação pendentes (etapa 2: admin decide) */}
      {rows.some((r) => r.revocationRequested && !r.revoked) && (
        <div className="bg-rose-50 dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 rounded-lg p-4">
          <p className="text-[11px] font-black uppercase text-rose-700 dark:text-rose-400 flex items-center gap-1.5 mb-2"><ShieldX className="w-4 h-4" /> Solicitações de revogação pendentes</p>
          <div className="space-y-2">
            {rows.filter((r) => r.revocationRequested && !r.revoked).map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-2">
                <div className="text-[11px] min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white">{r.studentName}</span>
                  <span className="text-slate-400"> · {r.courseCode} · {r.certificateCode}</span>
                  <div className="text-slate-500 dark:text-slate-400">Motivo: {r.revocationReason || '—'} <span className="text-slate-400">(solicitado por {r.revocationRequestedBy || '—'})</span></div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => revoke(r)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white"><Ban className="w-3.5 h-3.5" /> Revogar definitivamente</button>
                  <button onClick={() => rejectRevocation(r)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200"><Check className="w-3.5 h-3.5" /> Manter (rejeitar)</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Janelas de acesso por empresa (restrição de horário) */}
      {accessWindows.length > 0 && (
        <div className="bg-amber-50 dark:bg-slate-900 border border-amber-100 dark:border-slate-800 rounded-lg p-4">
          <p className="text-[11px] font-black uppercase text-amber-700 dark:text-amber-500 flex items-center gap-1.5 mb-2"><Clock className="w-4 h-4" /> Restrições de horário ativas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {accessWindows.map((c, i) => (
              <div key={i} className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-blue-600" /> {c.name}</span>
                <span className="text-slate-500 dark:text-slate-400">{describeSchedule(c.schedule)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Abas internas */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setTab('alunos')} className={`px-3 py-2 text-xs font-bold border-b-2 -mb-px ${tab === 'alunos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>Progresso dos Alunos</button>
        <button onClick={() => setTab('logs')} className={`px-3 py-2 text-xs font-bold border-b-2 -mb-px flex items-center gap-1.5 ${tab === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}><ScrollText className="w-3.5 h-3.5" /> Logs de acesso</button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</p>
      ) : tab === 'alunos' ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por aluno, CPF ou treinamento" className="w-full text-xs pl-8 pr-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none" />
            </div>
            <button onClick={exportCsv} className="inline-flex items-center gap-1.5 px-3 py-2 rounded text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"><Download className="w-3.5 h-3.5" /> Exportar CSV</button>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/60">
                <tr>
                  <th className={th}>Aluno</th>
                  <th className={th}>Treinamento</th>
                  <th className={th}>Progresso</th>
                  <th className={th}><Clock className="w-3 h-3 inline" /> Minutagem</th>
                  <th className={th}>1º Acesso</th>
                  <th className={th}>Prova (início → fim)</th>
                  <th className={th}>Nota</th>
                  <th className={th}>Situação</th>
                  <th className={th}>Certificado (emissão)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td className="p-4 text-center text-xs text-slate-400" colSpan={9}>Nenhuma matrícula encontrada.</td></tr>
                ) : filtered.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className={td}>
                      <div className="font-bold text-slate-900 dark:text-white">{r.studentName}</div>
                      <div className="text-[10px] text-slate-400">{r.studentCpf}</div>
                    </td>
                    <td className={td}><span className="font-bold">{r.courseCode}</span></td>
                    <td className={td}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${r.progress}%` }} /></div>
                        <span>{r.progress}%</span>
                      </div>
                    </td>
                    <td className={td}><span className="font-bold text-slate-900 dark:text-white">{fmtDuration(r.watchedSeconds)}</span></td>
                    <td className={td}>{fmtDateTime(r.firstAccessAt)}</td>
                    <td className={td}>{fmtDateTime(r.examStartedAt)} → {fmtDateTime(r.examFinishedAt)}</td>
                    <td className={td}>{r.examScore != null ? `${r.examScore}%` : '—'}</td>
                    <td className={td}>
                      {r.revoked ? <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-600 font-bold text-[10px]">Revogado</span>
                        : r.revocationRequested ? <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold text-[10px]">Revog. solicitada</span>
                        : r.released && r.certificateCode ? <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-bold text-[10px]">Certificado emitido</span>
                        : r.passed ? <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 font-bold text-[10px]">Aguardando liberação</span>
                        : <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 font-bold text-[10px]">Em andamento</span>}
                    </td>
                    <td className={td}>
                      {r.certificateCode ? (
                        <div>
                          <div className="font-mono text-[10px]">{r.certificateCode}</div>
                          <div className="text-[10px] text-slate-400">{r.released ? fmtDateTime(r.releasedAt) : 'pendente'}</div>
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr><th className={th}>Aluno</th><th className={th}>E-mail</th><th className={th}>Hora do login</th><th className={th}>Dispositivo</th></tr>
            </thead>
            <tbody>
              {logins.length === 0 ? (
                <tr><td className="p-4 text-center text-xs text-slate-400" colSpan={4}>Nenhum acesso registrado ainda.</td></tr>
              ) : logins.map((l, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                  <td className={td}><span className="font-bold text-slate-900 dark:text-white">{l.userName}</span></td>
                  <td className={td}>{l.userEmail}</td>
                  <td className={td}>{fmtDateTime(l.loginAt)}</td>
                  <td className={`${td} max-w-[260px] truncate`} title={l.userAgent ?? ''}>{l.userAgent ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
