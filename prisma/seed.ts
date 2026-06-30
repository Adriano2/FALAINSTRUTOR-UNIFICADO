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
  getExamQuestions,
  GENERIC_EXAM,
  SLIDES_BY_CODE,
} from '../src/data';

const prisma = new PrismaClient();

// Conta administradora mestre (senha definível via ADMIN_PASSWORD no .env).
const ADMIN_EMAIL = 'adriano.ricardo01@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Anthony9936#';

// Contas operacionais de acesso (produção): Instrutor, Empresa e Aluno.
// Login e senha definíveis por .env (use ASPAS se a senha tiver '#').
const INSTRUCTOR_EMAIL = process.env.INSTRUCTOR_EMAIL || 'instrutor@falainstrutor.com.br';
const INSTRUCTOR_PASSWORD = process.env.INSTRUCTOR_PASSWORD || 'Instrutor@2026';
// Nome do instrutor padrão dos cursos — usar o mesmo nome faz o painel do
// instrutor enxergar os cursos associados (vínculo é por nome).
const INSTRUCTOR_NAME = process.env.INSTRUCTOR_NAME || 'Adriano Aparecido Ribas Ricardo';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'empresa@falainstrutor.com.br';
const COMPANY_PASSWORD = process.env.COMPANY_PASSWORD || 'Empresa@2026';
const STUDENT_EMAIL = process.env.STUDENT_EMAIL || 'aluno@falainstrutor.com.br';
const STUDENT_PASSWORD = process.env.STUDENT_PASSWORD || 'Aluno@2026';

