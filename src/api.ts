/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Cliente HTTP do front-end para a API do FalaInstrutor.
 * Centraliza o token JWT (em localStorage) e o tratamento de erros.
 */

import {
  User, Course, Enrollment, SalesTransaction, Coupon, Comment,
  ContactMessage, StudentExamSubmission, LayoutConfig, PaymentConfig, Plan, Partner, JobRole,
} from './types';
import { apiUrl } from './config';

const TOKEN_KEY = 'fil_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string): void => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

// Formato do usuário retornado pela API (Prisma).
interface ApiUser {
  id: string;
  name: string;
  dob: string | null;
  cpf: string;
  email: string;
  role: 'ADMIN' | 'STUDENT' | 'COMPANY' | 'INSTRUCTOR';
  isActive: boolean;
  avatar: string | null;
  registeredAt: string;
}

// Converte o usuário da API para o formato usado no front-end.
export function mapApiUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.name,
    dob: u.dob ?? '',
    cpf: u.cpf,
    email: u.email,
    role: u.role === 'ADMIN' ? 'admin' : u.role === 'COMPANY' ? 'company' : u.role === 'INSTRUCTOR' ? 'instructor' : 'student',
    isActive: u.isActive,
    avatar: u.avatar ?? undefined,
    registeredAt: (u.registeredAt || '').split('T')[0],
  };
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(apiUrl(path), { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && data.error) || 'Não foi possível concluir a operação.');
  }
  return data as T;
}

// Formato do curso retornado pela API (Prisma).
interface ApiCourse {
  id: string;
  code: string;
  name: string;
  description: string;
  duration: number;
  modality: string | null;
  validityMonths?: number | null;
  price: number;
  coverImage: string | null;
  isActive: boolean;
  isFeatured: boolean;
  modules: string[];
  manualActivities: string[];
  videoUrl: string | null;
  moduleVideos: string[] | null;
  documents: { name: string; url: string }[] | null;
  examQuestions: { question: string; options: string[]; correctIndex: number }[] | null;
  slides: { title: string; bullets: string[] }[] | null;
  esocialEnabled?: boolean;
  esocialCode?: string | null;
  instructors: {
    id: string;
    name: string;
    formation: string;
    mte: string | null;
    cpf?: string | null;
    codCBO?: string | null;
    crea: string | null;
    crq: string | null;
    signatureUrl: string | null;
    icpEnabled: boolean;
  }[];
}

// Instrutor com o treinamento ao qual está associado (gestão de instrutores).
export interface ApiInstructor {
  id: string;
  name: string;
  formation: string;
  mte: string | null;
  cpf?: string | null;
  codCBO?: string | null;
  crea: string | null;
  crq: string | null;
  signatureUrl: string | null;
  icpEnabled: boolean;
  digitalCertHolder?: string | null;
  digitalCertIssuer?: string | null;
  digitalCertSerial?: string | null;
  digitalCertValidUntil?: string | null;
  hasDigitalCert?: boolean; // true quando há um .pfx ICP-Brasil cadastrado
  course: { id: string; code: string; name: string } | null;
}

// Empresa cliente (painel próprio com certificados da equipe).
export interface ApiCompany {
  id: string;
  name: string;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  employeeCount: number;
  cnae: string | null;
  cnaeDescription: string | null;
  riskGrade: number | null;
  isActive: boolean;
  createdAt: string;
  _count?: { members: number };
}

export interface CnpjInfo {
  cnpj: string;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  cnae: string | null;
  cnaeDescription: string | null;
  riskGrade: number | null;
}

export interface AccessWindow { days?: number[]; start?: string; end?: string }
export interface AccessSchedule { enabled?: boolean; windows?: AccessWindow[]; days?: number[]; start?: string; end?: string }
export interface CompanyDashboardData {
  company: { id: string; name: string; cnpj: string | null; email: string | null; phone: string | null; employeeCount: number; cnae: string | null; cnaeDescription: string | null; riskGrade: number | null; accessSchedule?: AccessSchedule; subscription?: { planId: string | null; planName: string | null; priceMonthly: number | null; status: string | null; renewsAt: string | null; active: boolean } } | null;
  employees: {
    id: string;
    name: string;
    email: string;
    cpf: string;
    jobRoleId?: string | null;
    jobRoleName?: string | null;
    trilha?: { roleId: string; roleName: string; items: { code: string; name: string; done: boolean }[] } | null;
    enrollments: {
      courseName: string;
      courseCode: string;
      workload: number;
      progress: number;
      passed: boolean;
      score: number | null;
      certificateCode: string | null;
      released?: boolean;
      validUntil?: string | null;
      expired?: boolean;
      date: string;
    }[];
  }[];
  obligatory: { code: string; name: string; completed: number; workload: number }[];
  jobRoles?: { id: string; name: string; description: string; courseCodes: string[] }[];
  stats: { declaredEmployees: number; registeredEmployees: number; certificates: number; compliant: number; compliancePct: number };
}

