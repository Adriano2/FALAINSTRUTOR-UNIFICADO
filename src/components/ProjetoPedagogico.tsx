/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Printer, FileText, Loader2 } from 'lucide-react';
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

// Catálogo oficial de treinamentos e a carga horária na plataforma (NR-01, Anexo II).
const CARGA_HORARIA: [string, number][] = [
  ['NR 01 – Treinamento de Integração de Segurança 1', 2],
  ['NR 01 – Treinamento de Integração de Segurança 2', 6],
  ['NR 05 CIPA Nomeado – Comissão Interna De Prevenção A Acidentes e Assédio – Grau De Risco 1', 8],
  ['NR 05 CIPA Nomeado – Comissão Interna De Prevenção A Acidentes e Assédio – Grau De Risco 2', 12],
  ['NR 05 CIPA Nomeado – Comissão Interna De Prevenção A Acidentes e Assédio – Grau De Risco 3', 16],
  ['NR 05 CIPA Nomeado – Comissão Interna De Prevenção A Acidentes e Assédio – Grau De Risco 4', 20],
  ['NR 05 CIPA – Comissão Interna De Prevenção A Acidentes e Assédio – Grau De Risco 1', 8],
  ['NR 05 CIPA – Comissão Interna De Prevenção A Acidentes e Assédio – Grau De Risco 2 – Parte Teórica', 8],
  ['NR 05 CIPA – Comissão Interna De Prevenção A Acidentes e Assédio – Grau De Risco 3 – Parte Teórica', 8],
  ['NR 05 CIPA – Comissão Interna De Prevenção A Acidentes e Assédio – Grau De Risco 4 – Parte Teórica', 12],
  ['NR 06 EPI – Equipamento De Proteção Individual – 01 Hora', 1],
  ['NR 06 EPI – Equipamento De Proteção Individual – 04 Horas', 4],
  ['NR 10 – Segurança Em Serviço Com Eletricidade – Básico', 40],
  ['NR 10 – Curso Complementar – Segurança No Sistema Elétrico De Potência (SEP) E Em Suas Proximidades', 40],
  ['NR 11 – Hilo Tombador – Teórico', 5],
  ['NR 11 – Operador De Empilhadeira – Teórico – 8 Horas', 8],
  ['NR 11 – Operador De Empilhadeira – Teórico – 16 Horas', 16],
  ['NR 11 – Operador De Guindaste Articulado', 8],
  ['NR 11 – Operação De Ponte Rolante E Talha Elétrica – Teórico – 8 Horas', 8],
  ['NR 11 – Operador De Guincho Agrícola', 8],
  ['NR 11 – Operador Máquinas Agrícolas E Equipamentos', 16],
  ['NR 11/12 – Segurança Na Operação de Bobcat, Retro Escavadeira, Escavadeira Hidr. E Pá Carregadeira – Teórico', 8],
  ['NR 12 – Segurança Em Máquinas E Equipamentos – 04 Horas', 4],
  ['NR 12 – Segurança Em Máquinas E Equipamentos – 08 Horas', 8],
  ['NR 12 – Máquinas E Equipamentos – Ferramentas Elétricas E Manuais', 4],
  ['NR 12 – Máquinas E Equipamentos – Máquinas Para Açougue, Mercearia, Bar E Restaurante', 4],
  ['NR 12 – Máquinas e Equipamentos – Injetoras De Materiais Plásticos – Teórico', 4],
  ['NR 12 – Máquinas e Equipamentos – Motosserra – Teórico', 2],
  ['NR 12 – Máquinas e Equipamentos – Máquinas para Panificação e Confeitaria', 4],
  ['NR 12 – Máquinas e Equipamentos – Prensa e Similares', 4],
  ['NR 13 – Treinamento De Segurança Na Operação De Caldeiras', 40],
  ['NR 17 – Ergonomia – Capacitação Ergonômica', 4],
  ['NR 17 – Ergonomia – Ergonomia Para Operadores De Checkout – Anexo I', 2],
  ['NR 17 – Ergonomia – Trabalho Em Teleatendimento/Telemarketing – Anexo II', 4],
  ['NR 17 – Ginástica Laboral', 1],
  ['NR 18 – Integração De Segurança Na Construção Civil – 04 Horas', 4],
  ['NR 18 – Integração De Segurança Na Construção Civil – 16 Horas', 16],
  ['NR 18 – Plataforma Elevatória Móvel De Trabalho (PEMT) – Teórico', 2],
  ['NR 20 – Exposição Ocupacional Ao Benzeno Em Postos Revendedores De Combustíveis – PRC', 4],
  ['NR 20 – Iniciação Sobre Inflamáveis E Combustíveis', 3],
  ['NR 20 – Segurança Com Líquidos E Inflamáveis – Básico – Classe 1', 4],
  ['NR 20 – Segurança Com Líquidos E Inflamáveis – Básico – Classe 2', 6],
  ['NR 20 – Segurança Com Líquidos E Inflamáveis – Básico – Classe 3', 8],
  ['NR 20 – Segurança Com Líquidos E Inflamáveis – Intermediário – Classe 1', 12],
  ['NR 20 – Segurança Com Líquidos E Inflamáveis – Intermediário – Classe 2', 14],
  ['NR 20 – Segurança Com Líquidos E Inflamáveis – Intermediário – Classe 3', 16],
  ['NR 20 – Segurança Com Líquidos E Inflamáveis – Específico – Classe 2', 14],
  ['NR 20 – Segurança Com Líquidos E Inflamáveis – Específico – Classe 3', 16],
  ['NR 20 – Segurança Com Líquidos E Inflamáveis – Avançado 1', 20],
  ['NR 20 – Segurança Com Líquidos E Inflamáveis – Avançado 2', 32],
  ['NR 26 – Sinalização de Segurança', 2],
  ['NR 31 CIPATR – Comissão Interna De Prevenção De Acidentes e de Assédio do Trabalho Rural – Teórico', 20],
  ['NR 31.7 – Agrotóxicos, Adjuvantes E Produtos Afins – Teórico', 20],
  ['NR 31.12 – Segurança No Trabalho Em Máquinas E Implementos Agrícolas – Teórico', 24],
  ['NR 32 – Treinamento De Capacitação Para Profissional De Saúde', 10],
  ['NR 33 – Trabalhador Autorizado e Vigia – Teórico', 8],
  ['NR 33 – Supervisor de Entrada – Teórico', 20],
  ['NR 34.5 – Segurança para Trabalhos a Quente – Básico', 8],
  ['NR 34.5 – Observador de Trabalhos a Quente – Básico', 8],
  ['NR 35 – Trabalho Em Altura', 8],
  ['NR 36 – Segurança E Saúde No Trabalho Em Empresas De Abate, Processamento De Carnes E Derivados', 5],
  ['NR 38 – Segurança E Saúde No Trab. Nas Atividades De Limp. Urbana E Manejo De Resíduos Sólidos – Teórico', 4],
  ['Combate A Incêndio – 04 Horas', 4],
  ['Combate A Incêndio – 08 Horas', 8],
  ['Combate A Incêndio – 12 Horas', 12],
  ['Combate A Incêndio – 16 Horas', 16],
  ['Conhecendo as Normas Regulamentadoras do MTE', 2],
  ['Lei Lucas nº 13.722 – Primeiros Socorros – 04 Horas', 4],
  ['Lei Lucas nº 13.722 – Primeiros Socorros – 10 Horas', 10],
  ['Direção Defensiva – 06 Horas', 6],
  ['Direção Defensiva – 08 Horas', 8],
  ['APR – Análise Preliminar de Risco', 1],
  ['LOTO – Lockout e Tagout', 2],
  ['PPR – Programa de Proteção Respiratória', 1],
  ['PCA – Programa de Conservação Auditiva', 1],
  ['Comportamento Seguro', 1],
  ['Primeiros Socorros – Básico', 4],
  ['Primeiros Socorros', 10],
  ['Operações De Soldagem E Corte A Quente', 4],
  ['Riscos Psicossociais no Trabalho para Operadores, Colaboradores e Público Operacional', 4],
  ['Riscos Psicossociais no Trabalho para Gestores', 4],
];

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
  const docRef = React.useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = React.useState(false);

  React.useEffect(() => {
    contentApi.get('tech_responsible').then((d) => {
      if (Array.isArray(d) && d[0]?.name) setTech({ ...DEFAULT_TECH, ...d[0] });
    }).catch(() => {});
  }, []);

  // Gera um PDF A4 (multipágina) do documento — mesmo motor do certificado.
  const handleDownloadPdf = async () => {
    const el = docRef.current;
    if (!el) return;
    setPdfLoading(true);
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pageW = 210;
      const pageH = 297;
      const imgW = pageW;
      const GAP = 2; // respiro entre blocos (mm)

      // Captura bloco a bloco (capa, sumário e cada seção) para não cortar
      // conteúdo no meio de uma página.
      const blocks: HTMLElement[] = [];
      el.querySelectorAll(':scope > section').forEach((s) => blocks.push(s as HTMLElement));
      const wrapper = el.querySelector(':scope > div');
      if (wrapper) wrapper.querySelectorAll(':scope > section, :scope > div').forEach((s) => blocks.push(s as HTMLElement));

      let cursorY = 0;
      for (const block of blocks.length ? blocks : [el]) {
        const canvas = await html2canvas(block, { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: el.scrollWidth });
        const imgH = (canvas.height * imgW) / canvas.width;
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        if (imgH <= pageH) {
          // Bloco cabe em uma página: quebra antes se não couber no restante.
          if (cursorY > 0 && cursorY + imgH > pageH) { pdf.addPage(); cursorY = 0; }
          pdf.addImage(imgData, 'JPEG', 0, cursorY, imgW, imgH);
          cursorY += imgH + GAP;
        } else {
          // Bloco maior que a página (ex.: tabela longa): inicia nova página e fatia.
          if (cursorY > 0) { pdf.addPage(); cursorY = 0; }
          let heightLeft = imgH;
          let pos = 0;
          pdf.addImage(imgData, 'JPEG', 0, pos, imgW, imgH);
          heightLeft -= pageH;
          while (heightLeft > 0) { pos -= pageH; pdf.addPage(); pdf.addImage(imgData, 'JPEG', 0, pos, imgW, imgH); heightLeft -= pageH; }
          cursorY = pageH; // próximo bloco começa em nova página
        }
      }
      pdf.save('Projeto-Pedagogico-FalaInstrutor.pdf');
    } catch {
      // Fallback: usa a impressão do navegador (também permite salvar em PDF).
      window.print();
    } finally {
      setPdfLoading(false);
    }
  };

  const sumario = [
    'Justificativa', 'Informações dos cursos', 'Objetivo Geral', 'Perfil profissional',
    'Público-alvo', 'Escolaridade mínima requerida', 'Documentos para matrícula',
    'Conteúdo programático', 'Instalações e equipamentos', 'Perfil dos instrutores',
    'Materiais didáticos', 'Bibliografia de apoio', 'Certificação',
    'Equipe técnica responsável', 'Validade', 'Responsabilidades', 'Anexos',
    'Metodologia, prazos e avaliação', 'Considerações finais',
  ];

  return (
    <div className="w-full bg-slate-100 dark:bg-slate-950 py-8 font-sans print:bg-white print:py-0">
      {/* Barra de ações (não imprime) */}
      <div className="mx-auto max-w-4xl px-4 mb-6 flex items-center justify-between print:hidden">
        <button onClick={onNavigateHome} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <button onClick={handleDownloadPdf} disabled={pdfLoading} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-xs font-bold rounded-lg cursor-pointer">
          {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />} {pdfLoading ? 'Gerando PDF...' : 'Imprimir / Salvar PDF'}
        </button>
      </div>

      <div ref={docRef} className="mx-auto max-w-4xl bg-white shadow-lg print:shadow-none" style={{ color: '#1f2a3a' }}>
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
                Plano Pedagógico para Treinamentos de Normas Regulamentadoras na modalidade EAD,
                elaborado de acordo com o disposto na NR-01, em seu Anexo II, item 3.
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
            <p className="mb-3">
              Os conteúdos seguem o exigido por cada Norma Regulamentadora. A tabela a seguir relaciona
              os treinamentos e a respectiva <strong>carga horária na plataforma</strong>:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr style={{ backgroundColor: NAVY }} className="text-white">
                    <th className="text-left p-2 border border-slate-300 font-bold">Treinamento / Formação</th>
                    <th className="text-center p-2 border border-slate-300 font-bold w-40">Carga Horária na Plataforma</th>
                  </tr>
                </thead>
                <tbody>
                  {CARGA_HORARIA.map(([t, h], i) => (
                    <tr key={i} className={i % 2 ? 'bg-slate-50' : ''} style={{ breakInside: 'avoid' }}>
                      <td className="p-2 border border-slate-300 align-top">{t}</td>
                      <td className="p-2 border border-slate-300 text-center font-bold whitespace-nowrap">{h}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              {tech.document ? ` (${tech.document})` : ''}. Cada treinamento é conduzido e homologado pelo
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

          <section>
            <SecHeader n="18" title="Metodologia, prazos e avaliação" />

            <p className="font-bold mb-1">j) Estimativa de tempo mínimo de dedicação diária ao curso</p>
            <p className="mb-3">
              Todos os nossos cursos são estruturados para atender à carga horária exigida pelas Normas
              Regulamentadoras (NRs). As aulas e atividades são organizadas com base nesses critérios, garantindo
              conformidade legal e qualidade no aprendizado. Além disso, os cursos ficam disponíveis na plataforma
              24 horas por dia, permitindo que o aluno acesse os conteúdos no horário mais conveniente, conforme sua
              rotina ou necessidade. Quando for necessário restringir o acesso ao curso ao horário de expediente,
              cabe à empresa contratante comunicar essa exigência, a fim de garantir o cumprimento adequado dentro
              do período de trabalho.
            </p>

            <p className="font-bold mb-1">k) Prazo máximo para conclusão da capacitação</p>
            <p className="mb-3">
              Em nossa plataforma, o acesso dos alunos aos treinamentos é ajustado conforme a necessidade do
              cliente. Os registros de acesso são mantidos por 2 anos após a conclusão, conforme exigido pela NR-01,
              servindo como comprovação da formação e conclusão do treinamento.
            </p>

            <p className="font-bold mb-1">l) Público-alvo</p>
            <p className="mb-3">Pessoas físicas e empresas em geral.</p>

            <p className="font-bold mb-1">m) Material didático</p>
            <p className="mb-3">
              Oferecemos treinamentos online de Normas Regulamentadoras (NRs) que incluem videoaulas teóricas e
              demonstrações práticas, materiais de leitura em formato de apostila para acompanhamento na plataforma,
              além do acesso à norma regulamentadora correspondente, conforme as diretrizes do Ministério do Trabalho
              e Emprego (MTE). Nossos alunos realizam avaliações para comprovar a aprendizagem e podem interagir com
              tutores qualificados para esclarecer dúvidas de forma virtual, garantindo suporte contínuo durante o
              processo de aprendizado.
            </p>

            <p className="font-bold mb-1">n) Instrumentos para potencialização do aprendizado</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Vídeo aulas teóricas;</li>
              <li>Vídeo aulas práticas;</li>
              <li>Apostila exclusiva para cada treinamento;</li>
              <li>Material de leitura complementar; e</li>
              <li>Tutores online para esclarecimento de dúvidas.</li>
            </ul>

            <p className="font-bold mb-1">o) Avaliação de aprendizagem</p>
            <p className="mb-2">
              Nossa avaliação de aprendizagem é feita dentro da plataforma online, cumprindo o disposto na NR-01.
              Os alunos podem realizar as avaliações à medida que avançam nas aulas de cada módulo, permitindo que
              avaliem seu entendimento progressivamente e garantam uma assimilação eficaz do conteúdo.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Alunos que, após a avaliação, obtiverem conceito inferior a 6 pontos devem realizar uma nova avaliação.</li>
              <li>Alunos que, após a avaliação, obtiverem conceito igual ou superior a 6 pontos são considerados aptos no treinamento realizado.</li>
            </ul>
          </section>

          <section>
            <SecHeader n="19" title="Considerações finais" />
            <p>
              Conforme estabelecido pela NR-01, no Anexo II detalhado no item 3, apresentamos nosso Plano Pedagógico
              para a realização dos treinamentos online. Garantimos que todos os requisitos mencionados e descritos
              nestas normas estão sendo atendidos em nosso Plano Pedagógico.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-200 text-center text-[11px] text-slate-400">
            Documento em conformidade com o Anexo II da NR-01 — Plano Pedagógico para treinamentos na modalidade EAD. • WWW.FALAINSTRUTOR.COM.BR
          </div>
        </div>
      </div>
    </div>
  );
}