// Validade do certificado por NR (em meses). Ajustável depois no painel.
const VALIDITY_BY_CODE: Record<string, number> = {
  'NR 10': 24, 'NR 12': 24, 'NR 33': 12, 'NR 35': 24, 'NR 20': 12,
  'NR 06': 12, 'NR 05': 12, 'NR 11': 12, 'NR 13': 12, 'NR 18': 12,
  'LEI LUCAS 4H': 24, 'LEI LUCAS 10H': 24,
};

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

  // 1b) Contas operacionais de acesso (sempre criadas — produção):
  //     Instrutor, Empresa e Aluno. Apenas login + senha; o Admin segue master.
  // Instrutor (nome casa com o instrutor padrão -> enxerga os cursos no painel).
  const instructorHashOp = await bcrypt.hash(INSTRUCTOR_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: INSTRUCTOR_EMAIL },
    update: { passwordHash: instructorHashOp, role: 'INSTRUCTOR', name: INSTRUCTOR_NAME, isActive: true },
    create: {
      id: 'usr-op-instrutor',
      name: INSTRUCTOR_NAME,
      cpf: '000.000.000-01',
      email: INSTRUCTOR_EMAIL,
      passwordHash: instructorHashOp,
      role: 'INSTRUCTOR',
      isActive: true,
    },
  });

  // Empresa: usuário COMPANY vinculado a uma empresa (editável no painel admin).
  await prisma.company.upsert({
    where: { id: 'comp-fala' },
    update: {},
    create: {
      id: 'comp-fala',
      name: 'Empresa FalaInstrutor',
      cnpj: '60.511.651/0001-78',
      email: COMPANY_EMAIL,
      phone: '(11) 99625-5102',
      employeeCount: 1,
      riskGrade: 3,
      isActive: true,
    },
  });
  const companyHashOp = await bcrypt.hash(COMPANY_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: COMPANY_EMAIL },
    update: { passwordHash: companyHashOp, role: 'COMPANY', companyId: 'comp-fala', isActive: true },
    create: {
      id: 'usr-op-empresa',
      name: 'Gestor — Empresa FalaInstrutor',
      cpf: '000.000.000-02',
      email: COMPANY_EMAIL,
      passwordHash: companyHashOp,
      role: 'COMPANY',
      companyId: 'comp-fala',
      isActive: true,
    },
  });

  // Aluno.
  const studentHashOp = await bcrypt.hash(STUDENT_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: STUDENT_EMAIL },
    update: { passwordHash: studentHashOp, role: 'STUDENT', isActive: true },
    create: {
      id: 'usr-op-aluno',
      name: 'Aluno FalaInstrutor',
      dob: '2000-01-01',
      cpf: '000.000.000-03',
      email: STUDENT_EMAIL,
      passwordHash: studentHashOp,
      role: 'STUDENT',
      isActive: true,
    },
  });

  // 2) Cursos (preservando os ids originais para casar com os cupons)
  // Resiliente: um curso com erro (ex.: code duplicado) é logado e ignorado,
  // sem abortar o seed inteiro.
  for (const c of SEED_COURSES) {
    try {
    await prisma.course.upsert({
      where: { id: c.id },
      update: {
        code: c.code,
        name: c.name,
        description: c.description,
        duration: c.duration,
        // price NÃO é sobrescrito no update: o preço é gerenciado no painel
        // (Gestão de Cursos) e deve sobreviver aos redeploys/seed.
        coverImage: c.coverImage,
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
        validityMonths: VALIDITY_BY_CODE[c.code] ?? 12,
        // Cursos de NR já entram elegíveis ao eSocial S-2245 (admin pode alterar).
        // Os códigos têm espaço ("NR 35"), por isso o \s* entre "NR" e o número.
        esocialEnabled: /^NR\s*\d/i.test(c.code),
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
    } catch (err) {
      console.warn(`[seed] curso ignorado (${c.id} / ${c.code}):`, (err as Error).message);
    }
  }

  // 2b) Provas no banco (correção autoritativa no servidor).
  // Preenche examQuestions quando o curso não tem prova OU quando ainda usa a
  // prova GENÉRICA e já existe uma prova temática para ele. NÃO sobrescreve
  // provas editadas no painel admin (que não batem com a genérica).
  const genericFirst = GENERIC_EXAM[0]?.question;
  const coursesNeedingExam = await prisma.course.findMany({ select: { id: true, examQuestions: true } });
  for (const c of coursesNeedingExam) {
    const current = (Array.isArray(c.examQuestions) ? c.examQuestions : []) as { question?: string }[];
    const themed = getExamQuestions(c.id);
    const themedAvailable = themed.length > 0 && themed[0]?.question !== genericFirst;
    const isGenericSaved = current.length > 0 && current[0]?.question === genericFirst;
    // 1) sem prova → preenche (temática se houver, senão genérica)
    // 2) prova genérica salva + existe temática → faz o upgrade
    if (current.length === 0 || (isGenericSaved && themedAvailable)) {
      await prisma.course.update({
        where: { id: c.id },
        data: { examQuestions: themed as unknown as Prisma.InputJsonValue },
      });
    }
  }

  // 2b-2) Slides: preenche o deck a partir de SLIDES_BY_CODE[code] APENAS quando
  // o curso ainda não tem slides salvos (preserva edições do Gerenciador de Slides).
  const coursesNeedingSlides = await prisma.course.findMany({ select: { id: true, code: true, slides: true } });
  for (const c of coursesNeedingSlides) {
    const current = Array.isArray(c.slides) ? c.slides : [];
    if (current.length > 0) continue;
    const deck = SLIDES_BY_CODE[c.code];
    if (!deck || deck.length === 0) continue;
    await prisma.course.update({
      where: { id: c.id },
      data: { slides: deck as unknown as Prisma.InputJsonValue },
    });
  }

  // 2b-1) Prova da NR 06: atualiza para a versão canônica (alinhada ao vídeo do
  // treinamento). Sobrescreve a prova anterior deste curso especificamente.
  await prisma.course
    .update({
      where: { id: 'course-nr06' },
      data: { examQuestions: getExamQuestions('course-nr06') as unknown as Prisma.InputJsonValue },
    })
    .catch(() => {});

  // 2c) Magnus Leandro de Souza como instrutor da NR 10 (e registrado na base).
  await prisma.instructor.deleteMany({ where: { courseId: 'course-nr10' } }).catch(() => {});
  await prisma.instructor
    .create({
      data: {
        name: 'Magnus Leandro de Souza',
        formation: 'Engenheiro de Segurança do Trabalho',
        crea: 'SP 5070766148',
        icpEnabled: true,
        courseId: 'course-nr10',
      },
    })
    .catch(() => {});

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

  // 3d) Planos de assinatura corporativa (recorrência). Cria se não existir;
  // preserva edições feitas no painel (não sobrescreve no update).
  const SEED_PLANS = [
    { id: 'plan-essencial', name: 'Essencial', priceMonthly: 199, maxEmployees: 20, highlight: false, sortOrder: 1,
      description: 'Ideal para pequenas equipes manterem as NRs em dia.',
      features: ['Até 20 colaboradores', 'Todos os treinamentos EaD', 'Certificados com validação pública', 'Painel de conformidade', 'Alertas de vencimento'] },
    { id: 'plan-profissional', name: 'Profissional', priceMonthly: 399, maxEmployees: 50, highlight: true, sortOrder: 2,
      description: 'Para empresas em crescimento, com gestão completa de SST.',
      features: ['Até 50 colaboradores', 'Tudo do Essencial', 'Relatório de auditoria (MTE)', 'Restrição de horário de acesso', 'Suporte prioritário'] },
    { id: 'plan-corporativo', name: 'Corporativo', priceMonthly: 799, maxEmployees: null, highlight: false, sortOrder: 3,
      description: 'Colaboradores ilimitados e atendimento dedicado.',
      features: ['Colaboradores ilimitados', 'Tudo do Profissional', 'Gestor de conta dedicado', 'Trilhas por cargo/função', 'Onboarding assistido'] },
  ];
  for (const p of SEED_PLANS) {
    await prisma.plan.upsert({
      where: { id: p.id },
      update: {}, // preserva edições do painel
      create: {
        id: p.id, name: p.name, description: p.description, priceMonthly: p.priceMonthly,
        maxEmployees: p.maxEmployees, highlight: p.highlight, sortOrder: p.sortOrder, isActive: true,
        features: p.features as unknown as Prisma.InputJsonValue,
      },
    }).catch(() => {});
  }

  // 3e) Trilhas por cargo/função (templates). Cria se não existir.
  const SEED_JOBROLES = [
    { id: 'role-eletricista', name: 'Eletricista', courseCodes: ['NR 10', 'NR 35', 'NR 06'], description: 'Atividades em instalações e serviços com eletricidade.' },
    { id: 'role-empilhadeira', name: 'Operador de Empilhadeira', courseCodes: ['NR 11', 'NR 06'], description: 'Movimentação e transporte de materiais.' },
    { id: 'role-altura', name: 'Trabalho em Altura', courseCodes: ['NR 35', 'NR 06'], description: 'Atividades acima de 2 metros.' },
    { id: 'role-confinado', name: 'Espaço Confinado', courseCodes: ['NR 33', 'NR 06'], description: 'Entrada e trabalho em espaços confinados.' },
    { id: 'role-construcao', name: 'Construção Civil', courseCodes: ['NR 18', 'NR 35', 'NR 06'], description: 'Obras e canteiros.' },
    { id: 'role-cipa', name: 'Membro da CIPA', courseCodes: ['NR 05', 'NR 06'], description: 'Comissão Interna de Prevenção de Acidentes.' },
  ];
  for (const r of SEED_JOBROLES) {
    await prisma.jobRole.upsert({
      where: { id: r.id },
      update: {},
      create: { id: r.id, name: r.name, description: r.description, isActive: true, courseCodes: r.courseCodes as unknown as Prisma.InputJsonValue },
    }).catch(() => {});
  }

  // Dados de demonstração (aluno/empresa/instrutor de exemplo).
  // Em PRODUÇÃO ficam DESLIGADOS por padrão: defina SEED_DEMO=true para criá-los.
  // Quando desligado, o seed também REMOVE quaisquer contas demo já existentes,
  // deixando apenas o admin master e os dados reais (cursos, instrutores, cupons).
  const SEED_DEMO = process.env.SEED_DEMO === 'true';
  const DEMO_USER_IDS = ['usr-2', 'usr-3', 'usr-company', 'usr-instrutor'];
  const DEMO_COMPANY_ID = 'comp-demo';

  if (!SEED_DEMO) {
    // Limpeza (idempotente): cascade remove matrículas, sessões e afins dos demo.
    await prisma.user.deleteMany({ where: { id: { in: DEMO_USER_IDS } } }).catch(() => {});
    await prisma.company.deleteMany({ where: { id: DEMO_COMPANY_ID } }).catch(() => {});
  } else {
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
    // Matrícula concluída e aprovada na NR 35, com certificado já liberado
    // (homologado) pelo instrutor — pronto para validação pública.
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: s.id, courseId: 'course-nr35' } },
      update: { progress: 100, passed: true, examScore: 100, released: true, releasedAt: new Date(), certificateCode: s.certificateCode },
      create: {
        userId: s.id,
        courseId: 'course-nr35',
        progress: 100,
        passed: true,
        examScore: 100,
        released: true,
        releasedAt: new Date(),
        certificateCode: s.certificateCode,
      },
    });
  }

  // Jéssica da Silva Ribeiro (usr-2) associada ao treinamento NR 06.
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: 'usr-2', courseId: 'course-nr06' } },
    update: {}, // não sobrescreve progresso/aprovação se já existir
    create: {
      userId: 'usr-2',
      courseId: 'course-nr06',
      progress: 0,
      passed: false,
    },
  });

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
  } // fim do bloco de demonstração (SEED_DEMO)

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
  // Responsável técnico dos treinamentos (configurável no painel → Arquivos).
  const techResponsible = [
    {
      name: 'Magnus Leandro de Souza',
      title: 'Engenheiro de Segurança do Trabalho',
      register: 'CREA-SP 5070766148',
      document: 'CPF 221.761.998-55',
      fileUrl: '/arquivos/CREA-MAGNUS-LEANDRO-DE-SOUZA.pdf',
    },
  ];
  // Documentos da aba Arquivos.
  const adminFiles = [
    {
      id: 'doc-crea-magnus',
      name: 'CREA — Magnus Leandro de Souza',
      category: 'Responsável Técnico',
      url: '/arquivos/CREA-MAGNUS-LEANDRO-DE-SOUZA.pdf',
      date: '2026-06-24',
    },
  ];
  for (const [key, data] of [['news', news], ['partners', partners], ['tech_responsible', techResponsible], ['admin_files', adminFiles]] as const) {
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