// Painel do Instrutor (role 'instructor').
export interface InstructorDashboardData {
  instructor: { name: string };
  courses: { id: string; code: string; name: string; examQuestions: { question: string; options: string[]; correctIndex: number }[]; sales: number; enrollments: number; examsCount: number; approved: number; revenue: number }[];
  exams: { id: string; studentName: string; studentCpf: string; courseId: string; courseCode: string; courseName: string; score: number; passed: boolean; validated: boolean; answers: Record<number, number>; date: string; enrollmentId: string | null; released: boolean; certificateCode: string | null; revocationRequested: boolean; revoked: boolean }[];
  stats: { courses: number; totalSales: number; totalEnrollments: number; totalExams: number; totalRevenue: number; commissionPercent: number; commissionValue: number };
}

// Nota Fiscal de Serviço (NFS-e) — base de gerenciamento.
export interface ApiInvoice {
  id: string;
  number: string | null;
  series: string | null;
  recipientType: 'PF' | 'PJ';
  document: string;
  recipientName: string;
  email: string | null;
  serviceDesc: string;
  amount: number;
  issueDate: string;
  status: 'PENDING' | 'ISSUED' | 'CANCELED';
  orderId: string | null;
  notes: string | null;
  createdAt: string;
}

export function mapApiCourse(c: ApiCourse): Course {
  return {
    id: c.id,
    code: c.code,
    name: c.name,
    description: c.description,
    duration: c.duration,
    modality: c.modality ?? undefined,
    validityMonths: c.validityMonths ?? undefined,
    price: c.price,
    coverImage: c.coverImage ?? undefined,
    isActive: c.isActive,
    isFeatured: c.isFeatured,
    modules: c.modules ?? [],
    manualActivities: c.manualActivities ?? [],
    videoUrl: c.videoUrl ?? undefined,
    moduleVideos: Array.isArray(c.moduleVideos) ? c.moduleVideos : [],
    documents: Array.isArray(c.documents) ? c.documents : [],
    examQuestions: Array.isArray(c.examQuestions) ? c.examQuestions : [],
    slides: Array.isArray(c.slides) ? c.slides : [],
    esocialEnabled: Boolean(c.esocialEnabled),
    esocialCode: c.esocialCode ?? undefined,
    instructors: (c.instructors ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      formation: i.formation,
      mte: i.mte ?? undefined,
      cpf: i.cpf ?? undefined,
      codCBO: i.codCBO ?? undefined,
      crea: i.crea ?? undefined,
      crq: i.crq ?? undefined,
      signatureUrl: i.signatureUrl ?? undefined,
      icpEnabled: Boolean(i.icpEnabled),
    })),
  };
}

export interface ApiExpiration {
  enrollmentId: string;
  studentName: string;
  studentEmail: string;
  company: string | null;
  courseCode: string;
  courseName: string;
  certificateCode: string | null;
  validUntil: string | null;
  daysLeft: number | null;
  status: 'valid' | 'expiring' | 'expired';
  notifiedAt: string | null;
}

export interface CertificateResult {
  code: string;
  studentName: string;
  studentCpf: string;
  studentDob: string;
  courseName: string;
  courseCode: string;
  workload: number;
  completionDate: string;
  validityMonths?: number | null;
  validUntil?: string | null; // ISO; nulo se o curso não tem validade definida
  expired?: boolean;
  instructor: string;
  instructorFormation: string;
  instructorMte?: string | null;
  instructorCrea?: string | null;
  manualActivities: string[];
}

export const coursesApi = {
  async list(): Promise<Course[]> {
    const data = await apiFetch<{ courses: ApiCourse[] }>('/courses');
    return (data.courses ?? []).map(mapApiCourse);
  },
};

export const certificatesApi = {
  // Retorna o certificado quando válido; sinaliza 'revoked' quando revogado.
  async validate(code: string): Promise<{ certificate: CertificateResult | null; revoked: boolean }> {
    try {
      const data = await apiFetch<{ valid: boolean; revoked?: boolean; certificate?: CertificateResult }>(
        `/certificates/${encodeURIComponent(code.trim())}`,
      );
      return { certificate: data.valid && data.certificate ? data.certificate : null, revoked: !!data.revoked };
    } catch {
      return { certificate: null, revoked: false };
    }
  },
};

