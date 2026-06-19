/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course, Instructor, User, Enrollment, SalesTransaction, Coupon, Comment, ContactMessage, LayoutConfig, PaymentConfig, StudentExamSubmission, ExamQuestion } from './types';

export const INITIAL_LAYOUT_CONFIG: LayoutConfig = {
  companyName: "FalaInstrutor",
  hostname: "https://falainstrutor.com.br",
  instagramUrl: "https://instagram.com/falainstrutor.treinamentos",
  youtubeUrl: "https://youtube.com/falainstrutor",
  linkedinUrl: "",
  phone: "+55 (11) 99625-5102",
  primaryColor: "#0f172a", // slate-900
  secondaryColor: "#eab308", // yellow-500
  backgroundColor: "#f8fafc", // slate-50
  logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=150&h=50&q=80", // placeholder logo
};

export const INITIAL_PAYMENT_CONFIG: PaymentConfig = {
  asaasToken: "7f4019a5bd8e0e31aaa5bad8e0ed04f7fc4",
  mercadoPagoToken: "MP-TOKEN-9f93ee7ba8310aaa5bad8",
  activeAcquirer: "Asaas",
  maxInstallments: 3,
  softDescriptor: "FALAINSTRUTOR",
  cnpj: "60.511.651/0001-78",
  cep: "01000-000",
  street: "Rua das harpas",
  number: "24",
  complement: "",
  neighborhood: "",
  city: "São Paulo",
  state: "SP",
  digitalCertificateName: "ADRIANO_APARECIDO_RIBAS_RICARDO_CERT.pfx",
  digitalCertificateHolder: "Adriano Aparecido Ribas Ricardo",
  digitalCertificateIssuer: "AC SOLUTI Múltipla v5 — ICP-Brasil",
  digitalCertificateSerial: "493D260213579194",
  digitalCertificateValidUntil: "13/02/2027",
};

export const SEED_USERS: User[] = [
  {
    id: "usr-1",
    name: "Adriano Ricardo",
    dob: "1985-04-15",
    cpf: "062.349.933-88",
    email: "adriano.ricardo01@gmail.com",
    password: "Anthony9936#",
    role: "admin",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    registeredAt: "2025-06-10",
  },
  {
    id: "usr-2",
    name: "Jéssica da Silva Ribeiro",
    dob: "1995-08-24",
    cpf: "110.887.259-11",
    email: "jessica@gmail.com",
    role: "student",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    registeredAt: "2025-06-11",
  },
  {
    id: "usr-3",
    name: "Thiago Aparecido Ramos",
    dob: "1988-02-14",
    cpf: "083.551.492-49",
    email: "thiago.ramos@empresa.com",
    role: "student",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    registeredAt: "2025-06-12",
  },
  {
    id: "usr-4",
    name: "Patrícia Teste da Silva",
    dob: "1994-11-30",
    cpf: "155.991.437-54",
    email: "patricia.teste@gmail.com",
    role: "student",
    isActive: true,
    registeredAt: "2025-06-12",
  },
  {
    id: "usr-5",
    name: "Gabriel Couto de Souza",
    dob: "2000-01-15",
    cpf: "135.918.472-10",
    email: "gabriel.couto@empresa.com",
    role: "student",
    isActive: true,
    registeredAt: "2025-06-13",
  }
];

// Instrutor responsável padrão (pode ser ajustado por curso no painel admin).
const INSTRUTOR_PADRAO: Instructor = {
  id: "inst-adriano",
  name: "Adriano Aparecido Ribas Ricardo",
  formation: "Técnico de Segurança do Trabalho",
  mte: "0124684/SP",
  crea: "",
  icpEnabled: true,
};

const IMG = {
  eletric: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=350&q=80",
  empilhadeira: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&h=350&q=80",
  altura: "https://images.unsplash.com/photo-1541535650810-10d26f5c2ab3?auto=format&fit=crop&w=600&h=350&q=80",
  fogo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&h=350&q=80",
  maquinas: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&h=350&q=80",
  construcao: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&h=350&q=80",
  geral: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&h=350&q=80",
};

