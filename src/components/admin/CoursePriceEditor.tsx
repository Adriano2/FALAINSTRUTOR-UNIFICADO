/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Edição rápida do preço de um treinamento na Gestão de Cursos. Permite
 * aumentar/diminuir e salvar no banco (PATCH /admin/courses/:id/price).
 */

import React from 'react';
import { Check, Loader2, Tag } from 'lucide-react';
import { Course } from '../../types';
import { adminApi } from '../../api';

interface CoursePriceEditorProps {
  course: Course;
  onSaved?: () => void;
}

export default function CoursePriceEditor({ course, onSaved }: CoursePriceEditorProps) {
  // Mantém como texto para o usuário digitar com vírgula/ponto livremente.
  const [value, setValue] = React.useState(String(course.price ?? 0).replace('.', ','));
  const [validity, setValidity] = React.useState(String(course.validityMonths ?? 12));
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setValue(String(course.price ?? 0).replace('.', ','));
    setValidity(String(course.validityMonths ?? 12));
  }, [course.price, course.validityMonths]);

  const parsed = Number(value.replace(/\./g, '').replace(',', '.'));
  const validityNum = parseInt(validity, 10);
  const changed =
    (!Number.isNaN(parsed) && parsed !== (course.price ?? 0)) ||
    (!Number.isNaN(validityNum) && validityNum !== (course.validityMonths ?? 12));

  const save = async () => {
    setError('');
    if (Number.isNaN(parsed) || parsed < 0) { setError('Preço inválido.'); return; }
    if (Number.isNaN(validityNum) || validityNum < 1) { setError('Validade inválida.'); return; }
    setSaving(true);
    try {
      await adminApi.updateCoursePrice(course.id, { price: Number(parsed.toFixed(2)), validityMonths: validityNum });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao salvar o preço.');
    } finally {
      setSaving(false);
    }
  };

  const bump = (delta: number) => {
    const next = Math.max(0, Number((((Number.isNaN(parsed) ? course.price : parsed) || 0) + delta).toFixed(2)));
    setValue(String(next).replace('.', ','));
  };

  return (
    <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
      <div className="flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Preço</span>
        <button type="button" onClick={() => bump(-10)} className="px-1.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px] leading-none cursor-pointer" title="-10">−</button>
        <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5">
          <span className="text-[11px] text-slate-400">R$</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="decimal"
            className="w-16 bg-transparent text-[12px] font-bold text-slate-900 dark:text-white py-1 focus:outline-none"
          />
        </div>
        <button type="button" onClick={() => bump(10)} className="px-1.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px] leading-none cursor-pointer" title="+10">+</button>
        <button
          type="button"
          onClick={save}
          disabled={saving || !changed}
          className={`ml-auto px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer ${changed ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'} disabled:cursor-not-allowed`}
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <Check className="w-3 h-3" /> : null}
          {saved ? 'Salvo' : 'Salvar'}
        </button>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Validade (meses)</span>
        <input
          value={validity}
          onChange={(e) => setValidity(e.target.value.replace(/\D/g, ''))}
          inputMode="numeric"
          className="w-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-[12px] font-bold text-slate-900 dark:text-white focus:outline-none"
        />
        <span className="text-[10px] text-slate-400">renovação do certificado</span>
      </div>
      {error && <p className="text-[10px] text-red-500 font-semibold mt-1">{error}</p>}
    </div>
  );
}
