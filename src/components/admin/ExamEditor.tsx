/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Editor de provas: cria/edita o banco de questões de cada curso e grava no
 * banco de dados (Course.examQuestions). Permite cadastrar provas sem código.
 */

import React from 'react';
import { Plus, Trash2, Loader2, Save, CheckCircle2, BookOpenCheck, Download, FileUp, FileSpreadsheet } from 'lucide-react';
import { adminApi } from '../../api';
import { getExamQuestions } from '../../data';
import { Course, ExamQuestion } from '../../types';
import { questionsToCsv, templateCsv, csvToQuestions, rowsToQuestions } from '../../lib/examCsv';

interface ExamEditorProps {
  courses: Course[];
  onSaved?: () => void;
  initialCourseId?: string;
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExamEditor({ courses, onSaved, initialCourseId }: ExamEditorProps) {
  const [courseId, setCourseId] = React.useState<string>(initialCourseId || courses[0]?.id || '');
  const [questions, setQuestions] = React.useState<ExamQuestion[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  // Permite abrir o editor já no curso indicado (associação a partir da gestão de cursos).
  React.useEffect(() => {
    if (initialCourseId) setCourseId(initialCourseId);
  }, [initialCourseId]);

  const selectedCourse = courses.find((c) => c.id === courseId);

  // Ao trocar de curso, carrega as questões já salvas daquele curso.
  React.useEffect(() => {
    const c = courses.find((x) => x.id === courseId);
    setQuestions(c?.examQuestions && c.examQuestions.length > 0 ? JSON.parse(JSON.stringify(c.examQuestions)) : []);
    setSavedAt(null);
  }, [courseId, courses]);

  const update = (qi: number, patch: Partial<ExamQuestion>) =>
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)));

  const addQuestion = () =>
    setQuestions((prev) => [...prev, { question: '', options: ['', ''], correctIndex: 0 }]);

  const removeQuestion = (qi: number) => setQuestions((prev) => prev.filter((_, i) => i !== qi));

  const setOption = (qi: number, oi: number, value: string) =>
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) } : q)));

  const addOption = (qi: number) =>
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, options: [...q.options, ''] } : q)));

  const removeOption = (qi: number, oi: number) =>
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const options = q.options.filter((_, j) => j !== oi);
        let correctIndex = q.correctIndex;
        if (oi === q.correctIndex) correctIndex = 0;
        else if (oi < q.correctIndex) correctIndex = q.correctIndex - 1;
        return { ...q, options, correctIndex };
      }),
    );

  const importTemplate = () => {
    if (!courseId) return;
    if (questions.length > 0 && !confirm('Isso substituirá as questões atuais pelo modelo padrão. Continuar?')) return;
    setQuestions(JSON.parse(JSON.stringify(getExamQuestions(courseId))));
  };

  // Baixa um modelo CSV em branco (com exemplos) para preencher e reimportar.
  const handleDownloadTemplate = () => downloadCsv('modelo_prova.csv', templateCsv());

  // Exporta a prova atual do curso selecionado como CSV.
  const handleExportCsv = () => {
    if (questions.length === 0) { alert('Não há questões para exportar. Use "Baixar modelo".'); return; }
    const code = (selectedCourse?.code || 'curso').replace(/\s+/g, '_').toLowerCase();
    downloadCsv(`prova_${code}.csv`, questionsToCsv(questions));
  };

  // Importa questões de um arquivo CSV ou Excel (.xlsx) para o editor.
  const handleImportFile = async (file: File) => {
    try {
      const isExcel = /\.(xlsx|xls)$/i.test(file.name);
      let parsed: ExamQuestion[];
      if (isExcel) {
        // read-excel-file (parser no main thread) carregado sob demanda.
        const readXlsxFile = (await import('read-excel-file/browser')).default;
        const rows = await readXlsxFile(file);
        parsed = rowsToQuestions(rows as unknown as (string | number | null)[][]);
      } else {
        parsed = csvToQuestions(await file.text());
      }
      if (parsed.length === 0) { alert('Nenhuma questão válida encontrada no arquivo. Confira o formato do modelo.'); return; }
      if (questions.length > 0 && !confirm(`Importar ${parsed.length} questão(ões)? Isso substituirá as questões atuais do editor.`)) return;
      setQuestions(parsed);
      alert(`${parsed.length} questão(ões) importada(s). Revise e clique em "Salvar Prova".`);
    } catch {
      alert('Não foi possível ler o arquivo. Use o formato do modelo (CSV ou Excel .xlsx).');
    }
  };

  const validate = (): string | null => {
    if (questions.length === 0) return 'Adicione ao menos uma questão.';
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `A questão ${i + 1} está sem enunciado.`;
      if (q.options.length < 2) return `A questão ${i + 1} precisa de pelo menos 2 alternativas.`;
      if (q.options.some((o) => !o.trim())) return `A questão ${i + 1} tem alternativa em branco.`;
      if (q.correctIndex < 0 || q.correctIndex >= q.options.length) return `Marque a alternativa correta da questão ${i + 1}.`;
    }
    return null;
  };

  const handleSave = async () => {
    if (!courseId) return;
    const err = validate();
    if (err) { alert(err); return; }
    setSaving(true);
    try {
      await adminApi.saveExam(courseId, questions.map((q) => ({ question: q.question.trim(), options: q.options.map((o) => o.trim()), correctIndex: q.correctIndex })));
      setSavedAt(Date.now());
      onSaved?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Não foi possível salvar a prova.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Editor de Provas</h2>
        <p className="text-xs text-slate-400">Crie e edite as questões da prova final de cada curso. Salvo no banco — sem precisar de código.</p>
      </div>

      {/* Seleção de curso */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Treinamento</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} — {c.name} {c.examQuestions && c.examQuestions.length > 0 ? `(${c.examQuestions.length} questões)` : '(sem prova)'}</option>
            ))}
          </select>
        </div>
        <button onClick={importTemplate} className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[11px] uppercase rounded cursor-pointer">
          <Download className="w-4 h-4" /> Modelo padrão
        </button>
      </div>

      {/* Ferramentas de importação/exportação por prova (CSV/Excel) */}
      <div className="bg-blue-50 dark:bg-slate-900 p-3 rounded-lg border border-blue-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-300 flex items-center gap-1.5 mr-1">
          <FileSpreadsheet className="w-4 h-4 text-blue-600" /> Importar / Exportar (CSV):
        </span>
        <button onClick={handleDownloadTemplate} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-700 dark:text-slate-200 font-bold text-[11px] rounded cursor-pointer">
          <Download className="w-3.5 h-3.5" /> Baixar modelo
        </button>
        <button onClick={handleExportCsv} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-700 dark:text-slate-200 font-bold text-[11px] rounded cursor-pointer">
          <Download className="w-3.5 h-3.5" /> Exportar esta prova
        </button>
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded cursor-pointer">
          <FileUp className="w-3.5 h-3.5" /> Importar arquivo
          <input
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ''; }}
          />
        </label>
        <span className="text-[10px] text-slate-400 w-full sm:w-auto">Aceita CSV e Excel (.xlsx). Formato: Pergunta; Alternativas; nº da resposta correta.</span>
      </div>

      {/* Lista de questões */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
            Nenhuma questão. Clique em "Adicionar questão" ou "Importar modelo padrão".
          </p>
        ) : (
          questions.map((q, qi) => (
            <div key={qi} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-600 text-white text-[11px] font-black shrink-0">{qi + 1}</span>
                <textarea
                  rows={2}
                  value={q.question}
                  onChange={(e) => update(qi, { question: e.target.value })}
                  placeholder="Enunciado da questão"
                  className="flex-1 text-xs p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none resize-none"
                />
                <button onClick={() => removeQuestion(qi)} className="p-1.5 text-slate-400 hover:text-red-500 shrink-0" title="Remover questão">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 pl-9">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Alternativas (marque a correta)</span>
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correctIndex === oi}
                      onChange={() => update(qi, { correctIndex: oi })}
                      className="accent-emerald-600 shrink-0"
                      title="Marcar como correta"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => setOption(qi, oi, e.target.value)}
                      placeholder={`Alternativa ${oi + 1}`}
                      className={`flex-1 text-xs p-2 rounded border focus:outline-none ${q.correctIndex === oi ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'} text-slate-900 dark:text-white`}
                    />
                    {q.options.length > 2 && (
                      <button onClick={() => removeOption(qi, oi)} className="p-1 text-slate-300 hover:text-red-500 shrink-0" title="Remover alternativa">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => addOption(qi)} className="text-[10px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Alternativa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ações */}
      <div className="flex flex-wrap items-center gap-3 sticky bottom-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur py-3">
        <button onClick={addQuestion} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase rounded cursor-pointer">
          <Plus className="w-4 h-4" /> Adicionar questão
        </button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-xs uppercase rounded cursor-pointer">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Prova
        </button>
        {savedAt && (
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Prova salva!</span>
        )}
        <span className="ml-auto text-[11px] text-slate-400 flex items-center gap-1">
          <BookOpenCheck className="w-3.5 h-3.5" /> {questions.length} questão(ões){selectedCourse ? ` • ${selectedCourse.code}` : ''}
        </span>
      </div>
    </div>
  );
}