export const SEED_COURSES: Course[] = [
  {
    id: "course-nr01", code: "NR 01", name: "NR 01 - Integração de Segurança do Trabalho",
    description: "Treinamento admissional obrigatório: disposições gerais, gerenciamento de riscos ocupacionais, ordens de serviço, direitos e deveres em SST.",
    duration: 4, price: 40, isActive: true, isFeatured: false, coverImage: IMG.geral,
    modules: ["Módulo 01 - Disposições Gerais da NR 01", "Módulo 02 - Gerenciamento de Riscos Ocupacionais (GRO/PGR)", "Módulo 03 - Ordens de Serviço e Direitos e Deveres", "Módulo 04 - Integração ao Ambiente de Trabalho"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr05", code: "NR 05", name: "NR 05 - CIPA - Comissão Interna de Prevenção de Acidentes",
    description: "Capacitação para membros da CIPA: prevenção de acidentes e doenças, mapa de riscos, investigação de acidentes e a Comissão Interna de Prevenção de Acidentes e Assédio.",
    duration: 20, price: 180, isActive: true, isFeatured: false, coverImage: IMG.geral,
    modules: ["Módulo 01 - Organização e Atribuições da CIPA", "Módulo 02 - Mapa de Riscos Ambientais", "Módulo 03 - Investigação e Análise de Acidentes", "Módulo 04 - Prevenção de Doenças Ocupacionais", "Módulo 05 - Noções de Combate a Incêndio e Primeiros Socorros"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr06", code: "NR 06", name: "NR 06 - Equipamentos de Proteção Individual (EPI)",
    description: "Seleção, uso, guarda e conservação dos EPI; responsabilidades do empregador e do trabalhador e fichas de controle de entrega.",
    duration: 4, price: 40, isActive: true, isFeatured: true, coverImage: IMG.geral,
    modules: ["Módulo 01 - O que é o Equipamento de Proteção Individual", "Módulo 02 - Responsabilidades (Empregador, Trabalhador e Fabricante)", "Módulo 03 - Tipos de EPI por Região do Corpo", "Módulo 04 - Higienização, Guarda e Ficha de Controle de EPI"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr10", code: "NR 10", name: "NR 10 e SEP - Segurança em Instalações e Serviços em Eletricidade",
    description: "Segurança em instalações e serviços em eletricidade e Sistema Elétrico de Potência (SEP): riscos elétricos, medidas de controle, aterramento e procedimentos.",
    duration: 40, price: 350, isActive: true, isFeatured: true, coverImage: IMG.eletric,
    modules: ["Módulo 01 - Introdução à Segurança com Eletricidade", "Módulo 02 - Riscos em Instalações e Serviços", "Módulo 03 - Técnicas de Análise de Risco Elétrico", "Módulo 04 - Medidas de Controle (EPC e EPI)", "Módulo 05 - Sistema Elétrico de Potência (SEP) e Proximidades", "Módulo 06 - Procedimentos, Acidentes e Primeiros Socorros"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: ["Bloqueio e Travamento de Disjuntores", "Aterramento Temporário"],
  },
  {
    id: "course-nr11", code: "NR 11", name: "NR 11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais",
    description: "Operação segura de equipamentos de transporte e movimentação de cargas (empilhadeiras), estabilidade, sinalização e armazenagem.",
    duration: 16, price: 226, isActive: true, isFeatured: true, coverImage: IMG.empilhadeira,
    modules: ["Módulo 01 - Legislação e Conceitos da NR 11", "Módulo 02 - Tipos de Equipamentos e Componentes", "Módulo 03 - Estabilidade e Equilíbrio de Carga", "Módulo 04 - Checklist e Inspeção", "Módulo 05 - Técnicas de Movimentação e Armazenagem"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: ["Operação e Manobra em Rampa com Carga", "Empilhamento e Desempilhamento Seguro"],
  },
  {
    id: "course-nr12", code: "NR 12", name: "NR 12 - Segurança no Trabalho em Máquinas e Equipamentos",
    description: "Princípios e medidas de proteção em máquinas e equipamentos: dispositivos de segurança, proteções fixas e móveis, manutenção e procedimentos de trabalho.",
    duration: 8, price: 199, isActive: true, isFeatured: true, coverImage: IMG.maquinas,
    modules: ["Módulo 01 - Princípios Gerais da NR 12", "Módulo 02 - Arranjo Físico e Dispositivos de Segurança", "Módulo 03 - Proteções Fixas e Móveis", "Módulo 04 - Manutenção, Inspeção e Procedimentos de Trabalho"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr13", code: "NR 13", name: "NR 13 - Caldeiras, Vasos de Pressão e Tubulações",
    description: "Segurança na operação de caldeiras, vasos de pressão e tubulações: inspeção, dispositivos de segurança, riscos e procedimentos operacionais.",
    duration: 16, price: 280, isActive: true, isFeatured: false, coverImage: IMG.maquinas,
    modules: ["Módulo 01 - Conceitos e Classificação", "Módulo 02 - Dispositivos de Segurança", "Módulo 03 - Operação e Inspeção de Segurança", "Módulo 04 - Riscos e Procedimentos de Emergência"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr17", code: "NR 17", name: "NR 17 - Ergonomia",
    description: "Adaptação das condições de trabalho às características psicofisiológicas dos trabalhadores: levantamento de carga, mobiliário, organização e AET.",
    duration: 8, price: 159, isActive: true, isFeatured: false, coverImage: IMG.geral,
    modules: ["Módulo 01 - Fundamentos de Ergonomia", "Módulo 02 - Levantamento e Transporte de Cargas", "Módulo 03 - Mobiliário e Posto de Trabalho", "Módulo 04 - Organização do Trabalho e AET"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr18", code: "NR 18", name: "NR 18 - Condições e Meio Ambiente de Trabalho na Indústria da Construção",
    description: "Diretrizes de segurança e saúde na construção civil: PCMAT/PGR, áreas de vivência, proteções coletivas, escavações e trabalho em andaimes.",
    duration: 8, price: 189, isActive: true, isFeatured: false, coverImage: IMG.construcao,
    modules: ["Módulo 01 - Programa de Gerenciamento de Riscos na Construção", "Módulo 02 - Áreas de Vivência e Sinalização", "Módulo 03 - Proteções Coletivas (Guarda-corpo e Plataformas)", "Módulo 04 - Andaimes, Escavações e Demolições"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr20", code: "NR 20", name: "NR 20 - Segurança e Saúde no Trabalho com Inflamáveis e Combustíveis",
    description: "Trabalho seguro com líquidos e gases inflamáveis e combustíveis: classificação das instalações, riscos, prevenção e resposta a emergências.",
    duration: 8, price: 199, isActive: true, isFeatured: false, coverImage: IMG.fogo,
    modules: ["Módulo 01 - Classificação das Instalações", "Módulo 02 - Propriedades dos Inflamáveis e Combustíveis", "Módulo 03 - Riscos e Medidas de Controle", "Módulo 04 - Prevenção e Combate a Emergências"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr23", code: "NR 23", name: "NR 23 - Proteção Contra Incêndios",
    description: "Prevenção e combate a princípios de incêndio: classes de fogo, equipamentos de extinção, saídas de emergência e plano de abandono.",
    duration: 4, price: 120, isActive: true, isFeatured: false, coverImage: IMG.fogo,
    modules: ["Módulo 01 - Teoria do Fogo e Classes de Incêndio", "Módulo 02 - Equipamentos de Combate (Extintores e Hidrantes)", "Módulo 03 - Saídas de Emergência e Sinalização", "Módulo 04 - Plano de Abandono e Brigada"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: ["Manuseio de Extintores por Classe de Fogo"],
  },
  {
    id: "course-nr31", code: "NR 31", name: "NR 31 - Segurança e Saúde no Trabalho na Agricultura, Pecuária, Silvicultura, Exploração Florestal e Aquicultura",
    description: "Segurança nas atividades agrárias: agrotóxicos, máquinas agrícolas, ergonomia rural e gerenciamento de riscos no campo.",
    duration: 8, price: 189, isActive: true, isFeatured: false, coverImage: IMG.geral,
    modules: ["Módulo 01 - Gestão de SST no Meio Rural", "Módulo 02 - Agrotóxicos e Produtos Químicos", "Módulo 03 - Máquinas e Implementos Agrícolas", "Módulo 04 - Ergonomia e Condições de Trabalho Rural"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr33", code: "NR 33", name: "NR 33 - Segurança e Saúde nos Trabalhos em Espaços Confinados",
    description: "Capacitação para trabalho em espaços confinados: identificação, monitoramento atmosférico, permissão de entrada e trabalho (PET) e resgate.",
    duration: 16, price: 280, isActive: true, isFeatured: false, coverImage: IMG.maquinas,
    modules: ["Módulo 01 - Definições e Reconhecimento de Espaços Confinados", "Módulo 02 - Riscos e Monitoramento Atmosférico", "Módulo 03 - Permissão de Entrada e Trabalho (PET)", "Módulo 04 - Resgate e Primeiros Socorros"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: ["Monitoramento de Gases e Ventilação", "Simulado de Resgate"],
  },
  {
    id: "course-nr35", code: "NR 35", name: "NR 35 - Segurança no Trabalho em Altura",
    description: "Capacitação para trabalho acima de 2 metros: análise de risco, sistemas de ancoragem, EPI antiqueda e resgate em altura.",
    duration: 8, price: 199, isActive: true, isFeatured: true, coverImage: IMG.altura,
    modules: ["Módulo 01 - Regulamentação Jurídica Aplicável - NR 35", "Módulo 02 - Análise de Riscos e Condições Impeditivas", "Módulo 03 - Sistemas, Equipamentos e Procedimentos de Proteção Coletiva", "Módulo 04 - Linha de Vida, Cabo de Aço e Pontos de Ancoragem Seguros", "Módulo 05 - EPI Para Trabalho em Altura: Seleção, Uso e Critérios de Inspeção", "Módulo 06 - Resgate Emergencial em Altura e Primeiros Socorros"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: ["Instalação com Ancoragem de Cabos Recartilhados", "Inspeção e Descarte de Cinto de Segurança"],
  },
  {
    id: "course-nr38", code: "NR 38", name: "NR 38 - Segurança e Saúde no Trabalho nas Atividades de Limpeza Urbana e Manejo de Resíduos Sólidos",
    description: "Segurança na limpeza urbana e manejo de resíduos sólidos: riscos biológicos e de trânsito, coleta, EPI e procedimentos operacionais.",
    duration: 8, price: 169, isActive: true, isFeatured: false, coverImage: IMG.geral,
    modules: ["Módulo 01 - Disposições Gerais da NR 38", "Módulo 02 - Riscos Biológicos, Químicos e de Trânsito", "Módulo 03 - Coleta, Varrição e Manejo de Resíduos", "Módulo 04 - EPI e Procedimentos Operacionais Seguros"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
];

/**
 * Conteúdo programático detalhado por Norma Regulamentadora (impresso no verso
 * do certificado). Chave = código do curso (ex.: "NR 35"). Quando ausente, o
 * verso usa os módulos do próprio curso como fallback.
 */
export const CONTEUDO_PROGRAMATICO: Record<string, string[]> = {
  "NR 01": [
    "Disposições gerais e campo de aplicação da NR-01",
    "Direitos e deveres do empregador e dos trabalhadores",
    "Ordens de serviço sobre segurança e saúde no trabalho",
    "Gerenciamento de Riscos Ocupacionais (GRO)",
    "Programa de Gerenciamento de Riscos (PGR): inventário e plano de ação",
    "Identificação de perigos e avaliação de riscos ocupacionais",
    "Medidas de prevenção e hierarquia de controle",
    "Capacitação, treinamentos e integração ao ambiente de trabalho",
    "Responsabilidade solidária e documentação do SST",
  ],
  "NR 05": [
    "Objetivos e organização da CIPA",
    "Atribuições, composição e processo eleitoral",
    "Mapa de riscos ambientais: elaboração e finalidade",
    "Identificação e classificação dos riscos (físicos, químicos, biológicos, ergonômicos e de acidentes)",
    "Investigação e análise de acidentes e doenças do trabalho",
    "Medidas de prevenção de acidentes e doenças ocupacionais",
    "Prevenção e combate ao assédio (Lei 14.457/2022)",
    "Noções de combate a incêndio e primeiros socorros",
    "Legislação previdenciária e normas aplicáveis",
  ],
  "NR 06": [
    "Conceito de Equipamento de Proteção Individual (EPI)",
    "Certificado de Aprovação (CA) e exigências legais",
    "Responsabilidades do empregador, do trabalhador e do fabricante",
    "Tipos de EPI por região do corpo (cabeça, olhos, face, auditiva, respiratória, tronco, membros)",
    "Critérios de seleção do EPI conforme o risco",
    "Uso correto, higienização, guarda e conservação",
    "Ficha de controle e fornecimento de EPI",
    "Inspeção, vida útil e descarte de EPIs",
  ],
  "NR 10": [
    "Introdução à segurança em instalações e serviços em eletricidade",
    "Riscos elétricos: choque, arco elétrico, campos eletromagnéticos",
    "Técnicas de análise de risco e medidas de controle (EPC e EPI)",
    "Desenergização e procedimentos de trabalho seguro",
    "Aterramento elétrico temporário e equipotencialização",
    "Sistema Elétrico de Potência (SEP) e trabalhos em proximidade",
    "Documentação e prontuário das instalações elétricas",
    "Acidentes de origem elétrica, proteção e combate a incêndio",
    "Primeiros socorros e responsabilidades",
  ],
  "NR 11": [
    "Legislação e conceitos da NR-11",
    "Transporte, movimentação, armazenagem e manuseio de materiais",
    "Tipos de equipamentos de transporte e seus componentes",
    "Estabilidade, equilíbrio e capacidade de carga",
    "Inspeção e checklist de equipamentos",
    "Sinalização e regras de circulação interna",
    "Técnicas seguras de movimentação e empilhamento",
    "Prevenção de acidentes na operação",
  ],
  "NR 12": [
    "Princípios gerais e campo de aplicação da NR-12",
    "Arranjo físico e instalações de máquinas e equipamentos",
    "Dispositivos de partida, acionamento e parada de emergência",
    "Sistemas de segurança: proteções fixas e móveis",
    "Componentes pressurizados e dispositivos de segurança",
    "Manutenção, inspeção e procedimentos de trabalho seguro",
    "Capacitação e procedimentos operacionais",
    "Análise de riscos em máquinas e equipamentos",
  ],
  "NR 13": [
    "Conceitos e classificação de caldeiras e vasos de pressão",
    "Categorias e tubulações de interligação",
    "Dispositivos de segurança e instrumentos de controle",
    "Operação segura e supervisão",
    "Inspeção de segurança inicial, periódica e extraordinária",
    "Prontuário e documentação obrigatória",
    "Riscos, falhas e procedimentos de emergência",
    "Profissional habilitado e responsabilidades",
  ],
  "NR 17": [
    "Fundamentos e objetivos da Ergonomia",
    "Análise Ergonômica do Trabalho (AET)",
    "Levantamento, transporte e descarga individual de materiais",
    "Mobiliário e equipamentos dos postos de trabalho",
    "Condições ambientais de trabalho (iluminação, ruído, temperatura)",
    "Organização do trabalho e pausas",
    "Trabalho em teleatendimento/telemarketing (Anexos)",
    "Prevenção de distúrbios osteomusculares (LER/DORT)",
  ],
  "NR 18": [
    "Programa de Gerenciamento de Riscos (PGR) na construção civil",
    "Áreas de vivência e instalações sanitárias",
    "Sinalização de segurança no canteiro de obras",
    "Proteções coletivas: guarda-corpo, plataformas e redes",
    "Escadas, rampas e passarelas",
    "Andaimes e plataformas de trabalho",
    "Escavações, fundações e demolições",
    "Movimentação e transporte de materiais e instalações elétricas temporárias",
  ],
  "NR 20": [
    "Classificação das instalações quanto a inflamáveis e combustíveis",
    "Propriedades físico-químicas e riscos dos produtos",
    "Projeto, construção, operação e manutenção das instalações",
    "Análise de riscos e medidas de controle",
    "Procedimentos e permissão de trabalho",
    "Prevenção e controle de vazamentos, derrames e incêndios",
    "Plano de resposta a emergências",
    "Capacitação dos trabalhadores conforme a classe da instalação",
  ],
  "NR 23": [
    "Teoria do fogo: triângulo e tetraedro do fogo",
    "Classes de incêndio (A, B, C, D, K)",
    "Métodos de extinção e agentes extintores",
    "Equipamentos de combate: extintores e hidrantes",
    "Sistemas de detecção e alarme de incêndio",
    "Saídas de emergência e sinalização",
    "Plano de abandono de área e brigada de incêndio",
    "Procedimentos em situação de emergência",
  ],
  "NR 31": [
    "Gestão de SST no trabalho rural",
    "Riscos químicos: agrotóxicos, adjuvantes e produtos afins",
    "Máquinas, equipamentos e implementos agrícolas",
    "Ergonomia e organização do trabalho no campo",
    "Riscos biológicos e medidas de proteção",
    "Trabalho com animais e em silvicultura",
    "Medidas de proteção pessoal e coletiva",
    "Primeiros socorros e situações de emergência no meio rural",
  ],
  "NR 33": [
    "Definições e reconhecimento de espaços confinados",
    "Riscos atmosféricos, físicos, químicos e biológicos",
    "Monitoramento e avaliação atmosférica",
    "Permissão de Entrada e Trabalho (PET)",
    "Funções: supervisor de entrada, vigia e trabalhador autorizado",
    "Equipamentos de proteção e de monitoramento",
    "Procedimentos de entrada, trabalho e saída seguros",
    "Resgate, emergência e primeiros socorros",
  ],
  "NR 35": [
    "Normas e regulamentos aplicáveis ao trabalho em altura",
    "Análise de Risco (AR) e condições impeditivas",
    "Riscos potenciais inerentes ao trabalho em altura e medidas de controle",
    "Sistemas, equipamentos e procedimentos de proteção coletiva",
    "EPI para trabalho em altura: seleção, inspeção, conservação e limitação de uso",
    "Sistemas de ancoragem, linha de vida e pontos de fixação",
    "Acidentes típicos de trabalho em altura",
    "Condutas em emergências, técnicas de resgate e primeiros socorros",
  ],
  "NR 38": [
    "Disposições gerais da NR-38 e responsabilidades",
    "Riscos biológicos, químicos, físicos e de trânsito",
    "Coleta, varrição e manejo de resíduos sólidos",
    "Operação segura de veículos e equipamentos",
    "Medidas de proteção coletiva e individual",
    "Procedimentos operacionais seguros",
    "Vacinação e cuidados com a saúde do trabalhador",
    "Situações de emergência e primeiros socorros",
  ],
};

export const SEED_COUPONS: Coupon[] = [
  {
    id: "cup-1",
    code: "COUPON100",
    description: "Desconto de 100% no valor total",
    value: 100,
    type: "percentage",
    isActive: true,
    associatedProducts: ["course-nr10", "course-nr11", "course-nr35", "course-loto"]
  },
  {
    id: "cup-2",
    code: "VALE25",
    description: "Desconto de 25% em Direção Secundária",
    value: 25,
    type: "percentage",
    isActive: true,
    associatedProducts: ["course-dirdef-16", "course-nr345"]
  },
  {
    id: "cup-3",
    code: "50DESCONTO",
    description: "Metade do preço em todos os cursos",
    value: 50,
    type: "percentage",
    isActive: true,
    associatedProducts: ["course-nr10", "course-nr11", "course-nr345", "course-nr35", "course-dirdef-16", "course-loto"]
  }
];

export const SEED_ENROLLMENTS: Enrollment[] = [
  {
    id: "enr-1",
    userId: "usr-2",
    userName: "Jéssica da Silva Ribeiro",
    userEmail: "jessica@gmail.com",
    courseId: "course-nr35",
    courseName: "NR 35 - Segurança no Trabalho em Altura",
    courseCode: "NR 35",
    progress: 100,
    startDate: "2026-05-20",
    examScore: 100,
    passed: true,
    certificateCode: "CERT-35-JESSICA-01A",
    enrolledAt: "2026-05-20"
  },
  {
    id: "enr-2",
    userId: "usr-2",
    userName: "Jéssica da Silva Ribeiro",
    userEmail: "jessica@gmail.com",
    courseId: "course-nr10",
    courseName: "NR 10 - Básico - Segurança em Instalações e Serviços em Eletricidade",
    courseCode: "NR 10",
    progress: 40,
    startDate: "2026-05-21",
    examScore: null,
    passed: false,
    certificateCode: null,
    enrolledAt: "2026-05-21"
  },
  {
    id: "enr-3",
    userId: "usr-3",
    userName: "Thiago Aparecido Ramos",
    userEmail: "thiago.ramos@empresa.com",
    courseId: "course-nr35",
    courseName: "NR 35 - Trabalho em Altura",
    courseCode: "NR 35",
    progress: 100,
    startDate: "2026-05-22",
    examScore: 100,
    passed: true,
    certificateCode: "CERT-35-THIAGO-02B",
    enrolledAt: "2026-05-22"
  },
  {
    id: "enr-4",
    userId: "usr-1",
    userName: "Adriano Ricardo",
    userEmail: "adriano.ricardo01@gmail.com",
    courseId: "course-loto",
    courseName: "Loto - Lockout e Tagout",
    courseCode: "LOTO",
    progress: 0,
    startDate: "2026-05-23",
    examScore: null,
    passed: false,
    certificateCode: null,
    enrolledAt: "2026-05-23"
  }
];

export const SEED_TRANSACTIONS: SalesTransaction[] = [
  {
    id: "tx-1",
    userId: "usr-2",
    userName: "Jéssica da Silva Ribeiro",
    courseName: "NR 35 - Segurança no Trabalho em Altura",
    total: 199,
    discount: 0,
    status: "active",
    installments: 1,
    date: "2026-05-20"
  },
  {
    id: "tx-2",
    userId: "usr-2",
    userName: "Jéssica da Silva Ribeiro",
    courseName: "NR 10 - Básico - Segurança em Instalações",
    total: 250,
    discount: 0,
    status: "open",
    installments: 3,
    date: "2026-05-21"
  },
  {
    id: "tx-3",
    userId: "usr-3",
    userName: "Thiago Aparecido Ramos",
    courseName: "NR 35 - Segurança no Trabalho em Altura",
    total: 149.25,
    discount: 49.75,
    status: "active",
    installments: 1,
    couponCode: "VALE25",
    date: "2026-05-22"
  },
  {
    id: "tx-4",
    userId: "usr-4",
    userName: "Patrícia Teste da Silva",
    courseName: "NR 11 - Operador de Empilhadeira",
    total: 226,
    discount: 0,
    status: "canceled",
    installments: 2,
    date: "2026-05-22"
  }
];

export const SEED_COMMENTS: Comment[] = [
  {
    id: "com-1",
    userId: "usr-2",
    userName: "Jéssica da Silva Ribeiro",
    courseId: "course-nr35",
    courseName: "NR 35 - Segurança no Trabalho em Altura",
    text: "Adorei a explicação sobre a Zona de Livre Queda (ZLQ). Esse conceito agora ficou super transparente!",
    reply: "Excelente, Jéssica! A ZLQ é um dos fatores mais importantes para prevenir choques contra o solo em quedas suspensas. Bons estudos!",
    isPublic: true,
    date: "2026-05-22"
  },
  {
    id: "com-2",
    userId: "usr-3",
    userName: "Thiago Aparecido Ramos",
    courseId: "course-nr35",
    courseName: "NR 35 - Trabalho em Altura",
    text: "O cinto tipo paraquedista é de uso obrigatório a partir de qual altura definida na norma?",
    reply: "Olá, Thiago! A NR 35 estabelece que todo trabalho realizado acima de 2,00 m (dois metros) do plano de referência, onde haja risco de queda, requer o uso de proteção contra quedas apropriada (por exemplo, cinturão paraquedista conectado ao ponto de ancoragem). Abraços!",
    isPublic: true,
    date: "2026-05-23"
  }
];

export const SEED_CONTACTS: ContactMessage[] = [
  {
    id: "cnt-1",
    name: "Cláudio Negócios de Segurança",
    email: "financeiro@consultoriamege.com.br",
    phone: "(27) 99182-1249",
    subject: "Treinamentos no site em Lote",
    message: "Prezados da FalaInstrutor, possuímos um corpo de 45 operários que necessitam fazer o curso de Reciclagem NR10 e NR35 em formato semipresencial. Qual o percentual de desconto concedido para faturamento corporativo no boleto 30 dias?",
    date: "2026-06-01"
  },
  {
    id: "cnt-2",
    name: "Rodrigo Alberto",
    email: "roberto.contabilidade@gmail.com",
    phone: "(31) 98882-7700",
    subject: "Dúvida sobre homologação de certificados no CREA",
    message: "Gostaria de confirmar se todos os certificados emitidos na plataforma contam com a assinatura digital do responsável legal e a devida anotação de responsabilidade técnica (ART). Agilidade na entrega é importante.",
    date: "2026-06-03"
  }
];

/**
 * Question banks for the course exams
 */
export const RECORD_EXAMS: Record<string, ExamQuestion[]> = {
  "course-nr05": [
    {
      question: "Qual é a principal finalidade da CIPA segundo a NR 05?",
      options: [
        "A) Fiscalizar a jornada de trabalho dos empregados",
        "B) A prevenção de acidentes e doenças decorrentes do trabalho, preservando a vida e a saúde do trabalhador",
        "C) Substituir o setor de Recursos Humanos da empresa",
        "D) Apenas organizar confraternizações internas",
      ],
      correctIndex: 1,
    },
    {
      question: "Como é composta a CIPA?",
      options: [
        "A) Apenas por representantes indicados pelo empregador",
        "B) Somente por membros do sindicato da categoria",
        "C) Por representantes do empregador (indicados) e dos empregados (eleitos), em partes iguais",
        "D) Exclusivamente pelo técnico de segurança do trabalho",
      ],
      correctIndex: 2,
    },
    {
      question: "Como são escolhidos os representantes dos empregados na CIPA?",
      options: [
        "A) São indicados diretamente pelo empregador",
        "B) São eleitos em escrutínio secreto pelos próprios empregados",
        "C) São nomeados pelo sindicato",
        "D) São definidos por ordem de antiguidade na empresa",
      ],
      correctIndex: 1,
    },
    {
      question: "Qual é o período do mandato dos membros eleitos da CIPA?",
      options: [
        "A) Seis meses, sem direito a reeleição",
        "B) Um ano, permitida uma reeleição",
        "C) Dois anos, sem possibilidade de reeleição",
        "D) Mandato por tempo indeterminado",
      ],
      correctIndex: 1,
    },
    {
      question: "O que é o Mapa de Riscos elaborado com a participação da CIPA?",
      options: [
        "A) Um mapa das rotas de fuga em caso de incêndio",
        "B) Uma representação gráfica dos riscos ambientais nos diversos locais de trabalho",
        "C) A planta elétrica da edificação",
        "D) O organograma hierárquico da empresa",
      ],
      correctIndex: 1,
    },
    {
      question: "Os representantes dos empregados na CIPA possuem estabilidade no emprego. Por quanto tempo?",
      options: [
        "A) Não possuem nenhuma estabilidade",
        "B) Desde o registro da candidatura até um ano após o término do mandato",
        "C) Apenas durante o período de eleição",
        "D) Por cinco anos após a posse",
      ],
      correctIndex: 1,
    },
    {
      question: "Além de prevenir acidentes, a NR 05 atribuiu à CIPA ações de prevenção e combate a:",
      options: [
        "A) Sonegação fiscal",
        "B) Assédio e demais formas de violência no trabalho",
        "C) Concorrência desleal",
        "D) Atrasos na produção",
      ],
      correctIndex: 1,
    },
    {
      question: "O que deve ser feito quando a CIPA identifica um risco grave e iminente no ambiente de trabalho?",
      options: [
        "A) Aguardar a próxima reunião ordinária para discutir",
        "B) Solicitar imediatamente ao empregador medidas para eliminar ou neutralizar o risco e, se necessário, a interdição da atividade",
        "C) Ignorar, pois não é competência da CIPA",
        "D) Comunicar somente ao final do mandato",
      ],
      correctIndex: 1,
    },
    {
      question: "Com que frequência a CIPA deve se reunir ordinariamente?",
      options: [
        "A) Diariamente",
        "B) Mensalmente, conforme calendário preestabelecido",
        "C) Apenas uma vez por ano",
        "D) Somente quando ocorre um acidente",
      ],
      correctIndex: 1,
    },
    {
      question: "O que é a SIPAT, organizada com o apoio da CIPA?",
      options: [
        "A) Sindicato Interno de Profissionais e Trabalhadores",
        "B) Semana Interna de Prevenção de Acidentes do Trabalho",
        "C) Sistema Integrado de Pagamento de Adicionais Trabalhistas",
        "D) Serviço de Inspeção Periódica de Ambientes de Trabalho",
      ],
      correctIndex: 1,
    },
  ],
  "course-nr35": [
    {
      question: "O que deve ser verificado em equipamentos de proteção individual (EPI) antes de seu uso?",
      options: [
        "A) Apenas a cor",
        "B) Rachaduras, integridade física e datas válidas de inspeções",
        "C) Marca do fabricante",
        "D) Não necessitam de inspeção prévia"
      ],
      correctIndex: 1
    },
    {
      question: "Quais são os principais riscos potenciais em trabalhos em altura?",
      options: [
        "A) Acidentes, perdas de equilíbrio e quedas de pessoas ou ferramentas",
        "B) Aumento de produtividade",
        "C) Condições climáticas sempre estáveis",
        "D) Apenas fadiga menor"
      ],
      correctIndex: 0
    },
    {
      question: "O que é o fator de queda no trabalho em altura?",
      options: [
        "A) Um tipo de equipamento de segurança",
        "B) É a relação entre a altura da queda de um trabalhador e o comprimento do talabarte",
        "C) Uma medida de velocidade do vento",
        "D) Nenhuma das anteriores"
      ],
      correctIndex: 1
    },
    {
      question: "Qual é a altura mínima a partir da qual as atividades são consideradas trabalho em altura sob a NR 35?",
      options: [
        "A) Acima de 1,50 metros",
        "B) Acima de 2,00 metros",
        "C) Acima de 3,00 metros",
        "D) Acima de 5,00 metros"
      ],
      correctIndex: 1
    }
  ],
  "course-nr10": [
    {
      question: "Qual das opções abaixo representa uma medida de controle coletivo do risco elétrico?",
      options: [
        "A) Uso de luvas de borracha isolantes",
        "B) Painéis elétricos trancados com barreiras e isolamento das partes vivas",
        "C) Capacete classe B",
        "D) Jaleco resistente a arco elétrico"
      ],
      correctIndex: 1
    },
    {
      question: "Sob a ótica da NR 10, quem é considerado um profissional habilitado?",
      options: [
        "A) Profissional treinado internamente na empresa",
        "B) Aquele previamente cadastrado no Ministério do Trabalho sem registro de conselho",
        "C) Profissional graduado e registrado no respectivo conselho de classe (ex: CREA)",
        "D) Qualquer técnico com mais de 10 anos de experiência prática comprovada"
      ],
      correctIndex: 2
    }
  ],
  "course-nr11": [
    {
      question: "O que deve ser realizado obrigatoriamente antes de iniciar o turno de operação de uma empilhadeira?",
      options: [
        "A) Acelerar o motor por alguns minutos para aquecer",
        "B) O checklist de inspeção do equipamento (freios, garfos, pneus, alarmes)",
        "C) Buzinar três vezes para avisar a equipe",
        "D) Nenhuma verificação é necessária se a máquina é nova"
      ],
      correctIndex: 1
    },
    {
      question: "Ao transportar uma carga com a empilhadeira, os garfos devem permanecer:",
      options: [
        "A) Na maior altura possível para ter melhor visibilidade",
        "B) O mais baixo possível e ligeiramente inclinados para trás",
        "C) Totalmente nivelados e na altura dos olhos do operador",
        "D) Inclinados para a frente para facilitar a descarga"
      ],
      correctIndex: 1
    },
    {
      question: "Quem está autorizado a operar uma empilhadeira segundo a NR 11?",
      options: [
        "A) Qualquer funcionário disponível no momento",
        "B) Somente o trabalhador capacitado, autorizado por escrito e habilitado",
        "C) Estagiários acompanhados de qualquer colega",
        "D) Apenas o supervisor de logística"
      ],
      correctIndex: 1
    }
  ],
  "course-nr345": [
    {
      question: "O que é a Permissão de Trabalho (PT) em atividades de trabalho a quente?",
      options: [
        "A) Um documento que autoriza e formaliza as medidas de segurança antes do início da atividade",
        "B) Uma autorização verbal do encarregado",
        "C) A nota fiscal do equipamento de solda",
        "D) Um certificado emitido após o término do serviço"
      ],
      correctIndex: 0
    },
    {
      question: "Qual é o principal risco associado ao trabalho a quente em atmosferas inflamáveis?",
      options: [
        "A) Apenas o cansaço visual do soldador",
        "B) Incêndio e explosão provocados por fagulhas e calor intenso",
        "C) O aumento do ruído ambiente",
        "D) A oxidação lenta das peças metálicas"
      ],
      correctIndex: 1
    },
    {
      question: "Antes de iniciar a atividade a quente, é fundamental:",
      options: [
        "A) Remover ou isolar materiais combustíveis e inflamáveis das proximidades",
        "B) Desligar a iluminação do ambiente",
        "C) Aumentar a pressão dos cilindros de gás",
        "D) Dispensar o vigia de incêndio para agilizar"
      ],
      correctIndex: 0
    }
  ],
  "course-dirdef-16": [
    {
      question: "O que caracteriza a direção defensiva?",
      options: [
        "A) Dirigir sempre na maior velocidade permitida",
        "B) Conduzir de modo a prevenir acidentes apesar das ações dos outros e das condições adversas",
        "C) Usar a buzina constantemente",
        "D) Ultrapassar somente pela direita"
      ],
      correctIndex: 1
    },
    {
      question: "Qual é a distância de seguimento recomendada em condições normais de tráfego?",
      options: [
        "A) Manter pelo menos 2 segundos de distância do veículo à frente",
        "B) Encostar o mais próximo possível para não ser ultrapassado",
        "C) Não há recomendação, depende apenas da velocidade",
        "D) Exatamente 1 metro independente da velocidade"
      ],
      correctIndex: 0
    },
    {
      question: "Sob chuva intensa, a conduta defensiva correta é:",
      options: [
        "A) Aumentar a velocidade para sair logo da pista molhada",
        "B) Reduzir a velocidade, aumentar a distância de seguimento e acender os faróis",
        "C) Desligar os faróis para não ofuscar os outros",
        "D) Frear bruscamente ao primeiro sinal de aquaplanagem"
      ],
      correctIndex: 1
    }
  ],
  "course-loto": [
    {
      question: "O que significa a sigla LOTO no contexto de segurança industrial?",
      options: [
        "A) Lockout/Tagout - Bloqueio e Etiquetagem de fontes de energia",
        "B) Logística Operacional de Transporte e Obras",
        "C) Lista de Operações de Trabalho Ocupacional",
        "D) Local Otimizado de Trabalho Operacional"
      ],
      correctIndex: 0
    },
    {
      question: "Qual o objetivo do procedimento de bloqueio e etiquetagem (LOTO)?",
      options: [
        "A) Acelerar a manutenção dos equipamentos",
        "B) Garantir que máquinas permaneçam desligadas e sem energia durante a manutenção, evitando acionamentos acidentais",
        "C) Identificar quem é o dono da máquina",
        "D) Reduzir o consumo de energia elétrica da planta"
      ],
      correctIndex: 1
    },
    {
      question: "Após aplicar o bloqueio das fontes de energia, qual é a etapa final indispensável?",
      options: [
        "A) Testar e confirmar a condição de energia zero antes de iniciar o serviço",
        "B) Remover imediatamente o cadeado para testar a máquina",
        "C) Comunicar apenas verbalmente que a máquina está bloqueada",
        "D) Aguardar 24 horas obrigatoriamente"
      ],
      correctIndex: 0
    }
  ]
};

/**
 * Generic SST exam used as a safe fallback for any course that does not
 * have a dedicated question bank registered above. This guarantees that
 * every enrolled student is always able to take a valid exam and become
 * certified, instead of facing an empty exam (which previously produced
 * an invalid score and blocked certification).
 */
export const GENERIC_EXAM: ExamQuestion[] = [
  {
    question: "O uso correto dos Equipamentos de Proteção Individual (EPIs) é responsabilidade:",
    options: [
      "A) Exclusiva do empregador",
      "B) Do trabalhador, que deve usá-los, conservá-los e comunicar qualquer dano",
      "C) Apenas do setor de compras",
      "D) De ninguém, pois o uso é opcional"
    ],
    correctIndex: 1
  },
  {
    question: "Ao identificar uma condição insegura no ambiente de trabalho, o profissional deve:",
    options: [
      "A) Ignorar e continuar a tarefa",
      "B) Comunicar imediatamente o responsável e, se necessário, interromper a atividade",
      "C) Resolver sozinho sem avisar ninguém",
      "D) Esperar o fim do expediente para relatar"
    ],
    correctIndex: 1
  },
  {
    question: "As Normas Regulamentadoras (NRs) têm como principal finalidade:",
    options: [
      "A) Aumentar a burocracia das empresas",
      "B) Estabelecer requisitos de segurança e saúde para prevenir acidentes e doenças do trabalho",
      "C) Definir o salário dos trabalhadores",
      "D) Regular apenas o horário de almoço"
    ],
    correctIndex: 1
  },
  {
    question: "Em caso de acidente de trabalho, a primeira medida recomendada é:",
    options: [
      "A) Isolar a área, prestar/solicitar os primeiros socorros e acionar a emergência",
      "B) Remover a vítima rapidamente sem qualquer cuidado",
      "C) Continuar trabalhando normalmente",
      "D) Apagar os registros do ocorrido"
    ],
    correctIndex: 0
  }
];

/**
 * Returns the exam question bank for a given course. Falls back to the
 * generic SST exam when the course has no dedicated bank, ensuring the
 * exam/certification flow always works.
 */
export const getExamQuestions = (courseId: string): ExamQuestion[] => {
  const specific = RECORD_EXAMS[courseId];
  return specific && specific.length > 0 ? specific : GENERIC_EXAM;
};

export const SEED_EXAMS_SUBMISSIONS: StudentExamSubmission[] = [
  {
    id: "sub-1",
    userId: "usr-2",
    userName: "Jéssica da Silva Ribeiro",
    courseId: "course-nr35",
    courseCode: "NR 35",
    courseName: "NR 35 - Segurança no Trabalho em Altura",
    score: 100,
    answers: { 0: 1, 1: 0, 2: 1, 3: 1 },
    passed: true,
    date: "2026-05-20"
  },
  {
    id: "sub-2",
    userId: "usr-3",
    userName: "Thiago Aparecido Ramos",
    courseId: "course-nr35",
    courseCode: "NR 35",
    courseName: "NR 35 - Trabalho em Altura",
    score: 100,
    answers: { 0: 1, 1: 0, 2: 1, 3: 1 },
    passed: true,
    date: "2026-05-22"
  }
];
