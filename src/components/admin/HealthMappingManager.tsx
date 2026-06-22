/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Módulo "Mapeamento da Saúde": riscos psicossociais e inventário de riscos
 * ocupacionais para o PGR. Inclui:
 *  - Matriz Probabilidade × Severidade e tabelas de referência;
 *  - Campanha de avaliação com geração de links (simples e com parâmetros) + QR;
 *  - Apuração dos Resultados (relatório por domínio, com % e nível de risco).
 *
 * Persistência via SiteContent: "health_mapping" (apuração) e
 * "health_campaigns" (campanhas).
 */

import React from 'react';
import { Plus, Trash2, Loader2, HeartPulse, Save, QrCode, Copy, ExternalLink, Download, CalendarDays } from 'lucide-react';
import { adminApi } from '../../api';

type Level = 'Trivial' | 'Tolerável' | 'Moderado' | 'Substancial' | 'Intolerável';

interface RiskEntry {
  id: string;
  domain: string;
  agent: string;
  harm: string;
  percent: number;     // % de favorabilidade apurada (0–100)
  probability: number; // 1–5
  severity: number;    // 1–5
}

interface Campaign {
  id: string;
  name: string;
  start: string;
  end: string;
  token: string;
}

function riskLevel(p: number, s: number): Level {
  const score = p * s;
  if (score <= 3) return 'Trivial';
  if (score <= 6) return 'Tolerável';
  if (score <= 11) return 'Moderado';
  if (score <= 16) return 'Substancial';
  return 'Intolerável';
}

const LEVEL_STYLE: Record<Level, string> = {
  'Trivial': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  'Tolerável': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  'Moderado': 'bg-amber-400/20 text-amber-700 dark:text-amber-400',
  'Substancial': 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
  'Intolerável': 'bg-red-500/15 text-red-700 dark:text-red-400',
};
const LEVEL_ACTION: Record<Level, string> = {
  'Trivial': 'Nenhuma ação necessária.',
  'Tolerável': 'Sem controle adicional; manter monitoramento.',
  'Moderado': 'Controle adicional, com ações em prazo definido.',
  'Substancial': 'Controle necessário com prioridade.',
  'Intolerável': 'Ações imediatas; atividade não deve continuar sem controle.',
};
const PROBABILITY = [
  { n: 1, label: 'Rara', range: 'até 20%' },
  { n: 2, label: 'Pouco provável', range: '20–40%' },
  { n: 3, label: 'Possível', range: '40–60%' },
  { n: 4, label: 'Provável', range: '60–80%' },
  { n: 5, label: 'Muito provável', range: '80–100%' },
];
const SEVERITY = [
  { n: 1, label: 'Ambiente saudável / sem dano' },
  { n: 2, label: 'Fadiga mental leve' },
  { n: 3, label: 'Estresse ocupacional' },
  { n: 4, label: 'Transtornos psicológicos' },
  { n: 5, label: 'Adoecimento / problema crítico' },
];

// Cor da % de favorabilidade (verde = saudável, vermelho = crítico).
function pctStyle(p: number): string {
  if (p >= 70) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400';
  if (p >= 40) return 'bg-amber-400/20 text-amber-700 dark:text-amber-400';
  return 'bg-rose-500/15 text-rose-700 dark:text-rose-400';
}

const inputCls = 'w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none';

