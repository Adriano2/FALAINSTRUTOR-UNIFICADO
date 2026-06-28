/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gerenciador de Slides (admin): edita o deck de slides de cada treinamento
 * (título + tópicos) e salva no banco. O aluno passa a ver esses slides na aba
 * "Apresentação de Slides". Sem precisar de código.
 */

import React from 'react';
import { Presentation, Plus, Trash2, ChevronUp, ChevronDown, Save, Loader2, Download, Check } from 'lucide-react';
import { Course } from '../../types';
import { adminApi } from '../../api';
import { SLIDES_BY_CODE } from '../../data';

type Slide = { title: string; bullets: string[] };

interface SlideManagerProps {
  courses: Course[];
  onSaved?: () => void;
  // Função de salvar (admin por padrão; o painel do instrutor passa a sua).
  onSave?: (courseId: string, slides: Slide[]) => Promise<unknown>;
}

export default function SlideManager({ courses, onSaved, onSave }: SlideManagerProps) {
  const saveFn = onSave ?? ((id: string, s: Slide[]) => adminApi.saveSlides(id, s));
  const [courseId, setCourseId] = React.useState<string>(courses[0]?.id || '');
  const [slides, setSlides] = React.useState<Slide[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  const selected = courses.find((c) => c.id === courseId);

  // Ao trocar de curso, carrega os slides salvos (ou o modelo estático como base).
  React.useEffect(() => {
    const c = courses.find((x) => x.id === courseId);
    const fromDb = c?.slides && c.slides.length > 0 ? c.slides : (c ? SLIDES_BY_CODE[c.code] : undefined);
    setSlides(fromDb ? JSON.parse(JSON.stringify(fromDb)) : []);
    setSavedAt(null);
  }, [courseId, courses]);

  const update = (i: number, patch: Partial<Slide>) => setSlides((p) => p.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const addSlide = () => setSlides((p) => [...p, { title: 'Novo slide', bullets: ['Tópico 1'] }]);
  const removeSlide = (i: number) => setSlides((p) => p.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => setSlides((p) => {
    const j = i + dir;
    if (j < 0 || j >= p.length) return p;
    const next = [...p];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
  const loadTemplate = () => {
    if (!selected) return;
    const deck = SLIDES_BY_CODE[selected.code];
    if (!deck || deck.length === 0) { alert('Não há modelo padrão para este curso.'); return; }
    if (slides.length > 0 && !confirm('Isso substituirá os slides atuais pelo modelo padrão. Continuar?')) return;
    setSlides(JSON.parse(JSON.stringify(deck)));
  };

  const save = async () => {
    if (!courseId) return;
    // Normaliza e valida.
    const clean = slides
      .map((s) => ({ title: s.title.trim(), bullets: s.bullets.map((b) => b.trim()).filter(Boolean) }))
      .filter((s) => s.title || s.bullets.length > 0);
    for (let i = 0; i < clean.length; i++) {
      if (!clean[i].title) { alert(`O slide ${i + 1} está sem título.`); return; }
      if (clean[i].bullets.length === 0) { alert(`O slide ${i + 1} (“${clean[i].title}”) está sem tópicos.`); return; }
    }
    setSaving(true);
    try {
      await saveFn(courseId, clean);
      setSavedAt(Date.now());
      onSaved?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Não foi possível salvar os slides.');
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full text-sm p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <Presentation className="w-5 h-5 text-blue-600" /> Gerenciador de Slides
        </h2>
        <p className="text-xs text-slate-400">Edite o deck de slides de cada treinamento (título + tópicos). Salvo no banco — aparece para o aluno na aba “Apresentação de Slides”.</p>
      </div>

      {/* Seleção de curso + ações */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Treinamento</label>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={inputCls}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} — {c.name} {c.slides && c.slides.length > 0 ? `(${c.slides.length} slides)` : '(sem slides)'}</option>
            ))}
          </select>
        </div>
        <button onClick={loadTemplate} className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[11px] uppercase rounded cursor-pointer">
          <Download className="w-4 h-4" /> Modelo padrão
        </button>
      </div>

      {/* Lista de slides */}
      <div className="space-y-3">
        {slides.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">Nenhum slide. Clique em “Adicionar slide” ou “Modelo padrão”.</p>
        ) : slides.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Slide {i + 1}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30" title="Mover para cima"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => move(i, 1)} disabled={i === slides.length - 1} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30" title="Mover para baixo"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => removeSlide(i)} className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30" title="Remover slide"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Título do slide</label>
              <input value={s.title} onChange={(e) => update(i, { title: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tópicos (um por linha)</label>
              <textarea
                value={s.bullets.join('\n')}
                onChange={(e) => update(i, { bullets: e.target.value.split('\n') })}
                rows={Math.max(3, s.bullets.length + 1)}
                className={`${inputCls} resize-y leading-relaxed`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={addSlide} className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded cursor-pointer"><Plus className="w-4 h-4" /> Adicionar slide</button>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs uppercase rounded cursor-pointer">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar slides
        </button>
        {savedAt && <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Slides salvos!</span>}
      </div>
    </div>
  );
}
