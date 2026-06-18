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
  ContactMessage, StudentExamSubmission, LayoutConfig, PaymentConfig,
} from './types';

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
  role: 'ADMIN' | 'STUDENT';
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
    role: u.role === 'ADMIN' ? 'admin' : 'student',
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

  const res = await fetch(`/api${path}`, { ...options, headers });
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
  price: number;
  coverImage: string | null;
  isActive: boolean;
  isFeatured: boolean;
  modules: string[];
  manualActivities: string[];
  instructors: {
    id: string;
    name: string;
    formation: string;
    mte: string | null;
    signatureUrl: string | null;
    icpEnabled: boolean;
  }[];
}

export function mapApiCourse(c: ApiCourse): Course {
  return {
    id: c.id,
    code: c.code,
    name: c.name,
    description: c.description,
    duration: c.duration,
    price: c.price,
    coverImage: c.coverImage ?? undefined,
    isActive: c.isActive,
    isFeatured: c.isFeatured,
    modules: c.modules ?? [],
    manualActivities: c.manualActivities ?? [],
    instructors: (c.instructors ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      formation: i.formation,
      mte: i.mte ?? undefined,
      signatureUrl: i.signatureUrl ?? undefined,
      icpEnabled: Boolean(i.icpEnabled),
    })),
  };
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
  instructor: string;
  instructorFormation: string;
  manualActivities: string[];
}

export const coursesApi = {
  async list(): Promise<Course[]> {
    const data = await apiFetch<{ courses: ApiCourse[] }>('/courses');
    return (data.courses ?? []).map(mapApiCourse);
  },
};

export const certificatesApi = {
  // Returns the certificate when valid, or null when not found.
  async validate(code: string): Promise<CertificateResult | null> {
    try {
      const data = await apiFetch<{ valid: boolean; certificate: CertificateResult }>(
        `/certificates/${encodeURIComponent(code.trim())}`,
      );
      return data.valid ? data.certificate : null;
    } catch {
      return null;
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
        passed: en.passed, certificateCode: en.certificateCode, enrolledAt: (en.enrolledAt || '').split('T')[0],
      })),
      transactions: t.transactions.map((tx) => ({
        id: tx.id, userId: tx.userId, userName: tx.user?.name ?? '', courseName: tx.courseName,
        total: tx.total, discount: tx.discount, status: String(tx.status).toLowerCase() as SalesTransaction['status'],
        installments: tx.installments, couponCode: tx.couponCode ?? undefined, date: fmtBr(tx.date),
      })),
      exams: x.exams.map((ex) => ({
        id: ex.id, userId: ex.userId, userName: ex.user?.name ?? '', courseId: ex.courseId,
        courseCode: ex.course?.code ?? '', courseName: ex.course?.name ?? '', score: ex.score,
        answers: ex.answers ?? {}, passed: ex.passed, date: fmtBr(ex.date),
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
  addInstructor(courseId: string, input: { name: string; formation: string; mte?: string; signatureUrl?: string; icpEnabled: boolean }) {
    return apiFetch(`/admin/courses/${courseId}/instructors`, { method: 'POST', body: JSON.stringify(input) });
  },
  addModule(courseId: string, module: string) {
    return apiFetch(`/admin/courses/${courseId}/modules`, { method: 'POST', body: JSON.stringify({ module }) });
  },
  saveConfig(layout: LayoutConfig, payment: PaymentConfig) {
    return apiFetch('/admin/config', { method: 'PUT', body: JSON.stringify({ layout, payment }) });
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
};