// Cartão de link da campanha com QR + copiar/abrir/baixar.
function LinkCard({ title, subtitle, url, children }: { title: string; subtitle: string; url: string; children?: React.ReactNode }) {
  const [qr, setQr] = React.useState('');
  React.useEffect(() => {
    let alive = true;
    import('qrcode').then(({ default: QRCode }) => QRCode.toDataURL(url, { margin: 1, width: 220 }).then((d) => { if (alive) setQr(d); }).catch(() => {}));
    return () => { alive = false; };
  }, [url]);

  const baixar = () => {
    if (!qr) return;
    const a = document.createElement('a');
    a.href = qr; a.download = 'qrcode-campanha.png';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</h4>
          <p className="text-[11px] text-slate-400">{subtitle}</p>
        </div>
        {qr ? <img src={qr} alt="QR" className="w-20 h-20 shrink-0 rounded border border-slate-200 dark:border-slate-700" /> : <div className="w-20 h-20 shrink-0 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><QrCode className="w-6 h-6 text-slate-300" /></div>}
      </div>
      {children}
      <p className="text-[10px] font-mono break-all bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded p-2 text-slate-600 dark:text-slate-300">{url}</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { navigator.clipboard?.writeText(url); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[11px] rounded"><Copy className="w-3.5 h-3.5" /> Copiar</button>
        <button onClick={() => window.open(url, '_blank')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded"><ExternalLink className="w-3.5 h-3.5" /> Abrir</button>
        <button onClick={baixar} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[11px] rounded"><Download className="w-3.5 h-3.5" /> Baixar QR</button>
      </div>
    </div>
  );
}

export default function HealthMappingManager() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const levels: Level[] = ['Trivial', 'Tolerável', 'Moderado', 'Substancial', 'Intolerável'];

  // ----- Apuração (inventário) -----
  const [items, setItems] = React.useState<RiskEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [domain, setDomain] = React.useState('');
  const [agent, setAgent] = React.useState('');
  const [harm, setHarm] = React.useState('');
  const [percent, setPercent] = React.useState(70);
  const [probability, setProbability] = React.useState(3);
  const [severity, setSeverity] = React.useState(3);

  // ----- Campanhas -----
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [cName, setCName] = React.useState('');
  const [cStart, setCStart] = React.useState('');
  const [cEnd, setCEnd] = React.useState('');
  const [openCampaign, setOpenCampaign] = React.useState<string | null>(null);
  const [paramSetor, setParamSetor] = React.useState('');
  const [paramCargo, setParamCargo] = React.useState('');

  React.useEffect(() => {
    let alive = true;
    Promise.all([adminApi.getContent('health_mapping'), adminApi.getContent('health_campaigns')])
      .then(([m, c]) => { if (!alive) return; setItems(Array.isArray(m) ? m : []); setCampaigns(Array.isArray(c) ? c : []); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const persistItems = async (next: RiskEntry[]) => {
    setItems(next); setSaving(true);
    try { await adminApi.saveContent('health_mapping', next); } catch { /* ignore */ }
    setSaving(false);
  };
  const persistCampaigns = async (next: Campaign[]) => {
    setCampaigns(next);
    try { await adminApi.saveContent('health_campaigns', next); } catch { /* ignore */ }
  };

  const addItem = () => {
    if (!domain.trim() || !agent.trim()) { alert('Informe ao menos o domínio e o agente nocivo.'); return; }
    persistItems([...items, { id: 'r' + Date.now(), domain: domain.trim(), agent: agent.trim(), harm: harm.trim(), percent, probability, severity }]);
    setDomain(''); setAgent(''); setHarm(''); setPercent(70); setProbability(3); setSeverity(3);
  };
  const removeItem = (id: string) => persistItems(items.filter((i) => i.id !== id));

  const addCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) { alert('Informe o nome da campanha.'); return; }
    const token = (crypto.randomUUID?.() || String(Date.now())).replace(/-/g, '');
    persistCampaigns([{ id: 'c' + Date.now(), name: cName.trim(), start: cStart, end: cEnd, token }, ...campaigns]);
    setCName(''); setCStart(''); setCEnd('');
  };
  const removeCampaign = (id: string) => persistCampaigns(campaigns.filter((c) => c.id !== id));

  const counts = React.useMemo(() => {
    const c: Record<Level, number> = { 'Trivial': 0, 'Tolerável': 0, 'Moderado': 0, 'Substancial': 0, 'Intolerável': 0 };
    items.forEach((i) => { c[riskLevel(i.probability, i.severity)]++; });
    return c;
  }, [items]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Mapeamento da Saúde</h2>
        <p className="text-xs text-slate-400">Avaliação de riscos psicossociais, campanha de avaliação e inventário de riscos ocupacionais (PGR / NR-01).</p>
      </div>

      {/* Resumo por nível */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {levels.map((lv) => (
          <div key={lv} className={`p-3 rounded-lg border border-slate-200 dark:border-slate-800 ${LEVEL_STYLE[lv]}`}>
            <span className="text-[10px] uppercase font-black block">{lv}</span>
            <strong className="text-lg font-extrabold">{counts[lv]}</strong>
          </div>
        ))}
      </div>

      {/* ===== Campanha de avaliação + links ===== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-blue-600" /> Campanha de Avaliação</h3>
        <form onSubmit={addCampaign} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2 space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Nome da campanha</label><input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Ex: Avalia - Janeiro" className={inputCls} /></div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Início</label><input type="date" value={cStart} onChange={(e) => setCStart(e.target.value)} className={inputCls} /></div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Fim</label><input type="date" value={cEnd} onChange={(e) => setCEnd(e.target.value)} className={inputCls} /></div>
          <button type="submit" className="sm:col-span-4 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase rounded"><Plus className="w-4 h-4" /> Criar campanha e gerar link</button>
        </form>

        {campaigns.length > 0 && (
          <div className="space-y-2">
            {campaigns.map((c) => {
              const simple = `${origin}/avaliacao/${c.token}`;
              const params = new URLSearchParams();
              if (paramSetor) params.set('setor', paramSetor);
              if (paramCargo) params.set('cargo', paramCargo);
              const withParams = `${simple}${params.toString() ? `?${params.toString()}` : ''}`;
              const open = openCampaign === c.id;
              return (
                <div key={c.id} className="border border-slate-200 dark:border-slate-800 rounded-lg">
                  <div className="flex items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                      <span className="text-[11px] text-slate-400">{c.start || '—'} até {c.end || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setOpenCampaign(open ? null : c.id); setParamSetor(''); setParamCargo(''); }} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold">{open ? 'Fechar' : 'Gerar link'}</button>
                      <button onClick={() => removeCampaign(c.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {open && (
                    <div className="px-3 pb-3 grid grid-cols-1 lg:grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <LinkCard title="Link Simples" subtitle="O respondente preencherá setor e cargo manualmente." url={simple} />
                      <LinkCard title="Link com Parâmetros" subtitle="Pré-define setor e cargo para facilitar o preenchimento." url={withParams}>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={paramSetor} onChange={(e) => setParamSetor(e.target.value)} placeholder="Setor" className={inputCls} />
                          <input value={paramCargo} onChange={(e) => setParamCargo(e.target.value)} placeholder="Cargo" className={inputCls} />
                        </div>
                      </LinkCard>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-[10px] text-amber-600">Os links levam ao formulário público de avaliação. A coleta de respostas e a apuração automática do % serão habilitadas na próxima etapa — por ora informe o % apurado manualmente abaixo.</p>
      </div>

      {/* ===== Matriz de risco ===== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm overflow-x-auto">
        <h3 className="text-xs font-black uppercase text-slate-500 mb-3">Matriz de Risco (Probabilidade × Severidade)</h3>
        <table className="text-[11px] border-collapse">
          <thead>
            <tr><th className="p-1.5 text-slate-400 font-bold text-left">Prob. ↓ / Sev. →</th>{SEVERITY.map((s) => <th key={s.n} className="p-1.5 text-center text-slate-500 font-bold w-14">{s.n}</th>)}</tr>
          </thead>
          <tbody>
            {[5, 4, 3, 2, 1].map((p) => (
              <tr key={p}>
                <td className="p-1.5 text-slate-500 font-bold whitespace-nowrap">{p} — {PROBABILITY.find((x) => x.n === p)?.label}</td>
                {SEVERITY.map((s) => { const lv = riskLevel(p, s.n); return <td key={s.n} className={`p-1.5 text-center font-bold ${LEVEL_STYLE[lv]}`}>{p * s.n}</td>; })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-wrap gap-2 mt-3">
          {levels.map((lv) => <span key={lv} className={`px-2 py-0.5 rounded text-[10px] font-bold ${LEVEL_STYLE[lv]}`}>{lv} — {LEVEL_ACTION[lv]}</span>)}
        </div>
      </div>

      {/* ===== Formulário de apuração ===== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-200 flex items-center gap-1.5"><HeartPulse className="w-4 h-4 text-rose-500" /> Adicionar domínio à apuração</span>
          {saving && <span className="text-[11px] text-amber-500 font-bold flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</span>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Domínio (ex: Demandas de trabalho)" className={inputCls} />
          <input value={agent} onChange={(e) => setAgent(e.target.value)} placeholder="Agente nocivo (ex: Excesso de demandas)" className={inputCls} />
          <input value={harm} onChange={(e) => setHarm(e.target.value)} placeholder="Possíveis danos (ex: Estresse ocupacional, DORT)" className="sm:col-span-2 w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none" />
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">% Favorabilidade</label><input type="number" min={0} max={100} value={percent} onChange={(e) => setPercent(Number(e.target.value))} className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Probabilidade</label><select value={probability} onChange={(e) => setProbability(Number(e.target.value))} className={inputCls}>{PROBABILITY.map((p) => <option key={p.n} value={p.n}>{p.n}</option>)}</select></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Severidade</label><select value={severity} onChange={(e) => setSeverity(Number(e.target.value))} className={inputCls}>{SEVERITY.map((s) => <option key={s.n} value={s.n}>{s.n}</option>)}</select></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded text-[11px] font-black ${LEVEL_STYLE[riskLevel(probability, severity)]}`}>Nível: {riskLevel(probability, severity)} ({probability * severity})</span>
          <button onClick={addItem} className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase rounded"><Plus className="w-4 h-4" /> Adicionar</button>
        </div>
      </div>

      {/* ===== Apuração dos Resultados ===== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-tight">Apuração dos Resultados</h3>
          <span className="text-[11px] text-blue-600 font-bold uppercase">Geral</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#34607d] text-white uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Domínio</th>
                <th className="p-2.5 text-center">%</th>
                <th className="p-2.5">Agente nocivo</th>
                <th className="p-2.5">Possíveis danos</th>
                <th className="p-2.5 text-center">Probabilidade (1 a 5)</th>
                <th className="p-2.5 text-center">Severidade (1 a 5)</th>
                <th className="p-2.5 text-center">Nível de risco</th>
                <th className="p-2.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={8} className="p-6 text-center text-slate-400"><Loader2 className="w-4 h-4 animate-spin inline" /> Carregando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="p-6 text-center text-slate-400">Nenhum domínio apurado ainda.</td></tr>
              ) : items.map((it) => {
                const lv = riskLevel(it.probability, it.severity);
                return (
                  <tr key={it.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-slate-150">{it.domain}</td>
                    <td className="p-2.5 text-center"><span className={`px-2 py-0.5 rounded font-black ${pctStyle(it.percent)}`}>{it.percent}%</span></td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">{it.agent}</td>
                    <td className="p-2.5 text-slate-500">{it.harm || '—'}</td>
                    <td className="p-2.5 text-center font-bold">{it.probability}</td>
                    <td className="p-2.5 text-center font-bold">{it.severity}</td>
                    <td className="p-2.5 text-center"><span className={`px-2 py-0.5 rounded font-black uppercase ${LEVEL_STYLE[lv]}`}>{lv}</span></td>
                    <td className="p-2.5 text-right"><button onClick={() => removeItem(it.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-slate-400 flex items-center gap-1 px-4 py-2"><Save className="w-3 h-3" /> Salvo automaticamente. Ferramenta de apoio ao PGR — não substitui a avaliação do responsável técnico.</p>
      </div>
    </div>
  );
}