// Matrícula retornada pela API (com o curso embutido).
interface ApiEnrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  startDate: string;
  examScore: number | null;
  passed: boolean;
  released: boolean;
  releasedAt?: string | null;
  certificateCode: string | null;
  enrolledAt: string;
  course: ApiCourse;
}

// Converte a matrícula da API para o formato do front-end (denormaliza os
// dados do aluno a partir do usuário autenticado).
export function mapApiEnrollment(e: ApiEnrollment, user: User): Enrollment {
  return {
    id: e.id,
    userId: e.userId,
    userName: user.name,
    userEmail: user.email,
    courseId: e.courseId,
    courseName: e.course?.name ?? '',
    courseCode: e.course?.code ?? '',
    progress: e.progress,
    startDate: (e.startDate || '').split('T')[0],
    examScore: e.examScore,
    passed: e.passed,
    released: Boolean(e.released),
    releasedAt: e.releasedAt ?? null,
    certificateCode: e.certificateCode,
    enrolledAt: (e.enrolledAt || '').split('T')[0],
  };
}

export const enrollmentsApi = {
  async listMine(): Promise<ApiEnrollment[]> {
    const data = await apiFetch<{ enrollments: ApiEnrollment[] }>('/enrollments/me');
    return data.enrollments ?? [];
  },
  async enroll(courseId: string): Promise<ApiEnrollment> {
    const data = await apiFetch<{ enrollment: ApiEnrollment }>('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
    return data.enrollment;
  },
  async updateProgress(id: string, progress: number): Promise<ApiEnrollment> {
    const data = await apiFetch<{ enrollment: ApiEnrollment }>(`/enrollments/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    });
    return data.enrollment;
  },
  async submitExam(
    id: string,
    payload: { score: number; passed: boolean; answers?: Record<number, number> },
  ): Promise<ApiEnrollment> {
    const data = await apiFetch<{ enrollment: ApiEnrollment }>(`/enrollments/${id}/exam`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.enrollment;
  },
  // Heartbeat de estudo: acumula a minutagem assistida (auditoria).
  async study(id: string, seconds: number): Promise<void> {
    try {
      await apiFetch(`/enrollments/${id}/study`, { method: 'POST', body: JSON.stringify({ seconds }) });
    } catch { /* não bloqueia a aula se a auditoria falhar */ }
  },
  // Marca o início da prova (auditoria).
  async examStart(id: string): Promise<void> {
    try {
      await apiFetch(`/enrollments/${id}/exam-start`, { method: 'POST', body: JSON.stringify({}) });
    } catch { /* silencioso */ }
  },
  // Verifica a janela de acesso (restrição de horário definida pela empresa).
  async accessWindow(): Promise<{ allowed: boolean; restricted: boolean; message?: string; schedule?: AccessSchedule }> {
    try {
      return await apiFetch('/enrollments/access-window');
    } catch {
      return { allowed: true, restricted: false };
    }
  },
};

// Relatório da Gestão Pedagógica (monitoramento de alunos).
export interface PedagogicalRow {
  id: string;
  studentName: string; studentEmail: string; studentCpf: string;
  courseCode: string; courseName: string; workload: number;
  progress: number; watchedSeconds: number;
  firstAccessAt: string | null; examStartedAt: string | null; examFinishedAt: string | null;
  examScore: number | null; passed: boolean; released: boolean; releasedAt: string | null;
  certificateCode: string | null; enrolledAt: string;
  revocationRequested?: boolean; revocationReason?: string | null; revocationRequestedBy?: string | null;
  revoked?: boolean; revokedAt?: string | null;
}
export interface PedagogicalLogin { userName: string; userEmail: string; loginAt: string; userAgent: string | null; }
export interface PedagogicalAccessWindow { name: string; schedule: AccessSchedule; }
export const pedagogicalApi = {
  async load(): Promise<{ rows: PedagogicalRow[]; logins: PedagogicalLogin[]; accessWindows: PedagogicalAccessWindow[] }> {
    return apiFetch('/admin/pedagogical');
  },
};

// Converte data ISO -> "dd/mm/aaaa" (formato usado no painel).
const fmtBr = (iso: string): string => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

// --- Cliente administrativo (somente ADMIN) ---
export interface AdminData {
  users: User[];
  enrollments: Enrollment[];
  transactions: SalesTransaction[];
  exams: StudentExamSubmission[];
  comments: Comment[];
  contacts: ContactMessage[];
  coupons: Coupon[];
  layout: LayoutConfig | null;
  payment: PaymentConfig | null;
}

export const adminApi = {
  async loadAll(): Promise<AdminData> {
    const [u, e, t, x, c, ct, cp, cfg] = await Promise.all([
      apiFetch<{ users: any[] }>('/admin/users'),
      apiFetch<{ enrollments: any[] }>('/admin/enrollments'),
      apiFetch<{ transactions: any[] }>('/admin/transactions'),
      apiFetch<{ exams: any[] }>('/admin/exams'),
      apiFetch<{ comments: any[] }>('/admin/comments'),
      apiFetch<{ contacts: any[] }>('/admin/contacts'),
      apiFetch<{ coupons: any[] }>('/admin/coupons'),
      apiFetch<{ layout: LayoutConfig | null; payment: PaymentConfig | null }>('/admin/config'),
    ]);
    return {
      users: u.users.map(mapApiUser),
      enrollments: e.enrollments.map((en) => ({
        id: en.id, userId: en.userId, userName: en.user?.name ?? '', userEmail: en.user?.email ?? '',
        courseId: en.courseId, courseName: en.course?.name ?? '', courseCode: en.course?.code ?? '',
        progress: en.progress, startDate: (en.startDate || '').split('T')[0], examScore: en.examScore,
        passed: en.passed, released: Boolean(en.released), certificateCode: en.certificateCode, enrolledAt: (en.enrolledAt || '').split('T')[0],
      })),
      transactions: t.transactions.map((tx) => ({
        id: tx.id, userId: tx.userId, userName: tx.user?.name ?? '', courseName: tx.courseName,
        total: tx.total, discount: tx.discount, status: String(tx.status).toLowerCase() as SalesTransaction['status'],
        installments: tx.installments, couponCode: tx.couponCode ?? undefined, date: fmtBr(tx.date),
      })),
      exams: x.exams.map((ex) => ({
        id: ex.id, userId: ex.userId, userName: ex.user?.name ?? '', courseId: ex.courseId,
        courseCode: ex.course?.code ?? '', courseName: ex.course?.name ?? '', score: ex.score,
        answers: ex.answers ?? {}, passed: ex.passed, validatedByInstructor: Boolean(ex.validatedByInstructor), date: fmtBr(ex.date),
      })),
      comments: c.comments.map((cm) => ({
        id: cm.id, userId: cm.userId, userName: cm.user?.name ?? '', courseId: cm.courseId,
        courseName: cm.course?.name ?? '', text: cm.text, reply: cm.reply ?? undefined,
        isPublic: cm.isPublic, date: fmtBr(cm.date),
      })),
      contacts: ct.contacts.map((m) => ({
        id: m.id, name: m.name, email: m.email, phone: m.phone ?? '', subject: m.subject,
        message: m.message, date: fmtBr(m.date),
      })),
      coupons: cp.coupons.map((c2) => ({
        id: c2.id, code: c2.code, description: c2.description, value: c2.value,
        type: String(c2.type).toLowerCase() as Coupon['type'], isActive: c2.isActive,
        associatedProducts: c2.associatedProducts ?? [],
      })),
      layout: cfg.layout, payment: cfg.payment,
    };
  },
  createUser(input: { name: string; email: string; cpf: string; dob?: string; role?: 'ADMIN' | 'STUDENT'; password?: string }) {
    return apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(input) });
  },
  toggleUserActive(id: string, isActive: boolean) {
    return apiFetch(`/admin/users/${id}/active`, { method: 'PATCH', body: JSON.stringify({ isActive }) });
  },
  // Redefine e-mail e/ou senha de um usuário.
  updateUserCredentials(id: string, input: { email?: string; password?: string; cpf?: string }) {
    return apiFetch(`/admin/users/${id}/credentials`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  // Planos de assinatura corporativa.
  plans() {
    return apiFetch<{ plans: ApiPlan[] }>('/admin/plans').then((d) => (d.plans ?? []).map(mapApiPlan));
  },
  createPlan(input: Partial<Plan>) {
    return apiFetch('/admin/plans', { method: 'POST', body: JSON.stringify(input) });
  },
  updatePlan(id: string, input: Partial<Plan>) {
    return apiFetch(`/admin/plans/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  deletePlan(id: string) {
    return apiFetch(`/admin/plans/${id}`, { method: 'DELETE' });
  },
  assignCompanyPlan(companyId: string, planId: string | null) {
    return apiFetch(`/admin/companies/${companyId}/plan`, { method: 'PATCH', body: JSON.stringify({ planId }) });
  },
  // Parceiros white-label.
  partners() {
    return apiFetch<{ partners: Partner[] }>('/admin/partners').then((d) => d.partners ?? []);
  },
  createPartner(input: Partner) {
    return apiFetch('/admin/partners', { method: 'POST', body: JSON.stringify(input) });
  },
  updatePartner(id: string, input: Partial<Partner>) {
    return apiFetch(`/admin/partners/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  deletePartner(id: string) {
    return apiFetch(`/admin/partners/${id}`, { method: 'DELETE' });
  },
  // Trilhas por cargo/função.
  jobRoles() {
    return apiFetch<{ jobRoles: JobRole[] }>('/admin/job-roles').then((d) => d.jobRoles ?? []);
  },
  createJobRole(input: { name: string; description?: string; courseCodes?: string[]; isActive?: boolean }) {
    return apiFetch('/admin/job-roles', { method: 'POST', body: JSON.stringify(input) });
  },
  updateJobRole(id: string, input: { name?: string; description?: string; courseCodes?: string[]; isActive?: boolean }) {
    return apiFetch(`/admin/job-roles/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  deleteJobRole(id: string) {
    return apiFetch(`/admin/job-roles/${id}`, { method: 'DELETE' });
  },
  // Relatório OCULTO de vendas por parceiro (somente administrador master).
  partnerSales() {
    return apiFetch<{ rows: { slug: string; name: string; orders: number; gross: number; discount: number; net: number }[]; totals: { orders: number; gross: number; discount: number; net: number } }>('/admin/partner-sales');
  },
  sendPartnerSales() {
    return apiFetch<{ ok: boolean; sentTo: string | null }>('/admin/partner-sales/send', { method: 'POST' });
  },
  replyComment(id: string, reply: string) {
    return apiFetch(`/admin/comments/${id}/reply`, { method: 'PATCH', body: JSON.stringify({ reply }) });
  },
  batchEnroll(userIds: string[], courseId: string) {
    return apiFetch('/admin/enrollments/batch', { method: 'POST', body: JSON.stringify({ userIds, courseId }) });
  },
  createCoupon(input: { code: string; description: string; value: number; type: 'PERCENTAGE' | 'FIXED'; associatedProducts: string[] }) {
    return apiFetch('/admin/coupons', { method: 'POST', body: JSON.stringify(input) });
  },
  toggleCoupon(id: string, isActive: boolean) {
    return apiFetch(`/admin/coupons/${id}/active`, { method: 'PATCH', body: JSON.stringify({ isActive }) });
  },
  // Empresas
  listCompanies() {
    return apiFetch<{ companies: ApiCompany[] }>(`/admin/companies`);
  },
  createCompany(input: { name: string; cnpj?: string; email?: string; phone?: string; employeeCount: number; cnae?: string; cnaeDescription?: string; riskGrade?: number }) {
    return apiFetch<{ company: ApiCompany }>(`/admin/companies`, { method: 'POST', body: JSON.stringify(input) });
  },
  updateCompany(id: string, input: { name?: string; cnpj?: string; email?: string; phone?: string; employeeCount?: number; cnae?: string; cnaeDescription?: string; riskGrade?: number; isActive?: boolean }) {
    return apiFetch<{ company: ApiCompany }>(`/admin/companies/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  lookupCnpj(cnpj: string) {
    return apiFetch<{ info: CnpjInfo }>(`/admin/cnpj/${encodeURIComponent(cnpj.replace(/\D/g, ''))}`);
  },
  createCompanyManager(companyId: string, input: { name: string; email: string; password: string; cpf: string }) {
    return apiFetch(`/admin/companies/${companyId}/manager`, { method: 'POST', body: JSON.stringify(input) });
  },
  assignUserCompany(userId: string, companyId: string | null) {
    return apiFetch(`/admin/users/${userId}/company`, { method: 'PATCH', body: JSON.stringify({ companyId }) });
  },
  addInstructor(courseId: string, input: { name: string; formation: string; mte?: string; cpf?: string; codCBO?: string; crea?: string; crq?: string; signatureUrl?: string; icpEnabled: boolean }) {
    return apiFetch(`/admin/courses/${courseId}/instructors`, { method: 'POST', body: JSON.stringify(input) });
  },
  listInstructors() {
    return apiFetch<{ instructors: ApiInstructor[] }>(`/admin/instructors`);
  },
  createInstructor(input: { name: string; formation: string; mte?: string; cpf?: string; codCBO?: string; crea?: string; crq?: string; signatureUrl?: string; icpEnabled: boolean; courseIds: string[] }) {
    return apiFetch(`/admin/instructors`, { method: 'POST', body: JSON.stringify(input) });
  },
  updateInstructor(id: string, input: { name?: string; formation?: string; mte?: string; cpf?: string; codCBO?: string; crea?: string; crq?: string; signatureUrl?: string; icpEnabled?: boolean }) {
    return apiFetch<{ instructors: ApiInstructor[] }>(`/admin/instructors/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  deleteInstructor(id: string) {
    return apiFetch(`/admin/instructors/${id}`, { method: 'DELETE' });
  },
  createInstructorLogin(input: { name: string; email: string; password: string; cpf: string }) {
    return apiFetch(`/admin/instructors/login`, { method: 'POST', body: JSON.stringify(input) });
  },
  // Configura o certificado digital do instrutor (assinatura eletrônica / ICP-Brasil).
  // pfxBase64 + password só são enviados ao habilitar a assinatura ICP com o A1.
  setInstructorCertificate(input: {
    name: string; icpEnabled?: boolean; holder?: string; issuer?: string; serial?: string; validUntil?: string;
    pfxBase64?: string; password?: string; clearPfx?: boolean;
  }) {
    return apiFetch<{ instructors: ApiInstructor[] }>(`/admin/instructors/certificate`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  listInvoices() {
    return apiFetch<{ invoices: ApiInvoice[] }>(`/admin/invoices`);
  },
  createInvoice(input: {
    recipientType: 'PF' | 'PJ'; document: string; recipientName: string; email?: string;
    serviceDesc: string; amount: number; issueDate?: string; number?: string; series?: string; orderId?: string; notes?: string;
  }) {
    return apiFetch<{ invoice: ApiInvoice }>(`/admin/invoices`, { method: 'POST', body: JSON.stringify(input) });
  },
  updateInvoice(id: string, input: { status?: 'PENDING' | 'ISSUED' | 'CANCELED'; number?: string; series?: string; notes?: string }) {
    return apiFetch<{ invoice: ApiInvoice }>(`/admin/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  deleteInvoice(id: string) {
    return apiFetch(`/admin/invoices/${id}`, { method: 'DELETE' });
  },
  addModule(courseId: string, module: string) {
    return apiFetch(`/admin/courses/${courseId}/modules`, { method: 'POST', body: JSON.stringify({ module }) });
  },
  saveCourseContent(courseId: string, input: { videoUrl?: string; moduleVideos?: string[]; documents?: { name: string; url: string }[]; modality?: string }) {
    return apiFetch(`/admin/courses/${courseId}/content`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  saveExam(courseId: string, questions: { question: string; options: string[]; correctIndex: number }[]) {
    return apiFetch(`/admin/courses/${courseId}/exam`, { method: 'PATCH', body: JSON.stringify({ questions }) });
  },
  // Atualiza preço/visibilidade do curso (Gestão de Cursos).
  updateCoursePrice(courseId: string, input: { price?: number; validityMonths?: number; isActive?: boolean; isFeatured?: boolean; esocialEnabled?: boolean; esocialCode?: string }) {
    return apiFetch(`/admin/courses/${courseId}/price`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  // Vencimentos de certificados + disparo de alertas de renovação.
  expirations() {
    return apiFetch<{ expirations: ApiExpiration[] }>('/admin/expirations');
  },
  notifyExpirations(daysAhead = 30) {
    return apiFetch<{ sent: number; candidates: number }>('/admin/expirations/notify', { method: 'POST', body: JSON.stringify({ daysAhead }) });
  },
  saveSlides(courseId: string, slides: { title: string; bullets: string[] }[]) {
    return apiFetch(`/admin/courses/${courseId}/slides`, { method: 'PATCH', body: JSON.stringify({ slides }) });
  },
  saveConfig(layout: LayoutConfig, payment: PaymentConfig) {
    return apiFetch('/admin/config', { method: 'PUT', body: JSON.stringify({ layout, payment }) });
  },
  async getContent(key: string): Promise<any[]> {
    const d = await apiFetch<{ data: any[] }>(`/admin/content/${key}`);
    return Array.isArray(d.data) ? d.data : [];
  },
  saveContent(key: string, data: any[]) {
    return apiFetch(`/admin/content/${key}`, { method: 'PUT', body: JSON.stringify({ data }) });
  },
  // Etapa 2: revogação definitiva (apenas administrador).
  revokeCertificate(enrollmentId: string) {
    return apiFetch(`/admin/enrollments/${enrollmentId}/revoke`, { method: 'POST', body: JSON.stringify({}) });
  },
  rejectRevocation(enrollmentId: string) {
    return apiFetch(`/admin/enrollments/${enrollmentId}/revocation/reject`, { method: 'POST', body: JSON.stringify({}) });
  },
};

// Conteúdo editável do site (notícias, parceiros, páginas, produtos, e-mails).
export const contentApi = {
  async get(key: string): Promise<any[]> {
    try {
      const d = await apiFetch<{ data: any[] }>(`/content/${key}`);
      return Array.isArray(d.data) ? d.data : [];
    } catch {
      return [];
    }
  },
};

// Painel da empresa (gestor com role 'company').
export const companyApi = {
  getDashboard() {
    return apiFetch<CompanyDashboardData>('/company/me');
  },
  setAccessSchedule(schedule: AccessSchedule) {
    return apiFetch<{ accessSchedule: AccessSchedule }>('/company/access-schedule', {
      method: 'PATCH',
      body: JSON.stringify(schedule),
    });
  },
  // Atribui (ou remove) a trilha de cargo de um funcionário.
  assignJobRole(employeeId: string, jobRoleId: string | null) {
    return apiFetch(`/company/employees/${employeeId}/job-role`, { method: 'PATCH', body: JSON.stringify({ jobRoleId }) });
  },
  // Assinatura recorrente (plano corporativo).
  subscribe(planId: string) {
    return apiFetch<{ subscriptionId: string; url: string | null }>('/company/subscription', { method: 'POST', body: JSON.stringify({ planId }) });
  },
  cancelSubscription() {
    return apiFetch<{ ok: boolean }>('/company/subscription/cancel', { method: 'POST' });
  },
  // eSocial S-2245: leitura dos treinamentos concluídos (com pendências).
  esocialS2245(from?: string, to?: string) {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    const suffix = qs.toString() ? `?${qs}` : '';
    return apiFetch<EsocialS2245Data>(`/company/esocial/s2245${suffix}`);
  },
  // Baixa o export (XML rascunho ou CSV) como Blob, autenticado por header.
  async esocialS2245Download(format: 'xml' | 'csv', from?: string, to?: string): Promise<Blob> {
    const qs = new URLSearchParams({ format });
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    const token = getToken();
    const res = await fetch(apiUrl(`/company/esocial/s2245/export?${qs}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Falha ao gerar o arquivo.');
    return res.blob();
  },
};

export interface EsocialS2245Record {
  enrollmentId: string;
  cpfTrab: string;
  nmTrab: string;
  cnpjEmpregador: string;
  courseCode: string;
  courseName: string;
  codTreiCap: string | null;
  durTreiCap: number;
  dtTreiCap: string;
  cpfProf: string;
  nmProf: string;
  formProf: string;
  codCBO: string;
  certificateCode: string | null;
  pendencias: string[];
}
export interface EsocialS2245Data {
  company: { name: string; cnpj: string };
  records: EsocialS2245Record[];
}

// Painel do instrutor (role 'instructor').
export const instructorApi = {
  getDashboard() {
    return apiFetch<InstructorDashboardData>('/instructor/me');
  },
  validateExam(id: string, validated: boolean) {
    return apiFetch(`/instructor/exams/${id}/validate`, { method: 'PATCH', body: JSON.stringify({ validated }) });
  },
  // Etapa 1: solicitar revogação do certificado (instrutor/responsável).
  requestRevocation(enrollmentId: string, reason: string) {
    return apiFetch(`/instructor/enrollments/${enrollmentId}/request-revocation`, { method: 'POST', body: JSON.stringify({ reason }) });
  },
  // Edita os slides de um curso do próprio instrutor.
  saveSlides(courseId: string, slides: { title: string; bullets: string[] }[]) {
    return apiFetch(`/instructor/courses/${courseId}/slides`, { method: 'PATCH', body: JSON.stringify({ slides }) });
  },
  // Edita a prova de um curso do próprio instrutor.
  saveExam(courseId: string, questions: { question: string; options: string[]; correctIndex: number }[]) {
    return apiFetch(`/instructor/courses/${courseId}/exam`, { method: 'PATCH', body: JSON.stringify({ questions }) });
  },
};

export const paymentsApi = {
  // Inicia o checkout. Retorna a URL de pagamento (Asaas) ou null se o
  // pagamento ainda não estiver configurado no servidor (403/503).
  async checkout(courseIds: string[], couponCode?: string): Promise<{ url: string; orderId: string } | null> {
    try {
      // Atribui a venda ao parceiro white-label de origem (subdomínio atual).
      const partnerSlug = typeof window !== 'undefined' ? partnerSlugFromHost(window.location.host) ?? undefined : undefined;
      return await apiFetch<{ url: string; orderId: string }>('/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({ courseIds, couponCode, partnerSlug }),
      });
    } catch (err) {
      if (err instanceof Error && /não configurado|configurado/i.test(err.message)) return null;
      throw err;
    }
  },
  async status(): Promise<boolean> {
    try {
      const d = await apiFetch<{ configured: boolean }>('/payments/status');
      return Boolean(d.configured);
    } catch {
      return false;
    }
  },
};

// --- Captação de leads (landing de divulgação + agente de IA) ---
export interface ApiLead {
  id: string;
  type: 'PERSON' | 'COMPANY';
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  cnpj: string | null;
  employeeCount: number | null;
  interest: string | null;
  message: string | null;
  source: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'DISCARDED';
  createdAt: string;
}

export interface LeadInput {
  type: 'PERSON' | 'COMPANY';
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  cnpj?: string;
  employeeCount?: number;
  interest?: string;
  message?: string;
  source?: string;
}

export const leadsApi = {
  // Cria um lead a partir do formulário público da landing.
  create(input: LeadInput) {
    return apiFetch<{ ok: boolean; leadId: string }>('/leads', { method: 'POST', body: JSON.stringify(input) });
  },
  // Conversa com o agente de IA de vendas (capta o lead automaticamente).
  async chat(history: { role: 'user' | 'model'; text: string }[], courses: string[]): Promise<{ reply: string; leadCaptured: boolean }> {
    const res = await fetch(apiUrl('/sales-agent'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, courses }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data && data.error) || 'Não foi possível falar com o agente.');
    return { reply: data.reply ?? '', leadCaptured: Boolean(data.leadCaptured) };
  },
};

// Métodos admin de leads.
export const adminLeadsApi = {
  list() {
    return apiFetch<{ leads: ApiLead[] }>('/admin/leads');
  },
  updateStatus(id: string, status: ApiLead['status']) {
    return apiFetch<{ lead: ApiLead }>(`/admin/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  remove(id: string) {
    return apiFetch(`/admin/leads/${id}`, { method: 'DELETE' });
  },
};

export const authApi = {
  async login(email: string, password: string): Promise<User> {
    const data = await apiFetch<{ token: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return mapApiUser(data.user);
  },

  async register(input: {
    name: string;
    email: string;
    cpf: string;
    password: string;
    dob?: string;
  }): Promise<User> {
    const data = await apiFetch<{ token: string; user: ApiUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setToken(data.token);
    return mapApiUser(data.user);
  },

  async me(): Promise<User> {
    const data = await apiFetch<{ user: ApiUser }>('/auth/me');
    return mapApiUser(data.user);
  },

  // Atualiza o próprio perfil (nome/dob/cpf/avatar). O avatar pode ser uma URL
  // ou um data URL (foto enviada pelo usuário).
  async updateProfile(input: { name?: string; dob?: string; cpf?: string; avatar?: string }): Promise<User> {
    const data = await apiFetch<{ user: ApiUser }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return mapApiUser(data.user);
  },
};

// --- Planos de assinatura corporativa ---
interface ApiPlan {
  id: string; name: string; description?: string | null; priceMonthly: number;
  maxEmployees?: number | null; features?: unknown; isActive: boolean; highlight: boolean; sortOrder: number;
}
function mapApiPlan(p: ApiPlan): Plan {
  return {
    id: p.id, name: p.name, description: p.description ?? '', priceMonthly: p.priceMonthly,
    maxEmployees: p.maxEmployees ?? null, features: Array.isArray(p.features) ? (p.features as string[]) : [],
    isActive: p.isActive, highlight: p.highlight, sortOrder: p.sortOrder,
  };
}
export const plansApi = {
  list(): Promise<Plan[]> {
    return apiFetch<{ plans: ApiPlan[] }>('/plans').then((d) => (d.plans ?? []).map(mapApiPlan));
  },
};

// --- Branding white-label (público, por subdomínio) ---
export const brandingApi = {
  get(slug: string): Promise<Partner | null> {
    return apiFetch<{ partner: Partner | null }>(`/branding/${encodeURIComponent(slug)}`).then((d) => d.partner ?? null).catch(() => null);
  },
};

// Extrai o slug do parceiro a partir do host (subdomínio de falainstrutor.com.br).
export function partnerSlugFromHost(host: string): string | null {
  const h = (host || '').split(':')[0].toLowerCase();
  const BASE = 'falainstrutor.com.br';
  if (h.endsWith('.' + BASE)) {
    const sub = h.slice(0, -(BASE.length + 1)).split('.')[0];
    if (sub && !['www', 'app'].includes(sub)) return sub;
  }
  return null;
}
