/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Popula o banco com os dados iniciais (cursos, cupons, admin e config).
 * Idempotente: pode ser executado várias vezes (usa upsert).
 *
 * Reaproveita os dados de catálogo de `src/data.ts` para evitar duplicação.
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, Prisma, type CouponType } from '@prisma/client';
import {
  SEED_COURSES,
  SEED_COUPONS,
  INITIAL_LAYOUT_CONFIG,
  INITIAL_PAYMENT_CONFIG,
} from '../src/data';

const prisma = new PrismaClient();

// Conta administradora mestre (senha definível via ADMIN_PASSWORD no .env).
const ADMIN_EMAIL = 'adriano.ricardo01@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Anthony9936#';

async function main() {
  // 1) Administrador
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash, role: 'ADMIN', isActive: true },
    create: {
      id: 'usr-1',
      name: 'Adriano Ricardo',
      dob: '1985-04-15',
      cpf: '062.349.933-88',
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    },
  });

  // 2) Cursos (preservando os ids originais para casar com os cupons)
  for (const c of SEED_COURSES) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: {
        code: c.code,
        name: c.name,
        description: c.description,
        duration: c.duration,
        price: c.price,
        coverImage: c.coverImage,
        isActive: c.isActive,
        isFeatured: c.isFeatured,
        modules: c.modules,
        manualActivities: c.manualActivities,
        modality: c.modality ?? 'EaD',
      },
      create: {
        id: c.id,
        code: c.code,
        name: c.name,
        description: c.description,
        duration: c.duration,
        price: c.price,
        coverImage: c.coverImage,
        isActive: c.isActive,
        isFeatured: c.isFeatured,
        modules: c.modules,
        manualActivities: c.manualActivities,
        modality: c.modality ?? 'EaD',
        instructors: {
          create: c.instructors.map((i) => ({
            name: i.name,
            formation: i.formation,
            mte: i.mte,
            crea: i.crea,
            crq: i.crq,
            signatureUrl: i.signatureUrl,
            icpEnabled: i.icpEnabled ?? false,
          })),
        },
      },
    });
  }

  // 3) Cupons
  for (const cp of SEED_COUPONS) {
    const type: CouponType = cp.type === 'fixed' ? 'FIXED' : 'PERCENTAGE';
    await prisma.coupon.upsert({
      where: { code: cp.code },
      update: {
        description: cp.description,
        value: cp.value,
        type,
        isActive: cp.isActive,
        associatedProducts: cp.associatedProducts,
      },
      create: {
        code: cp.code,
        description: cp.description,
        value: cp.value,
        type,
        isActive: cp.isActive,
        associatedProducts: cp.associatedProducts,
      },
    });
  }

  // 3b) Alunos de exemplo + certificados emitidos (para testar a validação)
  const studentHash = await bcrypt.hash('aluno123', 10);
  const demoStudents = [
    {
      id: 'usr-2',
      name: 'Jéssica da Silva Ribeiro',
      dob: '1995-08-24',
      cpf: '110.887.259-11',
      email: 'jessica@gmail.com',
      certificateCode: 'CERT-35-JESSICA-01A',
    },
    {
      id: 'usr-3',
      name: 'Thiago Aparecido Ramos',
      dob: '1988-02-14',
      cpf: '083.551.492-49',
      email: 'thiago.ramos@empresa.com',
      certificateCode: 'CERT-35-THIAGO-02B',
    },
  ];

  for (const s of demoStudents) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        id: s.id,
        name: s.name,
        dob: s.dob,
        cpf: s.cpf,
        email: s.email,
        passwordHash: studentHash,
        role: 'STUDENT',
        isActive: true,
      },
    });
    // Matrícula concluída e aprovada na NR 35, com certificado emitido.
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: s.id, courseId: 'course-nr35' } },
      update: { progress: 100, passed: true, examScore: 100, certificateCode: s.certificateCode },
      create: {
        userId: s.id,
        courseId: 'course-nr35',
        progress: 100,
        passed: true,
        examScore: 100,
        certificateCode: s.certificateCode,
      },
    });
  }

  // 3c) Empresa de demonstração + gestor + funcionários vinculados
  await prisma.company.upsert({
    where: { id: 'comp-demo' },
    update: { name: 'Construtora Modelo Ltda', employeeCount: 10, cnae: '4120-4/00', cnaeDescription: 'Construção de edifícios', riskGrade: 3 },
    create: { id: 'comp-demo', name: 'Construtora Modelo Ltda', cnpj: '12.345.678/0001-90', email: 'contato@construtoramodelo.com.br', phone: '(11) 4000-0000', employeeCount: 10, cnae: '4120-4/00', cnaeDescription: 'Construção de edifícios', riskGrade: 3, isActive: true },
  });
  const companyHash = await bcrypt.hash('empresa123', 10);
  await prisma.user.upsert({
    where: { email: 'empresa@gmail.com' },
    update: { role: 'COMPANY', companyId: 'comp-demo' },
    create: {
      id: 'usr-company',
      name: 'Gestor Construtora Modelo',
      cpf: '999.888.777-66',
      email: 'empresa@gmail.com',
      passwordHash: companyHash,
      role: 'COMPANY',
      companyId: 'comp-demo',
      isActive: true,
    },
  });
  // Vincula os alunos de demonstração à empresa (certificados aparecem no painel).
  await prisma.user.updateMany({
    where: { id: { in: ['usr-2', 'usr-3'] } },
    data: { companyId: 'comp-demo' },
  });

  // 3d) Acesso de demonstração do instrutor (nome igual ao do instrutor padrão,
  // para o painel localizar os cursos associados).
  const instructorHash = await bcrypt.hash('instrutor123', 10);
  await prisma.user.upsert({
    where: { email: 'instrutor@gmail.com' },
    update: { role: 'INSTRUCTOR', name: 'Adriano Aparecido Ribas Ricardo' },
    create: {
      id: 'usr-instrutor',
      name: 'Adriano Aparecido Ribas Ricardo',
      cpf: '062.349.933-77',
      email: 'instrutor@gmail.com',
      passwordHash: instructorHash,
      role: 'INSTRUCTOR',
      isActive: true,
    },
  });

  // 4) Configurações globais (layout + pagamento)
  const layout = INITIAL_LAYOUT_CONFIG as unknown as Prisma.InputJsonValue;
  const payment = INITIAL_PAYMENT_CONFIG as unknown as Prisma.InputJsonValue;
  await prisma.appConfig.upsert({
    where: { id: 'singleton' },
    update: { layout, payment },
    create: { id: 'singleton', layout, payment },
  });

  // 5) Conteúdo editável do site (notícias e parceiros)
  const news = [
    { id: 'news-1', tag: 'NR-05', title: 'O papel da CIPA na prevenção de acidentes de trabalho', description: 'A Comissão Interna de Prevenção de Acidentes e Assédio (CIPA) é essencial para aproximar colaboradores e a coordenação de SST na identificação de riscos.', date: '05/06/2026', readTime: '4 min de leitura' },
    { id: 'news-2', tag: 'Trânsito', title: 'Exame Toxicológico de CNH C, D e E: por que é indispensável?', description: 'Esclarecemos as diretrizes sobre a obrigatoriedade de renovação periódica dos exames toxicológicos para condutores profissionais.', date: '01/06/2026', readTime: '5 min de leitura' },
    { id: 'news-3', tag: 'PGR / GRO', title: 'Riscos Psicossociais no PGR a partir de 2026', description: 'As atualizações no Programa de Gerenciamento de Riscos demandam avaliação da ergonomia cognitiva e dos estressores emocionais.', date: '28/05/2026', readTime: '6 min de leitura' },
  ];
  const partners = [
    { id: 'p1', name: 'CREA-SP', logoUrl: '', url: 'https://www.creasp.org.br' },
    { id: 'p2', name: 'Ministério do Trabalho e Emprego', logoUrl: '', url: 'https://www.gov.br/trabalho-e-emprego' },
  ];
  for (const [key, data] of [['news', news], ['partners', partners]] as const) {
    await prisma.siteContent.upsert({
      where: { key },
      update: {},
      create: { key, data: data as unknown as Prisma.InputJsonValue },
    });
  }

  const counts = {
    usuarios: await prisma.user.count(),
    cursos: await prisma.course.count(),
    cupons: await prisma.coupon.count(),
  };
  console.log('Seed concluído:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
