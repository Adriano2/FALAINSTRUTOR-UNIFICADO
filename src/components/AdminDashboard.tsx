/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  User, Course, Enrollment, SalesTransaction, Coupon, Comment, 
  ContactMessage, LayoutConfig, PaymentConfig, StudentExamSubmission 
} from '../types';
import { getExamQuestions } from '../data';
import {
  BarChart, Users, BookOpen, DollarSign, Award, Tag, Settings, MessageSquare,
  Mail, ShieldCheck, ClipboardList, BookOpenCheck, Sliders, Download, Plus,
  Trash2, ToggleLeft, ToggleRight, Check, X, FileText, CheckCircle2, AlertTriangle, Key,
  Newspaper, Package, Building2, Layout, GraduationCap, Receipt, Video, Link2
} from 'lucide-react';
import ContentManager from './admin/ContentManager';
import InstructorManager from './admin/InstructorManager';
import InvoiceManager from './admin/InvoiceManager';
import { ShieldEmblem } from './BrandLogo';

interface AdminDashboardProps {
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  transactions: SalesTransaction[];
  coupons: Coupon[];
  comments: Comment[];
  contactMessages: ContactMessage[];
  studentExams: StudentExamSubmission[];
  layoutConfig: LayoutConfig;
  paymentConfig: PaymentConfig;
  onUpdateUsers: (users: User[]) => void;
  onUpdateCourses: (courses: Course[]) => void;
  onUpdateEnrollments: (enrollments: Enrollment[]) => void;
  onUpdateTransactions: (transactions: SalesTransaction[]) => void;
  onUpdateCoupons: (coupons: Coupon[]) => void;
  onUpdateComments: (comments: Comment[]) => void;
  onUpdateLayout: (layout: LayoutConfig) => void;
  onUpdatePayment: (payment: PaymentConfig) => void;
  // Ações que persistem no banco via API
  onCreateUser: (input: { name: string; email: string; cpf: string; dob?: string; role?: 'ADMIN' | 'STUDENT' }) => void;
  onToggleUserActive: (id: string, isActive: boolean) => void;
  onReplyComment: (id: string, reply: string) => void;
  onBatchEnroll: (userIds: string[], courseId: string) => void;
  onCreateCoupon: (input: { code: string; description: string; value: number; type: 'PERCENTAGE' | 'FIXED'; associatedProducts: string[] }) => void;
  onToggleCoupon: (id: string, isActive: boolean) => void;
  onAddInstructor: (courseId: string, input: { name: string; formation: string; mte?: string; crea?: string; signatureUrl?: string; icpEnabled: boolean }) => void;
  onAddModule: (courseId: string, module: string) => void;
  onSaveCourseContent: (courseId: string, input: { videoUrl?: string; moduleVideos?: string[]; documents?: { name: string; url: string }[] }) => void;
  onSaveConfig: (layout: LayoutConfig, payment: PaymentConfig) => void;
}

