/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Painel da Empresa: o gestor (role 'company') vê apenas a sua empresa — a lista
 * de funcionários e os certificados emitidos por eles. Dados com escopo restrito
 * vindos de /api/company/me.
 */

import React from 'react';
import { Building2, Users, Award, Loader2, ChevronDown, ChevronRight, ShieldCheck, Download } from 'lucide-react';
import { companyApi, CompanyDashboardData } from '../api';

interface CompanyDashboardProps {
  onValidateCertificate: (code: string) => void;
}

export default function CompanyDashboard({ onValidateCertificate }: CompanyDashboardProps) {
  const [data, setData] = React.useState<CompanyDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    companyApi
      .getDashboard()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar o painel.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-32 text-slate-400 text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando painel...</div>;
  }
  if (error || !data) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-slate-500">{error || 'Sem dados.'}</div>;
  }

  const employees = data.employees.filter((e) =>
    !query.trim() || e.name.toLowerCase().includes(query.toLowerCase()) || e.cpf.includes(query) || e.email.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      {/* Cabeçalho da empresa */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-blue-600/10 text-blue-600"><Building2 className="w-7 h-7" /></div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{data.company?.name ?? 'Minha Empresa'}</h1>
          <p className="text-xs text-slate-400">
            {data.company?.cnpj ? `CNPJ ${data.company.cnpj}` : 'Painel corporativo'} • Certificados da sua equipe
          </p>
        </div>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full"><Users className="w-5 h-5" /></div>
          <div>
            <span className="text-[10px] text-slate-450 uppercase font-black block">Funcionários</span>
            <strong className="text-lg font-extrabold text-slate-900 dark:text-white">{data.stats.employees}</strong>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full"><Award className="w-5 h-5" /></div>
          <div>
            <span className="text-[10px] text-slate-450 uppercase font-black block">Certificados emitidos</span>
            <strong className="text-lg font-extrabold text-slate-900 dark:text-white">{data.stats.certificates}</strong>
          </div>
        </div>
      </div>

      {/* Busca */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar funcionário por nome, CPF ou e-mail..."
        className="w-full mb-4 text-sm p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
      />

      {/* Lista de funcionários */}
      <div className="space-y-2">
        {employees.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            Nenhum funcionário vinculado à empresa ainda. Solicite ao administrador o vínculo dos colaboradores.
          </p>
        ) : (
          employees.map((emp) => {
            const certs = emp.enrollments.filter((e) => e.passed && e.certificateCode);
            const open = openId === emp.id;
            return (
              <div key={emp.id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : emp.id)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-850/40"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{emp.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">CPF {emp.cpf} • {emp.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase">{certs.length} cert.</span>
                    {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {open && (
                  <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800">
                    {certs.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">Nenhum certificado emitido ainda.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left mt-2">
                          <thead className="text-slate-400 uppercase text-[10px]">
                            <tr>
                              <th className="py-2">Treinamento</th>
                              <th className="py-2 text-center">Nota</th>
                              <th className="py-2">Código</th>
                              <th className="py-2 text-right">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {certs.map((c, i) => (
                              <tr key={i}>
                                <td className="py-2 font-semibold text-slate-700 dark:text-slate-200">{c.courseCode} — {c.courseName}</td>
                                <td className="py-2 text-center font-bold">{c.score ?? '—'}%</td>
                                <td className="py-2"><span className="font-mono text-emerald-600 select-all">{c.certificateCode}</span></td>
                                <td className="py-2 text-right">
                                  <button
                                    onClick={() => onValidateCertificate(c.certificateCode!)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" /> Ver / validar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <p className="mt-6 text-[11px] text-slate-400 flex items-center gap-1">
        <Download className="w-3.5 h-3.5" /> Para baixar um certificado em PDF, clique em "Ver / validar" e use a opção de download na validação.
      </p>
    </div>
  );
}
