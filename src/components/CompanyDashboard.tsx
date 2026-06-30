/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Painel da Empresa: o gestor (role 'company') vê apenas a sua empresa — a lista
 * de funcionários e os certificados emitidos por eles. Dados com escopo restrito
 * vindos de /api/company/me.
 */

import React from 'react';
import { Building2, Users, Award, Loader2, ChevronDown, ChevronRight, ShieldCheck, Download, CheckCircle2, Clock, Save, AlertTriangle, FileText, Route, Check } from 'lucide-react';
import { Plus, Trash2 } from 'lucide-react';
import EsocialS2245Panel from './EsocialS2245Panel';
import { companyApi, CompanyDashboardData, AccessSchedule, AccessWindow } from '../api';
import { CIPA_NR5_BY_GRADE, cipaRequirement } from '../lib/cipa';

interface CompanyDashboardProps {
  onValidateCertificate: (code: string) => void;
}

const WEEK = [
  { d: 1, l: 'Seg' }, { d: 2, l: 'Ter' }, { d: 3, l: 'Qua' }, { d: 4, l: 'Qui' },
  { d: 5, l: 'Sex' }, { d: 6, l: 'Sáb' }, { d: 0, l: 'Dom' },
];

// Editor de restrição de horário de acesso (múltiplas faixas) — definido pela empresa.
function AccessScheduleCard({ initial }: { initial?: AccessSchedule }) {
  const seed: AccessWindow[] =
    initial?.windows && initial.windows.length > 0
      ? initial.windows
      : initial?.start || initial?.days
        ? [{ days: initial?.days ?? [1, 2, 3, 4, 5], start: initial?.start ?? '08:00', end: initial?.end ?? '18:00' }]
        : [{ days: [1, 2, 3, 4, 5], start: '08:00', end: '18:00' }];

  const [enabled, setEnabled] = React.useState(!!initial?.enabled);
  const [windows, setWindows] = React.useState<AccessWindow[]>(seed);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState('');

  const update = (i: number, patch: Partial<AccessWindow>) =>
    setWindows((p) => p.map((w, idx) => (idx === i ? { ...w, ...patch } : w)));
  const toggleDay = (i: number, d: number) =>
    update(i, { days: (windows[i].days ?? []).includes(d) ? (windows[i].days ?? []).filter((x) => x !== d) : [...(windows[i].days ?? []), d].sort() });
  const addWindow = () => setWindows((p) => [...p, { days: [1, 2, 3, 4, 5], start: '13:00', end: '18:00' }]);
  const removeWindow = (i: number) => setWindows((p) => p.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true); setStatus('');
    try {
      await companyApi.setAccessSchedule({ enabled, windows });
      setStatus('✓ Restrição de horário salva.');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600"><Clock className="w-5 h-5" /></div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Restrição de horário de acesso</h2>
            <p className="text-xs text-slate-400">Defina uma ou mais faixas (ex.: manhã e tarde, ou horários diferentes por dia). Fora delas, o acesso aos treinamentos é bloqueado (horário de Brasília).</p>
          </div>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="accent-emerald-600 w-4 h-4" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{enabled ? 'Ativa' : 'Desativada'}</span>
        </label>
      </div>

      <div className={`space-y-3 ${enabled ? '' : 'opacity-50 pointer-events-none'}`}>
        {windows.map((w, i) => (
          <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Faixa {i + 1}</span>
              {windows.length > 1 && (
                <button type="button" onClick={() => removeWindow(i)} className="text-rose-500 hover:text-rose-600 inline-flex items-center gap-1 text-[11px] font-bold"><Trash2 className="w-3.5 h-3.5" /> Remover</button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {WEEK.map((wd) => (
                <button key={wd.d} type="button" onClick={() => toggleDay(i, wd.d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${(w.days ?? []).includes(wd.d) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                  {wd.l}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Das</label>
                <input type="time" value={w.start ?? ''} onChange={(e) => update(i, { start: e.target.value })} className="text-sm p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Até</label>
                <input type="time" value={w.end ?? ''} onChange={(e) => update(i, { end: e.target.value })} className="text-sm p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={addWindow} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"><Plus className="w-3.5 h-3.5" /> Adicionar faixa de horário</button>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-xs uppercase rounded cursor-pointer">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar restrição
        </button>
        {status && <span className={`text-xs ${status.startsWith('✓') ? 'text-emerald-600' : 'text-slate-400'}`}>{status}</span>}
      </div>
    </div>
  );
}

export default function CompanyDashboard({ onValidateCertificate }: CompanyDashboardProps) {
  const [data, setData] = React.useState<CompanyDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  const [assigningId, setAssigningId] = React.useState<string | null>(null);

  const reload = React.useCallback(() => {
    return companyApi
      .getDashboard()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar o painel.'));
  }, []);

  React.useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  const assignRole = async (employeeId: string, jobRoleId: string | null) => {
    setAssigningId(employeeId);
    try {
      await companyApi.assignJobRole(employeeId, jobRoleId);
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Falha ao atribuir cargo.');
    } finally {
      setAssigningId(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-32 text-slate-400 text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando painel...</div>;
  }
  if (error || !data) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-slate-500">{error || 'Sem dados.'}</div>;
  }

  const employees = data.employees.filter((e) =>
    !query.trim() || e.name.toLowerCase().includes(query.toLowerCase()) || e.cpf.includes(query) || e.email.toLowerCase().includes(query.toLowerCase()),
  );

  // Status de conformidade de um funcionário em um treinamento obrigatório.
  type CKind = 'valid' | 'expiring' | 'expired' | 'progress' | 'missing';
  const fmtD = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '');
  const statusFor = (emp: typeof data.employees[number], code: string): { kind: CKind; until?: string } => {
    const en = emp.enrollments.find((x) => x.courseCode === code);
    if (!en) return { kind: 'missing' };
    if (en.passed && en.certificateCode && en.released) {
      if (en.expired) return { kind: 'expired', until: en.validUntil ?? undefined };
      if (en.validUntil) {
        const days = Math.ceil((new Date(en.validUntil).getTime() - Date.now()) / 86_400_000);
        if (days <= 60) return { kind: 'expiring', until: en.validUntil };
      }
      return { kind: 'valid', until: en.validUntil ?? undefined };
    }
    return { kind: 'progress' };
  };
  const KIND_LABEL: Record<CKind, string> = { valid: 'Em dia', expiring: 'A vencer', expired: 'Vencido', progress: 'Em andamento', missing: 'Não realizado' };

  // Relatório de auditoria (PDF) — conformidade por funcionário × treinamento.
  const generateAuditPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    let y = 48;
    const line = (txt: string, size = 10, bold = false, color: [number, number, number] = [30, 42, 58]) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
      const wrapped = doc.splitTextToSize(txt, W - 80);
      for (const w of wrapped) { if (y > 800) { doc.addPage(); y = 48; } doc.text(w, 40, y); y += size + 5; }
    };
    doc.setFillColor(31, 42, 68); doc.rect(0, 0, W, 30, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('FalaInstrutor — Relatório de Conformidade SST', 40, 20);
    y = 56;
    line(`Empresa: ${data.company?.name ?? '-'}`, 12, true);
    line(`CNPJ: ${data.company?.cnpj ?? '-'}   •   Grau de risco (NR-04): ${data.company?.riskGrade ?? '-'}`);
    line(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}   •   Funcionários: ${data.stats.registeredEmployees}/${data.stats.declaredEmployees}   •   Conformidade: ${data.stats.compliancePct}%`);
    y += 6;
    line('Treinamentos obrigatórios: ' + (data.obligatory.map((o) => o.code).join(', ') || '-'), 9, false, [100, 116, 139]);
    y += 8;
    for (const emp of data.employees) {
      if (y > 770) { doc.addPage(); y = 48; }
      line(`${emp.name}  —  CPF ${emp.cpf}`, 10.5, true);
      for (const o of data.obligatory) {
        const s = statusFor(emp, o.code);
        const extra = (s.kind === 'valid' || s.kind === 'expiring') && s.until ? ` (válido até ${fmtD(s.until)})` : s.kind === 'expired' && s.until ? ` (venceu ${fmtD(s.until)})` : '';
        line(`   • ${o.code} — ${KIND_LABEL[s.kind]}${extra}`, 9.5, false, s.kind === 'valid' ? [22, 163, 74] : s.kind === 'expired' || s.kind === 'missing' ? [225, 29, 72] : [202, 138, 4]);
      }
      y += 4;
    }
    line('Observação: baseline conforme grau de risco (NR-04). Não substitui o PGR/análise de riscos da empresa.', 8, false, [100, 116, 139]);
    doc.save(`conformidade-${(data.company?.name ?? 'empresa').replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      {/* Cabeçalho da empresa */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-blue-600/10 text-blue-600"><Building2 className="w-7 h-7" /></div>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">{data.company?.name ?? 'Minha Empresa'}</h1>
          <p className="text-xs text-slate-400 truncate">
            {data.company?.cnpj ? `CNPJ ${data.company.cnpj}` : 'Painel corporativo'}
            {data.company?.riskGrade ? ` • Grau de risco ${data.company.riskGrade} (NR-04)` : ''}
            {data.company?.cnae ? ` • CNAE ${data.company.cnae}` : ''}
          </p>
        </div>
      </div>

      {/* Restrição de horário de acesso aos treinamentos */}
      <AccessScheduleCard initial={data.company?.accessSchedule} />

      {/* Indicadores: total de funcionários vs. concluíram os obrigatórios */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full"><Users className="w-5 h-5" /></div>
          <div>
            <span className="text-[10px] text-slate-450 uppercase font-black block">Total funcionários</span>
            <strong className="text-lg font-extrabold text-slate-900 dark:text-white">{data.stats.declaredEmployees}</strong>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <span className="text-[10px] text-slate-450 uppercase font-black block">Concluíram obrigatórios</span>
            <strong className="text-lg font-extrabold text-slate-900 dark:text-white">{data.stats.compliant}<span className="text-xs text-slate-400 font-bold"> / {data.stats.declaredEmployees}</span></strong>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full"><Award className="w-5 h-5" /></div>
          <div>
            <span className="text-[10px] text-slate-450 uppercase font-black block">Conformidade</span>
            <strong className="text-lg font-extrabold text-slate-900 dark:text-white">{data.stats.compliancePct}%</strong>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-full"><ShieldCheck className="w-5 h-5" /></div>
          <div>
            <span className="text-[10px] text-slate-450 uppercase font-black block">Cadastrados / Certificados</span>
            <strong className="text-lg font-extrabold text-slate-900 dark:text-white">{data.stats.registeredEmployees} / {data.stats.certificates}</strong>
          </div>
        </div>
      </div>

      {/* Barra de conformidade */}
      <div className="mb-6">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>Funcionários em conformidade com os treinamentos obrigatórios</span>
          <span className="font-bold">{data.stats.compliancePct}%</span>
        </div>
        <div className="w-full bg-slate-150 dark:bg-slate-800 rounded-full h-3">
          <div className={`h-3 rounded-full ${data.stats.compliancePct >= 100 ? 'bg-emerald-500' : data.stats.compliancePct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(100, data.stats.compliancePct)}%` }} />
        </div>
      </div>

      {/* Treinamentos obrigatórios (NR-04) e quantos concluíram */}
      {data.obligatory.length > 0 && (
        <div className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <h3 className="text-xs font-black uppercase text-slate-500 mb-3">Treinamentos obrigatórios pelo grau de risco</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.obligatory.map((o) => {
              const total = data.stats.declaredEmployees || 1;
              const pct = Math.round((o.completed / total) * 100);
              return (
                <div key={o.code} className="p-2.5 rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                      {o.code} — {o.name}
                      {o.workload ? <span className="ml-1.5 font-bold text-blue-600">· {o.workload}h</span> : null}
                    </span>
                    <span className="text-slate-400 shrink-0 ml-2">{o.completed}/{data.stats.declaredEmployees}</span>
                  </div>
                  <div className="w-full bg-slate-150 dark:bg-slate-800 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, pct)}%` }} /></div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 mt-3">Baseline conforme o grau de risco (NR-04). Não substitui a análise de riscos (PGR) da empresa.</p>
        </div>
      )}

      {/* Matriz de conformidade (funcionário × treinamento obrigatório) + relatório */}
      {data.obligatory.length > 0 && employees.length > 0 && (
        <div className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase text-slate-500">Matriz de conformidade</h3>
            <button onClick={generateAuditPdf} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded cursor-pointer">
              <FileText className="w-3.5 h-3.5" /> Relatório de auditoria (PDF)
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 sticky left-0 bg-slate-50 dark:bg-slate-950">Funcionário</th>
                  {data.obligatory.map((o) => <th key={o.code} className="p-2.5 text-center whitespace-nowrap">{o.code}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                    <td className="p-2.5 font-bold text-slate-800 dark:text-slate-150 sticky left-0 bg-white dark:bg-slate-900 whitespace-nowrap">{emp.name}</td>
                    {data.obligatory.map((o) => {
                      const s = statusFor(emp, o.code);
                      const cls = s.kind === 'valid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : s.kind === 'expiring' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : s.kind === 'expired' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                        : s.kind === 'progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800';
                      const icon = s.kind === 'valid' ? <CheckCircle2 className="w-3 h-3" /> : s.kind === 'expired' ? <AlertTriangle className="w-3 h-3" /> : s.kind === 'expiring' ? <Clock className="w-3 h-3" /> : null;
                      return (
                        <td key={o.code} className="p-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold ${cls}`} title={s.until ? `Validade: ${fmtD(s.until)}` : KIND_LABEL[s.kind]}>
                            {icon}{KIND_LABEL[s.kind]}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 flex flex-wrap gap-3 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <span className="text-emerald-600 font-bold">● Em dia</span>
            <span className="text-amber-600 font-bold">● A vencer (≤60d)</span>
            <span className="text-rose-600 font-bold">● Vencido</span>
            <span className="text-blue-600 font-bold">● Em andamento</span>
            <span className="font-bold">● Não realizado</span>
          </div>
        </div>
      )}

      {/* Regra de carga horária da CIPA (NR-5) por grau de risco */}
      <div className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
        <h3 className="text-xs font-black uppercase text-slate-500 mb-2">Treinamento da CIPA (NR-5) — carga horária por grau de risco</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
          A exigência de carga horária por grau de risco (1 a 4) refere-se especificamente ao <strong>treinamento da CIPA (NR-5)</strong>.
          Com as atualizações da NR-5, alinhadas ao Anexo II da NR-1, o treinamento pode ser <strong>semipresencial (híbrido)</strong>.
          Para empresas de maior risco (graus 3 e 4), parte da carga horária é <strong>obrigatoriamente presencial</strong>.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-100 dark:border-slate-800 rounded">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-2">Grau de risco</th>
                <th className="p-2 text-center">Carga horária total</th>
                <th className="p-2 text-center">Mínimo presencial</th>
                <th className="p-2 text-center">Pode ser EaD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[1, 2, 3, 4].map((g) => {
                const r = CIPA_NR5_BY_GRADE[g];
                const isCompany = data.company?.riskGrade === g;
                return (
                  <tr key={g} className={isCompany ? 'bg-blue-500/10 font-bold' : ''}>
                    <td className="p-2 text-slate-700 dark:text-slate-200">Grau {g}{isCompany ? ' — sua empresa' : ''}</td>
                    <td className="p-2 text-center">{r.total} horas</td>
                    <td className="p-2 text-center">{r.presencial > 0 ? `${r.presencial} horas` : '—'}</td>
                    <td className="p-2 text-center">{r.ead} horas</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {data.company?.riskGrade ? (
          (() => {
            const r = cipaRequirement(data.company.riskGrade);
            if (!r) return null;
            return (
              <div className="mt-3 p-3 rounded bg-emerald-500/5 border border-emerald-500/15 text-[11px] text-slate-600 dark:text-slate-300">
                <strong className="text-emerald-700 dark:text-emerald-400">Sua empresa (grau {r.grade}):</strong> o treinamento da CIPA deve ter
                <strong> {r.total} horas no total</strong>{r.presencial > 0 ? <>, sendo <strong>no mínimo {r.presencial} horas presenciais</strong> e até {r.ead} horas em EaD.</> : <>, podendo ser realizadas integralmente em EaD ({r.ead} horas).</>}
              </div>
            );
          })()
        ) : (
          <p className="mt-3 text-[11px] text-amber-600">Defina o grau de risco da empresa (NR-04) para ver a exigência específica da CIPA.</p>
        )}
      </div>

      {/* Busca */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar funcionário por nome, CPF ou e-mail..."
        className="w-full mb-4 text-sm p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
      />

      {/* Lista de funcionários */}
      <div className="space-y-2">
        {employees.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            Nenhum funcionário vinculado à empresa ainda. Solicite ao administrador o vínculo dos colaboradores.
          </p>
        ) : (
          employees.map((emp) => {
            const certs = emp.enrollments.filter((e) => e.passed && e.certificateCode);
            const open = openId === emp.id;
            return (
              <div key={emp.id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : emp.id)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-850/40"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{emp.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">CPF {emp.cpf} • {emp.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase">{certs.length} cert.</span>
                    {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {open && (
                  <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800">
                    {/* Trilha por cargo/função */}
                    <div className="mt-3 mb-2 rounded-lg bg-slate-50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800 p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Route className="w-4 h-4 text-blue-600" />
                        <span className="text-[11px] font-black uppercase text-slate-500">Cargo / função</span>
                        <select
                          value={emp.jobRoleId ?? ''}
                          disabled={assigningId === emp.id}
                          onChange={(e) => assignRole(emp.id, e.target.value || null)}
                          className="text-xs p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-60"
                        >
                          <option value="">Sem cargo definido</option>
                          {(data.jobRoles ?? []).map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                        {assigningId === emp.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                      </div>
                      {emp.trilha && emp.trilha.items.length > 0 ? (
                        <div className="mt-2">
                          {(() => {
                            const doneCount = emp.trilha!.items.filter((it) => it.done).length;
                            const total = emp.trilha!.items.length;
                            const pct = Math.round((doneCount / total) * 100);
                            return (
                              <>
                                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                                  <span className="font-bold">Trilha: {emp.trilha!.roleName}</span>
                                  <span>{doneCount}/{total} em dia ({pct}%)</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {emp.trilha!.items.map((it) => (
                                    <span
                                      key={it.code}
                                      title={it.name}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${it.done ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}
                                    >
                                      {it.done ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />} {it.code}
                                    </span>
                                  ))}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ) : emp.jobRoleId ? (
                        <p className="mt-2 text-[11px] text-slate-400">Este cargo não tem treinamentos cadastrados na trilha.</p>
                      ) : (
                        <p className="mt-2 text-[11px] text-slate-400">Defina um cargo para acompanhar a trilha de treinamentos obrigatórios.</p>
                      )}
                    </div>
                    {certs.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">Nenhum certificado emitido ainda.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left mt-2">
                          <thead className="text-slate-400 uppercase text-[10px]">
                            <tr>
                              <th className="py-2">Treinamento</th>
                              <th className="py-2 text-center">Nota</th>
                              <th className="py-2">Código</th>
                              <th className="py-2 text-right">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {certs.map((c, i) => (
                              <tr key={i}>
                                <td className="py-2 font-semibold text-slate-700 dark:text-slate-200">{c.courseCode} — {c.courseName}</td>
                                <td className="py-2 text-center font-bold">{c.score ?? '—'}%</td>
                                <td className="py-2"><span className="font-mono text-emerald-600 select-all">{c.certificateCode}</span></td>
                                <td className="py-2 text-right">
                                  <button
                                    onClick={() => onValidateCertificate(c.certificateCode!)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" /> Ver / validar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <p className="mt-6 text-[11px] text-slate-400 flex items-center gap-1">
        <Download className="w-3.5 h-3.5" /> Para baixar um certificado em PDF, clique em "Ver / validar" e use a opção de download na validação.
      </p>

      <EsocialS2245Panel />
    </div>
  );
}
