/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gerenciador genérico de conteúdo do site (notícias, parceiros, páginas,
 * produtos, e-mails). Lê e grava listas JSON no banco via /api/admin/content.
 */

import React from 'react';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { adminApi } from '../../api';

export interface ContentField {
  name: string;
  label: string;
  type?: 'text' | 'textarea';
  placeholder?: string;
}

interface ContentManagerProps {
  title: string;
  description: string;
  contentKey: string;
  fields: ContentField[];
}

export default function ContentManager({ title, description, contentKey, fields }: ContentManagerProps) {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [draft, setDraft] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    adminApi
      .getContent(contentKey)
      .then((d) => { if (alive) setItems(Array.isArray(d) ? d : []); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [contentKey]);

  const persist = async (next: any[]) => {
    setItems(next);
    setSaving(true);
    try { await adminApi.saveContent(contentKey, next); } catch { /* ignore */ }
    setSaving(false);
  };

  const addItem = () => {
    const hasValue = fields.some((f) => (draft[f.name] || '').trim());
    if (!hasValue) return;
    persist([...items, { id: 'c' + Date.now(), ...draft }]);
    setDraft({});
  };

  const removeItem = (id: string) => persist(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
        {saving && <span className="text-[11px] text-amber-500 font-bold flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</span>}
      </div>

      {/* Formulário de novo item */}
      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-100 dark:border-slate-800 space-y-3">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Adicionar item</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={draft[f.name] || ''}
                  onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full text-xs p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={draft[f.name] || ''}
                  onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full text-xs p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded cursor-pointer select-none"
        >
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {/* Lista de itens */}
      {loading ? (
        <p className="text-xs text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">Nenhum item cadastrado ainda.</p>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-start justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800">
              <div className="min-w-0 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white truncate">{it[fields[0].name] || it.title || it.name || '(sem título)'}</p>
                {fields.slice(1).map((f) => it[f.name] ? (
                  <p key={f.name} className="text-[11px] text-slate-500 line-clamp-2"><span className="font-semibold">{f.label}:</span> {it[f.name]}</p>
                ) : null)}
              </div>
              <button onClick={() => removeItem(it.id)} className="p-1.5 text-slate-400 hover:text-red-500 shrink-0" title="Remover">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-slate-400 flex items-center gap-1"><Save className="w-3 h-3" /> As alterações são salvas automaticamente no banco.</p>
    </div>
  );
}
