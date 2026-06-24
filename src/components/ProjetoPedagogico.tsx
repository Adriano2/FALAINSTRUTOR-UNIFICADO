/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import { Course } from '../types';
import { ShieldEmblem } from './BrandLogo';
import { contentApi } from '../api';

interface ProjetoPedagogicoProps {
  courses: Course[];
  onNavigateHome: () => void;
}

interface TechResp { name: string; title?: string; register?: string; document?: string; fileUrl?: string }

// Responsável técnico padrão (configurável no painel admin → Arquivos).
const DEFAULT_TECH: TechResp = {
  name: 'Magnus Leandro de Souza',
  title: 'Engenheiro de Segurança do Trabalho',
  register: 'CREA-SP 5070766148',
  document: 'CPF 221.761.998-55',
  fileUrl: '/arquivos/CREA-MAGNUS-LEANDRO-DE-SOUZA.pdf',
};

const NAVY = '#0f2147';

// Cabeçalho de seção no estilo do documento (pílula navy).
function SecHeader({ n, title }: { n: string; title: string }) {
  return (
    <div className="inline-block px-4 py-2 rounded-md text-white text-sm font-bold mb-3" style={{ backgroundColor: NAVY }}>
      {n}- {title}
    </div>
  );
}

export default function ProjetoPedagogico({ courses, onNavigateHome }: ProjetoPedagogicoProps) {
  // Responsável técnico configurável no painel admin (Arquivos).
  const [tech, setTech] = React.useState<TechResp>(DEFAULT_TECH);
  React.useEffect(() => {
    contentApi.get('tech_responsible').then((d) => {
      if (Array.isArray(d) && d[0]?.name) setTech({ ...DEFAULT_TECH, ...d[0] });
    }).catch(() => {});
  }, []);

  const sumario = [
    'Justificativa', 'Informações dos cursos', 'Objetivo Geral', 'Perfil profissional',
    'Público-alvo', 'Escolaridade mínima requerida', 'Documentos para matrícula',
    'Conteúdo programático', 'Instalações e equipamentos', 'Perfil dos instrutores',
    'Materiais didáticos', 'Bibliografia de apoio', 'Certificação',
    'Equipe técnica responsável', 'Validade', 'Responsabilidades', 'Anexos',
  ];

  return (
    <div className="w-full bg-slate-100 dark:bg-slate-950 py-8 font-sans print:bg-white print:py-0">
      {/* Barra de ações (não imprime) */}
      <div className="mx-auto max-w-4xl px-4 mb-6 flex items-center justify-between print:hidden">
        <button onClick={onNavigateHome} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer">
          <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
        </button>
      </div>

      <div className="mx-auto max-w-4xl bg-white shadow-lg print:shadow-none" style={{ color: '#1f2a3a' }}>
        {/* ---- CAPA ---- */}
        <section className="relative grid grid-cols-1 sm:grid-cols-2 overflow-hidden" style={{ minHeight: 520, backgroundColor: NAVY }}>
          <div className="relative z-10 p-8 sm:p-10 flex flex-col justify-between text-white">
            <ShieldEmblem className="w-16 h-auto" />
            <div className="mt-6">
              <h1 className="text-5xl font-black leading-[0.95]">Projeto<br />Pedagógico</h1>
              <div className="inline-flex items-center gap-2 border border-white/40 rounded-md px-3 py-1.5 mt-5 text-xs font-semibold tracking-wide">
                ▾ TREINAMENTOS SST
              </div>
              <div className="border-l-2 border-white/50 pl-3 mt-5">
                <p className="text-lg font-semibold leading-snug">Treinamentos Normativos de Segurança e Saúde do Trabalho — SST</p>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed mt-4 max-w-xs">
                Documento elaborado em conformidade com a NR-01 (Anexo II), que exige projeto pedagógico
                para capacitações nas modalidades EaD e semipresencial.
              </p>
            </div>
            <div className="text-[11px] text-white/60 mt-6">FalaInstrutor • Segurança do Trabalho</div>
          </div>
          {/* Foto da capa com efeito duotone navy */}
          <div className="relative min-h-[220px]">
            <img
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80"
              alt="Profissional de segurança do trabalho"
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0" style={{ backgroundColor: NAVY, mixBlendMode: 'multiply', opacity: 0.75 }} />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f2147] via-transparent to-transparent" />
          </div>
        </section>

        {/* ---- SUMÁRIO ---- */}
        <section className="p-8 sm:p-10">
          <div className="inline-flex items-center gap-3 rounded-md px-5 py-3 mb-5" style={{ backgroundColor: NAVY }}>
            <FileText className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-black text-white">Sumário</h2>
          </div>
          <ol className="space-y-1.5 text-[15px]" style={{ color: NAVY }}>
            {sumario.map((s, i) => (
              <li key={i} className="font-medium">{i + 1}- {s}</li>
            ))}
          </ol>
        </section>

        {/* ---- SEÇÕES ---- */}
        <div className="px-8 sm:px-10 pb-12 space-y-8 text-[14px] leading-relaxed text-slate-700">
          <section>
            <SecHeader n="1" title="Justificativa" />
            <p className="mb-3">
              Este projeto pedagógico tem por finalidade assegurar o atendimento à Norma Regulamentadora NR-01,
              que determina a elaboração de um projeto pedagógico, com seus elementos constitutivos, sempre que a
              capacitação ocorrer nas modalidades de ensino a distância (EaD) ou semipresencial.
            </p>
            <p className="mb-3">
              A FalaInstrutor estrutura aqui sua metodologia, objetivos, conteúdos programáticos, critérios de
              avaliação, recursos didáticos e estratégias de ensino, de modo a garantir a qualidade da formação,
              o cumprimento da carga horária mínima e a efetividade da aprendizagem, em conformidade com a
              legislação vigente de Segurança e Saúde no Trabalho.
            </p>
            <p>Nossos cursos são <strong>assíncronos</strong> no formato EaD e <strong>síncronos e assíncronos</strong> no formato semipresencial.</p>
          </section>

          <section>
            <SecHeader n="2" title="Informações dos cursos" />
            <p>
              Os treinamentos abrangem as principais Normas Regulamentadoras de SST, com carga horária e conteúdo
              definidos conforme cada norma. As turmas são conduzidas por instrutores qualificados, com material
              didático próprio e avaliação de aprendizagem ao final de cada módulo.
            </p>
          </section>

          <section>
            <SecHeader n="3" title="Objetivo Geral" />
            <p>
              Capacitar trabalhadores e profissionais para a identificação de riscos, a adoção de medidas
              preventivas e o cumprimento das exigências legais de cada Norma Regulamentadora, promovendo
              ambientes de trabalho mais seguros e saudáveis.
            </p>
          </section>

          <section>
            <SecHeader n="4" title="Perfil profissional" />
            <p>
              Ao concluir os treinamentos, o participante estará apto a reconhecer perigos ocupacionais, aplicar
              procedimentos seguros, utilizar corretamente os equipamentos de proteção e atuar em conformidade
              com as normas de segurança aplicáveis à sua atividade.
            </p>
          </section>

          <section>
            <SecHeader n="5" title="Público-alvo" />
            <p>
              Trabalhadores, supervisores, técnicos e demais profissionais cujas atividades exijam capacitação
              em Segurança e Saúde no Trabalho, bem como empresas que necessitem regularizar seus treinamentos
              obrigatórios.
            </p>
          </section>

          <section>
            <SecHeader n="6" title="Escolaridade mínima requerida" />
            <p>
              A escolaridade mínima observa o que cada Norma Regulamentadora estabelece. Quando a norma não
              especifica, recomenda-se que o participante seja alfabetizado e capaz de compreender o conteúdo
              ministrado.
            </p>
          </section>

          <section>
            <SecHeader n="7" title="Documentos para matrícula" />
            <ul className="list-disc pl-5 space-y-1">
              <li>Documento oficial com foto (RG ou CNH);</li>
              <li>CPF;</li>
              <li>Comprovante de vínculo/função, quando exigido pela norma.</li>
            </ul>
          </section>

          <section>
            <SecHeader n="8" title="Conteúdo programático" />
            <p className="mb-3">Os conteúdos seguem o exigido por cada Norma Regulamentadora. Cursos disponíveis na plataforma:</p>
            <ul className="list-disc pl-5 space-y-1 columns-1 sm:columns-2">
              {courses.map((c) => (
                <li key={c.id}>{c.name} — {c.duration}h</li>
              ))}
            </ul>
          </section>

          <section>
            <SecHeader n="9" title="Instalações e equipamentos" />
            <p>
              Para a modalidade EaD, o ambiente virtual de aprendizagem disponibiliza videoaulas, materiais e
              avaliações online. Para a modalidade semipresencial, as aulas práticas ocorrem em local adequado,
              com os equipamentos e EPIs necessários a cada treinamento.
            </p>
          </section>

          <section>
            <SecHeader n="10" title="Perfil dos instrutores" />
            <p>
              Os treinamentos são ministrados por profissionais habilitados em Segurança do Trabalho, com
              formação e registro compatíveis com a norma de cada curso, responsáveis técnicos pelo conteúdo
              e pela avaliação.
            </p>
          </section>

          <section>
            <SecHeader n="11" title="Materiais didáticos" />
            <p>
              Apostilas digitais, videoaulas, slides e exercícios avaliativos, disponibilizados no ambiente
              virtual e atualizados conforme as revisões das Normas Regulamentadoras.
            </p>
          </section>

          <section>
            <SecHeader n="12" title="Bibliografia de apoio" />
            <ul className="list-disc pl-5 space-y-1">
              <li>Normas Regulamentadoras do Ministério do Trabalho e Emprego (MTE);</li>
              <li>Portaria SEPRT nº 6.730/2020 e atualizações;</li>
              <li>Normas técnicas brasileiras (ABNT) aplicáveis a cada tema.</li>
            </ul>
          </section>

          <section>
            <SecHeader n="13" title="Certificação" />
            <p>
              Ao concluir o curso e ser aprovado na avaliação, o participante recebe certificado digital contendo
              nome, CPF, conteúdo programático, carga horária, data, local de realização e a qualificação do
              instrutor responsável, com código de validação público antifraude.
            </p>
          </section>

          <section>
            <SecHeader n="14" title="Equipe técnica responsável" />
            <p className="mb-3">
              O responsável técnico geral pelos treinamentos é <strong>{tech.name}</strong>
              {tech.title ? ` — ${tech.title}` : ''}{tech.register ? `, ${tech.register}` : ''}
              {tech.document ? ` (${tech.document})` : ''}.{' '}
              {tech.fileUrl ? (
                <a href={tech.fileUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold">Ver registro profissional</a>
              ) : null} Cada treinamento é conduzido e homologado pelo
              respectivo responsável técnico indicado a seguir:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {courses.map((c) => {
                const ins = c.instructors[0];
                const name = ins?.name || 'Adriano Aparecido Ribas Ricardo';
                const reg = [
                  ins?.mte ? `MTE ${ins.mte}` : (!ins ? 'MTE 0124684/SP' : ''),
                  ins?.crea ? `CREA ${ins.crea}` : '',
                  ins?.crq ? `CRQ ${ins.crq}` : '',
                ].filter(Boolean).join(' • ');
                return (
                  <li key={c.id}>
                    {c.code} — {c.name}: <strong>{name}</strong>{reg ? ` (${reg})` : ''}
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <SecHeader n="15" title="Validade" />
            <p>
              A validade de cada certificado segue a periodicidade de reciclagem prevista na Norma
              Regulamentadora correspondente.
            </p>
          </section>

          <section>
            <SecHeader n="16" title="Responsabilidades" />
            <p>
              Cabe à instituição assegurar a qualidade do conteúdo e a idoneidade da certificação; ao empregador,
              promover e custear a capacitação; e ao trabalhador, participar e aplicar as práticas seguras
              aprendidas.
            </p>
          </section>

          <section>
            <SecHeader n="17" title="Anexos" />
            <p>Modelos de certificado, conteúdos programáticos detalhados por norma e fichas de avaliação.</p>
          </section>

          <div className="pt-6 border-t border-slate-200 text-center text-[11px] text-slate-400">
            Documento em conformidade com o Anexo II da NR-01 — modalidade de ensino a distância e semipresencial. • WWW.FALAINSTRUTOR.COM.BR
          </div>
        </div>
      </div>
    </div>
  );
}
