/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Base de gerenciamento de Nota Fiscal de Serviço (NFS-e). Cadastro manual de
 * notas para tomadores PF (CPF) e PJ (CNPJ). A emissão automática junto à
 * prefeitura/SEFAZ (integração) será adicionada futuramente — por ora o fluxo
 * é manual: a nota nasce "Pendente" e o admin marca como Emitida/Cancelada.
 */

import React from 'react';
import { Plus, Trash2, Loader2, FileText, Info } from 'lucide-react';
import { adminApi, ApiInvoice } from '../../api';

const STATUS_LABEL: Record<ApiInvoice['status'], string> = {
  PENDING: 'Pendente',
  ISSUED: 'Emitida',
  CANCELED: 'Cancelada',
};
const STATUS_CLS: Record<ApiInvoice['status'], string> = {
  PENDING: 'bg-amber-500/10 text-amber-600',
  ISSUED: 'bg-emerald-500/10 text-emerald-600',
  CANCELED: 'bg-red-500/10 text-red-600',
};

export default function InvoiceManager() {
  const [invoices, setInvoices] = React.useState<ApiInvoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [recipientType, setRecipientType] = React.useState<'PF' | 'PJ'>('PF');
  const [document, setDocument] = React.useState('');
  const [recipientName, setRecipientName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [serviceDesc, setServiceDesc] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [issueDate, setIssueDate] = React.useState('');

  const load = React.useCallback(() => {
    setLoading(true);
    adminApi
      .listInvoices()
      .then((d) => setInvoices(Array.isArray(d.invoices) ? d.invoices : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const totals = React.useMemo(() => {
    const issued = invoices.filter((i) => i.status === 'ISSUED');
    return {
      count: invoices.length,
      issued: issued.length,
      pending: invoices.filter((i) => i.status === 'PENDING').length,
      revenue: issued.reduce((acc, i) => acc + i.amount, 0),
    };
  }, [invoices]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document.trim() || !recipientName.trim() || !serviceDesc.trim()) {
      alert('Preencha documento, nome/razão social e descrição do serviço.');
      return;
    }
    const value = Number(String(amount).replace(',', '.'));
    if (!Number.isFinite(value) || value < 0) { alert('Informe um valor válido.'); return; }
    setSaving(true);
    try {
      const res = await adminApi.createInvoice({
        recipientType, document: document.trim(), recipientName: recipientName.trim(),
        email: email.trim() || undefined, serviceDesc: serviceDesc.trim(), amount: value,
        issueDate: issueDate || undefined,
      });
      setInvoices((prev) => [res.invoice, ...prev]);
      setDocument(''); setRecipientName(''); setEmail(''); setServiceDesc(''); setAmount(''); setIssueDate('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível cadastrar a nota.');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (id: string, status: ApiInvoice['status']) => {
    try {
      const res = await adminApi.updateInvoice(id, { status });
      setInvoices((prev) => prev.map((i) => (i.id === id ? res.invoice : i)));
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta nota fiscal?')) return;
    try { await adminApi.deleteInvoice(id); setInvoices((prev) => prev.filter((i) => i.id !== id)); } catch { /* ignore */ }
  };

  const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const inputCls = 'w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Notas Fiscais de Serviço</h2>
        <p className="text-xs text-slate-400">Base de gerenciamento de NFS-e para tomadores pessoa física (CPF) e jurídica (CNPJ).</p>
      </div>

      {/* Aviso de integração futura */}
      <div className="flex items-start gap-2 p-3 rounded bg-blue-500/5 border border-blue-500/15 text-[11px] text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <span>
          A emissão automática junto à prefeitura/SEFAZ (integração para CPF e CNPJ) será habilitada futuramente.
          Por enquanto, o gerenciamento é manual: a nota nasce <strong>Pendente</strong> e você marca como <strong>Emitida</strong> ou <strong>Cancelada</strong>.
        </span>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
          <span className="text-[10px] text-slate-450 uppercase font-black block">Total de notas</span>
          <strong className="text-lg font-extrabold text-slate-900 dark:text-white">{totals.count}</strong>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
          <span className="text-[10px] text-slate-450 uppercase font-black block">Pendentes</span>
          <strong className="text-lg font-extrabold text-amber-600">{totals.pending}</strong>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
          <span className="text-[10px] text-slate-450 uppercase font-black block">Emitidas</span>
          <strong className="text-lg font-extrabold text-emerald-600">{totals.issued}</strong>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
          <span className="text-[10px] text-slate-450 uppercase font-black block">Receita emitida</span>
          <strong className="text-sm font-extrabold text-slate-900 dark:text-white">{brl(totals.revenue)}</strong>
        </div>
      </div>

      {/* Formulário de cadastro */}
      <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-black uppercase tracking-wide">Lançar Nota Fiscal</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo de tomador</label>
            <select value={recipientType} onChange={(e) => setRecipientType(e.target.value as 'PF' | 'PJ')} className={inputCls}>
              <option value="PF">Pessoa Física (CPF)</option>
              <option value="PJ">Pessoa Jurídica (CNPJ)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">{recipientType === 'PF' ? 'CPF' : 'CNPJ'} *</label>
            <input type="text" value={document} onChange={(e) => setDocument(e.target.value)} placeholder={recipientType === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">{recipientType === 'PF' ? 'Nome completo' : 'Razão social'} *</label>
            <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">E-mail (opcional)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição do serviço *</label>
            <input type="text" value={serviceDesc} onChange={(e) => setServiceDesc(e.target.value)} placeholder="Ex: Treinamento NR-35 - Segurança no Trabalho em Altura" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Valor (R$) *</label>
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Data de emissão</label>
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputCls} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-xs uppercase rounded cursor-pointer select-none">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Lançar Nota
        </button>
      </form>

      {/* Lista de notas */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-205 dark:border-slate-800 overflow-x-auto shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-450 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3">Tomador</th>
              <th className="p-3">Documento</th>
              <th className="p-3">Serviço</th>
              <th className="p-3 text-right">Valor</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-400"><Loader2 className="w-4 h-4 animate-spin inline" /> Carregando...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-400">Nenhuma nota fiscal lançada ainda.</td></tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                  <td className="p-3">
                    <p className="font-bold text-slate-900 dark:text-slate-150">{inv.recipientName}</p>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{inv.recipientType === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{inv.document}</td>
                  <td className="p-3 max-w-[220px] truncate text-slate-700 dark:text-slate-300">{inv.serviceDesc}</td>
                  <td className="p-3 text-right font-black text-slate-900 dark:text-white">{brl(inv.amount)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${STATUS_CLS[inv.status]}`}>{STATUS_LABEL[inv.status]}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <select
                        value={inv.status}
                        onChange={(e) => setStatus(inv.id, e.target.value as ApiInvoice['status'])}
                        className="text-[10px] p-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
                        title="Alterar status"
                      >
                        <option value="PENDING">Pendente</option>
                        <option value="ISSUED">Emitida</option>
                        <option value="CANCELED">Cancelada</option>
                      </select>
                      <button onClick={() => handleDelete(inv.id)} className="p-1 text-slate-400 hover:text-red-500" title="Remover">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
