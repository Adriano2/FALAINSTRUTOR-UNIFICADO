/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Aba "Arquivos" do painel administrativo. Reúne:
 *  - Responsável Técnico dos treinamentos (editável; reflete no Projeto Pedagógico).
 *  - Repositório de documentos (CREA, ART, contratos, modelos...) por URL.
 *
 * Persistência via SiteContent: 'tech_responsible' (1 item) e 'admin_files' (lista).
 */

import React from 'react';
import { Loader2, Plus, Trash2, FileText, ExternalLink, Save, BadgeCheck, FolderArchive } from 'lucide-react';
import { adminApi } from '../../api';

interface DocItem { id: string; name: string; category?: string; url: string; date?: string }
interface TechResp { name: string; title: string; register: string; document?: string; fileUrl?: string }

const EMPTY_TECH: TechResp = { name: '', title: '', register: '', document: '', fileUrl: '' };

export default function FileManager() {
  const [loading, setLoading] = React.useState(true);
  const [savingTech, setSavingTech] = React.useState(false);
  const [tech, setTech] = React.useState<TechResp>(EMPTY_TECH);
  const [files, setFiles] = React.useState<DocItem[]>([]);
  const [form, setForm] = React.useState<{ name: string; category: string; url: string }>({ name: '', category: '', url: '' });

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([adminApi.getContent('tech_responsible'), adminApi.getContent('admin_files')])
      .then(([t, f]) => {
        if (Array.isArray(t) && t[0]) setTech({ ...EMPTY_TECH, ...t[0] });
        setFiles(Array.isArray(f) ? f : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const saveTech = async () => {
    if (!tech.name.trim()) { alert('Informe o nome do responsável técnico.'); return; }
    setSavingTech(true);
    try {
      await adminApi.saveContent('tech_responsible', [tech]);
      alert('Responsável técnico salvo! Já aparece no Projeto Pedagógico.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      setSavingTech(false);
    }
  };

  const persistFiles = async (list: DocItem[]) => {
    setFiles(list);
    await adminApi.saveContent('admin_files', list).catch(() => load());
  };
  const addFile = async () => {
    if (!form.name.trim() || !form.url.trim()) { alert('Informe o nome e a URL do arquivo.'); return; }
    const item: DocItem = {
      id: `doc-${Date.now()}`,
      name: form.name.trim(), category: form.category.trim() || 'Documento',
      url: form.url.trim(), date: new Date().toISOString().split('T')[0],
    };
    await persistFiles([item, ...files]);
    setForm({ name: '', category: '', url: '' });
  };
  const removeFile = async (id: string) => {
    if (!confirm('Remover este arquivo da lista?')) return;
    await persistFiles(files.filter((f) => f.id !== id));
  };

  const inputCls = 'w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none';

  if (loading) return <p className="text-xs text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2"><FolderArchive className="w-5 h-5 text-amber-500" /> Arquivos</h2>
        <p className="text-xs text-slate-400">Responsável técnico dos treinamentos e repositório de documentos (CREA, ART, contratos...).</p>
      </div>

      {/* Responsável Técnico */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
          <BadgeCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-black uppercase tracking-wide">Responsável Técnico dos treinamentos</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Nome *</label>
            <input className={inputCls} value={tech.name} onChange={(e) => setTech({ ...tech, name: e.target.value })} placeholder="Ex: Magnus Leandro de Souza" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Título / Formação</label>
            <input className={inputCls} value={tech.title} onChange={(e) => setTech({ ...tech, title: e.target.value })} placeholder="Ex: Engenheiro de Segurança do Trabalho" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Registro (CREA/MTE/CRQ)</label>
            <input className={inputCls} value={tech.register} onChange={(e) => setTech({ ...tech, register: e.target.value })} placeholder="Ex: CREA-SP 5070766148" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Documento (CPF)</label>
            <input className={inputCls} value={tech.document ?? ''} onChange={(e) => setTech({ ...tech, document: e.target.value })} placeholder="Ex: 221.761.998-55" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Documento comprobatório (URL — ex.: CREA)</label>
            <input className={inputCls} value={tech.fileUrl ?? ''} onChange={(e) => setTech({ ...tech, fileUrl: e.target.value })} placeholder="/arquivos/CREA-....pdf" />
          </div>
        </div>
        <button onClick={saveTech} disabled={savingTech} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs uppercase rounded cursor-pointer">
          {savingTech ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar responsável técnico
        </button>
      </div>

      {/* Documentos */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-black uppercase tracking-wide">Documentos</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome (ex: CREA — Magnus)" />
          <input className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Categoria (ex: ART, Contrato)" />
          <input className={inputCls} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="URL do arquivo" />
        </div>
        <button onClick={addFile} className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] uppercase rounded cursor-pointer">
          <Plus className="w-4 h-4" /> Adicionar documento
        </button>

        {files.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">Nenhum documento salvo ainda.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-3 py-2.5">
                <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{f.name}</p>
                  <p className="text-[11px] text-slate-400">{f.category}{f.date ? ` · ${f.date}` : ''}</p>
                </div>
                <a href={f.url} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:text-blue-700" title="Abrir"><ExternalLink className="w-4 h-4" /></a>
                <button onClick={() => removeFile(f.id)} className="p-2 text-slate-400 hover:text-red-500" title="Remover"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
