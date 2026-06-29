/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Painel do Instrutor: o instrutor (role 'instructor') vê apenas os cursos aos
 * quais está associado — acompanha vendas/matrículas e revisa/valida as provas
 * (submissões) dos alunos. Dados com escopo restrito de /api/instructor/me.
 */

import React from 'react';
import { GraduationCap, DollarSign, Percent, BookOpenCheck, Loader2, X, ArrowLeft } from 'lucide-react';
import { instructorApi, coursesApi, InstructorDashboardData } from '../api';
import { getExamQuestions } from '../data';
import { Course } from '../types';
import SlideManager from './admin/SlideManager';
import ExamEditor from './admin/ExamEditor';

type ExamItem = InstructorDashboardData['exams'][number];

export default function InstructorDashboard({ isAdmin, onBack }: { isAdmin?: boolean; onBack?: () => void } = {}) {
  const [data, setData] = React.useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [reviewing, setReviewing] = React.useState<ExamItem | null>(null);
  const [allCourses, setAllCourses] = React.useState<Course[]>([]);
  React.useEffect(() => { coursesApi.list().then(setAllCourses).catch(() => {}); }, []);
  const [validatedMap, setValidatedMap] = React.useState<Record<string, boolean>>({});
  const [requestedMap, setRequestedMap] = React.useState<Record<string, boolean>>({});

  const isValidated = (ex: ExamItem) => validatedMap[ex.id] ?? ex.validated;

  // Etapa 1 da revogação: solicita a revogação do certificado (admin confirma).
  const requestRevocation = async (ex: ExamItem) => {
    if (!ex.enrollmentId) return;
    const reason = window.prompt(`Solicitar revogação do certificado de ${ex.studentName} (${ex.courseCode}).\nInforme o motivo:`);
    if (!reason || reason.trim().length < 3) return;
    try {
      await instructorApi.requestRevocation(ex.enrollmentId, reason.trim());
      setRequestedMap((m) => ({ ...m, [ex.id]: true }));
      alert('Solicitação de revogação enviada. A revogação definitiva será feita pelo administrador.');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Não foi possível solicitar a revogação.');
    }
  };

  const toggleValidate = async (ex: ExamItem) => {
    const next = !isValidated(ex);
    setValidatedMap((m) => ({ ...m, [ex.id]: next }));
    try {
      await instructorApi.validateExam(ex.id, next);
    } catch {
      setValidatedMap((m) => ({ ...m, [ex.id]: !next })); // reverte em erro
      alert('Não foi possível atualizar a liberação da prova.');
    }
  };

  React.useEffect(() => {
    instructorApi
      .getDashboard()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar o painel.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-32 text-slate-400 text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando painel...</div>;
  if (error || !data) return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-slate-500">{error || 'Sem dados.'}</div>;

  const questionsFor = (courseId: string) => {
    const c = data.courses.find((x) => x.id === courseId);
    return c && c.examQuestions.length > 0 ? c.examQuestions : getExamQuestions(courseId);
  };
  const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      {/* Cabeçalho */}
      {onBack && (
        <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Voltar ao painel administrativo
        </button>
      )}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-blue-600/10 text-blue-600"><GraduationCap className="w-7 h-7" /></div>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">Painel do Instrutor</h1>
          <p className="text-xs text-slate-400 truncate">
            {isAdmin ? 'Acesso do administrador • todos os treinamentos' : `${data.instructor.name} • Provas e vendas dos seus treinamentos`}
          </p>
        </div>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full"><BookOpenCheck className="w-5 h-5" /></div>
          <div><span className="text-[10px] text-slate-450 uppercase font-black block">Cursos</span><strong className="text-lg font-extrabold text-slate-900 dark:text-white">{data.stats.courses}</strong></div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full"><DollarSign className="w-5 h-5" /></div>
          <div><span className="text-[10px] text-slate-450 uppercase font-black block">Vendas</span><strong className="text-lg font-extrabold text-slate-900 dark:text-white">{data.stats.totalSales}</strong></div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full"><DollarSign className="w-5 h-5" /></div>
          <div><span className="text-[10px] text-slate-450 uppercase font-black block">Faturamento</span><strong className="text-sm font-extrabold text-slate-900 dark:text-white">{brl(data.stats.totalRevenue)}</strong></div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full"><Percent className="w-5 h-5" /></div>
          <div><span className="text-[10px] text-slate-450 uppercase font-black block">Comissão ({data.stats.commissionPercent}%)</span><strong className="text-sm font-extrabold text-amber-600">{brl(data.stats.commissionValue)}</strong></div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-full"><BookOpenCheck className="w-5 h-5" /></div>
          <div><span className="text-[10px] text-slate-450 uppercase font-black block">Provas feitas</span><strong className="text-lg font-extrabold text-slate-900 dark:text-white">{data.stats.totalExams}</strong></div>
        </div>
      </div>

      {/* Vendas por curso */}
      <div className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <h3 className="text-xs font-black uppercase text-slate-500 px-4 py-3 border-b border-slate-100 dark:border-slate-800">Vendas e matrículas por treinamento</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr><th className="p-2.5">Treinamento</th><th className="p-2.5 text-center">Vendas</th><th className="p-2.5 text-right">Faturamento</th><th className="p-2.5 text-right">Comissão ({data.stats.commissionPercent}%)</th><th className="p-2.5 text-center">Matrículas</th><th className="p-2.5 text-center">Provas</th><th className="p-2.5 text-center">Aprovados</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.courses.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-slate-400">Você ainda não está associado a nenhum curso.</td></tr>
              ) : data.courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                  <td className="p-2.5"><span className="font-bold text-amber-500">{c.code}</span> <span className="text-slate-600 dark:text-slate-300">{c.name}</span></td>
                  <td className="p-2.5 text-center font-bold text-emerald-600">{c.sales}</td>
                  <td className="p-2.5 text-right font-black text-slate-900 dark:text-white">{brl(c.revenue)}</td>
                  <td className="p-2.5 text-right font-bold text-amber-600">{brl(c.revenue * (data.stats.commissionPercent / 100))}</td>
                  <td className="p-2.5 text-center font-bold">{c.enrollments}</td>
                  <td className="p-2.5 text-center">{c.examsCount}</td>
                  <td className="p-2.5 text-center text-emerald-600 font-bold">{c.approved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provas para validar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <h3 className="text-xs font-black uppercase text-slate-500 px-4 py-3 border-b border-slate-100 dark:border-slate-800">Provas dos alunos — revisar / liberar</h3>
        <p className="px-4 py-2 text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-500/5 border-b border-amber-100 dark:border-amber-500/20">
          Ao <strong>liberar</strong> uma prova aprovada, o certificado do aluno é homologado e fica disponível para emissão e validação pública. <strong>Revogar</strong> torna o certificado pendente novamente.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr><th className="p-2.5">Aluno</th><th className="p-2.5">Treinamento</th><th className="p-2.5 text-center">Nota</th><th className="p-2.5 text-center">Situação</th><th className="p-2.5 text-center">Liberação</th><th className="p-2.5 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.exams.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-slate-400">Nenhuma prova realizada ainda.</td></tr>
              ) : data.exams.map((ex) => {
                const validated = isValidated(ex);
                return (
                <tr key={ex.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                  <td className="p-2.5 font-bold text-slate-900 dark:text-slate-150">{ex.studentName}</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-300">{ex.courseCode}</td>
                  <td className="p-2.5 text-center font-bold">{ex.score}%</td>
                  <td className="p-2.5 text-center">
                    {ex.passed ? <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded font-bold">Aprovado</span> : <span className="px-2 py-0.5 bg-red-500/10 text-red-600 rounded font-bold">Reprovado</span>}
                  </td>
                  <td className="p-2.5 text-center">
                    {validated
                      ? <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded font-bold">Liberada</span>
                      : <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded font-bold">Pendente</span>}
                  </td>
                  <td className="p-2.5 text-right whitespace-nowrap">
                    <button onClick={() => setReviewing(ex)} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold mr-1.5">Revisar</button>
                    <button
                      onClick={() => toggleValidate(ex)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold ${validated ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                    >
                      {validated ? 'Revogar' : 'Liberar'}
                    </button>
                    {ex.released && ex.certificateCode && !ex.revoked && (
                      (ex.revocationRequested || requestedMap[ex.id])
                        ? <span className="ml-1.5 px-2 py-1 bg-amber-500/10 text-amber-600 rounded text-[10px] font-bold">Revog. solicitada</span>
                        : <button onClick={() => requestRevocation(ex)} className="ml-1.5 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold">Solicitar revogação</button>
                    )}
                    {ex.revoked && <span className="ml-1.5 px-2 py-1 bg-rose-500/15 text-rose-600 rounded text-[10px] font-bold">Revogado</span>}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gerenciador de slides dos meus treinamentos (instrutor associado) */}
      {(() => {
        const ids = new Set(data.courses.map((c) => c.id));
        const myCourses = allCourses.filter((c) => ids.has(c.id));
        if (myCourses.length === 0) return null;
        return (
          <>
            <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
              <SlideManager
                courses={myCourses}
                onSave={(id, slides) => instructorApi.saveSlides(id, slides)}
                onSaved={() => coursesApi.list().then(setAllCourses).catch(() => {})}
              />
            </div>
            <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
              <ExamEditor
                courses={myCourses}
                onSave={(id, questions) => instructorApi.saveExam(id, questions)}
                onSaved={() => coursesApi.list().then(setAllCourses).catch(() => {})}
              />
            </div>
          </>
        );
      })()}

      {/* Modal de revisão da prova */}
      {reviewing && (() => {
        const questions = questionsFor(reviewing.courseId);
        const correct = questions.reduce((acc, q, i) => acc + (reviewing.answers[i] === q.correctIndex ? 1 : 0), 0);
        return (
          <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 sm:p-6 flex items-center justify-center backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full shadow-2xl max-h-[88vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-3 bg-[#34607d] text-white sticky top-0">
                <h3 className="font-extrabold uppercase text-sm">Prova de {reviewing.studentName}</h3>
                <button onClick={() => setReviewing(null)} className="p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <p><strong className="text-slate-700 dark:text-slate-200">{reviewing.courseCode} — {reviewing.courseName}</strong></p>
                  <p>Aproveitamento: <strong className="text-slate-900 dark:text-white">{reviewing.score}%</strong> • Acertos: {correct}/{questions.length} • {reviewing.passed ? 'Aprovado' : 'Reprovado'}</p>
                </div>
                <div className="space-y-3">
                  {questions.map((q, qi) => {
                    const choice = reviewing.answers[qi];
                    return (
                      <div key={qi} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded text-xs space-y-2">
                        <p className="font-bold text-slate-800 dark:text-slate-100">{qi + 1}. {q.question}</p>
                        <div className="space-y-1 ml-2">
                          {q.options.map((opt, oi) => {
                            const isCorrect = oi === q.correctIndex;
                            const isChoice = oi === choice;
                            return (
                              <div key={oi} className={`p-1.5 rounded flex items-center gap-1.5 ${isCorrect ? 'bg-emerald-500/10 text-emerald-700 font-bold' : isChoice ? 'bg-red-500/10 text-red-700 font-semibold' : 'text-slate-500'}`}>
                                <span>{opt}</span>
                                {isCorrect && <span className="text-[10px] text-emerald-600">(Correta)</span>}
                                {isChoice && !isCorrect && <span className="text-[10px] text-red-500">(Resposta do aluno)</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
