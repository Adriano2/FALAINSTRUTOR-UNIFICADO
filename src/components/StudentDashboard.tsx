/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Course, Enrollment, Comment, StudentExamSubmission, ExamQuestion } from '../types';
import { getExamQuestions } from '../data';
import { Clock, Shield, Award, Play, CheckCircle2, ChevronRight, FileDown, MessageSquare, Check, X, ShieldAlert, AwardIcon, Printer, Video, FileText, MonitorPlay, Presentation } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface StudentDashboardProps {
  currentUser: User;
  courses: Course[];
  enrollments: Enrollment[];
  comments: Comment[];
  studentExams: StudentExamSubmission[];
  onUpdateProfile: (updated: Partial<User>) => void;
  onPostComment: (comment: Omit<Comment, 'id' | 'date'>) => void;
  onCompleteEnrollment: (enrollmentId: string, score: number, passed: boolean, certificateCode: string, answers: Record<number, number>) => void;
  onUpdateProgress: (enrollmentId: string, progress: number) => void;
}

export default function StudentDashboard({
  currentUser,
  courses,
  enrollments,
  comments,
  studentExams,
  onUpdateProfile,
  onPostComment,
  onCompleteEnrollment,
  onUpdateProgress
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<'my-courses' | 'my-profile'>('my-courses');
  
  // Classroom Player View Mode
  const [activeEnrollment, setActiveEnrollment] = React.useState<Enrollment | null>(null);
  const [selectedModuleIdx, setSelectedModuleIdx] = React.useState(0);
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

  const handleDownloadPDF = async (courseName: string) => {
    setIsGeneratingPDF(true);
    try {
      const pageFront = document.getElementById('certificate-page-1');
      const pageBack = document.getElementById('certificate-page-2');

      if (!pageFront || !pageBack) {
        alert("Erro ao detectar as partes do certificado para geração do PDF.");
        setIsGeneratingPDF(false);
        return;
      }

      // Initialize jsPDF with landscape orientation, A4 measurements (297mm x 210mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Capture Front side of the certificate
      const canvasFront = await html2canvas(pageFront, {
        scale: 2, // Double scale for maximum crystalline quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgFront = canvasFront.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgFront, 'JPEG', 0, 0, 297, 210);

      // Add a page break and capture the Programmatic Back side
      pdf.addPage();
      const canvasBack = await html2canvas(pageBack, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgBack = canvasBack.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgBack, 'JPEG', 0, 0, 297, 210);

      // Download the composite dual-page PDF file
      const formattedCourseName = courseName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      pdf.save(`certificado_${formattedCourseName}.pdf`);
    } catch (error) {
      console.error("Erro na compilação do arquivo PDF do certificado:", error);
      alert("Houve um contratempo técnico ao compilar e fazer o download do seu PDF. Por favor, tente novamente.");
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

  const handleOpenClassroom = (enrollment: Enrollment) => {
    setActiveEnrollment(enrollment);
    setSelectedModuleIdx(0);
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
  const handleExamSubmit = (courseId: string, questions: ExamQuestion[]) => {
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
      const generatedCode = `CERT-${activeEnrollment.courseCode}-${currentUser.name.split(' ')[0].toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;
      onCompleteEnrollment(activeEnrollment.id, scorePercentage, passed, generatedCode, { ...examAnswers });
      
      // Update localized active state to reflect completion logs
      setActiveEnrollment({
        ...activeEnrollment,
        progress: 100,
        examScore: scorePercentage,
        passed,
        certificateCode: passed ? generatedCode : null
      });

      if (passed) {
        alert(`Parabéns! Você foi aprovado com aproveitamento de ${scorePercentage}%! Seu certificado do MTE foi emitido com sucesso e já está disponível para consulta.`);
      } else {
        alert(`Aproveitamento de ${scorePercentage}%. O mínimo exigido pela portaria é 75%. Estude os módulos novamente e realize uma nova tentativa.`);
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
          const questions = getExamQuestions(course.id);

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
                        ) : (
                          <div className="flex-1 flex items-center justify-center bg-slate-100 text-slate-800 w-full overflow-hidden relative">
                              {/* Fake PDF slide generator viewer */}
                              <div className="w-[90%] sm:w-[85%] h-[85%] bg-white shadow-2xl shadow-black/50 border border-slate-300 flex flex-col mt-4 sm:mt-0 relative max-h-[85%]">
                                 <div className="h-8 shrink-0 bg-slate-800 flex items-center px-4 justify-between text-white border-b border-slate-700 select-none">
                                    <span className="text-[10px] font-bold">Slide {selectedModuleIdx + 1} de {course.modules.length}</span>
                                    <div className="flex gap-2">
                                      <div className="w-4 h-4 bg-slate-600 rounded-full shrink-0 flex items-center justify-center text-[8px]">−</div>
                                      <div className="w-4 h-4 bg-slate-600 rounded-full shrink-0 flex items-center justify-center text-[8px]">+</div>
                                    </div>
                                 </div>
                                 <div className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-center text-center overflow-auto min-h-0 w-full">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-4 font-display uppercase leading-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-emerald-500 break-words w-full px-2" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{course.modules[selectedModuleIdx]}</h1>
                                    <p className="max-w-prose text-xs sm:text-sm text-slate-600 font-medium px-2">Conteúdo programático em slides homologados. Estude as diretrizes normativas da aula passo a passo.</p>
                                 </div>
                              </div>
                          </div>
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
                                {activeEnrollment.certificateCode && (
                                  <button 
                                    onClick={() => setViewingCertificate(activeEnrollment)}
                                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10px] uppercase shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Printer className="w-4 h-4" /> Emitir Certificado
                                  </button>
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

                            {enr.passed && enr.certificateCode && (
                              <button 
                                onClick={() => setViewingCertificate(enr)}
                                className="px-3 py-2 bg-emerald-650 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl select-none cursor-pointer flex items-center gap-1"
                              >
                                Certificado ✓
                              </button>
                            )}
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
        
        const firstInstructor = course.instructors[0] || { name: 'Instrutor Qualificado', formation: 'Engenheiro de Segurança / Civil' };
        
        const courseCodeMatch = course.name.match(/NR[- ]?(\d+[\.\d]*)/i);
        const courseCode = courseCodeMatch ? courseCodeMatch[1] : "XX";

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
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded text-xs font-bold flex items-center gap-1 transition select-none cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> Imprimir Documento
                  </button>
                  <button 
                    onClick={() => setViewingCertificate(null)}
                    className="p-1 px-3 bg-red-650 hover:bg-red-700 text-white rounded text-xs font-bold transition select-none cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>

              {/* DUAL PAGE LAYOUT PREVIEW PANEL */}
              <div className="space-y-8" id="printable-certificate-area">
                
                    {/* PAGE 1: FRONT SIDE */}
                <div id="certificate-page-1" className="relative bg-white aspect-[1.414] shadow-sm select-all font-sans text-slate-900 border border-slate-200 overflow-hidden" style={{ fontFamily: 'Arial, sans-serif' }}>
                  
                  {/* Decorative background vectors mock */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#slate-800_1px,transparent_1px),linear-gradient(to_bottom,#slate-800_1px,transparent_1px)] [background-size:20px_20px]" />

                  {/* Left Side Shapes & Branding - Simple Full Height Green Bar */}
                  <div className="absolute top-0 left-0 w-[24%] h-full bg-[#008e39] z-0 shadow-lg border-r-[8px] border-[#293452]" />

                  <div className="relative z-10 flex w-full h-full">
                    
                    {/* Sidebar / Left Column Content */}
                    <div className="w-[24%] h-full pt-[8%] pb-[8%] flex flex-col items-center justify-between z-20">
                      <div className="relative flex flex-col items-center">
                        <div className="w-28 h-28 bg-[#ffc107] border-[4px] border-slate-900 rounded-2xl transform rotate-45 flex items-center justify-center shadow-lg">
                          <div className="transform -rotate-45 text-center leading-[0.85]">
                            <span className="block text-2xl font-black text-slate-900 ml-[1px]">NR</span>
                            <span className="block text-[36px] font-black text-[#d91f26] -mb-1 shrink-0">{courseCode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 mb-2 w-full text-center">FALA INSTRUTOR</div>
                        <div className="text-white font-black italic text-6xl leading-none pt-2 drop-shadow-md">
                           FI
                        </div>
                      </div>

                      {/* QR Mock */}
                      <div className="bg-white p-1.5 w-24 h-24 shadow-md rounded">
                         <div className="w-full h-full bg-slate-900" style={{ backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px' }} />
                      </div>
                    </div>

                    {/* Main Content Pane */}
                    <div className="w-[76%] h-full pl-12 pr-16 pt-12 flex flex-col items-center text-center">
                      
                      <div className="w-full flex justify-end mb-6">
                         <h1 className="text-5xl font-black text-[#008e39] tracking-tighter" style={{ fontFamily: 'Arial Black, sans-serif'}}>
                           CERTIFICADO
                         </h1>
                      </div>

                      <div className="mt-4 mb-8">
                         <div className="flex items-center gap-1 justify-center">
                           <div className="text-4xl font-black italic text-[#008e39] border-t-4 border-l-4 border-slate-900 pt-1 pl-1 leading-none">FI</div>
                           <div className="flex flex-col text-left leading-[0.9]">
                             <span className="text-3xl font-black text-slate-900 tracking-tight">FALA</span>
                             <span className="text-3xl font-black text-slate-900 tracking-tight">INSTRUTOR</span>
                           </div>
                         </div>
                         <span className="block text-[11px] text-slate-600 tracking-widest font-bold mt-2 uppercase">Segurança do Trabalho</span>
                      </div>

                      <div className="space-y-6 w-full flex-1 flex flex-col justify-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#008e39] uppercase tracking-wide">
                          {viewingCertificate.userName}
                        </h2>
                        
                        <p className="text-[13px] sm:text-[15px] text-slate-800 text-center leading-relaxed mx-auto max-w-2xl font-medium">
                          Portador (a) do CPF nº {currentUser.cpf} participou do <strong>TREINAMENTO DE {course.name}</strong>, realizado no dia {viewingCertificate.startDate}, 
                          com carga horária total de <strong>{course.duration} horas</strong>.
                        </p>
                      </div>

                      <div className="w-full flex flex-col justify-between h-36">
                         <div className="text-right text-[13px] sm:text-[15px] text-slate-800 font-bold mb-4">
                           São Paulo, {viewingCertificate.startDate}
                         </div>

                         <div className="flex items-end justify-between w-full mt-auto">
                           <div className="text-left w-64 flex flex-col items-center">
                             <div className="w-full h-px bg-slate-900 mb-2" />
                             <span className="text-xs text-slate-700 font-bold uppercase tracking-wider">Assinatura do Aluno</span>
                           </div>

                           <div className="text-center w-72 flex flex-col items-center">
                             <span className="font-serif italic text-3xl mb-1 border-b border-slate-400 text-slate-800 w-full pb-1 mt-[-20px]">
                               {firstInstructor.name.split(' ')[0]} {firstInstructor.name.split(' ').slice(1).join(' ')}
                             </span>
                             <div className="text-[11px] text-left w-full leading-tight font-bold text-slate-900 mt-2 uppercase tracking-wide">
                               Instrutor: {firstInstructor.name}<br/>
                               {firstInstructor.formation}<br/>
                               MTE nº: 0124684/SP
                             </div>
                           </div>
                         </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* PAGE 2: BACK SIDE */}
                <div id="certificate-page-2" className="relative bg-white aspect-[1.414] shadow-sm select-all font-sans text-slate-900 border border-slate-200 mt-8 overflow-hidden" style={{ fontFamily: 'Arial, sans-serif' }}>
                  
                  {/* Decorative background vectors mock */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#slate-800_1px,transparent_1px),linear-gradient(to_bottom,#slate-800_1px,transparent_1px)] [background-size:20px_20px]" />

                  {/* Left Side Shapes & Branding - Simple Full Height Green Bar */}
                  <div className="absolute top-0 left-0 w-[24%] h-full bg-[#008e39] z-0 shadow-lg border-r-[8px] border-[#293452]" />

                  <div className="relative z-10 flex w-full h-full">
                    
                    {/* Sidebar / Left Column Content */}
                    <div className="w-[24%] h-full pt-[8%] pb-[8%] flex flex-col items-center justify-between z-20">
                     <div className="relative flex flex-col items-center">
                        <div className="w-28 h-28 bg-[#ffc107] border-[4px] border-slate-900 rounded-2xl transform rotate-45 flex items-center justify-center shadow-lg">
                          <div className="transform -rotate-45 text-center leading-[0.85]">
                            <span className="block text-2xl font-black text-slate-900 ml-[1px]">NR</span>
                            <span className="block text-[36px] font-black text-[#d91f26] -mb-1 shrink-0">{courseCode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 mb-2 w-full text-center">FALA INSTRUTOR</div>
                        <div className="text-white font-black italic text-6xl leading-none pt-2 drop-shadow-md">
                           FI
                        </div>
                      </div>

                      {/* QR Mock */}
                      <div className="bg-white p-1.5 w-24 h-24 shadow-md rounded">
                         <div className="w-full h-full bg-slate-900" style={{ backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px' }} />
                      </div>
                    </div>

                    {/* Main Content Pane */}
                    <div className="w-[76%] h-full pl-12 pr-12 pt-12 pb-12 flex flex-col text-left">
                      
                      <div className="mb-6 flex flex-col items-center">
                         <div className="flex items-center gap-1 justify-center">
                           <div className="text-4xl font-black italic text-[#008e39] border-t-4 border-l-4 border-slate-900 pt-1 pl-1 leading-none">FI</div>
                           <div className="flex flex-col text-left leading-[0.9]">
                             <span className="text-3xl font-black text-slate-900 tracking-tight">FALA</span>
                             <span className="text-3xl font-black text-slate-900 tracking-tight">INSTRUTOR</span>
                           </div>
                         </div>
                         <span className="block text-[11px] text-slate-600 tracking-widest font-bold mt-2 uppercase">Segurança do Trabalho</span>
                      </div>

                      <h3 className="text-[15px] max-w-xl mx-auto text-center font-bold text-slate-900 mb-6 border-b-2 border-slate-900 pb-2 uppercase tracking-wide">
                        Conteúdo Programático do Treinamento de {course.name}
                      </h3>
                      
                      <div className="flex-1 w-full text-[12px] leading-relaxed text-slate-800 px-4 mt-2 columns-2 gap-8">
                        <ul className="list-disc pl-4 space-y-1 font-medium">
                          {course.modules.map((mod, mi) => (
                            <li key={mi}>{mod}</li>
                          ))}
                          {course.manualActivities.length > 0 && course.manualActivities.map((act, ax) => (
                            <li key={`act-${ax}`}>{act}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Footer URL */}
                      <div className="mt-auto pt-6 flex justify-center text-[12px] text-[#008e39] font-black tracking-[0.2em] w-full z-20">
                        WWW.FALAINSTRUTOR.COM.BR
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
