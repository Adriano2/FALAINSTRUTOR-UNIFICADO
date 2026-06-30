/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gestão de Trilhas por cargo/função. O administrador define cargos (ex.:
 * Eletricista, Operador de Empilhadeira) e os treinamentos (NRs) obrigatórios
 * de cada um. A empresa atribui o cargo aos funcionários e passa a enxergar a
 * trilha de treinamentos exigida e o que já está em dia.
 */

import React from 'react';
import { Loader2, Plus, Trash2, Save, Check, Route } from 'lucide-react';
import { adminApi } from '../../api';
import { Course, JobRole } from '../../types';

interface Props {
  courses: Course[];
}

export default function JobRoleManager({ courses }: Props) {
  const [roles, setRoles] = React.useState<JobRole[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [savedId, setSavedId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    adminApi.jobRoles().then(setRoles).catch(() => {}).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const patch = (id: string, p: Partial<JobRole>) => setRoles((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const toggleCode = (id: string, code: string) => setRoles((prev) => prev.map((x) => {
    if (x.id !== id) return x;
    const has = x.courseCodes.includes(code);
    return { ...x, courseCodes: has ? x.courseCodes.filter((c) => c !== code) : [...x.courseCodes, code] };
  }));

  const save = async (role: JobRole) => {
    setSavingId(role.id);
    try {
      await adminApi.updateJobRole(role.id, {
        name: role.name, description: role.description, courseCodes: role.courseCodes, isActive: role.isActive,
      });
      setSavedId(role.id); setTimeout(() => setSavedId(null), 1800);
    } catch (e) { alert(e instanceof Error ? e.message : 'Falha ao salvar.'); }
    finally { setSavingId(null); }
  };

  const addRole = async () => {
    try {
      await adminApi.createJobRole({ name: 'Novo cargo', description: '', courseCodes: [], isActive: true });
      load();
    } catch (e) { alert(e instanceof Error ? e.message : 'Falha ao criar cargo.'); }
  };
  const removeRole = async (id: string) => {
    if (!confirm('Remover este cargo? Os funcionários vinculados ficarão sem trilha.')) return;
    setRoles((p) => p.filter((x) => x.id !== id));
    await adminApi.deleteJobRole(id).catch(() => load());
  };

  const input = 'w-full text-sm p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none';

  // Cursos ordenados por código para a seleção da trilha.
  const sortedCourses = [...courses].sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2"><Route className="w-5 h-5 text-blue-600" /> Trilhas por Cargo</h2>
          <p className="text-xs text-slate-400">Defina os treinamentos obrigatórios de cada função. A empresa atribui o cargo aos funcionários e acompanha a trilha.</p>
        </div>
        <button onClick={addRole} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded bg-blue-600 hover:bg-blue-700 text-white"><Plus className="w-4 h-4" /> Novo cargo</button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</p>
      ) : roles.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-10 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">Nenhum cargo. Clique em "Novo cargo".</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roles.map((r) => (
            <div key={r.id} className={`bg-white dark:bg-slate-900 border rounded-lg p-4 space-y-3 ${r.isActive ? 'border-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800 opacity-70'}`}>
              <div className="flex items-center gap-2">
                <input value={r.name} onChange={(e) => patch(r.id, { name: e.target.value })} className={`${input} font-bold`} />
                <button onClick={() => removeRole(r.id)} className="p-2 text-slate-400 hover:text-rose-500 shrink-0" title="Remover"><Trash2 className="w-4 h-4" /></button>
              </div>
              <input value={r.description} onChange={(e) => patch(r.id, { description: e.target.value })} placeholder="Descrição curta (opcional)" className={`${input} text-xs`} />
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Treinamentos da trilha ({r.courseCodes.length})</label>
                <div className="mt-1 max-h-52 overflow-y-auto rounded border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedCourses.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input type="checkbox" checked={r.courseCodes.includes(c.code)} onChange={() => toggleCode(r.id, c.code)} />
                      <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0">{c.code}</span>
                      <span className="text-slate-600 dark:text-slate-300 truncate">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={r.isActive} onChange={(e) => patch(r.id, { isActive: e.target.checked })} /> Ativo</label>
                <button onClick={() => save(r)} disabled={savingId === r.id} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded">
                  {savingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedId === r.id ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />} Salvar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
