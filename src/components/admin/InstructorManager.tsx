/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gestão de Instrutores: cadastra um instrutor (com MTE e CREA) e o associa a
 * um ou mais treinamentos. Lê e grava via /api/admin/instructors.
 */

import React from 'react';
import { Plus, Trash2, Loader2, GraduationCap, BadgeCheck, Check } from 'lucide-react';
import { adminApi, ApiInstructor } from '../../api';
import { Course } from '../../types';

interface InstructorManagerProps {
  courses: Course[];
  onChanged?: () => void;
}

export default function InstructorManager({ courses, onChanged }: InstructorManagerProps) {
  const [instructors, setInstructors] = React.useState<ApiInstructor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [name, setName] = React.useState('');
  const [formation, setFormation] = React.useState('');
  const [mte, setMte] = React.useState('');
  const [crea, setCrea] = React.useState('');
  const [crq, setCrq] = React.useState('');
  const [signatureUrl, setSignatureUrl] = React.useState('');
  const [icpEnabled, setIcpEnabled] = React.useState(true);
  const [courseIds, setCourseIds] = React.useState<string[]>([]);

  const load = React.useCallback(() => {
    setLoading(true);
    adminApi
      .listInstructors()
      .then((d) => setInstructors(Array.isArray(d.instructors) ? d.instructors : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const toggleCourse = (id: string) => {
    setCourseIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !formation.trim()) {
      alert('Informe pelo menos o nome e a formação do instrutor.');
      return;
    }
    if (courseIds.length === 0) {
      alert('Selecione pelo menos um treinamento para associar o instrutor.');
      return;
    }
    setSaving(true);
    try {
      const res = await adminApi.createInstructor({
        name: name.trim(),
        formation: formation.trim(),
        mte: mte.trim() || undefined,
        crea: crea.trim() || undefined,
        crq: crq.trim() || undefined,
        signatureUrl: signatureUrl.trim() || undefined,
        icpEnabled,
        courseIds,
      }) as { instructors: ApiInstructor[] };
      setInstructors(Array.isArray(res.instructors) ? res.instructors : []);
      setName(''); setFormation(''); setMte(''); setCrea(''); setCrq(''); setSignatureUrl(''); setIcpEnabled(true); setCourseIds([]);
      onChanged?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível cadastrar o instrutor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta associação de instrutor ao treinamento?')) return;
    try {
      await adminApi.deleteInstructor(id);
      setInstructors((prev) => prev.filter((i) => i.id !== id));
      onChanged?.();
    } catch { /* ignore */ }
  };

  // Vincular cursos adicionais a um instrutor já cadastrado (reaproveita seus dados).
  const [linkingKey, setLinkingKey] = React.useState<string | null>(null);
  const [linkCourseIds, setLinkCourseIds] = React.useState<string[]>([]);

  const handleLinkCourses = async (head: ApiInstructor) => {
    if (linkCourseIds.length === 0) { alert('Selecione ao menos um curso para vincular.'); return; }
    try {
      const res = await adminApi.createInstructor({
        name: head.name,
        formation: head.formation,
        mte: head.mte ?? undefined,
        crea: head.crea ?? undefined,
        crq: head.crq ?? undefined,
        signatureUrl: head.signatureUrl ?? undefined,
        icpEnabled: head.icpEnabled,
        courseIds: linkCourseIds,
      }) as { instructors: ApiInstructor[] };
      setInstructors(Array.isArray(res.instructors) ? res.instructors : []);
      setLinkingKey(null);
      setLinkCourseIds([]);
      onChanged?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível vincular os cursos.');
    }
  };

  // Agrupa as associações por instrutor (nome + MTE) para uma visão de registro.
  const grouped = React.useMemo(() => {
    const map = new Map<string, ApiInstructor[]>();
    for (const i of instructors) {
      const key = `${i.name}|${i.mte ?? ''}|${i.crea ?? ''}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(i);
    }
    return Array.from(map.values());
  }, [instructors]);

  const inputCls = 'w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Gestão de Instrutores</h2>
        <p className="text-xs text-slate-400">Cadastre instrutores responsáveis e associe-os aos treinamentos. MTE e CREA são impressos no certificado.</p>
      </div>

      {/* Formulário de cadastro */}
      <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-black uppercase tracking-wide">Cadastrar Instrutor</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Nome completo *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Adriano Aparecido Ribas Ricardo" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Formação *</label>
            <input type="text" value={formation} onChange={(e) => setFormation(e.target.value)} placeholder="Ex: Técnico de Segurança do Trabalho" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Registro MTE</label>
            <input type="text" value={mte} onChange={(e) => setMte(e.target.value)} placeholder="Ex: 0124684/SP" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Registro CREA</label>
            <input type="text" value={crea} onChange={(e) => setCrea(e.target.value)} placeholder="Ex: SP-1234567/D" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Registro CRQ</label>
            <input type="text" value={crq} onChange={(e) => setCrq(e.target.value)} placeholder="Ex: 04123456 (4ª Região)" className={inputCls} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">URL da imagem da assinatura (opcional)</label>
            <input type="text" value={signatureUrl} onChange={(e) => setSignatureUrl(e.target.value)} placeholder="https://..." className={inputCls} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
          <input type="checkbox" checked={icpEnabled} onChange={(e) => setIcpEnabled(e.target.checked)} className="accent-emerald-600" />
          Assinar digitalmente o certificado com ICP-Brasil (MP 2.200-2/2001)
        </label>

        {/* Associação a treinamentos */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase block">Associar aos treinamentos *</label>
          <div className="max-h-44 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded p-2 bg-slate-50/50 dark:bg-slate-950 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {courses.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer p-1">
                <input type="checkbox" checked={courseIds.includes(c.id)} onChange={() => toggleCourse(c.id)} className="accent-blue-600" />
                <span className="truncate">{c.code} — {c.name}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setCourseIds(courses.map((c) => c.id))} className="text-[10px] font-bold text-blue-600 hover:underline">Selecionar todos</button>
            <button type="button" onClick={() => setCourseIds([])} className="text-[10px] font-bold text-slate-400 hover:underline">Limpar</button>
          </div>
        </div>

        <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-xs uppercase rounded cursor-pointer select-none">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Cadastrar e Associar
        </button>
      </form>

      {/* Lista de instrutores cadastrados */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-400">Instrutores Cadastrados</h3>
        {loading ? (
          <p className="text-xs text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</p>
        ) : grouped.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">Nenhum instrutor cadastrado ainda.</p>
        ) : (
          grouped.map((rows) => {
            const head = rows[0];
            return (
              <div key={head.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      {head.name}
                      {head.icpEnabled && <BadgeCheck className="w-4 h-4 text-emerald-500" />}
                    </p>
                    <p className="text-[11px] text-amber-600 font-semibold uppercase">{head.formation}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {head.mte ? <span className="mr-3">MTE: <strong>{head.mte}</strong></span> : null}
                      {head.crea ? <span className="mr-3">CREA: <strong>{head.crea}</strong></span> : null}
                      {head.crq ? <span>CRQ: <strong>{head.crq}</strong></span> : null}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {rows.map((r) => (
                    <span key={r.id} className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      {r.course?.code ?? 'Curso'}
                      <button onClick={() => handleDelete(r.id)} className="p-0.5 text-slate-400 hover:text-red-500" title="Remover deste treinamento">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => { setLinkingKey(linkingKey === head.id ? null : head.id); setLinkCourseIds([]); }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-blue-600 border border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Plus className="w-3 h-3" /> Vincular cursos
                  </button>
                </div>

                {/* Seletor de cursos adicionais (apenas os ainda não vinculados) */}
                {linkingKey === head.id && (() => {
                  const linkedIds = new Set(rows.map((r) => r.course?.id).filter(Boolean) as string[]);
                  const available = courses.filter((c) => !linkedIds.has(c.id));
                  return (
                    <div className="pt-2 space-y-2">
                      {available.length === 0 ? (
                        <p className="text-[11px] text-slate-400">Este instrutor já está vinculado a todos os cursos.</p>
                      ) : (
                        <>
                          <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded p-2 bg-slate-50/50 dark:bg-slate-950 grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {available.map((c) => (
                              <label key={c.id} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer p-1">
                                <input
                                  type="checkbox"
                                  checked={linkCourseIds.includes(c.id)}
                                  onChange={() => setLinkCourseIds((p) => p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id])}
                                  className="accent-blue-600"
                                />
                                <span className="truncate">{c.code} — {c.name}</span>
                              </label>
                            ))}
                          </div>
                          <button onClick={() => handleLinkCourses(head)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] uppercase rounded">
                            <Check className="w-3.5 h-3.5" /> Vincular selecionados
                          </button>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
