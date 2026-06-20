/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gestão de Empresas (admin): cadastra empresas clientes, cria o acesso do
 * gestor (role COMPANY) e vincula funcionários (alunos) à empresa — os
 * certificados desses funcionários passam a aparecer no painel da empresa.
 */

import React from 'react';
import { Plus, Loader2, Building2, ToggleLeft, ToggleRight, UserPlus, Users, Check, Search } from 'lucide-react';
import { adminApi, ApiCompany } from '../../api';
import { User } from '../../types';

interface CompanyManagerProps {
  users: User[];
}

export default function CompanyManager({ users }: CompanyManagerProps) {
  const [companies, setCompanies] = React.useState<ApiCompany[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [openId, setOpenId] = React.useState<string | null>(null);

  // Formulário de nova empresa
  const [name, setName] = React.useState('');
  const [cnpj, setCnpj] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [employeeCount, setEmployeeCount] = React.useState('');
  const [cnae, setCnae] = React.useState('');
  const [cnaeDescription, setCnaeDescription] = React.useState('');
  const [riskGrade, setRiskGrade] = React.useState<number | ''>('');
  const [lookingUp, setLookingUp] = React.useState(false);
  const [cnpjStatus, setCnpjStatus] = React.useState('');
  const lastLookup = React.useRef('');

  // Gestor por empresa
  const [mgr, setMgr] = React.useState<{ name: string; email: string; cpf: string; password: string }>({ name: '', email: '', cpf: '', password: '' });
  // Seleção de funcionários
  const [selected, setSelected] = React.useState<string[]>([]);

  const students = users.filter((u) => u.role === 'student');

  // Baseline de treinamentos obrigatórios por grau de risco (NR-04) — apenas
  // para pré-visualização no cadastro (a regra autoritativa está no servidor).
  const OBLIGATORY_BY_RISK: Record<number, string[]> = {
    1: ['NR 01', 'NR 05', 'NR 06'],
    2: ['NR 01', 'NR 05', 'NR 06', 'NR 23'],
    3: ['NR 01', 'NR 05', 'NR 06', 'NR 23', 'NR 17', 'NR 35'],
    4: ['NR 01', 'NR 05', 'NR 06', 'NR 23', 'NR 17', 'NR 35', 'NR 33', 'NR 20'],
  };

  const handleCnpjLookup = async () => {
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length !== 14) { setCnpjStatus('Informe um CNPJ com 14 dígitos.'); return; }
    lastLookup.current = digits;
    setLookingUp(true);
    setCnpjStatus('Consultando CNPJ...');
    try {
      const { info } = await adminApi.lookupCnpj(cnpj);
      if (info.razaoSocial) setName(info.razaoSocial); // preenche Razão social automaticamente
      if (info.cnae) setCnae(info.cnae);
      if (info.cnaeDescription) setCnaeDescription(info.cnaeDescription);
      if (info.riskGrade) setRiskGrade(info.riskGrade);
      setCnpjStatus(`✓ ${info.razaoSocial ?? 'Empresa'} • CNAE ${info.cnae ?? '—'} • Grau de risco ${info.riskGrade ?? '—'}`);
    } catch (err) {
      setCnpjStatus((err instanceof Error ? err.message : 'Falha na consulta.') + ' Preencha os dados manualmente.');
    } finally {
      setLookingUp(false);
    }
  };

  // Busca automática quando o CNPJ fica completo (14 dígitos).
  React.useEffect(() => {
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length === 14 && digits !== lastLookup.current) {
      handleCnpjLookup();
    }
    if (digits.length < 14) lastLookup.current = '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cnpj]);

  const load = React.useCallback(() => {
    setLoading(true);
    adminApi.listCompanies().then((d) => setCompanies(d.companies ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { alert('Informe o nome da empresa.'); return; }
    const count = parseInt(employeeCount, 10);
    if (!Number.isInteger(count) || count < 1) { alert('Informe o total de funcionários (obrigatório, mínimo 1).'); return; }
    try {
      const res = await adminApi.createCompany({
        name: name.trim(), cnpj: cnpj.trim() || undefined, email: email.trim() || undefined, phone: phone.trim() || undefined,
        employeeCount: count, cnae: cnae.trim() || undefined, cnaeDescription: cnaeDescription.trim() || undefined,
        riskGrade: riskGrade === '' ? undefined : Number(riskGrade),
      });
      setCompanies((prev) => [{ ...res.company, _count: { members: 0 } }, ...prev]);
      setName(''); setCnpj(''); setEmail(''); setPhone(''); setEmployeeCount(''); setCnae(''); setCnaeDescription(''); setRiskGrade('');
    } catch (err) { alert(err instanceof Error ? err.message : 'Não foi possível criar a empresa.'); }
  };

  const toggleActive = async (c: ApiCompany) => {
    try {
      const res = await adminApi.updateCompany(c.id, { isActive: !c.isActive });
      setCompanies((prev) => prev.map((x) => (x.id === c.id ? { ...x, isActive: res.company.isActive } : x)));
    } catch { /* ignore */ }
  };

  const open = (id: string) => {
    setOpenId(openId === id ? null : id);
    setMgr({ name: '', email: '', cpf: '', password: '' });
    setSelected([]);
  };

  const createManager = async (companyId: string) => {
    if (!mgr.name || !mgr.email || !mgr.cpf || mgr.password.length < 6) {
      alert('Preencha nome, e-mail, CPF e senha (mínimo 6 caracteres) do gestor.');
      return;
    }
    try {
      await adminApi.createCompanyManager(companyId, mgr);
      alert('Acesso do gestor criado! Ele já pode entrar com esse e-mail e senha.');
      setMgr({ name: '', email: '', cpf: '', password: '' });
    } catch (err) { alert(err instanceof Error ? err.message : 'Não foi possível criar o gestor.'); }
  };

  const assignSelected = async (companyId: string) => {
    if (selected.length === 0) { alert('Selecione ao menos um funcionário.'); return; }
    try {
      await Promise.all(selected.map((uid) => adminApi.assignUserCompany(uid, companyId)));
      alert(`${selected.length} funcionário(s) vinculado(s) à empresa.`);
      setSelected([]);
      load();
    } catch (err) { alert(err instanceof Error ? err.message : 'Não foi possível vincular.'); }
  };

  const inputCls = 'w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Gestão de Empresas</h2>
        <p className="text-xs text-slate-400">Cadastre empresas clientes, crie o acesso do gestor e vincule os funcionários. Cada empresa vê apenas os certificados da sua equipe.</p>
      </div>

      {/* Nova empresa */}
      <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Building2 className="w-4 h-4 text-blue-600" /><span className="text-xs font-black uppercase tracking-wide">Cadastrar Empresa</span>
        </div>
        {/* CNPJ com busca automática (CNAE + grau de risco NR-04) */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">CNPJ</label>
          <div className="flex gap-2">
            <input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" className={inputCls} />
            <button type="button" onClick={handleCnpjLookup} disabled={lookingUp} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-[11px] uppercase rounded cursor-pointer">
              {lookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Buscar
            </button>
          </div>
          {cnpjStatus ? (
            <p className={`text-[10px] ${cnpjStatus.startsWith('✓') ? 'text-emerald-600' : 'text-slate-400'}`}>{cnpjStatus}</p>
          ) : (
            <p className="text-[10px] text-slate-400">Ao digitar os 14 dígitos, a razão social, o CNAE e o grau de risco (NR-04) são preenchidos automaticamente.</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Nome / Razão social *</label><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Total de funcionários *</label><input type="number" min={1} value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} placeholder="Ex: 45" className={inputCls} /></div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">CNAE principal</label><input value={cnae} onChange={(e) => setCnae(e.target.value)} placeholder="Ex: 4120-4/00" className={inputCls} /></div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Grau de risco (NR-04)</label>
            <select value={riskGrade} onChange={(e) => setRiskGrade(e.target.value === '' ? '' : Number(e.target.value))} className={inputCls}>
              <option value="">— selecione —</option>
              {[1, 2, 3, 4].map((g) => <option key={g} value={g}>Grau {g}</option>)}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase">Descrição do CNAE</label><input value={cnaeDescription} onChange={(e) => setCnaeDescription(e.target.value)} className={inputCls} /></div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">E-mail</label><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Telefone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></div>
        </div>

        {/* Pré-visualização dos treinamentos obrigatórios pelo grau de risco */}
        {riskGrade !== '' && (
          <div className="text-[11px] text-slate-500 bg-blue-500/5 border border-blue-500/15 rounded p-2.5">
            <span className="font-bold text-slate-600 dark:text-slate-300">Treinamentos obrigatórios (grau {riskGrade}):</span>{' '}
            {OBLIGATORY_BY_RISK[Number(riskGrade)].join(', ')}
          </div>
        )}

        <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase rounded cursor-pointer"><Plus className="w-4 h-4" /> Cadastrar Empresa</button>
      </form>

      {/* Lista de empresas */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-400">Empresas Cadastradas</h3>
        {loading ? (
          <p className="text-xs text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</p>
        ) : companies.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">Nenhuma empresa cadastrada ainda.</p>
        ) : (
          companies.map((c) => (
            <div key={c.id} className={`bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm ${c.isActive ? '' : 'opacity-60'}`}>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{c.name}</p>
                  <p className="text-[11px] text-slate-400">{c.cnpj ? `CNPJ ${c.cnpj} • ` : ''}{c._count?.members ?? 0} funcionário(s)</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(c)} title={c.isActive ? 'Desativar' : 'Ativar'}>
                    {c.isActive ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                  </button>
                  <button onClick={() => open(c.id)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold">Gerenciar</button>
                </div>
              </div>

              {openId === c.id && (
                <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4">
                  {/* Acesso do gestor */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-1.5"><UserPlus className="w-4 h-4 text-blue-600" /> Acesso do gestor</span>
                    <input value={mgr.name} onChange={(e) => setMgr({ ...mgr, name: e.target.value })} placeholder="Nome do gestor" className={inputCls} />
                    <input value={mgr.email} onChange={(e) => setMgr({ ...mgr, email: e.target.value })} placeholder="E-mail (login)" className={inputCls} />
                    <input value={mgr.cpf} onChange={(e) => setMgr({ ...mgr, cpf: e.target.value })} placeholder="CPF" className={inputCls} />
                    <input type="password" value={mgr.password} onChange={(e) => setMgr({ ...mgr, password: e.target.value })} placeholder="Senha (mín. 6)" className={inputCls} />
                    <button onClick={() => createManager(c.id)} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase rounded">Criar acesso do gestor</button>
                  </div>

                  {/* Vincular funcionários */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-1.5"><Users className="w-4 h-4 text-blue-600" /> Vincular funcionários</span>
                    <div className="max-h-44 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded p-2 bg-slate-50/50 dark:bg-slate-950 space-y-1">
                      {students.length === 0 ? (
                        <p className="text-[11px] text-slate-400 p-1">Nenhum aluno cadastrado.</p>
                      ) : students.map((u) => (
                        <label key={u.id} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer p-1">
                          <input type="checkbox" checked={selected.includes(u.id)} onChange={() => setSelected((p) => p.includes(u.id) ? p.filter((x) => x !== u.id) : [...p, u.id])} className="accent-blue-600" />
                          <span className="truncate">{u.name} <span className="text-slate-400">({u.email})</span></span>
                        </label>
                      ))}
                    </div>
                    <button onClick={() => assignSelected(c.id)} className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase rounded flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> Vincular selecionados</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
