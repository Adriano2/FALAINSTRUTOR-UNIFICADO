/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Landing page de DIVULGAÇÃO da plataforma de treinamento. Foco em captação de
 * leads (profissionais e empresas) + agente de IA de vendas. Os leads são
 * gravados no banco e aparecem no painel admin (Captação de Leads).
 *
 * Acesse por: /?lp=1
 */

import React from 'react';
import {
  ShieldCheck, Award, GraduationCap, Building2, CheckCircle2, Loader2, Send,
  Clock, FileCheck2, Headset, ArrowRight, Star,
} from 'lucide-react';
import { Course } from '../types';
import { leadsApi, LeadInput } from '../api';
import SalesAgentChat from './SalesAgentChat';

interface DivulgacaoLandingProps {
  courses: Course[];
  onNavigate: (screen: string, extra?: unknown) => void;
}

const BENEFITS = [
  { icon: Award, title: 'Certificado válido', text: 'Emissão com validação pública e assinatura digital do instrutor responsável (MTE/CREA).' },
  { icon: Clock, title: 'No seu ritmo', text: 'Treinamentos EaD e semipresenciais — estude quando e onde quiser, pelo computador ou celular.' },
  { icon: ShieldCheck, title: 'Conforme as NRs', text: 'Conteúdo alinhado às Normas Regulamentadoras e à legislação de SST do Brasil.' },
  { icon: FileCheck2, title: 'Gestão para empresas', text: 'Painel da empresa com os treinamentos obrigatórios por grau de risco (NR-04) e certificados da equipe.' },
];

