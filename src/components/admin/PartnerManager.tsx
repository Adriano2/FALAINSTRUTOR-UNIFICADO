/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parceiros White-label: cada parceiro tem marca própria (logo, nome, cores,
 * WhatsApp) aplicada por subdomínio (slug.falainstrutor.com.br).
 */

import React from 'react';
import { Loader2, Plus, Trash2, Save, Check, ExternalLink } from 'lucide-react';
import { adminApi } from '../../api';
import { Partner } from '../../types';

export default function PartnerManager() {
  const [items, setItems] = React.useState<Partner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [savedId, setSavedId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<{ slug: string; name: string }>({ slug: '', name: '' });

  const load = React.useCallback(() => {
    setLoading(true);
    adminApi.partners().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const patch = (id: string, p: Partial<Partner>) => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const create = async () => {
    if (!draft.slug.trim() || !draft.name.trim()) { alert('Informe o subdomínio e o nome do parceiro.'); return; }
    try {
      await adminApi.createPartner({ slug: draft.slug.trim().toLowerCase(), name: draft.name.trim(), isActive: true });
      setDraft({ slug: '', name: '' }); load();
    } catch (e) { alert(e instanceof Error ? e.message : 'Falha ao criar parceiro.'); }
  };
  const save = async (p: Partner) => {
    if (!p.id) return;
    setSavingId(p.id);
    try {
      await adminApi.updatePartner(p.id, { slug: p.slug, name: p.name, logoUrl: p.logoUrl, faviconUrl: p.faviconUrl, primaryColor: p.primaryColor, secondaryColor: p.secondaryColor, whatsappNumber: p.whatsappNumber, email: p.email, phone: p.phone, isActive: p.isActive });
      setSavedId(p.id); setTimeout(() => setSavedId(null), 1800);
    } catch (e) { alert(e instanceof Error ? e.message : 'Falha ao salvar.'); }
    finally { setSavingId(null); }
  };
  const remove = async (p: Partner) => {
    if (!p.id || !confirm(`Remover o parceiro "${p.name}"?`)) return;
    setItems((prev) => prev.filter((x) => x.id !== p.id));
    await adminApi.deletePartner(p.id).catch(() => load());
  };

  const input = 'w-full text-sm p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Parceiros White-label</h2>
        <p className="text-xs text-slate-400">Cada parceiro tem marca própria aplicada por subdomínio. Aponte o DNS do subdomínio para o servidor.</p>
      </div>

      {/* Novo parceiro */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Subdomínio (slug)</label>
          <input value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase() }))} placeholder="consultoriax" className={input} />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do parceiro</label>
          <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Consultoria X" className={input} />
        </div>
        <button onClick={create} className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded"><Plus className="w-4 h-4" /> Adicionar</button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-8 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">Nenhum parceiro cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((p) => {
            const url = `https://${p.slug}.falainstrutor.com.br`;
            return (
              <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <a href={url} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1 truncate"><ExternalLink className="w-3.5 h-3.5" /> {p.slug}.falainstrutor.com.br</a>
                  <button onClick={() => remove(p)} className="p-1.5 text-slate-400 hover:text-rose-500 shrink-0" title="Remover"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase">Nome</label><input value={p.name} onChange={(e) => patch(p.id!, { name: e.target.value })} className={input} /></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase">Subdomínio</label><input value={p.slug} onChange={(e) => patch(p.id!, { slug: e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase() })} className={input} /></div>
                </div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Logo (URL)</label><input value={p.logoUrl ?? ''} onChange={(e) => patch(p.id!, { logoUrl: e.target.value })} placeholder="https://..." className={input} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp</label><input value={p.whatsappNumber ?? ''} onChange={(e) => patch(p.id!, { whatsappNumber: e.target.value })} placeholder="5511999999999" className={input} /></div>
                  <div className="flex items-end gap-3">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer"><input type="checkbox" checked={p.isActive ?? true} onChange={(e) => patch(p.id!, { isActive: e.target.checked })} /> Ativo</label>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400">Cor:</span>
                  <input type="color" value={p.primaryColor ?? '#1E9B46'} onChange={(e) => patch(p.id!, { primaryColor: e.target.value })} className="w-7 h-7 rounded border border-slate-300" />
                  <button onClick={() => save(p)} disabled={savingId === p.id} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs rounded">
                    {savingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedId === p.id ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />} Salvar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