export default function AdminDashboard({
  users,
  courses,
  enrollments,
  transactions,
  coupons,
  comments,
  contactMessages,
  studentExams,
  layoutConfig,
  paymentConfig,
  onUpdateUsers,
  onUpdateCourses,
  onUpdateEnrollments,
  onUpdateTransactions,
  onUpdateCoupons,
  onUpdateComments,
  onUpdateLayout,
  onUpdatePayment,
  onCreateUser,
  onToggleUserActive,
  onReplyComment,
  onBatchEnroll,
  onCreateCoupon,
  onToggleCoupon,
  onAddInstructor,
  onAddModule,
  onSaveCourseContent,
  onSaveConfig,
}: AdminDashboardProps) {
  // Sidebar State
  const [activeTab, setActiveTab] = React.useState<string>('dashboard');
  const [dashboardDaysFilter, setDashboardDaysFilter] = React.useState<number>(30);

  // General CSV Downloader helper
  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics summary calculations based on selected days
  const metrics = React.useMemo(() => {
    return {
      totalUsers: users.length,
      totalEnrollments: enrollments.length,
      completedCertificates: enrollments.filter(e => e.passed && e.certificateCode).length,
      totalRevenues: transactions.filter(t => t.status === 'active').reduce((acc, t) => acc + t.total, 0),
      discountsApplied: transactions.reduce((acc, t) => acc + t.discount, 0),
      totalProducts: courses.length,
    };
  }, [users, enrollments, transactions, courses, dashboardDaysFilter]);

  // General course modal states
  const [managingCourse, setManagingCourse] = React.useState<Course | null>(null);
  const [courseModalType, setCourseModalType] = React.useState<'instructors' | 'modules' | 'content' | null>(null);
  // Conteúdo de mídia do curso (vídeo aula + materiais de apoio)
  const [contentVideoUrl, setContentVideoUrl] = React.useState('');
  const [contentModuleVideos, setContentModuleVideos] = React.useState<string[]>([]);
  const [contentDocs, setContentDocs] = React.useState<{ name: string; url: string }[]>([]);
  const [newDocName, setNewDocName] = React.useState('');
  const [newDocUrl, setNewDocUrl] = React.useState('');
  const [newInstructorName, setNewInstructorName] = React.useState('');
  const [newInstructorFormation, setNewInstructorFormation] = React.useState('');
  const [newInstructorMte, setNewInstructorMte] = React.useState('');
  const [newInstructorCrea, setNewInstructorCrea] = React.useState('');
  const [newInstructorSignatureUrl, setNewInstructorSignatureUrl] = React.useState('');
  const [newInstructorIcp, setNewInstructorIcp] = React.useState(true);
  const [newModuleText, setNewModuleText] = React.useState('');

  // Coupon manager states
  const [newCouponCode, setNewCouponCode] = React.useState('');
  const [newCouponDesc, setNewCouponDesc] = React.useState('');
  const [newCouponVal, setNewCouponVal] = React.useState<number>(10);
  const [newCouponType, setNewCouponType] = React.useState<'percentage' | 'fixed'>('percentage');

  // Manual User Registration state
  const [newUserOpen, setNewUserOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newCpf, setNewCpf] = React.useState('');
  const [newDob, setNewDob] = React.useState('');
  const [newRole, setNewRole] = React.useState<'admin' | 'student'>('student');

  // CSV Batch Upload state modal
  const [csvUploadOpen, setCsvUploadOpen] = React.useState(false);

  // Batch Enrollment state modal
  const [batchEnrollOpen, setBatchEnrollOpen] = React.useState(false);
  const [selectedEnrollUsers, setSelectedEnrollUsers] = React.useState<string[]>([]);
  const [batchEnrollCourseId, setBatchEnrollCourseId] = React.useState('');

  // Comment Reply state
  const [replyCommentId, setReplyCommentId] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState('');

  // Layout Colors states
  const [layoutCompany, setLayoutCompany] = React.useState(layoutConfig.companyName);
  const [layoutPhone, setLayoutPhone] = React.useState(layoutConfig.phone);
  const [cfgPrimary, setCfgPrimary] = React.useState(layoutConfig.primaryColor);
  const [cfgSecondary, setCfgSecondary] = React.useState(layoutConfig.secondaryColor);
  const [cfgInstagram, setCfgInstagram] = React.useState(layoutConfig.instagramUrl || '');
  const [cfgYoutube, setCfgYoutube] = React.useState(layoutConfig.youtubeUrl || '');
  const [cfgLinkedin, setCfgLinkedin] = React.useState(layoutConfig.linkedinUrl || '');
  const [cfgCnpj, setCfgCnpj] = React.useState(paymentConfig.cnpj);
  const [cfgCep, setCfgCep] = React.useState(paymentConfig.cep);
  const [cfgStreet, setCfgStreet] = React.useState(paymentConfig.street);
  const [cfgNum, setCfgNum] = React.useState(paymentConfig.number);
  const [cfgComp, setCfgComp] = React.useState(paymentConfig.complement || '');
  const [cfgCity, setCfgCity] = React.useState(paymentConfig.city);
  const [cfgState, setCfgState] = React.useState(paymentConfig.state);

  // Certificado digital ICP-Brasil (identidade do assinante dos certificados emitidos)
  const [cfgCertName, setCfgCertName] = React.useState(paymentConfig.digitalCertificateName || '');
  const [cfgCertHolder, setCfgCertHolder] = React.useState(paymentConfig.digitalCertificateHolder || '');
  const [cfgCertPassword, setCfgCertPassword] = React.useState(paymentConfig.digitalCertificatePassword || '');
  const [cfgCertIssuer, setCfgCertIssuer] = React.useState(paymentConfig.digitalCertificateIssuer || '');
  const [cfgCertSerial, setCfgCertSerial] = React.useState(paymentConfig.digitalCertificateSerial || '');
  const [cfgCertValid, setCfgCertValid] = React.useState(paymentConfig.digitalCertificateValidUntil || '');

  // Exam Details state drawer
  const [auditingExam, setAuditingExam] = React.useState<StudentExamSubmission | null>(null);

  // Export actions
  const handleExportEnrollments = () => {
    const headers = ["Matrícula ID", "Estudante", "Email", "Código Curso", "Curso", "Progresso (%)", "Exame", "Aprovado", "Data Início"];
    const rows = enrollments.map(e => [
      e.id, e.userName, e.userEmail, e.courseCode, e.courseName, e.progress.toString(),
      e.examScore !== null ? `${e.examScore}%` : "Pendente", e.passed ? "Sim" : "Não", e.startDate
    ]);
    downloadCSV("enrollments_export.csv", headers, rows);
  };

  const handleExportSales = () => {
    const headers = ["Transação ID", "Estudante", "Curso", "Total Pago", "Desconto", "Status", "Parcelas", "Cupom", "Data"];
    const rows = transactions.map(t => [
      t.id, t.userName, t.courseName, t.total.toFixed(2), t.discount.toFixed(2), t.status, t.installments.toString(), t.couponCode || "Nenhum", t.date
    ]);
    downloadCSV("sales_export.csv", headers, rows);
  };

  // Add customized instructors
  const handleAddInstructor = () => {
    if (!managingCourse || !newInstructorName.trim()) {
      alert('Informe ao menos o nome do instrutor.');
      return;
    }
    onAddInstructor(managingCourse.id, {
      name: newInstructorName.trim(),
      formation: newInstructorFormation.trim() || 'Instrutor Responsável',
      mte: newInstructorMte || undefined,
      crea: newInstructorCrea || undefined,
      signatureUrl: newInstructorSignatureUrl || undefined,
      icpEnabled: newInstructorIcp,
    });
    setNewInstructorName('');
    setNewInstructorFormation('');
    setNewInstructorMte('');
    setNewInstructorCrea('');
    setNewInstructorSignatureUrl('');
    setNewInstructorIcp(true);
    setManagingCourse(null);
    setCourseModalType(null);
  };

  // Add customized modules
  const handleAddModule = () => {
    if (!managingCourse || !newModuleText) return;
    onAddModule(managingCourse.id, newModuleText);
    setNewModuleText('');
    setManagingCourse(null);
    setCourseModalType(null);
  };

  // Add a support document (name + URL) to the in-modal draft list
  const handleAddDoc = () => {
    if (!newDocName.trim() || !newDocUrl.trim()) return;
    setContentDocs([...contentDocs, { name: newDocName.trim(), url: newDocUrl.trim() }]);
    setNewDocName('');
    setNewDocUrl('');
  };

  // Save course video link + support documents
  const handleSaveCourseContent = () => {
    if (!managingCourse) return;
    onSaveCourseContent(managingCourse.id, {
      videoUrl: contentVideoUrl.trim(),
      moduleVideos: contentModuleVideos.map((v) => v.trim()),
      documents: contentDocs,
    });
    setManagingCourse(null);
    setCourseModalType(null);
  };

  // Create manual individual Account
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newCpf) return;

    onCreateUser({
      name: newName,
      email: newEmail,
      cpf: newCpf,
      dob: newDob || undefined,
      role: newRole === 'admin' ? 'ADMIN' : 'STUDENT',
    });
    setNewName('');
    setNewEmail('');
    setNewCpf('');
    setNewDob('');
    setNewRole('student');
    setNewUserOpen(false);
  };

  // Download template CSV file
  const handleDownloadCsvTemplate = () => {
    const headers = ["Nome Completo", "Nascimento (AAAA-MM-DD)", "CPF (000.000.000-00)", "Email", "Cargo"];
    const rows = [
      ["Lucas de Assis Soares", "1993-04-15", "123.456.789-10", "lucas@empresa.com.br", "student"],
      ["Gabriela Mendes Albuquerque", "1989-11-20", "225.441.905-11", "gabriela@empresa.com.br", "student"],
    ];
    downloadCSV("user_example_template.csv", headers, rows);
  };

  // Mock upload CSV registry file
  const handleMockCsvUpload = () => {
    setCsvUploadOpen(false);
    // Simulate parsing 3 users instantly
    const parsedUsers: User[] = [
      {
        id: "usr-csv-1",
        name: "Larissa Mayara Carvalho",
        dob: "1994-07-16",
        cpf: "542.128.988-11",
        email: "larissa.mayara@empresa.com.br",
        role: "student",
        isActive: true,
        registeredAt: new Date().toISOString().split('T')[0]
      },
      {
        id: "usr-csv-2",
        name: "Bruno de Sousa Barros",
        dob: "1991-03-24",
        cpf: "191.129.435-02",
        email: "bruno.sousa@empresa.com.br",
        role: "student",
        isActive: true,
        registeredAt: new Date().toISOString().split('T')[0]
      },
      {
        id: "usr-csv-3",
        name: "Olívia Santos Soares",
        dob: "1997-12-05",
        cpf: "348.911.233-14",
        email: "olivia.santos@empresa.com.br",
        role: "student",
        isActive: true,
        registeredAt: new Date().toISOString().split('T')[0]
      }
    ];

    onUpdateUsers([...users, ...parsedUsers]);
    alert("Arquivo de lote processado! 3 novos profissionais de SST foram engajados e registrados no FalaInstrutor.");
  };

  // Batch Enrollment trigger
  const handleBatchEnroll = () => {
    if (selectedEnrollUsers.length === 0 || !batchEnrollCourseId) {
      alert("Por favor, selecione pelo menos um usuário e informe o curso de destino.");
      return;
    }
    onBatchEnroll(selectedEnrollUsers, batchEnrollCourseId);
    setSelectedEnrollUsers([]);
    setBatchEnrollCourseId('');
    setBatchEnrollOpen(false);
  };

  // Save Settings Config
  const handleSaveSettings = () => {
    onSaveConfig(
      { ...layoutConfig, companyName: layoutCompany, phone: layoutPhone, primaryColor: cfgPrimary, secondaryColor: cfgSecondary, instagramUrl: cfgInstagram, youtubeUrl: cfgYoutube, linkedinUrl: cfgLinkedin },
      {
        ...paymentConfig,
        cnpj: cfgCnpj, cep: cfgCep, street: cfgStreet, number: cfgNum, complement: cfgComp, city: cfgCity, state: cfgState,
        digitalCertificateName: cfgCertName,
        digitalCertificateHolder: cfgCertHolder,
        digitalCertificatePassword: cfgCertPassword,
        digitalCertificateIssuer: cfgCertIssuer,
        digitalCertificateSerial: cfgCertSerial,
        digitalCertificateValidUntil: cfgCertValid,
      },
    );
  };

  // Post Administrative reply to comment
  const handleSaveReply = () => {
    if (!replyCommentId || !replyText) return;
    onReplyComment(replyCommentId, replyText);
    setReplyCommentId(null);
    setReplyText('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Admin Left navigation column (menu lateral) */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 md:sticky md:top-20 space-y-4">

            {/* Marca */}
            <div className="flex items-center gap-2 px-1 py-2 border-b border-slate-100 dark:border-slate-800">
              <ShieldEmblem className="w-9 h-auto" />
              <span className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">
                Fala<span className="text-blue-600">Instrutor</span>
              </span>
            </div>

            {[
              {
                group: 'Geral',
                items: [
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart },
                  { id: 'courses', label: 'Gestão de cursos', icon: BookOpen },
                  { id: 'instructors', label: 'Gestão de instrutores', icon: GraduationCap },
                  { id: 'enrollments', label: 'Gestão de matrículas', icon: ClipboardList },
                  { id: 'sales', label: 'Gestão de vendas', icon: DollarSign },
                  { id: 'invoices', label: 'Notas fiscais (NFS-e)', icon: Receipt },
                  { id: 'partners', label: 'Gestão de parceiros', icon: Building2 },
                  { id: 'users', label: 'Gestão de usuários', icon: Users },
                  { id: 'pages', label: 'Gestão de páginas', icon: Layout },
                  { id: 'news', label: 'Gestão de notícias', icon: Newspaper },
                  { id: 'products', label: 'Gestão de produtos', icon: Package },
                  { id: 'coupons', label: 'Gestão de cupons', icon: Tag },
                  { id: 'exams', label: 'Provas / Exames', icon: BookOpenCheck },
                ],
              },
              {
                group: 'Configuração',
                items: [
                  { id: 'settings', label: 'Configurações', icon: Settings },
                  { id: 'comments', label: 'Comentários', icon: MessageSquare },
                  { id: 'contacts', label: 'Mensagem de contato', icon: Mail },
                  { id: 'certificates', label: 'Certificados', icon: Award },
                  { id: 'emails', label: 'E-mails', icon: Mail },
                ],
              },
            ].map((section) => (
              <div key={section.group}>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-1">{section.group}</p>
                <div className="space-y-0.5">
                  {section.items.map((opt) => {
                    const Icon = opt.icon;
                    const active = activeTab === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setActiveTab(opt.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-left transition select-none cursor-pointer ${
                          active
                            ? 'bg-blue-600 text-white font-bold shadow-sm'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" /> {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Admin right main workspace panel */}
        <div className="md:col-span-3 space-y-6">
          
          {/* TAB 1: METRICS DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Filter Row header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-4 rounded-lg">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Estatísticas Gerais</h2>
                  <p className="text-xs text-slate-400">Atividades e relatórios financeiros consolidados.</p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded text-xs font-bold">
                  {[7, 15, 30].map(days => (
                    <button
                      key={days}
                      onClick={() => setDashboardDaysFilter(days)}
                      className={`px-3 py-1 rounded transition select-none cursor-pointer ${
                        dashboardDaysFilter === days 
                          ? 'bg-amber-500 text-slate-950 font-black' 
                          : 'text-slate-650 dark:text-slate-350 hover:text-amber-500'
                      }`}
                    >
                      {days} Dias
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Cards values */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full shrink-0"><Users className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-slate-450 uppercase font-black block">Total Usuários</span>
                    <strong className="text-lg font-extrabold text-slate-900 dark:text-white">{metrics.totalUsers}</strong>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full shrink-0"><BookOpen className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-slate-450 uppercase font-black block">Matrículas Ativas</span>
                    <strong className="text-lg font-extrabold text-slate-900 dark:text-white">{metrics.totalEnrollments}</strong>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 text-purple-500 rounded-full shrink-0"><Award className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-slate-450 uppercase font-black block">Certificados Emitidos</span>
                    <strong className="text-lg font-extrabold text-slate-900 dark:text-white">{metrics.completedCertificates}</strong>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full shrink-0"><DollarSign className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-slate-450 uppercase font-black block">Receita Bruta</span>
                    <strong className="text-lg font-extrabold text-slate-900 dark:text-white">R$ {metrics.totalRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
                  <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full shrink-0"><Tag className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-slate-450 uppercase font-black block">Cupons Aplicados</span>
                    <strong className="text-lg font-extrabold text-slate-900 dark:text-white">R$ {metrics.discountsApplied.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-full shrink-0"><Sliders className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-slate-450 uppercase font-black block">Cursos Ativos</span>
                    <strong className="text-lg font-extrabold text-slate-900 dark:text-white">{metrics.totalProducts}</strong>
                  </div>
                </div>

              </div>

              {/* Visual custom SVG graphics elements */}
              <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-lg shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-950 dark:text-slate-100 uppercase tracking-tight">Tendências de Registro & Práticas</h3>
                  <span className="text-slate-400 text-xs">Visão consolidada do fluxo do tráfego corporativo semipresencial.</span>
                </div>

                {/* Highly responsive animated custom interactive SVG Bar Chart */}
                <div className="w-full aspect-[2.1] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded p-4 flex flex-col justify-between">
                  <div className="flex-1 flex items-end justify-between gap-2.5 sm:gap-6 relative sm:px-6">
                    {/* SVG Chart vertical gridlines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none">
                      <div className="w-full border-t border-slate-200 dark:border-slate-800 text-[9px] text-slate-400 pt-0.5 font-bold">50 Users</div>
                      <div className="w-full border-t border-slate-200 dark:border-slate-800 text-[9px] text-slate-400 pt-0.5 font-bold">25 Users</div>
                      <div className="w-full border-t border-slate-200 dark:border-slate-800 text-[9px] text-slate-400 pt-0.5 font-bold">10 Users</div>
                    </div>

                    {[
                      { l: 'Set/25', u: 40, h: '85%' },
                      { l: 'Out/25', u: 28, h: '60%' },
                      { l: 'Nov/25', u: 52, h: '100%' },
                      { l: 'Dez/25', u: 10, h: '25%' },
                      { l: 'Jan/26', u: 31, h: '70%' },
                      { l: 'Fev/26', u: 45, h: '90%' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 z-1">
                        <div className="w-full max-w-[28px] bg-amber-500 rounded-t shadow transition-all duration-500 hover:opacity-85 cursor-help" style={{ height: item.h }} title={`${item.u} usuários inscritos`}>
                          {/* tooltip spacer */}
                        </div>
                        <span className="text-[10px] text-slate-450 font-bold select-none">{item.l}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-center pt-2 text-[10px] text-amber-500 font-bold tracking-wide uppercase select-none">
                    Gráfico Mensal de Desempenho e Matrícula de Turmas
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: COURSE ADMIN */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight border-b border-slate-100 dark:border-slate-800 pb-2">
                Gestão e Homologação de Cursos
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.map(course => (
                  <div key={course.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex flex-col justify-between space-y-4 shadow-sm">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-amber-500 font-extrabold pb-0.5 block">{course.code}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{course.duration}h total</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase line-clamp-1">{course.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{course.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                      <button
                        onClick={() => {
                          setManagingCourse(course);
                          setCourseModalType('instructors');
                        }}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 text-slate-700 dark:text-slate-300 rounded font-semibold text-center text-[11px] transition select-none cursor-pointer"
                      >
                        Docentes ({course.instructors.length})
                      </button>
                      
                      <button
                        onClick={() => {
                          setManagingCourse(course);
                          setCourseModalType('modules');
                        }}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 text-slate-700 dark:text-slate-300 rounded font-semibold text-center text-[11px] transition select-none cursor-pointer"
                      >
                        Módulos Práticos
                      </button>

                      <button
                        onClick={() => {
                          setManagingCourse(course);
                          setContentVideoUrl(course.videoUrl || '');
                          setContentModuleVideos(course.modules.map((_, i) => course.moduleVideos?.[i] || ''));
                          setContentDocs(course.documents || []);
                          setNewDocName('');
                          setNewDocUrl('');
                          setCourseModalType('content');
                        }}
                        className="col-span-2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-center text-[11px] transition select-none cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" /> Vídeo & Materiais
                        {course.videoUrl ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" title="Vídeo configurado" /> : null}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB: GESTÃO DE INSTRUTORES */}
          {activeTab === 'instructors' && (
            <InstructorManager courses={courses} />
          )}

          {/* TAB: NOTAS FISCAIS (NFS-e) */}
          {activeTab === 'invoices' && (
            <InvoiceManager />
          )}

          {/* TAB 3: MATRICULAS (ENROLLMENTS) */}
          {activeTab === 'enrollments' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Matrículas e Aproveitamento</h2>
                <button 
                  onClick={handleExportEnrollments}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 hover:text-amber-500 text-white font-bold text-xs rounded shadow flex items-center gap-1.5 select-none cursor-pointer uppercase tracking-wider"
                >
                  <Download className="w-4 h-4" /> Exportar Planilha
                </button>
              </div>

              {/* Enrollments table row */}
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-205 dark:border-slate-800 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-450 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Estudante</th>
                      <th className="p-3">Código Curso</th>
                      <th className="p-3">Progresso</th>
                      <th className="p-3">Avaliação</th>
                      <th className="p-3 text-right">Data Início</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {enrollments.map((enr) => (
                      <tr key={enr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                        <td className="p-3 space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-slate-150">{enr.userName}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">{enr.userEmail}</p>
                        </td>
                        <td className="p-3 font-semibold text-slate-650 dark:text-slate-400">{enr.courseCode}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{enr.progress}%</span>
                            <div className="w-16 bg-slate-150 dark:bg-slate-800 rounded-full h-1">
                              <div className="bg-amber-500 h-1 rounded-full" style={{ width: `${enr.progress}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          {enr.examScore !== null ? (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-bold">
                              {enr.examScore}% Aprovado
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Em andamento</span>
                          )}
                        </td>
                        <td className="p-3 text-right text-slate-450 font-bold font-mono">{enr.startDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 4: SALES JOURNAL */}
          {activeTab === 'sales' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Fluxo de Caixa Asaas</h2>
                <button 
                  onClick={handleExportSales}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 hover:text-amber-500 text-white font-bold text-xs rounded shadow flex items-center gap-1.5 select-none cursor-pointer uppercase tracking-wider"
                >
                  <Download className="w-4 h-4" /> Exportar Vendas
                </button>
              </div>

              {/* Transactions table row */}
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-205 dark:border-slate-800 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-450 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Estudante</th>
                      <th className="p-3">Treinamentos</th>
                      <th className="p-3 text-right">Desconto</th>
                      <th className="p-3 text-right">Total Pago</th>
                      <th className="p-3 text-center">Intermediário</th>
                      <th className="p-3 text-right">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-slate-150">{tx.userName}</td>
                        <td className="p-3 max-w-[200px] truncate font-medium text-slate-700 dark:text-slate-350">{tx.courseName}</td>
                        <td className="p-3 text-right text-rose-500 font-semibold">- R$ {tx.discount.toFixed(2)}</td>
                        <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                          R$ {tx.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                            tx.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : tx.status === 'open' 
                                ? 'bg-amber-500/10 text-amber-500' 
                                : 'bg-red-500/10 text-red-500'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-3 text-right text-slate-450 font-bold font-mono">{tx.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 5: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Profissionais Cadastrados</h2>
                
                {/* Actions Dropdown triggers */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setNewUserOpen(true)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Novo Usuário
                  </button>
                  <button 
                    onClick={() => setCsvUploadOpen(true)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-805 hover:text-amber-400 text-white font-bold text-xs uppercase rounded flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" /> Importar CSV
                  </button>
                  <button 
                    onClick={() => setBatchEnrollOpen(true)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-805 hover:text-amber-400 text-white font-bold text-xs uppercase rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders className="w-4 h-4" /> Matricular Lote
                  </button>
                </div>
              </div>

              {/* Users Ledger Table listing */}
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-205 dark:border-slate-800 overflow-x-auto shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-450 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Nome</th>
                      <th className="p-3">E-mail</th>
                      <th className="p-3">CPF</th>
                      <th className="p-3">Função</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Data Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                        <td className="p-3 whitespace-nowrap font-bold text-slate-900 dark:text-slate-150">{u.name}</td>
                        <td className="p-3 text-slate-500 select-all">{u.email}</td>
                        <td className="p-3 font-mono">{u.cpf}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {/* Active / Inactive switch toggler */}
                          <button
                            onClick={() => onToggleUserActive(u.id, !u.isActive)}
                            className="p-1 focus:outline-none"
                            title="Alternar Inativo / Ativo"
                          >
                            {u.isActive ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-red-500 mx-auto" />
                            )}
                          </button>
                        </td>
                        <td className="p-3 text-right text-slate-400 font-bold font-mono">{u.registeredAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 6: DISCOUNT COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight border-b border-slate-100 dark:border-slate-800 pb-2">
                Cadastrar Código Promocional
              </h2>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newCouponCode) return;
                onCreateCoupon({
                  code: newCouponCode.toUpperCase(),
                  description: newCouponDesc,
                  value: newCouponVal,
                  type: newCouponType === 'fixed' ? 'FIXED' : 'PERCENTAGE',
                  associatedProducts: courses.map(c => c.id), // inicialmente todos os cursos
                });
                setNewCouponCode('');
                setNewCouponDesc('');
              }} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Chave Código *</label>
                  <input 
                    type="text" 
                    placeholder="EX: LOTO30"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    required
                    className="w-full text-xs p-2 rounded bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Valor Desconto *</label>
                  <input 
                    type="number" 
                    value={newCouponVal}
                    onChange={(e) => setNewCouponVal(Number(e.target.value))}
                    required
                    className="w-full text-xs p-2 rounded bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full text-xs p-2 rounded bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="percentage">Percentual (%)</option>
                    <option value="fixed">Fixo (R$)</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase rounded cursor-pointer select-none"
                >
                  Criar Cupom
                </button>
              </form>

              {/* Coupons list */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase text-slate-400">Cupons Ativos no Asaas</h3>
                {coupons.map(cp => (
                  <div key={cp.id} className={`flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-955 rounded border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 ${cp.isActive ? '' : 'opacity-50'}`}>
                    <div>
                      <strong className="text-amber-505 dark:text-amber-400 font-extrabold pr-2">{cp.code}</strong>
                      <span className="text-slate-450">({cp.type === 'percentage' ? `${cp.value}%` : `R$ ${cp.value}`} de desconto)</span>
                      <p className="text-[10px] text-slate-400 mt-1">{cp.description || 'Disponível em todos os treinamentos do portal.'}</p>
                    </div>
                    <button
                      onClick={() => onToggleCoupon(cp.id, !cp.isActive)}
                      title={cp.isActive ? 'Desativar cupom' : 'Ativar cupom'}
                      className="p-1 focus:outline-none"
                    >
                      {cp.isActive
                        ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                        : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 7: GENERAL LAYOUT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-lg border border-slate-250 dark:border-slate-800 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight border-b border-slate-100 dark:border-slate-800 pb-2">
                Configurações da Plataforma
              </h2>

              <div className="space-y-6">
                
                {/* Section A: Layout Configs */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">Canal e Visual de Cores</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Título da Entidade</label>
                      <input 
                        type="text" 
                        value={layoutCompany}
                        onChange={(e) => setLayoutCompany(e.target.value)}
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Central Telefone Suporte</label>
                      <input 
                        type="text" 
                        value={layoutPhone}
                        onChange={(e) => setLayoutPhone(e.target.value)}
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase block">Cor Primária (Theme)</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={cfgPrimary} onChange={(e) => setCfgPrimary(e.target.value)} className="w-8 h-8 rounded border border-slate-3D" />
                        <span className="font-mono text-slate-650 dark:text-slate-350">{cfgPrimary}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase block">Cor Secundária (Destaques)</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={cfgSecondary} onChange={(e) => setCfgSecondary(e.target.value)} className="w-8 h-8 rounded border border-slate-3D" />
                        <span className="font-mono text-slate-650 dark:text-slate-350">{cfgSecondary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Redes sociais (exibidas no rodapé) */}
                  <div className="space-y-3 border-t border-slate-100 dark:border-slate-850 pt-4">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Redes Sociais (rodapé)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Instagram (URL)</label>
                        <input
                          type="text"
                          value={cfgInstagram}
                          onChange={(e) => setCfgInstagram(e.target.value)}
                          placeholder="https://instagram.com/sua_pagina"
                          className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">YouTube (URL)</label>
                        <input
                          type="text"
                          value={cfgYoutube}
                          onChange={(e) => setCfgYoutube(e.target.value)}
                          placeholder="https://youtube.com/@seu_canal"
                          className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">LinkedIn (URL)</label>
                        <input
                          type="text"
                          value={cfgLinkedin}
                          onChange={(e) => setCfgLinkedin(e.target.value)}
                          placeholder="https://linkedin.com/company/sua_empresa"
                          className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400">Deixe em branco para ocultar o ícone no rodapé. (Facebook e Twitter/X removidos.)</p>
                  </div>
                </div>

                {/* Section B: Billing Address Coordinates */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">Coordenadas Institucionais (Rodapé e Certificados)</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">CNPJ Corporativo</label>
                      <input 
                        type="text" 
                        value={cfgCnpj}
                        onChange={(e) => setCfgCnpj(e.target.value)}
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">CEP Postal</label>
                      <input 
                        type="text" 
                        value={cfgCep}
                        onChange={(e) => setCfgCep(e.target.value)}
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Logradouro / Avenida</label>
                      <input 
                        type="text" 
                        value={cfgStreet}
                        onChange={(e) => setCfgStreet(e.target.value)}
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Número</label>
                      <input 
                        type="text" 
                        value={cfgNum}
                        onChange={(e) => setCfgNum(e.target.value)}
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Cidade de Homologação</label>
                      <input 
                        type="text" 
                        value={cfgCity}
                        onChange={(e) => setCfgCity(e.target.value)}
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Estado da Federação (UF)</label>
                      <input 
                        type="text" 
                        value={cfgState}
                        onChange={(e) => setCfgState(e.target.value)}
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                </div>

                {/* Section C: Digital Certificate ICP-Brasil */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                    Certificado Digital ICP-Brasil (Assinatura dos Certificados)
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Estes dados identificam o titular que assina digitalmente os certificados emitidos. Eles aparecem
                    publicamente na validação do certificado (após a conclusão do aluno).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Titular do Certificado Digital</label>
                      <input
                        type="text"
                        value={cfgCertHolder}
                        onChange={(e) => setCfgCertHolder(e.target.value)}
                        placeholder="Ex: Adriano Aparecido Ribas Ricardo"
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Arquivo / Identificador (.pfx / A1)</label>
                      <input
                        type="text"
                        value={cfgCertName}
                        onChange={(e) => setCfgCertName(e.target.value)}
                        placeholder="ADRIANO_APARECIDO_RIBAS_RICARDO_CERT.pfx"
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Autoridade Certificadora (Emissor)</label>
                      <input
                        type="text"
                        value={cfgCertIssuer}
                        onChange={(e) => setCfgCertIssuer(e.target.value)}
                        placeholder="Ex: AC SOLUTI Múltipla v5 — ICP-Brasil"
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Senha do Certificado (.pfx)</label>
                      <input
                        type="password"
                        value={cfgCertPassword}
                        onChange={(e) => setCfgCertPassword(e.target.value)}
                        placeholder="••••••••••"
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Número de Série</label>
                      <input
                        type="text"
                        value={cfgCertSerial}
                        onChange={(e) => setCfgCertSerial(e.target.value)}
                        placeholder="Ex: 00:A1:B2:C3:D4"
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Validade (Válido até)</label>
                      <input
                        type="text"
                        value={cfgCertValid}
                        onChange={(e) => setCfgCertValid(e.target.value)}
                        placeholder="Ex: 31/12/2027"
                        className="w-full text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSaveSettings}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase rounded shadow cursor-pointer select-none"
                >
                  Atualizar Configurações Gerais
                </button>

              </div>
            </div>
          )}

          {/* TAB 8: COMMENTS ADMINISTRATION */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight border-b border-slate-100 dark:border-slate-800 pb-2">
                Moderar Comentários & Dúvidas Técnicas
              </h2>

              <div className="space-y-4">
                {comments.map(com => (
                  <div key={com.id} className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-150 pr-2">{com.userName}</strong>
                        <span>concluiu dúvidas sobre: {com.courseName}</span>
                      </div>
                      <span>{com.date}</span>
                    </div>
                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">{com.text}</p>
                    
                    {com.reply ? (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 border-l-4 border-amber-500 rounded text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-extrabold text-amber-500 text-[10px] block mb-1">SUA RESPOSTA ADMINISTRATIVA:</span>
                        <p>{com.reply}</p>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setReplyCommentId(com.id);
                            setReplyText('');
                          }}
                          className="px-3 py-1.5 bg-slate-905 hover:bg-amber-500 hover:text-slate-950 text-white rounded text-xs font-semibold select-none cursor-pointer"
                        >
                          Responder dúvida
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Reply Comment absolute Drawer Overlay */}
              {replyCommentId && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 flex items-center justify-center backdrop-blur-xs">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-lg max-w-md w-full space-y-4 shadow-2xl border border-slate-2D">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase">Escrever resposta oficial do Instrutor</h3>
                    <textarea 
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Redija sua resposta explicativa normativa..."
                      className="w-full text-xs p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    />
                    <div className="flex gap-2 justify-end text-xs">
                      <button onClick={handleSaveReply} className="px-4 py-2 bg-emerald-500 font-bold text-white rounded hover:bg-emerald-450">Publicar</button>
                      <button onClick={() => setReplyCommentId(null)} className="px-3 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300">Fechar</button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 9: CONTACT INBOUND INBOX */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight border-b border-slate-100 dark:border-slate-800 pb-2">
                Contatos Institucionais Recebidos
              </h2>

              <div className="space-y-4">
                {contactMessages.map(msg => (
                  <div key={msg.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg space-y-3 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div>
                        <strong className="text-slate-800 dark:text-white pr-2">{msg.name}</strong>
                        <span>({msg.email})</span>
                      </div>
                      <span>{msg.date}</span>
                    </div>
                    
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded text-xs space-y-2">
                      <span className="font-extrabold text-slate-400 block text-[10px] uppercase">Assunto: {msg.subject}</span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">"{msg.message}"</p>
                    </div>

                    <div className="text-xs text-slate-450 font-bold flex items-center gap-1">
                      <span>WhatsApp de retorno:</span>
                      <strong className="text-amber-500 hover:underline cursor-pointer" onClick={() => window.open(`https://api.whatsapp.com/send?phone=${msg.phone.replace(/[^0-9]/g, '')}`, '_blank')}>
                        {msg.phone}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 10: USER EXAMS SUBMISSIONS */}
          {activeTab === 'exams' && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight border-b border-slate-100 dark:border-slate-800 pb-2">
                Auditoria de Provas Regulamentadas
              </h2>

              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-205 dark:border-slate-800 overflow-x-auto shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-450 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Aluno</th>
                      <th className="p-3">Norma</th>
                      <th className="p-3 text-center">Score Obtido</th>
                      <th className="p-3 text-center">Habilitação</th>
                      <th className="p-3 text-right">Data Exame</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentExams.map(ex => (
                      <tr 
                        key={ex.id} 
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 cursor-pointer"
                        title="Clique para inspecionar respostas"
                        onClick={() => setAuditingExam(ex)}
                      >
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{ex.userName}</td>
                        <td className="p-3 font-semibold text-slate-650 dark:text-slate-350">{ex.courseCode} - {ex.courseName}</td>
                        <td className="p-3 text-center font-bold text-sm text-slate-900 dark:text-slate-150">{ex.score}%</td>
                        <td className="p-3 text-center">
                          {ex.passed ? (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-extrabold rounded">Habilitado</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-500/10 text-red-500 font-semibold rounded">Reprovado</span>
                          )}
                        </td>
                        <td className="p-3 text-right text-slate-400 font-bold font-mono">{ex.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Exam auditor detailed popup sheet — acompanhamento do aluno */}
              {auditingExam && (() => {
                const enr = enrollments.find((e) => e.userId === auditingExam.userId && e.courseId === auditingExam.courseId);
                const course = courses.find((c) => c.id === auditingExam.courseId);
                const questions = getExamQuestions(auditingExam.courseId);
                const totalQuestions = questions.length;
                const correctCount = questions.reduce((acc, q, i) => acc + (auditingExam.answers[i] === q.correctIndex ? 1 : 0), 0);
                const totalModules = course?.modules.length ?? 0;
                const progress = enr?.progress ?? (auditingExam.passed ? 100 : 0);
                const modulesDone = Math.round((progress / 100) * totalModules);

                return (
                <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 sm:p-6 flex items-center justify-center backdrop-blur-xs">
                  <div className="bg-white p-0 rounded-lg max-w-2xl w-full shadow-2xl relative max-h-[88vh] overflow-y-auto">
                    {/* Cabeçalho */}
                    <div className="flex items-center justify-between px-6 py-3 bg-[#34607d] text-white sticky top-0 z-10">
                      <h3 className="font-extrabold uppercase text-sm">Acompanhamento do Aluno</h3>
                      <button onClick={() => setAuditingExam(null)} className="p-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold">X</button>
                    </div>

                    <div className="p-6 space-y-5">
                      {/* Dados do aluno */}
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wide border-b border-slate-100 pb-1 mb-2">Dados do Aluno</h4>
                        <div className="flex items-center justify-between text-xs">
                          <p className="font-bold text-slate-900">{auditingExam.userName}</p>
                          <p className="text-slate-500">{enr?.userEmail}</p>
                        </div>
                      </div>

                      {/* Dados da matrícula */}
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wide border-b border-slate-100 pb-1 mb-2">Dados da Matrícula</h4>
                        <p className="font-bold text-slate-900 text-sm">{auditingExam.courseCode} — {auditingExam.courseName}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[11px]">
                          <div><span className="text-slate-400 block">Início</span><strong className="text-slate-800">{enr?.startDate ?? '—'}</strong></div>
                          <div><span className="text-slate-400 block">Última prova</span><strong className="text-slate-800">{auditingExam.date}</strong></div>
                          <div><span className="text-slate-400 block">Status</span><strong className={auditingExam.passed ? 'text-emerald-600' : 'text-amber-600'}>{auditingExam.passed ? 'Concluído' : 'Em andamento'}</strong></div>
                          <div><span className="text-slate-400 block">Aprovação</span><strong className={auditingExam.passed ? 'text-emerald-600' : 'text-red-600'}>{auditingExam.passed ? 'Aprovada' : 'Reprovada'}</strong></div>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5"><span>Tempo decorrido</span><span>{progress}%</span></div>
                          <div className="w-full bg-slate-150 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }} /></div>
                        </div>
                      </div>

                      {/* Frequência e desempenho */}
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wide border-b border-slate-100 pb-1 mb-3">Frequência e Desempenho</h4>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="p-3 rounded-lg border border-slate-150 bg-slate-50">
                            <div className="text-2xl font-black text-emerald-600">{totalModules ? Math.round((modulesDone / totalModules) * 100) : 0}%</div>
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">Frequência</span>
                            <p className="text-[10px] text-slate-400 mt-1">Completou {modulesDone} de {totalModules} aulas</p>
                          </div>
                          <div className="p-3 rounded-lg border border-slate-150 bg-slate-50">
                            <div className="text-2xl font-black text-emerald-600">{auditingExam.score}%</div>
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">Desempenho</span>
                            <p className="text-[10px] text-slate-400 mt-1">Acertou {correctCount} de {totalQuestions} questões</p>
                          </div>
                        </div>
                      </div>

                      {/* Detalhes por módulo */}
                      {totalModules > 0 && (
                        <div>
                          <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wide border-b border-slate-100 pb-1 mb-2">Detalhes de Acessos por Módulo</h4>
                          <div className="space-y-1">
                            {course!.modules.map((mod, mi) => {
                              const done = mi < modulesDone;
                              return (
                                <div key={mi} className="flex items-center gap-2 text-[11px] p-1.5 rounded bg-slate-50 border border-slate-100">
                                  <span className={`w-3 h-3 rounded-full shrink-0 ${done ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                  <span className="font-semibold text-slate-700">Módulo {mi + 1}</span>
                                  <span className="text-slate-500 truncate">— {mod}</span>
                                  <span className={`ml-auto text-[9px] font-bold uppercase ${done ? 'text-emerald-600' : 'text-slate-400'}`}>{done ? 'Completa' : 'Não acessada'}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Prova final — respostas */}
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wide border-b border-slate-100 pb-1 mb-3">Prova Final — Respostas ({correctCount}/{totalQuestions})</h4>
                        <div className="space-y-4">
                          {questions.map((q, qIndex) => {
                            const studentChoiceIdx = auditingExam.answers[qIndex];
                            return (
                              <div key={qIndex} className="p-3 bg-slate-50 border rounded text-xs space-y-2">
                                <p className="font-bold text-slate-800">{qIndex + 1}. {q.question}</p>
                                <div className="space-y-1 ml-2">
                                  {q.options.map((opt, oIndex) => {
                                    const isCorrect = oIndex === q.correctIndex;
                                    const isStudentChoice = oIndex === studentChoiceIdx;
                                    return (
                                      <div
                                        key={oIndex}
                                        className={`p-1.5 rounded flex items-center gap-1.5 ${
                                          isCorrect
                                            ? 'bg-emerald-500/10 text-emerald-800 font-bold'
                                            : isStudentChoice
                                              ? 'bg-red-500/10 text-red-800 font-semibold'
                                              : 'text-slate-650'
                                        }`}
                                      >
                                        <span>{opt}</span>
                                        {isCorrect && <span className="text-[10px] text-emerald-600">(Correta)</span>}
                                        {isStudentChoice && !isCorrect && <span className="text-[10px] text-red-500">(Resposta do aluno)</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })()}

            </div>
          )}

          {/* TAB 11: PARTNERS MANAGER */}
          {activeTab === 'partners' && (
            <ContentManager
              title="Gestão de Parceiros"
              description="Empresas e instituições parceiras exibidas na página inicial."
              contentKey="partners"
              fields={[
                { name: 'name', label: 'Nome do parceiro', placeholder: 'Ex: Construtora Alfa' },
                { name: 'url', label: 'Site (URL)', placeholder: 'https://...' },
                { name: 'logoUrl', label: 'Logo do parceiro', type: 'image' },
                { name: 'description', label: 'Descrição', type: 'textarea', placeholder: 'Breve descrição da parceria' },
              ]}
            />
          )}

          {/* TAB 12: PAGES MANAGER */}
          {activeTab === 'pages' && (
            <ContentManager
              title="Gestão de Páginas"
              description="Páginas institucionais de conteúdo livre (Sobre, Termos, FAQ etc.)."
              contentKey="pages"
              fields={[
                { name: 'title', label: 'Título da página', placeholder: 'Ex: Sobre Nós' },
                { name: 'slug', label: 'Endereço (slug)', placeholder: 'sobre-nos' },
                { name: 'content', label: 'Conteúdo', type: 'textarea', placeholder: 'Texto da página...' },
              ]}
            />
          )}

          {/* TAB 13: NEWS MANAGER */}
          {activeTab === 'news' && (
            <ContentManager
              title="Gestão de Notícias"
              description="Notícias e artigos exibidos na página inicial."
              contentKey="news"
              fields={[
                { name: 'tag', label: 'Categoria', placeholder: 'Ex: Segurança' },
                { name: 'title', label: 'Título', placeholder: 'Título da notícia' },
                { name: 'description', label: 'Resumo', type: 'textarea', placeholder: 'Resumo da notícia...' },
                { name: 'date', label: 'Data', placeholder: '19/06/2026' },
                { name: 'readTime', label: 'Tempo de leitura', placeholder: '3 min' },
              ]}
            />
          )}

          {/* TAB 14: PRODUCTS MANAGER */}
          {activeTab === 'products' && (
            <ContentManager
              title="Gestão de Produtos"
              description="Produtos complementares (EPIs, apostilas, kits) ofertados na loja."
              contentKey="products"
              fields={[
                { name: 'name', label: 'Nome do produto', placeholder: 'Ex: Capacete classe B' },
                { name: 'price', label: 'Preço (R$)', placeholder: '49,90' },
                { name: 'description', label: 'Descrição', type: 'textarea', placeholder: 'Descrição do produto...' },
                { name: 'imageUrl', label: 'Imagem (URL)', placeholder: 'https://...' },
              ]}
            />
          )}

          {/* TAB 15: EMAILS / TEMPLATES MANAGER */}
          {activeTab === 'emails' && (
            <ContentManager
              title="E-mails Transacionais"
              description="Modelos de e-mail enviados aos alunos (boas-vindas, certificado, cobrança)."
              contentKey="emails"
              fields={[
                { name: 'name', label: 'Nome do modelo', placeholder: 'Ex: Boas-vindas' },
                { name: 'subject', label: 'Assunto', placeholder: 'Bem-vindo ao FalaInstrutor!' },
                { name: 'body', label: 'Corpo do e-mail', type: 'textarea', placeholder: 'Olá {{nome}}, ...' },
              ]}
            />
          )}

          {/* TAB 16: CERTIFICATES ISSUED (read-only) */}
          {activeTab === 'certificates' && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight border-b border-slate-100 dark:border-slate-800 pb-2">
                Certificados Emitidos
              </h2>
              <p className="text-xs text-slate-400">
                Lista de certificados gerados após aprovação na avaliação. O código é validável publicamente em
                <span className="font-mono text-amber-500"> /validar</span>.
              </p>

              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-205 dark:border-slate-800 overflow-x-auto shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-450 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Aluno</th>
                      <th className="p-3">Treinamento</th>
                      <th className="p-3 text-center">Nota</th>
                      <th className="p-3">Código de Validação</th>
                      <th className="p-3 text-right">Emissão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {enrollments.filter(e => e.passed && e.certificateCode).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">Nenhum certificado emitido ainda.</td>
                      </tr>
                    ) : (
                      enrollments.filter(e => e.passed && e.certificateCode).map(enr => (
                        <tr key={enr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                          <td className="p-3 font-bold text-slate-900 dark:text-slate-150">{enr.userName}</td>
                          <td className="p-3 font-semibold text-slate-650 dark:text-slate-350">{enr.courseCode} - {enr.courseName}</td>
                          <td className="p-3 text-center font-bold">{enr.examScore !== null ? `${enr.examScore}%` : '—'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded font-mono font-bold select-all">{enr.certificateCode}</span>
                          </td>
                          <td className="p-3 text-right text-slate-450 font-bold font-mono">{enr.startDate}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* CORE ADMIN POPUPS AND DIALOGS MODALS */}

      {/* MODAL GROUP A: COURSE INSTRUTORES & CONTÉUDO DO CURSO */}
      {managingCourse && courseModalType === 'instructors' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 flex items-center justify-center backdrop-blur-xs">
          <div className="bg-white text-slate-900 p-6 rounded-lg max-w-md w-full space-y-4 shadow-2xl border border-slate-3D animate-scale-up">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm uppercase tracking-tight">Docentes do Curso: {managingCourse.code}</h3>
              <button onClick={() => setManagingCourse(null)} className="text-slate-400 hover:text-red-500 font-black">X</button>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-400 block uppercase">Instrutores Cadastrados</span>
              {managingCourse.instructors.map(i => (
                <div key={i.id} className="p-2.5 bg-slate-50 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">{i.name}</p>
                    <p className="text-[10px] text-amber-600 uppercase font-semibold">{i.formation}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form list inline */}
            <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
              <span className="font-extrabold text-slate-400 block uppercase">Associar Novo Instrutor</span>
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Nome Completo do Engenheiro"
                  value={newInstructorName}
                  onChange={(e) => setNewInstructorName(e.target.value)}
                  className="w-full p-2 rounded bg-slate-50 border text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Formação (ex: Técnico de Segurança do Trabalho)"
                  value={newInstructorFormation}
                  onChange={(e) => setNewInstructorFormation(e.target.value)}
                  className="w-full p-2 rounded bg-slate-50 border text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Registro MTE (ex: 0124684/SP)"
                  value={newInstructorMte}
                  onChange={(e) => setNewInstructorMte(e.target.value)}
                  className="w-full p-2 rounded bg-slate-50 border text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Registro CREA (ex: SP-1234567/D)"
                  value={newInstructorCrea}
                  onChange={(e) => setNewInstructorCrea(e.target.value)}
                  className="w-full p-2 rounded bg-slate-50 border text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="URL da imagem da assinatura (opcional)"
                  value={newInstructorSignatureUrl}
                  onChange={(e) => setNewInstructorSignatureUrl(e.target.value)}
                  className="w-full p-2 rounded bg-slate-50 border text-xs focus:outline-none"
                />
                <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 cursor-pointer select-none p-1">
                  <input
                    type="checkbox"
                    checked={newInstructorIcp}
                    onChange={(e) => setNewInstructorIcp(e.target.checked)}
                    className="accent-emerald-600"
                  />
                  Assinar digitalmente o certificado com ICP-Brasil (MP 2.200-2/2001)
                </label>
                <button
                  onClick={handleAddInstructor}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase rounded cursor-pointer select-none"
                >
                  Adicionar Instrutor Responsável
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {managingCourse && courseModalType === 'modules' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 flex items-center justify-center backdrop-blur-xs">
          <div className="bg-white text-slate-900 p-6 rounded-lg max-w-md w-full space-y-4 shadow-2xl border border-slate-3D">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm uppercase tracking-tight">Atividades Práticas Registradas</h3>
              <button onClick={() => setManagingCourse(null)} className="text-slate-400 hover:text-red-500 font-black">X</button>
            </div>

            <div className="space-y-2 text-xs">
              {managingCourse.manualActivities && managingCourse.manualActivities.length > 0 ? (
                managingCourse.manualActivities.map((act, ax) => (
                  <div key={ax} className="p-2.5 bg-slate-50 border rounded flex justify-between items-center font-semibold text-slate-750">
                    <span>{act}</span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 text-center py-2">Nenhuma atividade prática manual registrada ainda.</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-150 space-y-2 text-xs">
              <span className="font-bold text-slate-400 block uppercase">Adicionar Módulo de Habilidade</span>
              <input 
                type="text" 
                placeholder="Ex Atividade: Prática com talabarte estático"
                value={newModuleText}
                onChange={(e) => setNewModuleText(e.target.value)}
                className="w-full p-2 rounded bg-slate-50 border text-xs focus:outline-none"
              />
              <button 
                onClick={handleAddModule}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase rounded cursor-pointer select-none"
              >
                Incluir Novo Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VÍDEO AULA & MATERIAIS DE APOIO */}
      {managingCourse && courseModalType === 'content' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 flex items-center justify-center backdrop-blur-xs">
          <div className="bg-white text-slate-900 p-6 rounded-lg max-w-lg w-full space-y-4 shadow-2xl border border-slate-3D max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm uppercase tracking-tight">Vídeo & Materiais — {managingCourse.code}</h3>
              <button onClick={() => { setManagingCourse(null); setCourseModalType(null); }} className="text-slate-400 hover:text-red-500 font-black">X</button>
            </div>

            {/* Vídeo por módulo */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Video className="w-3.5 h-3.5" /> Vídeo de cada módulo (visível ao aluno)</label>
              <div className="space-y-2">
                {managingCourse.modules.map((mod, mi) => (
                  <div key={mi} className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-blue-600 text-white text-[8px] font-black shrink-0">{mi + 1}</span>
                      <span className="truncate">{mod}</span>
                    </span>
                    <input
                      type="text"
                      placeholder="Link do vídeo deste módulo (YouTube/Vimeo/MP4)"
                      value={contentModuleVideos[mi] ?? ''}
                      onChange={(e) => {
                        const next = [...contentModuleVideos];
                        next[mi] = e.target.value;
                        setContentModuleVideos(next);
                      }}
                      className="w-full p-2 rounded bg-slate-50 border text-xs focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">Cada módulo pode ter um vídeo diferente. Deixe em branco para usar o vídeo padrão abaixo.</p>
            </div>

            {/* Vídeo padrão (fallback) */}
            <div className="space-y-1.5 border-t border-slate-100 pt-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Video className="w-3.5 h-3.5" /> Vídeo padrão (opcional)</label>
              <input
                type="text"
                placeholder="Usado nos módulos sem vídeo próprio"
                value={contentVideoUrl}
                onChange={(e) => setContentVideoUrl(e.target.value)}
                className="w-full p-2.5 rounded bg-slate-50 border text-xs focus:outline-none"
              />
            </div>

            {/* Materiais de apoio */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Documentos de apoio (visíveis ao aluno)</span>

              {contentDocs.length > 0 ? (
                <div className="space-y-1.5">
                  {contentDocs.map((doc, di) => (
                    <div key={di} className="flex items-center justify-between gap-2 p-2 bg-slate-50 border rounded text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 truncate flex items-center gap-1"><Link2 className="w-3 h-3 shrink-0" /> {doc.url}</p>
                      </div>
                      <button onClick={() => setContentDocs(contentDocs.filter((_, i) => i !== di))} className="p-1 text-slate-400 hover:text-red-500 shrink-0" title="Remover">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 text-center py-1">Nenhum material de apoio adicionado ainda.</p>
              )}

              <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded border">
                <input
                  type="text"
                  placeholder="Nome do documento (ex: Apostila NR-35.pdf)"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full p-2 rounded bg-white border text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Link do documento (URL — Drive, site, PDF...)"
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  className="w-full p-2 rounded bg-white border text-xs focus:outline-none"
                />
                <button onClick={handleAddDoc} className="inline-flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase rounded cursor-pointer select-none">
                  <Plus className="w-4 h-4" /> Adicionar documento
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveCourseContent}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded cursor-pointer select-none"
            >
              Salvar Conteúdo do Curso
            </button>
          </div>
        </div>
      )}

      {/* MODAL GROUP B: MANUAL CREATION DIALOG */}
      {newUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 flex items-center justify-center backdrop-blur-xs">
          <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-lg max-w-md w-full space-y-4 shadow-2xl border border-slate-3D">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold uppercase text-sm">Registrar Profissional</h3>
              <button onClick={() => setNewUserOpen(false)} className="text-slate-450 hover:text-red-550 font-black">X</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-semibold text-slate-550">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase block">Nome Completo</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full p-2 rounded bg-slate-50 border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase block">CPF do profissional</label>
                  <input 
                    type="text" 
                    value={newCpf}
                    onChange={(e) => setNewCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    required
                    className="w-full p-2 rounded bg-slate-50 border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase block">Data Nascimento</label>
                  <input 
                    type="date" 
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="w-full p-2 rounded bg-slate-50 border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase block">E-mail (Login institucional)</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="usuario@empresa.com.br"
                  required
                  className="w-full p-2 rounded bg-slate-50 border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase block">Função / Perfil</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full p-2 rounded bg-slate-50 border text-xs focus:outline-none"
                >
                  <option value="student">Aluno de Treinamento</option>
                  <option value="admin">Administrador Entidade</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase rounded cursor-pointer select-none"
              >
                Cadastrar Colaborador
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GROUP C: BATCH REGISTRY FROM EXCEL CSV */}
      {csvUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 flex items-center justify-center backdrop-blur-xs">
          <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-lg max-w-md w-full space-y-4 shadow-2xl border border-slate-2D">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold uppercase text-sm">Matrícula em Lote (.CSV)</h3>
              <button onClick={() => setCsvUploadOpen(false)} className="text-slate-450 hover:text-red-550 font-black">X</button>
            </div>

            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded text-xs text-slate-700 leading-relaxed font-semibold">
              <span className="font-black text-amber-500 block mb-1 uppercase tracking-wider">Como preparar o arquivo?</span>
              Baixe nosso arquivo de modelo, preencha as colunas do Excel sem alterar as estruturas iniciais do cabeçalho e realize o envio seguro em lote.
            </div>

            <div className="space-y-2 text-xs">
              <button 
                onClick={handleDownloadCsvTemplate}
                className="w-full py-2.0 border border-slate-200 hover:border-amber-500 text-slate-705 dark:text-slate-800 hover:text-amber-500 rounded font-semibold text-center select-none cursor-pointer flex items-center justify-center gap-1"
              >
                <Download className="w-4 h-4" /> Baixar Modelo Exemplo (.CSV)
              </button>

              <div className="border-2 border-dashed border-slate-205 rounded-lg p-6 text-center space-y-2 bg-slate-50/50 hover:bg-indigo-50/10 transition">
                <FileText className="w-10 h-10 text-slate-350 mx-auto" />
                <span className="font-extrabold text-[11px] text-slate-500 block uppercase">Arrastar e Soltar Planilha Excel (.CSV)</span>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={handleMockCsvUpload}
                  className="text-xs max-w-[180px] mx-auto block cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GROUP D: BATCH ENROLLMENT LMS SELECTION */}
      {batchEnrollOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 flex items-center justify-center backdrop-blur-xs">
          <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-lg max-w-lg w-full space-y-4 shadow-2xl border border-slate-2D">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold uppercase text-sm">Vincular Usuários a um Treinamento</h3>
              <button onClick={() => setBatchEnrollOpen(false)} className="text-slate-450 hover:text-red-550 font-black">X</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">1. Selecione o Treinamento Alvo</label>
                <select
                  value={batchEnrollCourseId}
                  onChange={(e) => setBatchEnrollCourseId(e.target.value)}
                  className="w-full p-2.5 rounded bg-slate-50 border text-xs focus:outline-none text-slate-900"
                >
                  <option value="">-- Escolha um treinamento regulamentar --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">2. Marque os Alunos (Selecione em lote)</label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded p-2 bg-slate-50/50 space-y-1.5">
                  {users.filter(u => u.role === 'student').map(u => (
                    <label key={u.id} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={selectedEnrollUsers.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEnrollUsers([...selectedEnrollUsers, u.id]);
                          } else {
                            setSelectedEnrollUsers(selectedEnrollUsers.filter(id => id !== u.id));
                          }
                        }}
                        className="accent-amber-500"
                      />
                      <span>{u.name} ({u.email})</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleBatchEnroll}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase rounded shadow cursor-pointer select-none text-[11px] tracking-wide"
              >
                Ativar Matrícula em Lote
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
