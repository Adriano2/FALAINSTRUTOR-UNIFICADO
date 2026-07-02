/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Painel de gamificação + microlearning do aluno: nível/XP, ofensiva (streak),
 * conquistas (badges) e a "Pílula do Dia" (1 questão diária com XP).
 */

import React from 'react';
import { Loader2, Flame, Trophy, Zap, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { gamificationApi, GamificationData, MicroQuizData, MicroQuizResult } from '../api';

export default function GamificationPanel() {
  const [data, setData] = React.useState<GamificationData | null>(null);
  const [micro, setMicro] = React.useState<MicroQuizData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [result, setResult] = React.useState<MicroQuizResult | null>(null);
  const [sending, setSending] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([gamificationApi.me(), gamificationApi.micro()])
      .then(([g, m]) => { setData(g); setMicro(m); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const answer = async () => {
    if (selected === null || !micro?.ref) return;
    setSending(true);
    try {
      const r = await gamificationApi.answerMicro(micro.ref.courseId, micro.ref.qIndex, selected);
      setResult(r);
      // Atualiza XP/nível/ofensiva após responder.
      gamificationApi.me().then(setData).catch(() => {});
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  if (loading) {
    return <div className="flex items-center gap-2 text-slate-400 text-sm py-6"><Loader2 className="w-4 h-4 animate-spin" /> Carregando seu progresso...</div>;
  }
  if (!data) return null;

  const pct = Math.round((data.xpInLevel / data.xpForNext) * 100);

  return (
    <div className="space-y-4">
      {/* Nível + XP + Ofensiva */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="font-black text-lg">Nível {data.level}</span>
            </div>
            <span className="text-xs font-bold opacity-90">{data.totalXp} XP</span>
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] opacity-90">{data.xpInLevel}/{data.xpForNext} XP para o Nível {data.level + 1}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-rose-600 text-white rounded-xl p-4 flex flex-col items-center justify-center">
          <Flame className="w-7 h-7" />
          <span className="font-black text-2xl leading-none mt-1">{data.streakDays}</span>
          <span className="text-[11px] font-bold opacity-90 uppercase">dias de ofensiva</span>
        </div>
      </div>

      {/* Pílula do Dia (microlearning) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" /> Pílula do Dia
        </h3>
        {!micro?.question ? (
          <p className="text-xs text-slate-400 mt-2">Matricule-se em um treinamento para receber sua pílula diária de conhecimento.</p>
        ) : data.answeredToday && !result ? (
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Você já respondeu a pílula de hoje. Volte amanhã para manter a ofensiva! 🔥</p>
        ) : (
          <>
            <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 font-semibold">{micro.question.question}</p>
            <div className="mt-2 space-y-1.5">
              {micro.question.options.map((opt, i) => {
                const isCorrect = result && i === result.correctIndex;
                const isWrongPick = result && i === selected && !result.correct;
                return (
                  <button
                    key={i}
                    disabled={!!result || sending}
                    onClick={() => setSelected(i)}
                    className={`w-full text-left text-xs p-2.5 rounded-lg border transition ${
                      isCorrect ? 'border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : isWrongPick ? 'border-rose-400 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                      : selected === i ? 'border-blue-500 bg-blue-500/10 text-slate-800 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                    } disabled:cursor-default`}
                  >
                    {opt}
                    {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 inline ml-1" />}
                    {isWrongPick && <XCircle className="w-3.5 h-3.5 inline ml-1" />}
                  </button>
                );
              })}
            </div>
            {!result ? (
              <button
                onClick={answer}
                disabled={selected === null || sending}
                className="mt-3 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Responder
              </button>
            ) : (
              <p className={`mt-3 text-xs font-bold ${result.correct ? 'text-emerald-600' : 'text-rose-500'}`}>
                {result.correct ? 'Acertou! 🎉' : 'Quase! Veja a resposta correta acima.'}
                {result.xpAwarded > 0 && <span className="text-blue-600"> +{result.xpAwarded} XP</span>}
                {result.xpAwarded > 0 && <span className="text-orange-500"> • ofensiva {result.streakDays}🔥</span>}
              </p>
            )}
          </>
        )}
      </div>

      {/* Conquistas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" /> Conquistas
          <span className="text-[11px] font-bold text-slate-400">({data.badges.filter((b) => b.earned).length}/{data.badges.length})</span>
        </h3>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {data.badges.map((b) => (
            <div
              key={b.id}
              title={b.description}
              className={`rounded-lg border p-2 text-center ${b.earned ? 'border-amber-300 bg-amber-50 dark:bg-amber-500/10' : 'border-slate-200 dark:border-slate-800 opacity-40 grayscale'}`}
            >
              <div className="text-2xl leading-none">{b.icon}</div>
              <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1 leading-tight">{b.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
