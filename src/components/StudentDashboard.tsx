/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Course, Instructor, Enrollment, Comment, StudentExamSubmission, ExamQuestion, PaymentConfig } from '../types';
import { getExamQuestions, CONTEUDO_PROGRAMATICO, SLIDES_BY_CODE, REFERENCE_VIDEO_BY_CODE, RESPONSAVEL_TECNICO } from '../data';
import { enrollmentsApi } from '../api';
import { Clock, Shield, ShieldCheck, Award, Play, CheckCircle2, ChevronRight, FileDown, MessageSquare, Check, X, ShieldAlert, AwardIcon, Printer, Video, FileText, MonitorPlay, Presentation,
  HardHat, Flame, Zap, Users, AlertTriangle, ClipboardList, ClipboardCheck, Eye, Droplets, Wrench, Layers, Thermometer, Factory, FlaskConical, Truck, Activity, BookOpen, Leaf, Settings, FileCheck, Flag, Wind, type LucideIcon } from 'lucide-react';

// Escolhe uma ilustração (ícone) para o slide conforme o tema do título.
// Mantém todos os treinamentos visualmente ricos sem precisar de imagens externas.
const pickSlideIcon = (title: string): LucideIcon => {
  const t = title.toLowerCase();
  const rules: [RegExp, LucideIcon][] = [
    [/encerr|conclus/, Flag],
    [/respons.*fabricante|fabricante|importador/, Factory],
    [/respons/, Users],
    [/hierarquia|medidas de controle|controle/, Layers],
    [/certificado de aprova|\bca\b/, FileCheck],
    [/uso correto|inspe/, Eye],
    [/higien|guarda|conserva/, Droplets],
    [/ficha|entrega|document|prontu/, ClipboardList],
    [/permiss|pet\b/, ClipboardCheck],
    [/tipos de epi|epi|prote..o individual/, HardHat],
    [/inc.ndio|fogo|combate/, Flame],
    [/el.tric|eletricidade|energia|el.trico/, Zap],
    [/m.quina|equipamento|acionamento|prote..es fixas/, Settings],
    [/caldeira|vaso de press|press.o/, Thermometer],
    [/ergonomia|ler|dort|postura/, Activity],
    [/espa.o confinado|atmosf|monitor|ventila/, Wind],
    [/qu.mic|ghs|fispq|inflam|rotulagem|incompat/, FlaskConical],
    [/rural|agro|silvicult|animal/, Leaf],
    [/tr.nsito|coleta|res.duo|limpeza urbana|movimenta|transporte/, Truck],
    [/risco|perigo|acidente/, AlertTriangle],
    [/manuten/, Wrench],
    [/campo de aplica|disposi|o que .|conceito|^nr |defini/, BookOpen],
  ];
  for (const [re, icon] of rules) if (re.test(t)) return icon;
  return ShieldCheck;
};
// jsPDF, html2canvas-pro e qrcode são carregados sob demanda (import dinâmico)
// para não pesar o bundle inicial — só baixam quando o aluno gera/visualiza o
// certificado. (html2canvas-pro suporta as cores oklch() do Tailwind v4.)
import TutorChat from './TutorChat';
import { ShieldEmblem, LogoHorizontal, RosetteSeal } from './BrandLogo';

// Player da vídeo aula do curso: detecta YouTube/Vimeo (iframe) ou vídeo
// direto (MP4) e renderiza o reprodutor adequado dentro do espaço do player.
function CourseVideo({ url }: { url: string }) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  let embed: string | null = null;
  if (yt) embed = `https://www.youtube.com/embed/${yt[1]}`;
  else if (vimeo) embed = `https://player.vimeo.com/video/${vimeo[1]}`;

  if (embed) {
    // Para o YouTube: usa o domínio "nocookie", remove vídeos relacionados e a
    // marca, e cobre a faixa superior (título/links) com uma camada transparente
    // para impedir que o clique no título redirecione o aluno para o YouTube.
    const src = yt
      ? `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&fs=1`
      : embed;
    return (
      <div className="absolute inset-0">
        <iframe
          src={src}
          title="Vídeo aula"
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        {yt && (
          <div
            className="absolute top-0 left-0 right-0 h-14 z-20"
            style={{ cursor: 'default' }}
            aria-hidden="true"
            onClick={(e) => e.preventDefault()}
            title="Vídeo da plataforma Fala Instrutor"
          />
        )}
      </div>
    );
  }
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return <video src={url} controls className="absolute inset-0 w-full h-full bg-black" />;
  }
  // Link genérico: abre em nova guia.
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 p-6 text-center">
      <Play className="w-10 h-10 text-emerald-400" />
      <a href={url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded font-bold text-xs uppercase">
        Abrir vídeo aula
      </a>
    </div>
  );
}

