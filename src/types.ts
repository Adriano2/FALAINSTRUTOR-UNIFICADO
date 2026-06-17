/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  dob: string;
  cpf: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  registeredAt: string;
}

export interface Instructor {
  id: string;
  name: string;
  formation: string;
}

export interface Course {
  id: string;
  code: string; // e.g. "NR10", "NR11", "NR35", "DIR-DEF"
  name: string;
  description: string;
  duration: number; // in hours
  price: number;
  coverImage?: string;
  isActive: boolean;
  isFeatured: boolean; // if true, shows in the hero slider
  modules: string[];
  instructors: Instructor[];
  manualActivities: string[]; // custom exercises, e.g., "Treinamento com escada"
}

export interface Enrollment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  progress: number; // 0 to 100
  startDate: string;
  examScore: number | null; // null if not taken yet
  passed: boolean;
  certificateCode: string | null;
  enrolledAt: string;
}

export interface SalesTransaction {
  id: string;
  userId: string;
  userName: string;
  courseName: string;
  total: number;
  discount: number;
  status: 'open' | 'active' | 'canceled';
  installments: number;
  couponCode?: string;
  date: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  value: number; // percentage or fixed value
  type: 'percentage' | 'fixed';
  isActive: boolean;
  associatedProducts: string[]; // course IDs
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  text: string;
  reply?: string;
  isPublic: boolean;
  date: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
}

export interface LayoutConfig {
  companyName: string;
  hostname: string;
  twitterUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  phone: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  logoUrl?: string;
  signatureUrl?: string;
  faviconUrl?: string;
  certificateFrontUrl?: string;
  certificateBackUrl?: string;
}

export interface PaymentConfig {
  asaasToken: string;
  mercadoPagoToken: string;
  activeAcquirer: 'Asaas' | 'Mercado Pago';
  maxInstallments: number;
  softDescriptor: string;
  cnpj: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  digitalCertificateName?: string;
  digitalCertificatePassword?: string;
}

export interface ExamQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface StudentExamSubmission {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  score: number; // e.g. 100 for 100%
  answers: Record<number, number>; // index of question -> index of selected option
  passed: boolean;
  date: string;
}
