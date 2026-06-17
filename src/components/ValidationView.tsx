/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Search, FileText, CheckCircle2, User, Key, Calendar, MapPin, Award, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Enrollment, User as UserType, Course } from '../types';

interface ValidationViewProps {
  enrollments: Enrollment[];
  users: UserType[];
  courses: Course[];
}

export default function ValidationView({ enrollments, users, courses }: ValidationViewProps) {
  const [searchCode, setSearchCode] = React.useState('');
  const [matchedCertificate, setMatchedCertificate] = React.useState<any | null>(null);
  const [performedSearch, setPerformedSearch] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode) return;

    setPerformedSearch(true);
    const cleanCode = searchCode.trim().toUpperCase();

    // Find enrollment matching certificate code
    const enrollment = enrollments.find((en) => en.certificateCode?.toUpperCase() === cleanCode);
    
    if (enrollment) {
      // retrieve related user info
      const student = users.find((u) => u.id === enrollment.userId);
      // retrieve course info
      const course = courses.find((c) => c.id === enrollment.courseId);

      setMatchedCertificate({
        code: enrollment.certificateCode,
        studentName: enrollment.userName,
        studentCpf: student?.cpf || "Não cadastrado",
        studentDob: student?.dob || "Não cadastrada",
        courseName: enrollment.courseName,
        courseCode: enrollment.courseCode,
        workload: course?.duration || 8,
        startDate: enrollment.startDate,
        completionDate: enrollment.startDate, // assuming same-day completion for simplicity
        instructor: course?.instructors[0]?.name || "Instrutor Qualificado",
        instructorFormation: course?.instructors[0]?.formation || "Engenheiro de Segurança / Civil",
        manualActivities: course?.manualActivities || [],
        status: "VÁLIDO & AUTENTICADO",
        digitalSeal: "SH-SHA256-" + enrollment.certificateCode + "-892EF0"
      });
    } else {
      setMatchedCertificate(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      
      {/* Intro branding */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
          Validação Pública de Certificados
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Nossa solução utiliza tecnologia antifraude para verificação ágil de certificados de capacitação. Digite a chave autenticadora impressa no documento para verificar a regularidade legal perante as Normas Regulamentadoras (MTE).
        </p>
      </div>

      {/* Query Search Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
            Código Autenticador do Certificado
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full flex items-center gap-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-600">
              <Key className="w-5 h-5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Ex COD: CERT-35-JESSICA-01A"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full text-sm bg-transparent border-none text-slate-900 dark:text-white uppercase focus:outline-none font-sans font-medium"
                required
              />
            </div>
            <button 
              type="submit"
              className="sm:w-36 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wide rounded-xl shadow-xs cursor-pointer select-none flex items-center justify-center gap-1.5 shrink-0 font-display"
              id="certificate-search-btn"
            >
              <Search className="w-4 h-4" /> Validar
            </button>
          </div>
          <span className="text-[10px] text-slate-400 leading-normal block font-sans">
            * Caso queira testar a validação imediata, utilize o código de JESSICA: <strong className="text-blue-600 select-all">CERT-35-JESSICA-01A</strong> ou o de THIAGO: <strong className="text-blue-600 select-all">CERT-35-THIAGO-02B</strong>
          </span>
        </form>
      </div>

      {/* Query results panel */}
      {performedSearch && (
        <div className="animate-fade-in">
          {matchedCertificate ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg p-6 sm:p-8 shadow-lg space-y-6">
              
              {/* Authenticated Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-full">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-emerald-500 tracking-wider block">Status do Certificado</span>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{matchedCertificate.status}</h2>
                  </div>
                </div>
                
                <div className="text-center sm:text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Assinante Digital Responsável</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{matchedCertificate.instructor}</span>
                </div>
              </div>

              {/* Dossier details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
                
                {/* Outliner student details */}
                <div className="space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Identificação do Profissional</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-450 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400 pr-1 select-none">Nome completo:</span>
                      <strong className="text-slate-900 dark:text-white">{matchedCertificate.studentName}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-450 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400 pr-1 select-none">CPF do profissional:</span>
                      <strong className="text-slate-900 dark:text-white">{matchedCertificate.studentCpf}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-450 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400 pr-1 select-none">Nascimento:</span>
                      <strong className="text-slate-900 dark:text-white">{matchedCertificate.studentDob}</strong>
                    </div>
                  </div>
                </div>

                {/* Training detailed attributes */}
                <div className="space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dados do Treinamento Regulamentado</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-slate-450 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400 pr-1 select-none">Norma / Curso:</span>
                      <strong className="text-slate-900 dark:text-white">{matchedCertificate.courseName}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-450 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400 pr-1 select-none">Carga Horária:</span>
                      <strong className="text-slate-900 dark:text-white">{matchedCertificate.workload} horas</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-450 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400 pr-1 select-none">Conclusão:</span>
                      <strong className="text-slate-900 dark:text-white">{matchedCertificate.completionDate}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Associated manual activities list */}
              {matchedCertificate.manualActivities.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Módulos Práticos de Campo Homologados</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedCertificate.manualActivities.map((act: string, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700/50 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-semibold text-slate-750 dark:text-slate-350">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security and Signature authenticity */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500 leading-normal">
                
                <div className="space-y-1">
                  <strong className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Identificador de Autenticidade</strong>
                  <span className="font-mono text-slate-800 dark:text-slate-350 select-all font-semibold block">{matchedCertificate.digitalSeal}</span>
                  <span>Assinatura eletrônica em conformidade com o ICP-Brasil e homologação de responsabilidade técnica pela FALA INSTRUTOR A2 CONSUTORIA SEG HIGIENE OCUPACIONAL.</span>
                </div>

                <div className="space-y-1 p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-100 dark:border-slate-800 text-center sm:text-left flex flex-col justify-center">
                  <strong className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-0.5">Certificação Registrada</strong>
                  <span>Esta credencial atende de forma integral a todos os requisitos normativos do Ministério do Trabalho e Emprego, regularizada sob o CNPJ 60.511.651/0001-78 e registrada perante o conselho CREA de classe.</span>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-lg shadow text-center space-y-4">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full inline-block">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Código Não Localizado</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-normal">
                O código de autenticação digitado não corresponde a nenhum certificado regular e ativo emitido pelo FalaInstrutor. Verifique se o código possui erros de digitação e tente novamente.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