// Formata uma data (ISO ou yyyy-mm-dd) por extenso em português: "10 de junho de 2024".
function formatLongDatePt(value: string): string {
  if (!value) return '';
  const iso = value.length <= 10 ? `${value}T00:00:00Z` : value;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

// Deriva o rótulo do selo do certificado a partir do código do curso.
// Ex.: "NR 35" -> { top: "NR", main: "35" }; "LOTO" -> { top: "", main: "LOTO" }.
function certificateBadge(code: string): { top: string; main: string } {
  const nr = code.match(/NR\s*0*(\d+\.?\d*)/i);
  if (nr) return { top: 'NR', main: nr[1] };
  const compact = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  return { top: '', main: compact.slice(0, 6) };
}

interface StudentDashboardProps {
  currentUser: User;
  courses: Course[];
  enrollments: Enrollment[];
  comments: Comment[];
  studentExams: StudentExamSubmission[];
  paymentConfig?: PaymentConfig;
  onUpdateProfile: (updated: Partial<User>) => void;
  onPostComment: (comment: Omit<Comment, 'id' | 'date'>) => void;
  onCompleteEnrollment: (enrollmentId: string, score: number, passed: boolean, certificateCode: string, answers: Record<number, number>) => Promise<Enrollment | undefined>;
  onUpdateProgress: (enrollmentId: string, progress: number) => void;
}

export default function StudentDashboard({
  currentUser,
  courses,
  enrollments,
  comments,
  studentExams,
  paymentConfig,
  onUpdateProfile,
  onPostComment,
  onCompleteEnrollment,
  onUpdateProgress
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<'my-courses' | 'my-profile'>('my-courses');
  
  // Classroom Player View Mode
  const [activeEnrollment, setActiveEnrollment] = React.useState<Enrollment | null>(null);
  const [selectedModuleIdx, setSelectedModuleIdx] = React.useState(0);
  const [slideIdx, setSlideIdx] = React.useState(0); // slide atual no deck de treinamento
  const [videoProgressRate, setVideoProgressRate] = React.useState<Record<string, number>>({}); // maps enrollmentId -> last completed module index
  
  // Immersive & Lesson Configs
  const [lessonType, setLessonType] = React.useState<'video' | 'pdf'>('video');
  const [viewMode, setViewMode] = React.useState<'standard' | 'immersive'>('immersive');
  
  // Comment Engine State
  const [newCommentText, setNewCommentText] = React.useState('');
  const [isCommentPublic, setIsCommentPublic] = React.useState(true);

  // Exam taking state
  const [isTakingExam, setIsTakingExam] = React.useState(false);
  const [examAnswers, setExamAnswers] = React.useState<Record<number, number>>({});

  // Certificate Modal State
  const [viewingCertificate, setViewingCertificate] = React.useState<Enrollment | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const [certQrUrl, setCertQrUrl] = React.useState('');

  // Tamanho fixo de uma folha A4 paisagem (≈96dpi). O certificado é sempre
  // renderizado nesse tamanho para nunca cortar conteúdo; na pré-visualização
  // ele é apenas reduzido proporcionalmente para caber na largura do modal.
  const PAGE_W = 1040;
  const PAGE_H = Math.round(PAGE_W / 1.414); // mantém a proporção A4 paisagem
  const PREVIEW_GAP = 32;
  const previewWrapRef = React.useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = React.useState(1);

  React.useEffect(() => {
    if (!viewingCertificate) return;
    const update = () => {
      const w = previewWrapRef.current?.clientWidth ?? PAGE_W;
      setPreviewScale(Math.min(1, w / PAGE_W));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [viewingCertificate]);

  // Generates a real, scannable QR Code pointing to the public certificate
  // validation page (anti-fraud). Regenerated whenever the certificate changes.
  React.useEffect(() => {
    if (!viewingCertificate?.certificateCode) {
      setCertQrUrl('');
      return;
    }
    const url = `${window.location.origin}/?cert=${encodeURIComponent(viewingCertificate.certificateCode)}`;
    import('qrcode')
      .then(({ default: QRCode }) => QRCode.toDataURL(url, { margin: 1, width: 240, errorCorrectionLevel: 'M', color: { dark: '#0f2147', light: '#ffffff' } }))
      .then(setCertQrUrl)
      .catch(() => setCertQrUrl(''));
  }, [viewingCertificate]);

  // Captura todas as páginas do certificado em alta resolução. Importante:
  // o preview fica dentro de um wrapper com `transform: scale()` para caber na
  // tela — e o html2canvas mede a largura do texto errado sob transform,
  // fazendo as palavras "grudarem". Por isso zeramos a escala (scale 1, tamanho
  // A4 real) só durante a captura e restauramos em seguida. Também aguardamos as
  // fontes carregarem para evitar fallback que junta os caracteres.
  const captureCertificatePages = async (quality = 0.98): Promise<string[]> => {
    const pageEls = ['certificate-page-1', 'certificate-page-2', 'certificate-page-3']
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (pageEls.length < 2) return [];

    const area = document.getElementById('printable-certificate-area');
    const prevTransform = area?.style.transform ?? '';
    if (area) area.style.transform = 'none';

    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      if ((document as any).fonts?.ready) await (document as any).fonts.ready;
      const imgs: string[] = [];
      for (const el of pageEls) {
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
        });
        imgs.push(canvas.toDataURL('image/jpeg', quality));
      }
      return imgs;
    } finally {
      if (area) area.style.transform = prevTransform;
    }
  };

  const handleDownloadPDF = async (courseName: string) => {
    setIsGeneratingPDF(true);
    try {
      const imgs = await captureCertificatePages(0.98);
      if (imgs.length < 2) {
        alert("Erro ao detectar as partes do certificado para geração do PDF.");
        setIsGeneratingPDF(false);
        return;
      }

      // Initialize jsPDF with landscape orientation, A4 measurements (297mm x 210mm)
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      imgs.forEach((img, i) => {
        if (i > 0) pdf.addPage();
        pdf.addImage(img, 'JPEG', 0, 0, 297, 210);
      });

      // Download the composite multi-page PDF file
      const formattedCourseName = courseName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      pdf.save(`certificado_${formattedCourseName}.pdf`);
    } catch (error) {
      console.error("Erro na compilação do arquivo PDF do certificado:", error);
      alert("Houve um contratempo técnico ao compilar e fazer o download do seu PDF. Por favor, tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Abre o certificado em uma nova guia, já formatado em folha A4 paisagem,
  // com todo o conteúdo (frente e verso) e dispara a impressão. Evita que o
  // navegador corte o documento ao imprimir o modal da aplicação.
  const handlePrintCertificate = async () => {
    setIsGeneratingPDF(true);
    try {
      const imgs = await captureCertificatePages(0.97);
      if (imgs.length < 2) {
        alert('Erro ao detectar as partes do certificado para impressão.');
        return;
      }

      const win = window.open('', '_blank');
      if (!win) {
        alert('Não foi possível abrir a nova guia. Permita pop-ups para imprimir o certificado.');
        return;
      }
      const pagesHtml = imgs
        .map((src, i) => `<div class="page"><img src="${src}" alt="Certificado - página ${i + 1}" /></div>`)
        .join('');
      win.document.write(
        `<!doctype html><html><head><meta charset="utf-8"><title>Certificado FalaInstrutor</title>
        <style>
          @page { size: A4 landscape; margin: 0; }
          html, body { margin: 0; padding: 0; background: #fff; }
          .page { width: 297mm; height: 210mm; overflow: hidden; page-break-after: always; }
          .page:last-child { page-break-after: auto; }
          .page img { width: 100%; height: 100%; object-fit: contain; display: block; }
        </style></head><body>
          ${pagesHtml}
          <script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script>
        </body></html>`
      );
      win.document.close();
    } catch (error) {
      console.error('Erro ao preparar a impressão do certificado:', error);
      alert('Houve um problema ao preparar a impressão. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Active student enrollments
  const studentEnrollments = enrollments.filter((e) => e.userId === currentUser.id);

  // Profile Form state
  const [name, setName] = React.useState(currentUser.name);
  const [dob, setDob] = React.useState(currentUser.dob);
  const [cpf, setCpf] = React.useState(currentUser.cpf);
  const [avatar, setAvatar] = React.useState(currentUser.avatar || '');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, dob, cpf, avatar });
    alert("Dados cadastrais atualizados com sucesso!");
  };

  // Auditoria: enquanto a sala de aula está aberta e a aba visível, acumula a
  // minutagem assistida (heartbeat a cada 30s) — alimenta a Gestão Pedagógica.
  React.useEffect(() => {
    const id = activeEnrollment?.id;
    if (!id) return;
    const STEP = 30;
    const timer = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        enrollmentsApi.study(id, STEP);
      }
    }, STEP * 1000);
    return () => clearInterval(timer);
  }, [activeEnrollment?.id]);

  // Auditoria: marca o início da prova (tempo até a finalização).
  React.useEffect(() => {
    if (isTakingExam && activeEnrollment?.id) enrollmentsApi.examStart(activeEnrollment.id);
  }, [isTakingExam, activeEnrollment?.id]);

  const handleOpenClassroom = async (enrollment: Enrollment) => {
    // Restrição de horário definida pela empresa: bloqueia o acesso fora da janela.
    const access = await enrollmentsApi.accessWindow();
    if (!access.allowed) {
      alert(`Acesso aos treinamentos bloqueado pela sua empresa neste momento.\n\n${access.message ?? ''}`.trim());
      return;
    }
    setActiveEnrollment(enrollment);
    setSelectedModuleIdx(0);
    setSlideIdx(0);
    setIsTakingExam(false);
    setExamAnswers({});
  };

  // Student watches a lesson
  const handleWatchLesson = (enrollment: Enrollment, course: Course) => {
    const totalModules = course.modules.length;
    
    // Complete the current module and calculate progress incremental percentage
    const currentCompleted = videoProgressRate[enrollment.id] ?? 0;
    const nextCompleted = Math.max(currentCompleted, selectedModuleIdx + 1);
    
    setVideoProgressRate({
      ...videoProgressRate,
      [enrollment.id]: nextCompleted
    });

    // Calculate progress percentage
    const nextPercent = Math.min(100, Math.round((nextCompleted / totalModules) * 100));

    // Update parent enrollments database logs
    onUpdateProgress(enrollment.id, nextPercent);

    // Auto update localized modal state
    setActiveEnrollment({
      ...enrollment,
      progress: nextPercent
    });

    if (selectedModuleIdx < totalModules - 1) {
      setSelectedModuleIdx(selectedModuleIdx + 1);
    } else {
      alert("Parabéns! Você assistiu e concluiu todas as aulas deste treinamento. O exame avaliativo agora está desbloqueado para certificação.");
    }
  };

  // Submit Comments in classroom
  const handleSendComment = (e: React.FormEvent, courseId: string, courseName: string) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    onPostComment({
      userId: currentUser.id,
      userName: currentUser.name,
      courseId,
      courseName,
      text: newCommentText,
      isPublic: isCommentPublic
    });

    setNewCommentText('');
    alert("Dúvida técnica postada! O instrutor responsável analisará sua questão.");
  };

  // Exam Submission handler
  const handleExamSubmit = async (courseId: string, questions: ExamQuestion[]) => {
    // Guard against an empty question bank (should not happen with the fallback)
    if (questions.length === 0) {
      alert("Nenhuma questão disponível para este exame no momento. Tente novamente mais tarde.");
      return;
    }

    // Check if answered all questions
    const answeredCount = Object.keys(examAnswers).length;
    if (answeredCount < questions.length) {
      alert("Por favor, responda a todos os exercícios antes de submeter o exame.");
      return;
    }

    // Grade
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (examAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= 75;

    if (activeEnrollment) {
      const localCode = `CERT-${activeEnrollment.courseCode}-${currentUser.name.split(' ')[0].toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;
      // Persiste no banco; o código do certificado é gerado no servidor.
      const updated = await onCompleteEnrollment(activeEnrollment.id, scorePercentage, passed, localCode, { ...examAnswers });

      // Reflete a conclusão usando os dados autoritativos do banco quando houver.
      setActiveEnrollment(updated ?? {
        ...activeEnrollment,
        progress: 100,
        examScore: scorePercentage,
        passed,
        certificateCode: passed ? localCode : null
      });

      // A nota e a aprovação são confirmadas pelo servidor (correção autoritativa).
      const finalScore = updated?.examScore ?? scorePercentage;
      const finalPassed = updated?.passed ?? passed;
      if (finalPassed) {
        alert(`Parabéns! Você foi aprovado com aproveitamento de ${finalScore}%! Sua prova foi enviada para homologação. O certificado ficará disponível assim que o instrutor responsável liberar a prova.`);
      } else {
        alert(`Aproveitamento de ${finalScore}%. O mínimo exigido pela portaria é 75%. Estude os módulos novamente e realize uma nova tentativa.`);
      }
    }

    setIsTakingExam(false);
    setExamAnswers({});
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 py-10 transition-colors duration-200 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Course Player active overlay */}
        {activeEnrollment ? (() => {
          const course = courses.find((c) => c.id === activeEnrollment.courseId);
          if (!course) return null;
          
          const playlistFinished = activeEnrollment.progress === 100;
          // Prefere a prova cadastrada no painel admin; usa o banco padrão como fallback.
          const questions = (course.examQuestions && course.examQuestions.length > 0) ? course.examQuestions : getExamQuestions(course.id);

          return (
            <div 
              className="bg-cover bg-center border border-slate-200 dark:border-slate-800 rounded-3xl p-0 shadow-lg overflow-hidden animate-fade-in font-sans relative flex flex-col"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1920')`, minHeight: '80vh' }}
            >
              {/* Dark overlay for immersive mode */}
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-0" />
              
              <div className="relative z-10 flex flex-col flex-1">
                {/* Classroom header */}
                <div className="p-4 bg-slate-900/60 backdrop-blur border-b border-white/10 text-white flex items-center justify-between font-display">
                  <div>
                    <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-wider">{course.code} • Sala Virtual</span>
                    <h1 className="text-sm sm:text-base font-extrabold uppercase line-clamp-1 text-emerald-50">{course.name}</h1>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900/80 rounded-lg p-1 flex border border-white/10">
                      <button 
                        onClick={() => setLessonType('video')}
                        className={`p-1.5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${lessonType === 'video' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        title="Vídeo Aula"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setLessonType('pdf')}
                        className={`p-1.5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${lessonType === 'pdf' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        title="Apresentação de Slides (PDF)"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        setActiveEnrollment(null);
                        setIsTakingExam(false);
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs transition select-none cursor-pointer border border-white/10 font-bold"
                    >
                      Voltar ao painel
                    </button>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-4 sm:p-6 flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto w-full">
                  
                  {/* Left Column: Player & Exam */}
                  <div className="flex-1 flex flex-col gap-6 w-full min-w-0 max-w-full">
                    {isTakingExam ? (
                      <div className="space-y-6">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                          <h2 className="text-sm font-bold uppercase tracking-tight text-white flex items-center gap-2 font-display">
                            <ShieldAlert className="w-5 h-5 text-emerald-400" /> Avaliação Final de Homologação
                          </h2>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            Responda com atenção a todos os exercícios. O Ministério do Trabalho exige aproveitamento de no mínimo <strong className="text-emerald-400">75%</strong> para a regularidade nacional do certificado.
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800/60 text-slate-200 font-bold border border-white/10">
                              <FileText className="w-3.5 h-3.5 text-emerald-400" /> {questions.length} questões
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800/60 text-slate-200 font-bold border border-white/10">
                              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Tempo estimado: ≈ {Math.floor((questions.length * 70) / 60)} min{(questions.length * 70) % 60 ? ` ${(questions.length * 70) % 60} s` : ''}
                            </span>
                            <span className="text-slate-400">(1 min 10 s por questão)</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {questions.map((q, questIdx) => (
                            <div key={questIdx} className="bg-slate-800/50 p-4 border border-white/5 rounded-xl">
                              <p className="text-xs font-bold text-white mb-3">{questIdx + 1}. {q.question}</p>
                              <div className="space-y-2">
                                {q.options.map((opt, optIdx) => (
                                  <label 
                                    key={optIdx} 
                                    className={`flex items-center gap-2 p-3 rounded-lg text-xs border cursor-pointer transition ${
                                      examAnswers[questIdx] === optIdx 
                                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold' 
                                        : 'border-white/10 hover:border-white/20 text-slate-300'
                                    }`}
                                  >
                                    <input 
                                      type="radio" 
                                      name={`quest_${questIdx}`}
                                      checked={examAnswers[questIdx] === optIdx}
                                      onChange={() => setExamAnswers({ ...examAnswers, [questIdx]: optIdx })}
                                      className="accent-emerald-500"
                                    />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-4">
                          <button 
                            onClick={() => handleExamSubmit(course.id, questions)}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded font-bold text-xs uppercase shadow select-none cursor-pointer"
                          >
                            Submeter Respostas
                          </button>
                          <button 
                            onClick={() => setIsTakingExam(false)}
                            className="px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600 text-white rounded font-bold text-xs uppercase cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                    <div className="space-y-6">
                      
                      {/* Interactive player */}
                      <div className="relative bg-black rounded-2xl aspect-video p-0 overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10 group">
                        
                        {/* Player Content area based on lessonType */}
                        {lessonType === 'video' ? (
                          (course.moduleVideos?.[selectedModuleIdx] || course.videoUrl || REFERENCE_VIDEO_BY_CODE[course.code]) ? (
                            <CourseVideo url={(course.moduleVideos?.[selectedModuleIdx] || course.videoUrl || REFERENCE_VIDEO_BY_CODE[course.code])!} />
                          ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center text-white space-y-4">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black z-0 pointer-events-none" />
                            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
                              <span className="inline-block px-3 py-1 bg-emerald-600 font-bold text-[9px] uppercase tracking-widest rounded-full font-display mb-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                MÓDULO {(selectedModuleIdx + 1).toString().padStart(2, '0')}
                              </span>
                              <h2 className="text-xl sm:text-2xl font-black uppercase max-w-2xl leading-tight font-display drop-shadow-md">
                                {course.modules[selectedModuleIdx]}
                              </h2>
                              <p className="text-xs text-slate-300 max-w-sm mt-3 font-medium">
                                Vídeo aula teórica e instruções do instrutor responsável legal {course.instructors[0].name}.
                              </p>
                              <button className="mt-6 w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 backdrop-blur hover:scale-110 hover:bg-emerald-500/40 transition-all cursor-pointer">
                                <Play className="w-8 h-8 text-emerald-400 ml-1" />
                              </button>
                            </div>
                          </div>
                          )
                        ) : (
                          (() => {
                            const deck = (course.slides && course.slides.length > 0) ? course.slides : SLIDES_BY_CODE[course.code];
                            // Deck real do treinamento (se houver); senão, mantém o aviso genérico.
                            if (deck && deck.length > 0) {
                              const idx = Math.min(slideIdx, deck.length - 1);
                              const slide = deck[idx];
                              const eyebrow = idx === 0 ? `${course.code} · Apresentação` : `${course.code} · Conteúdo`;
                              const Icon = pickSlideIcon(slide.title);
                              return (
                                <div className="flex-1 flex items-center justify-center bg-slate-200 w-full overflow-hidden relative p-2 sm:p-4">
                                  {/* Slide no modelo clean (navy + acento) */}
                                  <div className="w-full h-full bg-white shadow-2xl shadow-black/40 border border-slate-200 flex flex-col relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: '#0f2147' }} />
                                    <div className="flex-1 px-6 sm:px-10 py-5 sm:py-7 flex flex-col min-h-0 overflow-auto">
                                      <div className="flex items-center gap-2 mb-2 shrink-0">
                                        <Icon className="w-4 h-4 text-emerald-600" strokeWidth={2.2} />
                                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</span>
                                      </div>
                                      <h1 className="text-lg sm:text-2xl md:text-3xl font-black leading-tight mb-4 shrink-0 break-words" style={{ color: '#0f2147', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{slide.title}</h1>
                                      <ul className="space-y-2 sm:space-y-2.5">
                                        {slide.bullets.map((b, bi) => (
                                          <li key={bi} className="flex items-start gap-2.5 text-[12px] sm:text-sm text-slate-700 leading-relaxed">
                                            <span className="mt-[7px] w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#10b981' }} />
                                            <span>{b}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    {/* Rodapé: marca + navegação + número do slide */}
                                    <div className="shrink-0 border-t border-slate-200 px-4 sm:px-10 py-2 flex items-center justify-between select-none">
                                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 truncate">FalaInstrutor · Segurança do Trabalho</span>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => setSlideIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-40 cursor-pointer disabled:cursor-default flex items-center justify-center" aria-label="Slide anterior">‹</button>
                                        <span className="text-[10px] font-bold text-slate-500 tabular-nums">{idx + 1} / {deck.length}</span>
                                        <button onClick={() => setSlideIdx((i) => Math.min(deck.length - 1, i + 1))} disabled={idx === deck.length - 1} className="w-7 h-7 rounded-full text-white font-bold disabled:opacity-40 cursor-pointer disabled:cursor-default flex items-center justify-center" style={{ backgroundColor: '#0f2147' }} aria-label="Próximo slide">›</button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div className="flex-1 flex items-center justify-center bg-slate-100 text-slate-800 w-full overflow-hidden relative">
                                <div className="w-[90%] sm:w-[85%] h-[85%] bg-white shadow-2xl shadow-black/50 border border-slate-300 flex flex-col mt-4 sm:mt-0 relative max-h-[85%]">
                                  <div className="h-8 shrink-0 bg-slate-800 flex items-center px-4 justify-between text-white border-b border-slate-700 select-none">
                                    <span className="text-[10px] font-bold">Slide {selectedModuleIdx + 1} de {course.modules.length}</span>
                                  </div>
                                  <div className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-center text-center overflow-auto min-h-0 w-full">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-4 font-display uppercase leading-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-emerald-500 break-words w-full px-2" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{course.modules[selectedModuleIdx]}</h1>
                                    <p className="max-w-prose text-xs sm:text-sm text-slate-600 font-medium px-2">Conteúdo programático em slides homologados. Estude as diretrizes normativas da aula passo a passo.</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        )}

                        {/* Player control status */}
                        <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col sm:flex-row items-center gap-4 justify-between text-xs text-slate-300 absolute bottom-0 w-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                          <span className="font-medium bg-black/60 px-3 py-1.5 rounded text-[11px] tracking-wide">Duração sugerida: 45 min / 12 Slides</span>
                          <button 
                            onClick={() => handleWatchLesson(activeEnrollment, course)}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all text-[11px] uppercase tracking-wider cursor-pointer font-display"
                          >
                            Concluir Aula & Avançar
                          </button>
                        </div>
                      </div>

                      {/* Materiais de apoio do treinamento (visíveis ao aluno) */}
                      {course.documents && course.documents.length > 0 && (
                        <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 sm:p-5">
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 font-display flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Materiais de Apoio
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {course.documents.map((doc, di) => (
                              <a
                                key={di}
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors group"
                              >
                                <FileDown className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="text-xs font-semibold truncate group-hover:text-white">{doc.name}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Immersive Modules Carousel (Horizontal Listing below player) */}
                      <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 sm:p-5">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 font-display flex items-center gap-2">
                          Módulos e Aulas do Treinamento Imersivo
                        </h3>
                        
                        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-emerald-500/50 scrollbar-track-transparent snap-x">
                          {course.modules.map((mod, idx) => {
                            const watched = (videoProgressRate[activeEnrollment.id] ?? 0) > idx || activeEnrollment.progress === 100;
                            const isActive = idx === selectedModuleIdx && !isTakingExam;
                            
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedModuleIdx(idx);
                                  setIsTakingExam(false);
                                }}
                                className={`relative shrink-0 w-64 h-36 rounded-xl overflow-hidden snap-start transition-all cursor-pointer border group ${
                                  isActive
                                    ? 'border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.3)] scale-[1.02] z-10'
                                    : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                                }`}
                              >
                                {/* Fake module thumbnail bg */}
                                <div className="absolute inset-0 bg-slate-800" />
                                <div className={`absolute inset-0 bg-gradient-to-t ${isActive ? 'from-emerald-900/90' : 'from-slate-900'} via-slate-900/80 to-transparent`} />
                                
                                {/* Content */}
                                <div className="absolute inset-x-0 bottom-0 p-3 text-left">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    {watched ? (
                                      <div className="bg-emerald-500 text-white rounded-full p-0.5"><Check className="w-3 h-3" /></div>
                                    ) : (
                                      <div className="bg-white/20 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold border border-white/10">{idx + 1}</div>
                                    )}
                                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">Módulo {(idx + 1).toString().padStart(2, '0')}</span>
                                  </div>
                                  <p className={`text-xs font-semibold line-clamp-2 ${isActive ? 'text-emerald-100' : 'text-slate-300'}`}>
                                    {mod}
                                  </p>
                                </div>
                                
                                {isActive && (
                                  <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow">Em Aula</div>
                                )}
                              </button>
                            );
                          })}

                          {playlistFinished && (
                             <button
                               onClick={() => setIsTakingExam(true)}
                               className={`relative shrink-0 w-64 h-36 rounded-xl overflow-hidden snap-start transition-all cursor-pointer border flex flex-col justify-center items-center p-3 text-center ${
                                 isTakingExam
                                   ? 'border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.3)] bg-emerald-950/80'
                                   : 'border-emerald-500/40 hover:border-emerald-500/80 bg-emerald-900/40 hover:bg-emerald-900/60'
                               }`}
                             >
                                <AwardIcon className={`w-8 h-8 mb-2 ${isTakingExam ? 'text-emerald-400' : 'text-emerald-500/80'}`} />
                                <span className="text-[11px] font-bold text-white uppercase tracking-wider">Exame Final de Certificação</span>
                                <span className="text-[9px] text-emerald-200/70 mt-1">Realizar prova online</span>
                             </button>
                          )}
                        </div>
                      </div>

                      {/* Auxiliary Info & Downloads & Forum */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                        
                        <div className="lg:col-span-1 flex flex-col gap-6 shrink-0">
                          <div className="p-5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-xs space-y-4">
                            <span className="font-extrabold uppercase text-slate-400 block text-[10px] tracking-widest font-display">Temos e Progresso</span>
                            
                            <div>
                              <div className="flex items-center justify-between font-bold text-white mt-1">
                                <span>Aulas Concluídas</span>
                                <span className="text-emerald-400">{activeEnrollment.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                                <div className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-300" style={{ width: `${activeEnrollment.progress}%` }} />
                              </div>
                            </div>

                            {activeEnrollment.passed && (
                              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-[11px] font-bold flex flex-col gap-3">
                                <div className="flex items-center gap-2 font-display uppercase tracking-widest"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Concluído</div>
                                {activeEnrollment.released && activeEnrollment.certificateCode ? (
                                  <button
                                    onClick={() => setViewingCertificate(activeEnrollment)}
                                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10px] uppercase shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Printer className="w-4 h-4" /> Emitir Certificado
                                  </button>
                                ) : (
                                  <div className="w-full py-2 px-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded text-[10px] font-bold uppercase tracking-wide text-center">
                                    Aguardando liberação do instrutor
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="p-5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-xs space-y-3 flex-1 flex flex-col">
                            <span className="font-extrabold uppercase text-slate-400 block text-[10px] tracking-widest font-display">Material Didático</span>
                            <p className="text-slate-300 leading-relaxed">Download de apostilas regulamentares, glossários normativos e cadernos de campo.</p>
                            <button 
                              onClick={() => alert("Fazendo download da apostila teórica homologada...")}
                              className="mt-4 flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 hover:border-slate-500 rounded-xl border border-white/10 transition group cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <FileDown className="w-4 h-4 text-emerald-500 group-hover:text-emerald-400" /> 
                                <span className="text-white font-medium">Apostila Completa.pdf</span>
                              </div>
                              <span className="text-[10px] text-slate-400">6.4 MB</span>
                            </button>
                          </div>

                          {/* AI Tutor chat */}
                          <TutorChat courseName={course.name} modules={course.modules} />
                        </div>

                        {/* Forum Area */}
                        <div className="lg:col-span-2 space-y-4 bg-slate-900/80 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                          <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2 font-display">
                            <MessageSquare className="w-4 h-4 text-emerald-500" /> Fórum do Treinamento
                          </h3>

                          {/* Text form */}
                          <form onSubmit={(e) => handleSendComment(e, course.id, course.name)} className="space-y-3">
                            <textarea 
                              rows={3}
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              placeholder="Deixe sua dúvida técnica registrada para o Engenheiro Responsável responder..."
                              className="w-full text-xs p-3 rounded-xl bg-slate-800/80 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-sans"
                              required
                            />
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={isCommentPublic}
                                  onChange={() => setIsCommentPublic(!isCommentPublic)}
                                  className="accent-emerald-500"
                                />
                                <span>Minha pergunta é útil e pública à turma</span>
                              </label>
                              
                              <button 
                                type="submit"
                                className="px-5 py-2.5 bg-slate-800 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition cursor-pointer select-none font-display border border-white/10"
                              >
                                Publicar pergunta
                              </button>
                            </div>
                          </form>

                          {/* Comments listing of the course */}
                          <div className="space-y-3 mt-4">
                            {comments.filter((c) => c.courseId === course.id && (c.isPublic || c.userId === currentUser.id)).map((com) => (
                              <div key={com.id} className="p-4 bg-slate-800/50 border border-white/5 rounded-xl text-xs space-y-2">
                                <div className="flex items-center justify-between text-slate-400">
                                  <span className="font-bold text-white">{com.userName}</span>
                                  <span>{com.date}</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed font-medium font-sans">{com.text}</p>
                                {com.reply ? (
                                  <div className="p-3 bg-slate-800/80 border-l-4 border-emerald-500 rounded text-slate-300 mt-2">
                                    <span className="font-extrabold uppercase text-[9px] text-emerald-400 tracking-wider block mb-1.5 font-display">Resposta do Instrutor Responsável</span>
                                    <p className="leading-relaxed font-sans">{com.reply}</p>
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider mt-2">● Aguardando retorno técnico administrativo...</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
          );
        })() : (
          /* Normal Tab layout lists */
          <div className="space-y-6">
            
            {/* Horizontal menu toggle */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
              <button 
                onClick={() => setActiveTab('my-courses')}
                className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition ${
                  activeTab === 'my-courses' 
                    ? 'border-b-2 border-blue-600 text-slate-900 dark:text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-500'
                }`}
              >
                Meus Treinamentos
              </button>
              <button 
                onClick={() => setActiveTab('my-profile')}
                className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition ${
                  activeTab === 'my-profile' 
                    ? 'border-b-2 border-blue-600 text-slate-900 dark:text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-500'
                }`}
              >
                Dados Cadastrais
              </button>
            </div>

            {activeTab === 'my-profile' ? (
              /* Profile details Update Form */
              <div className="mx-auto max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm">
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight border-b border-slate-105 dark:border-slate-800 pb-2 font-display">
                    Editar Cadastro de Aluno
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Nome Completo *</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">E-mail Cadastrado (Login)</label>
                      <input 
                        type="email" 
                        value={currentUser.email}
                        disabled
                        className="w-full text-xs p-2.5 rounded bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Data de Nascimento</label>
                      <input 
                        type="date" 
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">CPF Cadastrado *</label>
                      <input 
                        type="text" 
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">URL Imagem de Perfil (Avatar)</label>
                    <input 
                      type="text" 
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://exemplo-unsplash.com/avatar.jpg"
                      className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-xl shadow-xs cursor-pointer select-none"
                  >
                    Salvar Alterações
                  </button>
                </form>
              </div>
            ) : (
              /* Enrolled Courses registry list */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight font-display">Meus Cursos e Matrículas Ativas</h2>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{studentEnrollments.length} Matrículas</span>
                </div>

                {studentEnrollments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {studentEnrollments.map((enr) => {
                      const course = courses.find((c) => c.id === enr.courseId);
                      if (!course) return null;

                      return (
                        <div 
                          key={enr.id}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-xs transition space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <span className="inline-block px-2.5 py-0.5 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold text-[9px] uppercase rounded-md tracking-wider">
                              {enr.courseCode}  • Matrícula: #{enr.id.split('-')[1]}
                            </span>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate" title={enr.courseName}>{enr.courseName}</h3>
                            
                            <div className="pt-2 font-medium">
                              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                <span>Progresso teórico</span>
                                <span className="font-bold">{enr.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-850 rounded-full h-1.5">
                                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${enr.progress}%` }} />
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                            <button 
                              onClick={() => handleOpenClassroom(enr)}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800/90 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer select-none"
                            >
                              Acessar Aulas <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            {enr.passed && enr.released && enr.certificateCode ? (
                              <button
                                onClick={() => setViewingCertificate(enr)}
                                className="px-3 py-2 bg-emerald-650 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl select-none cursor-pointer flex items-center gap-1"
                              >
                                Certificado ✓
                              </button>
                            ) : enr.passed ? (
                              <span className="px-3 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[11px] rounded-xl select-none flex items-center gap-1 border border-amber-200 dark:border-amber-500/30">
                                Aguardando liberação
                              </span>
                            ) : null}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-400">Você ainda não se matriculou em nenhum treinamento.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Dynamic dual page printable certificate modal overlay */}
      {viewingCertificate && (() => {
        const course = courses.find((c) => c.id === viewingCertificate.courseId);
        if (!course) return null;
        
        const firstInstructor: Instructor = course.instructors[0] || { id: 'inst-default', name: 'Adriano Aparecido Ribas Ricardo', formation: 'Técnico de Segurança do Trabalho', mte: '0124684/SP', icpEnabled: true };
        const longDate = formatLongDatePt(viewingCertificate.startDate);
        const badge = certificateBadge(course.code);

        // Conteúdo programático detalhado do verso. Usa o catálogo por NR e
        // complementa com módulos/atividades práticas do curso. Quando longo,
        // é dividido em duas páginas de verso (parte 1 e parte 2).
        const syllabus: string[] = [
          ...(CONTEUDO_PROGRAMATICO[course.code] ?? course.modules),
          ...course.manualActivities,
        ];
        const SYLLABUS_PER_PAGE = 12; // cabe confortavelmente em 2 colunas
        const needsSecondBack = syllabus.length > SYLLABUS_PER_PAGE;
        const syllabusPage1 = needsSecondBack ? syllabus.slice(0, SYLLABUS_PER_PAGE) : syllabus;
        const syllabusPage2 = needsSecondBack ? syllabus.slice(SYLLABUS_PER_PAGE) : [];

        // Verso reaproveitado para parte 1 e parte 2 do conteúdo programático.
        const BackPage = (id: string, items: string[], part?: { n: number; total: number }) => (
          <div id={id} className="relative bg-white shadow-sm select-all font-sans text-slate-900 overflow-hidden" style={{ width: PAGE_W, height: PAGE_H, fontFamily: 'Arial, sans-serif' }}>
            {Frame}
            <div className="relative z-10 flex w-full h-full px-[3%] py-[2.5%]">
              {LeftColumn}
              <div className="flex-1 flex flex-col pr-[2%] pt-[1.5%]">
                <div className="flex justify-center">{LogoBlock}</div>
                <h3 className="text-[14px] max-w-2xl mx-auto text-center font-bold text-[#1f2a44] mt-3 mb-4 border-b-2 border-[#1e9b46] pb-2">
                  Conteúdo Programático — {course.name}
                  {part ? <span className="block text-[10px] font-semibold text-slate-500 mt-0.5">Página {part.n} de {part.total}</span> : null}
                </h3>
                <div className="w-full text-[11px] leading-relaxed text-slate-800 px-2 columns-2 gap-8">
                  <ul className="list-disc pl-4 space-y-1 font-medium [&>li]:break-inside-avoid">
                    {items.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                </div>
                {/* Faixa holográfica de segurança (autenticidade) — centralizada, um pouco acima da base */}
                <div className="flex-1 flex items-center w-full">
                <div className="relative w-full h-[84px] rounded-md overflow-hidden border border-slate-200" style={{ backgroundColor: '#f4f2e9' }}>
                  <div className="absolute inset-0" style={{ backgroundImage: 'repeating-radial-gradient(circle at 18% 50%, transparent 0 5px, rgba(15,33,71,0.06) 5px 6px),repeating-radial-gradient(circle at 50% 50%, transparent 0 5px, rgba(16,157,99,0.06) 5px 6px),repeating-radial-gradient(circle at 82% 50%, transparent 0 5px, rgba(245,178,26,0.06) 5px 6px),repeating-linear-gradient(60deg, rgba(0,0,0,0.035) 0 1px, transparent 1px 6px)' }} />
                  {(['left', 'right'] as const).map((side) => (
                    <div key={side} className="absolute top-0 bottom-0 w-7 flex items-center justify-center overflow-hidden" style={{ [side]: 0, background: 'conic-gradient(from 45deg,#1e9b46,#27b074,#7fe0b0,#f5b21a,#1f2a3a,#27b074,#1e9b46)' } as React.CSSProperties}>
                      <span className="text-white font-black text-[7px] tracking-[0.25em] uppercase" style={{ writingMode: 'vertical-rl', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>GENUINE · GENUINE</span>
                    </div>
                  ))}
                  <div className="absolute inset-0 flex items-center gap-3 px-12">
                    <div className="relative w-[52px] h-[52px] shrink-0">
                      <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg,#1e9b46,#27b074,#7fe0b0,#f5b21a,#1f2a3a,#27b074,#1e9b46)' }} />
                      <div className="absolute inset-[5px] rounded-full flex flex-col items-center justify-center" style={{ background: 'radial-gradient(circle at 30% 22%, #1e3a8a, #0f2147 72%)' }}>
                        <div className="w-[22px]"><ShieldEmblem className="w-full h-auto" /></div>
                        <span className="text-white font-black text-[7px] mt-px tracking-wide">VÁLIDO</span>
                      </div>
                    </div>
                    <div className="leading-tight">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Selo holográfico de autenticidade</div>
                      <div className="font-mono font-bold text-slate-800 text-[12px] break-all">{viewingCertificate.certificateCode}</div>
                      <div className="text-[8px] font-bold uppercase tracking-wide text-[#1e9b46]">Fala Instrutor · Documento autenticado</div>
                    </div>
                  </div>
                </div>
                </div>
                <div className="pt-2 flex justify-center text-[12px] text-[#1e9b46] font-black tracking-[0.2em] w-full">
                  WWW.FALAINSTRUTOR.COM.BR
                </div>
              </div>
            </div>
          </div>
        );

        // Moldura: textura diagonal sutil, borda fina e cantos angulares
        // (verde + azul-marinho) no topo-esquerdo e na base-direita.
        const Frame = (
          <>
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.05]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #1f2a44 0, #1f2a44 1px, transparent 1px, transparent 9px)',
              }}
            />
            <div className="absolute inset-[9px] border border-slate-300 pointer-events-none" />
            {/* Canto superior esquerdo (sempre à frente, z-30) */}
            <div className="absolute top-0 left-0 w-[26%] h-[18%] pointer-events-none z-30" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', backgroundColor: '#1e9b46' }} />
            <div className="absolute top-0 left-0 w-[15%] h-[10%] pointer-events-none z-30" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', backgroundColor: '#1f2a44' }} />
            {/* Canto inferior direito */}
            <div className="absolute bottom-0 right-0 w-[19%] h-[13%] pointer-events-none z-30" style={{ clipPath: 'polygon(100% 100%, 100% 0, 0 100%)', backgroundColor: '#1f2a44' }} />
            <div className="absolute bottom-0 right-0 w-[11%] h-[8%] pointer-events-none z-30" style={{ clipPath: 'polygon(100% 100%, 100% 0, 0 100%)', backgroundColor: '#1e9b46' }} />
          </>
        );

        // Logo central "Fala Instrutor / Higiene Ocupacional" (SVG vetorial).
        const LogoBlock = <LogoHorizontal />;

        // Coluna esquerda: selo da NR (losango amarelo), emblema FI e QR real.
        // Fundo azul-marinho (mesma cor do certificado) com QR sobre cartão branco.
        const LeftColumn = (
          <div className="w-[19%] flex flex-col items-center justify-between pt-[15%] pb-[6%] px-[1%] shrink-0 rounded-md" style={{ backgroundColor: '#1f2a44' }}>
            <div className="w-[78px] h-[78px] bg-[#f5c518] border-[3px] border-slate-900 rounded-[14px] rotate-45 flex items-center justify-center shadow-md">
              <div className="-rotate-45 text-center leading-none">
                {badge.top && <span className="block text-[16px] font-black text-slate-900 leading-none">{badge.top}</span>}
                <span className={`block ${badge.main.length > 2 ? 'text-base' : 'text-[28px]'} font-black text-[#d91f26] leading-none`}>{badge.main}</span>
              </div>
            </div>
            <ShieldEmblem className="w-[72px] h-auto" />
            {/* QR de validação: cartão branco com borda clara para destacar no fundo navy */}
            <div className="bg-white rounded-md p-1.5 shadow-md flex flex-col items-center gap-0.5">
              {certQrUrl
                ? <img src={certQrUrl} alt="QR Code de validação do certificado" className="w-[74px] h-[74px]" />
                : <div className="w-[74px] h-[74px] flex items-center justify-center text-[8px] font-bold text-slate-400 text-center leading-tight border border-dashed border-slate-300 rounded">QR de<br/>validação</div>}
              <span className="text-[7px] font-black uppercase tracking-wider text-[#1f2a44]">Validação</span>
            </div>
          </div>
        );

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <div className="bg-white/95 text-slate-900 rounded-lg max-w-4xl w-full p-4 sm:p-8 shadow-2xl relative space-y-6 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
              
              {/* Top modal command buttons close / print */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Homologação de SST em Lote • FalaInstrutor</span>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={isGeneratingPDF}
                    onClick={() => handleDownloadPDF(course.name)}
                    className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition select-none ${
                      isGeneratingPDF 
                        ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    }`}
                  >
                    {isGeneratingPDF ? (
                      <>
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                        <span>Gerando PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        <span>Baixar PDF (Recomendado)</span>
                      </>
                    )}
                  </button>
                  <button
                    disabled={isGeneratingPDF}
                    onClick={handlePrintCertificate}
                    className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition select-none ${
                      isGeneratingPDF
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-850 text-white cursor-pointer'
                    }`}
                  >
                    <Printer className="w-4 h-4" /> Imprimir (A4 paisagem)
                  </button>
                  <button
                    onClick={() => setViewingCertificate(null)}
                    className="p-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition select-none cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>

              {/* DUAL PAGE LAYOUT PREVIEW PANEL — renderizado em tamanho A4 fixo
                  e reduzido proporcionalmente para caber, sem cortar conteúdo. */}
              <div ref={previewWrapRef} className="w-full overflow-hidden mx-auto" style={{ height: (PAGE_H * 2 + PREVIEW_GAP) * previewScale }}>
                <div
                  id="printable-certificate-area"
                  style={{ width: PAGE_W, transform: `scale(${previewScale})`, transformOrigin: 'top left', display: 'flex', flexDirection: 'column', gap: PREVIEW_GAP }}
                >

                    {/* PAGE 1: FRONT SIDE */}
                <div id="certificate-page-1" className="relative bg-white shadow-sm select-all font-sans text-slate-900 overflow-hidden" style={{ width: PAGE_W, height: PAGE_H, fontFamily: 'Arial, sans-serif' }}>
                  {Frame}
                  {/* Faixa holográfica discreta na lateral direita (segurança) */}
                  <div className="absolute top-[9px] bottom-[9px] right-[9px] w-[11px] pointer-events-none z-20 opacity-70" style={{ background: 'conic-gradient(from 45deg,#1e9b46,#27b074,#7fe0b0,#f5b21a,#1f2a3a,#27b074,#1e9b46)' }} />

                  <div className="relative z-10 flex w-full h-full px-[3%] py-[2.5%]">
                    {LeftColumn}

                    {/* Main Content Pane */}
                    <div className="flex-1 flex flex-col items-center text-center pr-[2%] pt-[1.5%]">
                      {LogoBlock}

                      {/* Título "Certificado" com selo de roseta */}
                      <div className="flex items-center justify-center gap-3 mt-2 mb-1">
                        <h1 className="text-[48px] leading-none font-extrabold tracking-tight" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
                          <span style={{ color: '#1e9b46' }}>Cert</span>
                          <span style={{ color: '#1f2a44' }}>ificado</span>
                        </h1>
                        <RosetteSeal className="h-[68px] w-auto" />
                      </div>

                      {/* Corpo */}
                      <div className="flex-1 flex flex-col justify-center w-full max-w-2xl mx-auto">
                        <h2 className="text-2xl sm:text-[26px] font-bold text-[#1f2a44] uppercase tracking-wide mb-4">
                          {viewingCertificate.userName}
                        </h2>
                        <p className="text-[13px] sm:text-[14px] text-slate-800 leading-relaxed font-medium">
                          Portador (a) do CPF nº {currentUser.cpf} participou do <strong>TREINAMENTO DE {course.name.toUpperCase()}</strong>, realizado no dia {longDate}, com carga horária total de <strong>{course.duration} horas</strong>.
                        </p>
                        <div className="text-right text-[13px] text-slate-800 font-bold mt-6 pr-1">
                          São Paulo, {longDate}
                        </div>
                      </div>

                      {/* Assinaturas: aluno + instrutor + responsável técnico (Magnus) */}
                      <div className="flex items-end justify-between w-full max-w-3xl mx-auto mt-4 mb-[5%] gap-4">
                        <div className="w-36 flex flex-col items-center">
                          <div className="w-full h-px bg-slate-900 mb-1.5" />
                          <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider">Assinatura do Aluno</span>
                        </div>
                        <div className="w-60 flex flex-col items-center">
                          {firstInstructor.signatureUrl ? (
                            <img src={firstInstructor.signatureUrl} alt="Assinatura do instrutor" className="h-9 object-contain mb-0.5" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[20px] text-slate-800 leading-tight mb-0.5 text-center" style={{ fontFamily: '"Great Vibes", cursive' }}>
                              {firstInstructor.name}
                            </span>
                          )}
                          <div className="w-full h-px bg-slate-900 mb-1.5" />
                          <div className="text-[10px] leading-tight font-bold text-slate-900 uppercase tracking-wide text-center">
                            Instrutor: {firstInstructor.name}<br />
                            {firstInstructor.formation}
                            {firstInstructor.mte ? <><br />MTE nº: {firstInstructor.mte}</> : null}
                            {firstInstructor.crea ? <><br />CREA nº: {firstInstructor.crea}</> : null}
                            {firstInstructor.crq ? <><br />CRQ nº: {firstInstructor.crq}</> : null}
                          </div>
                          {firstInstructor.icpEnabled && viewingCertificate.certificateCode && (
                            <div className="mt-1.5 w-full flex items-center gap-1.5 border border-[#1f2a44]/40 rounded px-2 py-1 bg-[#1f2a44]/[0.04]">
                              <ShieldCheck className="w-4 h-4 text-[#1f2a44] shrink-0" />
                              <div className="text-[7px] leading-snug text-[#1f2a44] text-left min-w-0">
                                <span className="font-extrabold uppercase tracking-wide block">Assinado digitalmente • ICP-Brasil</span>
                                <span className="block truncate">{paymentConfig?.digitalCertificateHolder || firstInstructor.name}</span>
                                <span className="font-mono block truncate">{viewingCertificate.certificateCode}</span>
                                <span className="block">MP 2.200-2/2001</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Responsável técnico — assina (digitalmente) todos os certificados */}
                        <div className="w-60 flex flex-col items-center">
                          {RESPONSAVEL_TECNICO.signatureUrl ? (
                            <img src={RESPONSAVEL_TECNICO.signatureUrl} alt="Assinatura do responsável técnico" className="h-9 object-contain mb-0.5" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[20px] text-slate-800 leading-tight mb-0.5 text-center" style={{ fontFamily: '"Great Vibes", cursive' }}>
                              {RESPONSAVEL_TECNICO.name}
                            </span>
                          )}
                          <div className="w-full h-px bg-slate-900 mb-1.5" />
                          <div className="text-[10px] leading-tight font-bold text-slate-900 uppercase tracking-wide text-center">
                            Responsável Técnico: {RESPONSAVEL_TECNICO.name}<br />
                            {RESPONSAVEL_TECNICO.formation}
                            {RESPONSAVEL_TECNICO.register ? <><br />{RESPONSAVEL_TECNICO.register}</> : null}
                          </div>
                          {RESPONSAVEL_TECNICO.icpEnabled && viewingCertificate.certificateCode && (
                            <div className="mt-1.5 w-full flex items-center gap-1.5 border border-[#1f2a44]/40 rounded px-2 py-1 bg-[#1f2a44]/[0.04]">
                              <ShieldCheck className="w-4 h-4 text-[#1f2a44] shrink-0" />
                              <div className="text-[7px] leading-snug text-[#1f2a44] text-left min-w-0">
                                <span className="font-extrabold uppercase tracking-wide block">Assinado digitalmente • ICP-Brasil</span>
                                <span className="block truncate">{RESPONSAVEL_TECNICO.name}</span>
                                <span className="font-mono block truncate">{viewingCertificate.certificateCode}</span>
                                <span className="block">MP 2.200-2/2001</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PAGE 2: BACK SIDE — conteúdo programático (parte 1) */}
                {BackPage('certificate-page-2', syllabusPage1, needsSecondBack ? { n: 1, total: 2 } : undefined)}

                {/* PAGE 3: BACK SIDE — conteúdo programático (parte 2), quando necessário */}
                {needsSecondBack && BackPage('certificate-page-3', syllabusPage2, { n: 2, total: 2 })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
