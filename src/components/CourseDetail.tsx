/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Clock, Shield, Award, Sparkles, ShoppingCart, ArrowLeft, CheckCircle, HelpCircle } from 'lucide-react';
import { Course } from '../types';

interface CourseDetailProps {
  course: Course;
  onAddToCart: (course: Course) => void;
  onNavigateHome: () => void;
}

export default function CourseDetail({ course, onAddToCart, onNavigateHome }: CourseDetailProps) {
  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 py-12 transition-colors duration-200 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <button 
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-500 mb-6 transition-colors select-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o catálogo
        </button>

        {/* Dynamic Details Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Col 1 & 2: Course description, modules & instructors list */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Main info card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 sm:p-8 rounded-lg shadow-sm space-y-4">
              <span className="inline-block px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[10px] uppercase rounded tracking-wider">
                {course.code} • Treinamento Homologado
              </span>
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                {course.name}
              </h1>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {course.description}
              </p>

              {/* Stats row */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Duração total</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-amber-500">{course.duration} horas</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Modalidade</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-amber-500">
                    {course.description.toLowerCase().includes('semipresencial') ? 'Híbrido' : 'EAD Online'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Certificação</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-amber-500">Inclusa MTE</p>
                </div>
              </div>
            </div>

            {/* Program Content (Módulos do Curso) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                Conteúdo Programático Elaborado
              </h2>
              
              <div className="space-y-2.5">
                {course.modules.length > 0 ? (
                  course.modules.map((mod, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 p-3 bg-slate-50/60 dark:bg-slate-800/40 rounded border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex w-6 h-6 rounded-full items-center justify-center bg-amber-500/10 text-amber-500 font-bold shrink-0 text-xs">
                        {(index + 1).toString().padStart(2, '0')}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{mod}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center">Nenhum módulo registrado para este curso.</p>
                )}
              </div>
            </div>

            {/* Custom practical actions on certificate */}
            {course.manualActivities && course.manualActivities.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mb-3">
                  Atividades Práticas e Habilidades Auditadas
                </h2>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Para os treinamentos semipresenciais ou integrados, as seguintes tarefas práticas de capacitação são registradas individualmente no verso do certificado:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {course.manualActivities.map((act, idx) => (
                    <div key={idx} className="p-3 bg-indigo-500/5 dark:bg-indigo-400/5 border border-indigo-500/10 dark:border-indigo-400/10 rounded flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Designated Instructors Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                Corpo Docente & Responsabilidade Técnica
              </h2>
              
              <div className="space-y-4">
                {course.instructors.map((inst) => (
                  <div key={inst.id} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-md">
                    <div className="flex w-12 h-12 rounded-full items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white text-lg font-black shrink-0 uppercase select-none">
                      {inst.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{inst.name}</h3>
                      <p className="text-xs text-amber-500 font-bold mb-1 uppercase tracking-wider">{inst.formation}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Profissional engenheiro habilitado, cadastrado e regularizado perante o CREA regional, atuando conforme as portarias da Previdência Social e diretrizes regulamentares de SST do trânsito e indústria.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Col 3: Side payment action card */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Cost and purchase call to action */}
            <div className="sticky top-20 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg p-6 shadow-md space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Acesso imediato</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    R$ {course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-slate-400 text-xs font-semibold">Preço único</span>
                </div>
                <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 fill-current" /> Parcelamento em até 3x sem juros no cartão
                </p>
              </div>

              {/* Course indicators list */}
              <div className="space-y-3.5 text-xs border-y border-slate-100 dark:border-slate-800 py-4 font-semibold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Carga horária total: {course.duration} horas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Certificado homologado CREA/MTE</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Garantia de arrependimento (7 dias)</span>
                </div>
              </div>

              {/* Purchase button */}
              <button 
                onClick={() => onAddToCart(course)}
                className="w-full h-11 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded shadow hover:shadow-lg transition select-none cursor-pointer text-sm uppercase tracking-wide"
                id="course-buy-btn"
              >
                <ShoppingCart className="w-4 h-4" /> Comprar este treinamento
              </button>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed text-center">
                  * Faturamento em lote corporativo disponível via formulário comercial na página de início ou central telefônica institucional.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