export default function DivulgacaoLanding({ courses, onNavigate }: DivulgacaoLandingProps) {
  const featured = courses.filter((c) => c.isActive).slice(0, 6);
  const courseNames = courses.filter((c) => c.isActive).map((c) => `${c.code} — ${c.name}`);

  const [tab, setTab] = React.useState<'PERSON' | 'COMPANY'>('PERSON');
  const [form, setForm] = React.useState<LeadInput>({ type: 'PERSON', name: '' });
  const [sending, setSending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = (patch: Partial<LeadInput>) => setForm((f) => ({ ...f, ...patch }));

  const switchTab = (t: 'PERSON' | 'COMPANY') => {
    setTab(t);
    setForm({ type: t, name: '' });
    setDone(false);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) { setError('Informe o seu nome.'); return; }
    if (!form.email && !form.phone) { setError('Informe um e-mail ou telefone para contato.'); return; }
    setSending(true);
    try {
      await leadsApi.create({ ...form, type: tab, source: 'landing' });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const inputCls = 'w-full text-sm p-3 rounded-lg bg-white text-slate-900 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400';

  return (
    <div className="w-full bg-slate-950 text-white font-sans">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Vídeo de fundo (autoplay, mudo, em loop) */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/landing-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        {/* Overlay escuro semitransparente para legibilidade do texto */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/80 to-emerald-950/70" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Treinamento e Homologação SST
            </span>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight">
              Capacitação em <span className="text-emerald-400">Segurança do Trabalho</span> que vale certificado.
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl">
              Treinamentos nas Normas Regulamentadoras (NRs) para <strong>profissionais</strong> e <strong>empresas</strong>.
              100% online, com certificado válido e gestão completa de conformidade.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#captacao" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer">
                Quero me capacitar <ArrowRight className="w-4 h-4" />
              </a>
              <button onClick={() => onNavigate('home')} className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl cursor-pointer">
                Ver todos os cursos
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-slate-400">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Certificado válido</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> EaD e Semipresencial</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Para PF e PJ</div>
            </div>
          </div>

          {/* Cartão de prova social */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-5 h-5 fill-amber-400" />)}
              <span className="ml-2 text-sm text-slate-300">Avaliação dos alunos</span>
            </div>
            <p className="text-slate-200 italic">“Plataforma simples e o certificado saiu na hora. A empresa toda fez os treinamentos das NRs aqui.”</p>
            <div className="grid grid-cols-3 gap-4 text-center pt-2 border-t border-white/10">
              <div><p className="text-2xl font-black text-emerald-400">+{Math.max(courses.length, 10)}</p><p className="text-[11px] text-slate-400 uppercase">Treinamentos</p></div>
              <div><p className="text-2xl font-black text-emerald-400">NR</p><p className="text-[11px] text-slate-400 uppercase">Conformidade</p></div>
              <div><p className="text-2xl font-black text-emerald-400">24/7</p><p className="text-[11px] text-slate-400 uppercase">Acesso online</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="bg-white text-slate-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-10">Por que escolher a FalaInstrutor</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-6 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4"><b.icon className="w-6 h-6" /></div>
                <h3 className="font-bold text-lg mb-1">{b.title}</h3>
                <p className="text-sm text-slate-600">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CURSOS EM DESTAQUE */}
      {featured.length > 0 && (
        <section className="bg-slate-50 text-slate-900 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-black">Treinamentos em destaque</h2>
              <button onClick={() => onNavigate('home')} className="text-emerald-700 font-bold text-sm hover:underline hidden sm:inline-flex items-center gap-1">Ver todos <ArrowRight className="w-4 h-4" /></button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((c) => (
                <button key={c.id} onClick={() => onNavigate('course-detail', c)} className="text-left bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
                  <div className="h-32 bg-gradient-to-br from-emerald-600 to-slate-800 flex items-center justify-center">
                    <span className="text-white font-black text-xl">{c.code}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm line-clamp-2 mb-1">{c.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {c.duration}h · {c.modality ?? 'EaD'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CAPTAÇÃO DE LEADS */}
      <section id="captacao" className="bg-slate-900 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black">Comece agora</h2>
            <p className="text-slate-400 mt-2">Deixe seus dados e um especialista entra em contato com a melhor solução para você ou sua empresa.</p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
            {/* Abas */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
              <button onClick={() => switchTab('PERSON')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-pointer ${tab === 'PERSON' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600'}`}>
                <GraduationCap className="w-4 h-4" /> Sou profissional
              </button>
              <button onClick={() => switchTab('COMPANY')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-pointer ${tab === 'COMPANY' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600'}`}>
                <Building2 className="w-4 h-4" /> Sou empresa
              </button>
            </div>

            {done ? (
              <div className="text-center py-10 text-slate-800">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-xl font-black">Recebemos o seu contato! 🎉</h3>
                <p className="text-slate-500 mt-2">Em breve nossa equipe vai falar com você. Enquanto isso, conheça os treinamentos disponíveis.</p>
                <button onClick={() => onNavigate('home')} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer">Ver cursos <ArrowRight className="w-4 h-4" /></button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input className={inputCls} placeholder={tab === 'COMPANY' ? 'Seu nome (responsável) *' : 'Seu nome completo *'} value={form.name} onChange={(e) => set({ name: e.target.value })} />
                {tab === 'COMPANY' && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input className={inputCls} placeholder="Razão social / empresa" value={form.company ?? ''} onChange={(e) => set({ company: e.target.value })} />
                    <input className={inputCls} placeholder="CNPJ (opcional)" value={form.cnpj ?? ''} onChange={(e) => set({ cnpj: e.target.value })} />
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <input className={inputCls} type="email" placeholder="E-mail *" value={form.email ?? ''} onChange={(e) => set({ email: e.target.value })} />
                  <input className={inputCls} placeholder="WhatsApp / telefone *" value={form.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} />
                </div>
                {tab === 'COMPANY' && (
                  <input className={inputCls} type="number" min={1} placeholder="Nº de funcionários" value={form.employeeCount ?? ''} onChange={(e) => set({ employeeCount: e.target.value ? Number(e.target.value) : undefined })} />
                )}
                <select className={inputCls} value={form.interest ?? ''} onChange={(e) => set({ interest: e.target.value })}>
                  <option value="">Treinamento de interesse (opcional)</option>
                  {courseNames.map((n) => <option key={n} value={n}>{n}</option>)}
                  <option value="Vários / não sei ainda">Vários / não sei ainda</option>
                </select>
                <textarea className={inputCls} rows={2} placeholder="Mensagem (opcional)" value={form.message ?? ''} onChange={(e) => set({ message: e.target.value })} />

                {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}

                <button type="submit" disabled={sending} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {tab === 'COMPANY' ? 'Quero uma proposta para a empresa' : 'Quero me capacitar'}
                </button>
                <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1"><Headset className="w-3 h-3" /> Atendimento humano + assistente de IA. Seus dados ficam seguros.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* RODAPÉ CTA */}
      <footer className="bg-slate-950 border-t border-white/10 py-10 text-center">
        <p className="text-slate-400 text-sm">FalaInstrutor — Plataforma de Treinamento e Homologação SST</p>
        <button onClick={() => onNavigate('login')} className="mt-3 text-emerald-400 font-bold text-sm hover:underline">Já é aluno? Acessar conta</button>
      </footer>

      {/* Agente de IA de vendas (capta leads automaticamente) */}
      <SalesAgentChat courses={courseNames} />
    </div>
  );
}
