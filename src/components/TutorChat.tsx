/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';

interface TutorChatProps {
  courseName: string;
  modules: string[];
}

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export default function TutorChat({ courseName, modules }: TutorChatProps) {
  const [messages, setMessages] = React.useState<ChatTurn[]>([
    {
      role: 'model',
      text: `Olá! Sou o Tutor FalaInstrutor 🤖. Pode me perguntar qualquer dúvida sobre o treinamento de ${courseName}.`,
    },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    const nextHistory: ChatTurn[] = [...messages, { role: 'user', text: question }];
    setMessages(nextHistory);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName,
          modules,
          // Send only the actual conversation turns (skip the local greeting).
          history: nextHistory.slice(1),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || 'Falha ao consultar o Tutor de IA.');
      }

      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao falar com o Tutor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col">
      <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2 font-display mb-1">
        <Sparkles className="w-4 h-4 text-emerald-400" /> Tutor de IA
      </h3>
      <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
        Tire dúvidas instantâneas sobre o conteúdo deste treinamento com nosso assistente especialista em SST.
      </p>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 max-h-80 overflow-y-auto space-y-3 pr-1 mb-3 scrollbar-thin scrollbar-thumb-emerald-500/50 scrollbar-track-transparent"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                m.role === 'user' ? 'bg-slate-700 text-slate-200' : 'bg-emerald-600 text-white'
              }`}
            >
              {m.role === 'user' ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`text-xs leading-relaxed rounded-xl px-3 py-2 max-w-[85%] whitespace-pre-wrap font-sans ${
                m.role === 'user'
                  ? 'bg-slate-700/80 text-slate-100'
                  : 'bg-slate-800/70 text-slate-200 border border-white/5'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 items-center text-xs text-slate-400">
            <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-emerald-600 text-white">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="flex items-center gap-1.5 bg-slate-800/70 border border-white/5 rounded-xl px-3 py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Pensando...
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="text-[11px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-end gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Digite sua dúvida sobre o curso..."
          className="flex-1 text-xs p-3 rounded-xl bg-slate-800/80 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-sans"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="shrink-0 h-10 w-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition cursor-pointer"
          title="Enviar pergunta"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
