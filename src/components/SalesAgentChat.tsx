/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Agente de IA de vendas (SDR) da landing de divulgação. Conversa com o
 * visitante, tira dúvidas sobre os treinamentos e capta o contato (lead),
 * que é gravado no banco e aparece no painel admin (Captação de Leads).
 */

import React from 'react';
import { Bot, Send, X, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { leadsApi } from '../api';

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

interface SalesAgentChatProps {
  courses: string[]; // nomes dos treinamentos para contexto do agente
}

const GREETING =
  'Oi! 👋 Sou a Júlia, consultora da FalaInstrutor. Posso te ajudar a escolher o treinamento ideal — para você ou para a sua empresa. Me conta: o que você procura?';

export default function SalesAgentChat({ courses }: SalesAgentChatProps) {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatTurn[]>([{ role: 'model', text: GREETING }]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [captured, setCaptured] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;
    const next: ChatTurn[] = [...messages, { role: 'user', text: question }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      // Envia só os turnos reais (descarta a saudação local).
      const { reply, leadCaptured } = await leadsApi.chat(next.slice(1), courses);
      setMessages((m) => [...m, { role: 'model', text: reply }]);
      if (leadCaptured) setCaptured(true);
    } catch (err) {
      setMessages((m) => [...m, { role: 'model', text: err instanceof Error ? err.message : 'Tive um problema agora. Pode tentar de novo?' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-lg shadow-emerald-600/30 cursor-pointer animate-fade-in"
        >
          <Bot className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Fale com a Júlia</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
        </button>
      )}

      {/* Janela do chat */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 h-[32rem] max-h-[80vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between p-3 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center"><Bot className="w-4 h-4" /></div>
              <div>
                <p className="text-sm font-bold leading-tight">Júlia · FalaInstrutor</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Consultora online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-950">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            {captured && (
              <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4" /> Contato registrado! Nossa equipe vai falar com você em breve.
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Entrada */}
          <div className="p-2.5 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                placeholder="Escreva sua mensagem..."
                className="flex-1 text-sm px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button onClick={send} disabled={loading || !input.trim()} className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl cursor-pointer">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-1.5 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> Assistente com IA — pode cometer erros. Confirme dados importantes.</p>
          </div>
        </div>
      )}
    </>
  );
}
