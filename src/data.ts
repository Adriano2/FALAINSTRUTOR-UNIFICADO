/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course, Instructor, User, Enrollment, SalesTransaction, Coupon, Comment, ContactMessage, LayoutConfig, PaymentConfig, StudentExamSubmission, ExamQuestion } from './types';

export const INITIAL_LAYOUT_CONFIG: LayoutConfig = {
  companyName: "FalaInstrutor",
  hostname: "https://falainstrutor.com.br",
  instagramUrl: "https://instagram.com/falainstrutor.treinamentos",
  youtubeUrl: "https://www.youtube.com/@fala.Instrutor",
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

// Engenheiro de Segurança do Trabalho — responsável técnico (ex.: NR 10).
const INSTRUTOR_MAGNUS: Instructor = {
  id: "inst-magnus",
  name: "Magnus Leandro de Souza",
  formation: "Engenheiro de Segurança do Trabalho",
  crea: "SP 5070766148",
  icpEnabled: true,
};

// Instrutor responsável técnico em Química (cursos químicos).
const INSTRUTOR_GILVAN: Instructor = {
  id: "inst-gilvan",
  name: "Gilvan Ramos",
  formation: "Químico — Responsável Técnico",
  crq: "04453210",
  icpEnabled: true,
};

export const SEED_COURSES: Course[] = [
  {
    id: "course-nr01", code: "NR 01", name: "NR 01 - Integração de Segurança do Trabalho",
    description: "Treinamento admissional obrigatório: disposições gerais, gerenciamento de riscos ocupacionais, ordens de serviço, direitos e deveres em SST.",
    duration: 4, price: 40, isActive: true, isFeatured: false, coverImage: "/covers/course-nr01.svg",
    modules: ["Módulo 01 - Disposições Gerais da NR 01", "Módulo 02 - Gerenciamento de Riscos Ocupacionais (GRO/PGR)", "Módulo 03 - Ordens de Serviço e Direitos e Deveres", "Módulo 04 - Integração ao Ambiente de Trabalho"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr05", code: "NR 05", name: "NR 05 - CIPA - Comissão Interna de Prevenção de Acidentes",
    description: "Capacitação para membros da CIPA: prevenção de acidentes e doenças, mapa de riscos, investigação de acidentes e a Comissão Interna de Prevenção de Acidentes e Assédio.",
    duration: 20, price: 180, isActive: true, isFeatured: false, coverImage: "/covers/course-nr05.svg",
    modules: ["Módulo 01 - Organização e Atribuições da CIPA", "Módulo 02 - Mapa de Riscos Ambientais", "Módulo 03 - Investigação e Análise de Acidentes", "Módulo 04 - Prevenção de Doenças Ocupacionais", "Módulo 05 - Noções de Combate a Incêndio e Primeiros Socorros"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr06", code: "NR 06", name: "NR 06 - Equipamentos de Proteção Individual (EPI)",
    description: "Conceitos de EPI e EPC, responsabilidades (empregador, empregado e fabricante), Certificado de Aprovação (CA) e os tipos de EPI e seus funcionamentos.",
    duration: 2, price: 40, isActive: true, isFeatured: true, coverImage: "/covers/course-nr06.svg",
    modules: ["Módulo 01 - EPI e EPC (Conceitos)", "Módulo 02 - Responsabilidades e Certificado de Aprovação (CA)", "Módulo 03 - Tipos de EPI e seus Funcionamentos", "Módulo 04 - Equipamentos de Proteção Coletiva (EPC)", "Módulo 05 - Conclusão"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr10", code: "NR 10", name: "NR 10 e SEP - Segurança em Instalações e Serviços em Eletricidade",
    description: "Segurança em instalações e serviços em eletricidade e Sistema Elétrico de Potência (SEP): riscos elétricos, medidas de controle, aterramento e procedimentos.",
    duration: 40, price: 350, isActive: true, isFeatured: true, coverImage: "/covers/course-nr10.svg",
    modules: ["Módulo 01 - Introdução à Segurança com Eletricidade", "Módulo 02 - Riscos em Instalações e Serviços", "Módulo 03 - Técnicas de Análise de Risco Elétrico", "Módulo 04 - Medidas de Controle (EPC e EPI)", "Módulo 05 - Sistema Elétrico de Potência (SEP) e Proximidades", "Módulo 06 - Procedimentos, Acidentes e Primeiros Socorros"],
    instructors: [INSTRUTOR_MAGNUS], manualActivities: ["Bloqueio e Travamento de Disjuntores", "Aterramento Temporário"],
  },
  {
    id: "course-nr11", code: "NR 11", name: "NR 11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais",
    description: "Operação segura de equipamentos de transporte e movimentação de cargas (empilhadeiras), estabilidade, sinalização e armazenagem.",
    duration: 16, price: 226, isActive: true, isFeatured: true, coverImage: "/covers/course-nr11.svg",
    modules: ["Módulo 01 - Legislação e Conceitos da NR 11", "Módulo 02 - Tipos de Equipamentos e Componentes", "Módulo 03 - Estabilidade e Equilíbrio de Carga", "Módulo 04 - Checklist e Inspeção", "Módulo 05 - Técnicas de Movimentação e Armazenagem"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: ["Operação e Manobra em Rampa com Carga", "Empilhamento e Desempilhamento Seguro"],
  },
  {
    id: "course-nr12", code: "NR 12", name: "NR 12 - Segurança no Trabalho em Máquinas e Equipamentos",
    description: "Princípios e medidas de proteção em máquinas e equipamentos: dispositivos de segurança, proteções fixas e móveis, manutenção e procedimentos de trabalho.",
    duration: 8, price: 199, isActive: true, isFeatured: true, coverImage: "/covers/course-nr12.svg",
    modules: ["Módulo 01 - Princípios Gerais da NR 12", "Módulo 02 - Arranjo Físico e Dispositivos de Segurança", "Módulo 03 - Proteções Fixas e Móveis", "Módulo 04 - Manutenção, Inspeção e Procedimentos de Trabalho"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr13", code: "NR 13", name: "NR 13 - Caldeiras, Vasos de Pressão e Tubulações",
    description: "Segurança na operação de caldeiras, vasos de pressão e tubulações: inspeção, dispositivos de segurança, riscos e procedimentos operacionais.",
    duration: 16, price: 280, isActive: true, isFeatured: false, coverImage: "/covers/course-nr13.svg",
    modules: ["Módulo 01 - Conceitos e Classificação", "Módulo 02 - Dispositivos de Segurança", "Módulo 03 - Operação e Inspeção de Segurança", "Módulo 04 - Riscos e Procedimentos de Emergência"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr17", code: "NR 17", name: "NR 17 - Ergonomia",
    description: "Adaptação das condições de trabalho às características psicofisiológicas dos trabalhadores: levantamento de carga, mobiliário, organização e AET.",
    duration: 8, price: 159, isActive: true, isFeatured: false, coverImage: "/covers/course-nr17.svg",
    modules: ["Módulo 01 - Fundamentos de Ergonomia", "Módulo 02 - Levantamento e Transporte de Cargas", "Módulo 03 - Mobiliário e Posto de Trabalho", "Módulo 04 - Organização do Trabalho e AET"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr18", code: "NR 18", name: "NR 18 - Condições e Meio Ambiente de Trabalho na Indústria da Construção",
    description: "Diretrizes de segurança e saúde na construção civil: PCMAT/PGR, áreas de vivência, proteções coletivas, escavações e trabalho em andaimes.",
    duration: 8, price: 189, isActive: true, isFeatured: false, coverImage: "/covers/course-nr18.svg",
    modules: ["Módulo 01 - Programa de Gerenciamento de Riscos na Construção", "Módulo 02 - Áreas de Vivência e Sinalização", "Módulo 03 - Proteções Coletivas (Guarda-corpo e Plataformas)", "Módulo 04 - Andaimes, Escavações e Demolições"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr20", code: "NR 20", name: "NR 20 - Segurança e Saúde no Trabalho com Inflamáveis e Combustíveis",
    description: "Trabalho seguro com líquidos e gases inflamáveis e combustíveis: classificação das instalações, riscos, prevenção e resposta a emergências.",
    duration: 8, price: 199, isActive: true, isFeatured: false, coverImage: "/covers/course-nr20.svg",
    modules: ["Módulo 01 - Classificação das Instalações", "Módulo 02 - Propriedades dos Inflamáveis e Combustíveis", "Módulo 03 - Riscos e Medidas de Controle", "Módulo 04 - Prevenção e Combate a Emergências"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr23", code: "NR 23", name: "NR 23 - Proteção Contra Incêndios",
    description: "Prevenção e combate a princípios de incêndio: classes de fogo, equipamentos de extinção, saídas de emergência e plano de abandono.",
    duration: 4, price: 120, isActive: true, isFeatured: false, coverImage: "/covers/course-nr23.svg",
    modules: ["Módulo 01 - Teoria do Fogo e Classes de Incêndio", "Módulo 02 - Equipamentos de Combate (Extintores e Hidrantes)", "Módulo 03 - Saídas de Emergência e Sinalização", "Módulo 04 - Plano de Abandono e Brigada"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: ["Manuseio de Extintores por Classe de Fogo"],
  },
  {
    id: "course-nr31", code: "NR 31", name: "NR 31 - Segurança e Saúde no Trabalho na Agricultura, Pecuária, Silvicultura, Exploração Florestal e Aquicultura",
    description: "Segurança nas atividades agrárias: agrotóxicos, máquinas agrícolas, ergonomia rural e gerenciamento de riscos no campo.",
    duration: 8, price: 189, isActive: true, isFeatured: false, coverImage: "/covers/course-nr31.svg",
    modules: ["Módulo 01 - Gestão de SST no Meio Rural", "Módulo 02 - Agrotóxicos e Produtos Químicos", "Módulo 03 - Máquinas e Implementos Agrícolas", "Módulo 04 - Ergonomia e Condições de Trabalho Rural"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-nr33", code: "NR 33", name: "NR 33 - Segurança e Saúde nos Trabalhos em Espaços Confinados",
    description: "Capacitação para trabalho em espaços confinados: identificação, monitoramento atmosférico, permissão de entrada e trabalho (PET) e resgate.",
    duration: 16, price: 280, isActive: true, isFeatured: false, coverImage: "/covers/course-nr33.svg", modality: "Semipresencial",
    modules: ["Módulo 01 - Definições e Reconhecimento de Espaços Confinados", "Módulo 02 - Riscos e Monitoramento Atmosférico", "Módulo 03 - Permissão de Entrada e Trabalho (PET)", "Módulo 04 - Resgate e Primeiros Socorros"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: ["Monitoramento de Gases e Ventilação", "Simulado de Resgate"],
  },
  {
    id: "course-nr35", code: "NR 35", name: "NR 35 - Segurança no Trabalho em Altura",
    description: "Capacitação para trabalho acima de 2 metros: análise de risco, sistemas de ancoragem, EPI antiqueda e resgate em altura.",
    duration: 8, price: 199, isActive: true, isFeatured: true, coverImage: "/covers/course-nr35.svg", modality: "Semipresencial",
    modules: ["Módulo 01 - Regulamentação Jurídica Aplicável - NR 35", "Módulo 02 - Análise de Riscos e Condições Impeditivas", "Módulo 03 - Sistemas, Equipamentos e Procedimentos de Proteção Coletiva", "Módulo 04 - Linha de Vida, Cabo de Aço e Pontos de Ancoragem Seguros", "Módulo 05 - EPI Para Trabalho em Altura: Seleção, Uso e Critérios de Inspeção", "Módulo 06 - Resgate Emergencial em Altura e Primeiros Socorros"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: ["Instalação com Ancoragem de Cabos Recartilhados", "Inspeção e Descarte de Cinto de Segurança"],
  },
  {
    id: "course-nr38", code: "NR 38", name: "NR 38 - Segurança e Saúde no Trabalho nas Atividades de Limpeza Urbana e Manejo de Resíduos Sólidos",
    description: "Segurança na limpeza urbana e manejo de resíduos sólidos: riscos biológicos e de trânsito, coleta, EPI e procedimentos operacionais.",
    duration: 8, price: 169, isActive: true, isFeatured: false, coverImage: "/covers/course-nr38.svg",
    modules: ["Módulo 01 - Disposições Gerais da NR 38", "Módulo 02 - Riscos Biológicos, Químicos e de Trânsito", "Módulo 03 - Coleta, Varrição e Manejo de Resíduos", "Módulo 04 - EPI e Procedimentos Operacionais Seguros"],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-incompat-quimica", code: "IQ", name: "Incompatibilidade Química",
    description: "Identificação de incompatibilidades químicas, segregação e armazenamento seguro de produtos químicos, leitura de FISPQ/GHS e prevenção de reações perigosas.",
    duration: 8, price: 149, isActive: true, isFeatured: false, coverImage: "/covers/course-incompat-quimica.svg",
    modules: [
      "Módulo 01 - Fundamentos de Química e Reações Perigosas",
      "Módulo 02 - Classificação GHS e Rotulagem de Produtos Químicos",
      "Módulo 03 - Leitura e Interpretação da FISPQ (SDS)",
      "Módulo 04 - Incompatibilidades Químicas e Tabela de Segregação",
      "Módulo 05 - Armazenamento, Manuseio e Transporte Seguro",
      "Módulo 06 - Resposta a Emergências e Primeiros Socorros Químicos",
    ],
    instructors: [INSTRUTOR_GILVAN], manualActivities: [],
  },
  {
    id: "course-class-rotulagem", code: "GHS", name: "Classificação e Rotulagem de Produtos Químicos (FISPQ, GHS, NBR 14725 e NR-26)",
    description: "Classificação de perigos e rotulagem de produtos químicos conforme o GHS e a ABNT NBR 14725, elaboração e leitura da FISPQ e sinalização de segurança da NR-26.",
    duration: 8, price: 149, isActive: true, isFeatured: false, coverImage: "/covers/course-class-rotulagem.svg",
    modules: [
      "Módulo 01 - Fundamentos da Classificação de Perigos Químicos",
      "Módulo 02 - Sistema GHS (Sistema Globalmente Harmonizado)",
      "Módulo 03 - ABNT NBR 14725: Classificação e Rotulagem",
      "Módulo 04 - Elaboração e Interpretação da FISPQ (SDS)",
      "Módulo 05 - Rótulos: Elementos, Pictogramas e Frases de Perigo",
      "Módulo 06 - NR-26: Sinalização de Segurança",
    ],
    instructors: [INSTRUTOR_GILVAN], manualActivities: [],
  },
  {
    id: "course-quimicos-controlados", code: "PQC", name: "Produtos Químicos Controlados (PF, PC-SP e Exército)",
    description: "Controle de produtos químicos pelos órgãos fiscalizadores: Polícia Federal, Polícia Civil de São Paulo e Exército Brasileiro — licenças, mapas de movimentação e obrigações legais.",
    duration: 8, price: 159, isActive: true, isFeatured: false, coverImage: "/covers/course-quimicos-controlados.svg",
    modules: [
      "Módulo 01 - Conceitos e Legislação dos Produtos Químicos Controlados",
      "Módulo 02 - Controle pela Polícia Federal (Lei 10.357/2001 e Decreto 4.262/2002)",
      "Módulo 03 - Controle pelo Exército Brasileiro (R-105 / DFPC)",
      "Módulo 04 - Controle pela Polícia Civil de São Paulo (PC-SP)",
      "Módulo 05 - Licenças, Certificados e Mapas de Movimentação",
      "Módulo 06 - Fiscalização, Infrações e Responsabilidades",
    ],
    instructors: [INSTRUTOR_GILVAN], manualActivities: [],
  },
  {
    id: "course-leilucas-4", code: "LEI LUCAS 4H", name: "Lei Lucas nº 13.722 - Primeiros Socorros (04 Horas)",
    description: "Capacitação em noções básicas de primeiros socorros conforme a Lei Lucas (nº 13.722/2018): sinais vitais, OVACE, manobra de Heimlich, convulsões, traumas, hemorragias e parada cardiorrespiratória.",
    duration: 4, price: 60, isActive: true, isFeatured: false, coverImage: "/covers/course-leilucas-4.svg",
    modules: [
      "Módulo 01 - Sinais Vitais e Avaliação da Vítima",
      "Módulo 02 - OVACE e Manobra de Heimlich (Desengasgo)",
      "Módulo 03 - Convulsões, Traumas e Hemorragias",
      "Módulo 04 - Parada Respiratória e Cardiorrespiratória (RCP)",
    ],
    instructors: [INSTRUTOR_PADRAO], manualActivities: [],
  },
  {
    id: "course-leilucas-10", code: "LEI LUCAS 10H", name: "Lei Lucas nº 13.722 - Primeiros Socorros (10 Horas)",
    description: "Capacitação ampliada em primeiros socorros conforme a Lei Lucas (nº 13.722/2018): sinais vitais, OVACE, manobra de Heimlich, convulsões, traumas, controle de hemorragias, RCP e acionamento dos canais de urgência.",
    duration: 10, price: 120, isActive: true, isFeatured: false, coverImage: "/covers/course-leilucas-10.svg",
    modules: [
      "Módulo 01 - Sinais Vitais e Avaliação da Vítima",
      "Módulo 02 - OVACE e Manobra de Heimlich (Desengasgo)",
      "Módulo 03 - Convulsões e Emergências Clínicas",
      "Módulo 04 - Traumas e Protocolo de Atendimento",
      "Módulo 05 - Controle de Hemorragias",
      "Módulo 06 - Parada Respiratória e Cardiorrespiratória (RCP) e Canais de Urgência",
    ],
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
    "Conceitos da NR-06: Equipamento de Proteção Individual (EPI) e Conjugado de Proteção Individual",
    "EPI x Equipamento de Proteção Coletiva (EPC): diferenças e exemplos",
    "Responsabilidades do empregador, do empregado e do fabricante",
    "Quem recomenda o uso do EPI (SESMT/CIPA) e o profissional habilitado",
    "Certificado de Aprovação (CA): leitura, validade e informações obrigatórias",
    "Tipos de EPI e seus funcionamentos: proteção da cabeça, dos olhos e da face",
    "Proteção auditiva, respiratória (PPR/Fundacentro), de tronco e membros",
    "Proteção do corpo e proteção contra quedas com diferença de nível",
    "Equipamentos de Proteção Coletiva (EPC): anteparos, barreiras e sinalização",
    "Seleção adequada, uso correto, guarda e conservação dos EPIs",
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
  "PQC": [
    "Definição de produtos químicos controlados e órgãos fiscalizadores",
    "Polícia Federal: Lei 10.357/2001 e Decreto 4.262/2002 (produtos químicos para drogas)",
    "Exército Brasileiro: R-105 e a Diretoria de Fiscalização de Produtos Controlados (DFPC)",
    "Polícia Civil de São Paulo: controle estadual de produtos químicos",
    "Licença de Funcionamento, Certificado de Registro e Título de Registro",
    "Mapa de movimentação, controle de estoque e prazos de envio",
    "Transporte, armazenamento e segurança de produtos controlados",
    "Fiscalização, infrações, penalidades e responsabilidade legal",
  ],
  "GHS": [
    "Conceitos de classificação de perigos físicos, à saúde e ao meio ambiente",
    "Sistema Globalmente Harmonizado (GHS): estrutura e objetivos",
    "ABNT NBR 14725: classificação, rotulagem e FISPQ",
    "Elementos do rótulo: pictogramas, palavra de advertência e frases H/P",
    "Elaboração e interpretação da Ficha de Informações de Segurança (FISPQ/SDS)",
    "Categorias e classes de perigo dos produtos químicos",
    "NR-26: sinalização de segurança, cores e identificação de tubulações",
    "Boas práticas de comunicação de perigos no ambiente de trabalho",
    "Armazenamento e identificação de recipientes e embalagens",
    "Atualizações normativas e responsabilidades legais",
  ],
  "IQ": [
    "Conceitos fundamentais de química aplicada à segurança",
    "Classes de produtos perigosos e o sistema GHS",
    "Rotulagem preventiva e pictogramas de perigo",
    "Ficha de Informações de Segurança de Produtos Químicos (FISPQ/SDS)",
    "Principais grupos de incompatibilidade química",
    "Tabela de segregação e armazenamento por compatibilidade",
    "Reações perigosas: oxidação, corrosão, produtos pirofóricos e reativos à água",
    "Boas práticas de manuseio, transporte e contenção",
    "Ventilação, áreas de armazenagem e controle de derramamentos",
    "Resposta a emergências químicas e primeiros socorros",
  ],
  "LEI LUCAS 4H": [
    "Sinais vitais",
    "Interpretação de sintomas e sinais",
    "OVACE: obstrução de vias aéreas por corpo estranho — no adulto, na criança e no bebê",
    "Manobra de Heimlich (desengasgo)",
    "Crise convulsiva (febril, hipoglicemia e convulsões)",
    "Traumas: crânio, ocular, face, membros e choques elétricos",
    "Protocolo de traumas",
    "Controle de hemorragias",
    "PR — Parada respiratória",
    "PCR — Parada cardiorrespiratória",
    "Canais de atendimento de urgência",
  ],
};
// Lei Lucas: a versão de 10h compartilha o mesmo conteúdo programático da de 4h.
CONTEUDO_PROGRAMATICO["LEI LUCAS 10H"] = CONTEUDO_PROGRAMATICO["LEI LUCAS 4H"];

// --- Treinamento em slides (deck por NR) ------------------------------------
// Conteúdo didático em slides, exibido no player do aluno (aba "Apresentação de
// Slides"). Estático no bundle (não depende do banco). Cada deck segue o mesmo
// template: título + tópicos. Use SLIDES_BY_CODE[course.code].
export interface TrainingSlide {
  title: string;
  bullets: string[];
  images?: string[]; // imagens do slide (data URL ou URL), enviadas no Gerenciador de Slides
}

export const SLIDES_BY_CODE: Record<string, TrainingSlide[]> = {
  "NR 06": [
    {
      title: "NR 06 — Equipamentos de Proteção Individual (EPI)",
      bullets: [
        "Apresentação: Lorraine Ricardo — Técnica de Enfermagem do Trabalho.",
        "Carga horária: 2 horas.",
        "Objetivo: aprender a utilizar os EPIs de forma correta e compreender a necessidade do seu uso.",
        "Conhecer os principais conceitos da NR-06.",
      ],
    },
    {
      title: "Módulo 1 — EPI x EPC",
      bullets: [
        "EPI: todo dispositivo ou produto de uso individual utilizado pelo trabalhador, destinado à proteção contra riscos que ameacem a segurança e a saúde no trabalho.",
        "Cada colaborador deve ter o seu próprio EPI.",
        "É a proteção individual — diferente da proteção coletiva.",
      ],
    },
    {
      title: "Conjugado de Proteção Individual",
      bullets: [
        "Equipamento composto por vários dispositivos associados pelo fabricante.",
        "Protege contra um ou mais riscos que possam ocorrer simultaneamente.",
        "Exemplo: cinturão de segurança tipo paraquedista.",
      ],
    },
    {
      title: "Equipamento de Proteção Coletiva (EPC)",
      bullets: [
        "Protege um grupo de pessoas durante a realização de uma atividade.",
        "Construído com materiais de qualidade e instalado assim que o risco é detectado.",
        "Exemplos: dispositivos contra quedas, sistema guarda-corpo e plano vertical.",
      ],
    },
    {
      title: "Módulo 2 — Responsabilidades do Empregador",
      bullets: [
        "Adquirir o EPI adequado ao risco de cada atividade e exigir o seu uso.",
        "Fornecer somente o EPI aprovado (com CA) pelo órgão nacional competente.",
        "Orientar e treinar o trabalhador sobre uso, guarda e conservação.",
        "Substituir imediatamente quando danificado ou extraviado.",
        "Responsabilizar-se pela higienização e manutenção periódica.",
        "Comunicar ao MTE qualquer irregularidade observada.",
      ],
    },
    {
      title: "Responsabilidades do Empregado",
      bullets: [
        "Usar o EPI apenas para a finalidade a que se destina.",
        "Responsabilizar-se pela limpeza, guarda e conservação.",
        "Comunicar à organização quando extraviado, danificado ou impróprio para uso.",
        "Cumprir as determinações da organização sobre o uso adequado.",
      ],
    },
    {
      title: "Responsabilidades do Fabricante",
      bullets: [
        "Cadastrar-se junto ao órgão nacional competente (Anexo 2).",
        "Solicitar, renovar e requerer o Certificado de Aprovação (CA) quando houver alteração.",
        "Manter a qualidade do EPI e comercializar somente com CA.",
        "Fornecer instruções técnicas no idioma nacional e o número do lote.",
        "Providenciar a avaliação da conformidade no âmbito do SINMETRO, quando for o caso.",
      ],
    },
    {
      title: "Quem Recomenda o Uso do EPI?",
      bullets: [
        "Compete ao SESMT ou à CIPA recomendar o EPI adequado ao risco.",
        "Sem SESMT: recomendação ao empregador conforme o risco da atividade.",
        "Sem CIPA: cabe ao designado, com orientação de profissional habilitado.",
      ],
    },
    {
      title: "Certificado de Aprovação (CA) Válido",
      bullets: [
        "Indica validade, se o produto é nacional ou importado, o tipo de equipamento e uma breve descrição.",
        "Menciona o tipo de aprovação (ex.: protetor auditivo conforme NR-15, Anexos 1 e 2).",
        "Traz a norma técnica utilizada, a cor do equipamento, o nº do laudo, o laboratório e o fabricante.",
      ],
    },
    {
      title: "Módulo 3 — Tipos de EPI: Proteção da Cabeça",
      bullets: [
        "Seleção adequada e uso correto garantem a integridade física do trabalhador.",
        "Capacete: cores por função na obra; material plástico com carneira regulável e, às vezes, viseira.",
        "Protege contra impactos, choques elétricos e calor (combate a incêndio).",
        "Capuz (riscos térmicos) e Tyvek (proteção química contra partículas).",
      ],
    },
    {
      title: "Proteção dos Olhos e da Face",
      bullets: [
        "Óculos de policarbonato: impactos, fragmentos e respingos de ácidos/cáusticos; proteção UV-A e UV-B.",
        "Selecionar a lente conforme o tipo de radiação a que o colaborador está exposto.",
        "Protetor facial basculante (policarbonato) contra partículas, estilhaços e respingos.",
        "Máscara de solda: protege contra impactos, radiação UV/IR e luminosidade intensa.",
      ],
    },
    {
      title: "Proteção Auditiva",
      bullets: [
        "Protetores de inserção (silicone com flanges e cordão), circum-auricular (concha) e semi-auricular.",
        "Deve ser bem dimensionado — se inadequado ao risco, perde a função de proteção.",
        "Selecionar conforme o tipo e a intensidade do ruído (atenuação adequada).",
      ],
    },
    {
      title: "Proteção Respiratória",
      bullets: [
        "Purificador de ar: contra poeiras, névoas, fumos, vapores orgânicos e gases ácidos.",
        "Adução de ar (linha de ar comprimido / autônomo): atmosferas IPVS e espaços confinados.",
        "Respirador de fuga: escape em atmosferas IPVS ou O₂ abaixo de 18%.",
        "Seleção conforme o PPR (Fundacentro) e o tipo de partícula, gás ou vapor.",
      ],
    },
    {
      title: "Proteção de Tronco e Membros Superiores",
      bullets: [
        "Tronco: vestimentas contra riscos térmicos, mecânicos, químicos, radioativos e umidade; colete à prova de balas (vigilantes).",
        "Luvas: contra agentes abrasivos, cortantes, perfurantes, choques elétricos, térmicos, biológicos, químicos e radiações.",
        "Complementos: creme protetor, manga, braçadeira e dedeira.",
      ],
    },
    {
      title: "Proteção de Membros Inferiores e do Corpo",
      bullets: [
        "Calçados: contra impactos, choques elétricos, agentes térmicos/cortantes, umidade e respingos químicos.",
        "Meia, perneira e calça de segurança conforme o risco.",
        "Corpo inteiro: macacão, conjunto e vestimenta contra agentes térmicos, químicos e choques elétricos.",
      ],
    },
    {
      title: "Proteção Contra Quedas (Diferença de Nível)",
      bullets: [
        "Dispositivo trava-quedas para movimentação vertical ou horizontal.",
        "Cinturão de segurança contra quedas e para posicionamento em trabalhos em altura.",
        "Sempre utilizados em conjunto, conforme a atividade.",
      ],
    },
    {
      title: "Módulo 4 — Equipamentos de Proteção Coletiva",
      bullets: [
        "Anteparos e barreiras protetoras: rígidos, com travessão superior, intermediário e rodapé, com tela.",
        "Garantem o fechamento seguro de aberturas (muito usados na construção civil).",
        "Placas de sinalização: otimizam o fluxo de informações e a comunicação visual.",
      ],
    },
    {
      title: "Módulo 5 — Conclusão",
      bullets: [
        "A segurança no trabalho é uma responsabilidade compartilhada.",
        "O uso consciente do EPI e a implementação efetiva do EPC garantem um ambiente saudável e seguro.",
        "Cada ação de prevenção constrói um local de trabalho mais protegido.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "NR 01": [
    {
      title: "NR 01 — Disposições Gerais e Gerenciamento de Riscos",
      bullets: [
        "Treinamento admissional/integração obrigatório a todos os trabalhadores.",
        "Base legal: Norma Regulamentadora nº 01.",
        "Estabelece as diretrizes gerais de SST e o Gerenciamento de Riscos Ocupacionais (GRO).",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "Campo de Aplicação",
      bullets: [
        "Aplica-se a todas as organizações e órgãos públicos e privados que admitam trabalhadores.",
        "Define os requisitos gerais comuns às demais NRs.",
        "Introduz o GRO e o Programa de Gerenciamento de Riscos (PGR).",
      ],
    },
    {
      title: "Direitos e Deveres",
      bullets: [
        "Empregador: cumprir as NRs, informar os riscos, fornecer EPI, capacitar e fiscalizar.",
        "Trabalhador: cumprir as orientações, usar o EPI, colaborar e comunicar riscos.",
        "Ordens de Serviço sobre segurança e saúde no trabalho.",
      ],
    },
    {
      title: "GRO e PGR",
      bullets: [
        "GRO: processo contínuo de gerenciamento dos riscos ocupacionais.",
        "PGR: documento com inventário de riscos e plano de ação.",
        "Etapas: identificar perigos, avaliar riscos e definir controles.",
      ],
    },
    {
      title: "Hierarquia das Medidas de Controle",
      bullets: [
        "Eliminação e substituição do risco.",
        "Medidas de proteção coletiva (EPC) e de engenharia.",
        "Medidas administrativas e de organização do trabalho.",
        "EPI como última barreira.",
      ],
    },
    {
      title: "Capacitação e Integração",
      bullets: [
        "Treinamentos inicial, periódico e eventual.",
        "Integração ao ambiente de trabalho e aos riscos da função.",
        "Registro e documentação de SST.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "Segurança é responsabilidade de todos, começando pela integração.",
        "Conheça os riscos da sua função e as medidas de controle.",
        "Em caso de dúvida, procure o SESMT ou a liderança.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "NR 05": [
    {
      title: "NR 05 — CIPA",
      bullets: [
        "Capacitação dos membros da Comissão Interna de Prevenção de Acidentes e de Assédio.",
        "Base legal: Norma Regulamentadora nº 05.",
        "Objetivo: prevenir acidentes e doenças e promover ambiente saudável.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "O que é a CIPA",
      bullets: [
        "Comissão paritária (representantes do empregador e dos empregados).",
        "Atua na prevenção de acidentes e doenças do trabalho.",
        "Passou a incluir também a prevenção ao assédio (Lei 14.457/2022).",
      ],
    },
    {
      title: "Organização e Eleição",
      bullets: [
        "Dimensionamento conforme o quadro de funcionários e o grau de risco.",
        "Composição: titulares e suplentes indicados e eleitos.",
        "Mandato, processo eleitoral e estabilidade dos eleitos.",
      ],
    },
    {
      title: "Atribuições da CIPA",
      bullets: [
        "Identificar riscos e elaborar o mapa de riscos.",
        "Propor e acompanhar medidas preventivas.",
        "Promover a SIPAT e acompanhar a investigação de acidentes.",
      ],
    },
    {
      title: "Mapa de Riscos",
      bullets: [
        "Representação gráfica dos riscos por setor.",
        "Riscos: físicos, químicos, biológicos, ergonômicos e de acidentes.",
        "Cores e círculos proporcionais à intensidade do risco.",
      ],
    },
    {
      title: "Acidentes e Prevenção ao Assédio",
      bullets: [
        "Investigação e análise de causas; emissão da CAT.",
        "Canal de denúncia e medidas contra o assédio moral e sexual.",
        "Noções de combate a incêndio e primeiros socorros.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "A CIPA é a ponte entre trabalhadores e empresa na prevenção.",
        "Mapa de riscos atualizado e ações concretas salvam vidas.",
        "Participe, observe e comunique.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "NR 10": [
    {
      title: "NR 10 — Segurança em Eletricidade",
      bullets: [
        "Capacitação em segurança em instalações e serviços em eletricidade.",
        "Base legal: Norma Regulamentadora nº 10.",
        "Objetivo: controlar os riscos elétricos e garantir trabalho seguro.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "Riscos Elétricos",
      bullets: [
        "Choque elétrico (contato direto e indireto).",
        "Arco elétrico e queimaduras.",
        "Campos eletromagnéticos; incêndio e explosão de origem elétrica.",
      ],
    },
    {
      title: "Análise de Risco e Controle",
      bullets: [
        "Identificar perigos antes de iniciar o serviço.",
        "Medidas coletivas (EPC) prioritárias sobre as individuais (EPI).",
        "Isolação, barreiras, sinalização e bloqueio.",
      ],
    },
    {
      title: "Desenergização (sequência)",
      bullets: [
        "1) Seccionamento; 2) impedimento de reenergização (bloqueio).",
        "3) Constatação da ausência de tensão.",
        "4) Aterramento temporário; 5) sinalização e delimitação da área.",
      ],
    },
    {
      title: "Aterramento e Equipotencialização",
      bullets: [
        "Aterramento temporário protege contra reenergização acidental.",
        "Equipotencialização reduz diferenças de potencial.",
        "Conferir continuidade e fixação dos pontos.",
      ],
    },
    {
      title: "SEP e Documentação",
      bullets: [
        "Sistema Elétrico de Potência (SEP) e trabalhos em proximidade.",
        "Prontuário das instalações elétricas e procedimentos.",
        "Autorização e habilitação dos profissionais.",
      ],
    },
    {
      title: "Acidentes e Primeiros Socorros",
      bullets: [
        "Conduta diante de choque elétrico: desligar a fonte com segurança.",
        "Noções de RCP e atendimento até o socorro especializado.",
        "Combate a incêndio em instalações elétricas (extintores classe C).",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "Energia não se vê — respeite os procedimentos sempre.",
        "Só trabalhe energizado quando inevitável e com medidas adicionais.",
        "Desenergizou? Teste a ausência de tensão antes de tocar.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "NR 11": [
    {
      title: "NR 11 — Movimentação de Materiais",
      bullets: [
        "Capacitação em transporte, movimentação, armazenagem e manuseio de materiais.",
        "Base legal: Norma Regulamentadora nº 11.",
        "Objetivo: operar equipamentos com segurança e prevenir acidentes.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "Equipamentos e Componentes",
      bullets: [
        "Empilhadeiras, transpaleteiras, pontes rolantes, talhas e guindastes.",
        "Componentes: garfos, mastro, cabos, ganchos e freios.",
        "Cada equipamento exige operador capacitado e autorizado.",
      ],
    },
    {
      title: "Estabilidade e Capacidade de Carga",
      bullets: [
        "Centro de gravidade e triângulo de estabilidade.",
        "Respeitar a placa de capacidade (diagrama de carga).",
        "Carga centralizada, baixa e bem apoiada.",
      ],
    },
    {
      title: "Inspeção e Checklist",
      bullets: [
        "Checklist diário antes de operar (freios, pneus, vazamentos, alarmes).",
        "Manutenção preventiva e registro.",
        "Equipamento com defeito deve ser retirado de operação.",
      ],
    },
    {
      title: "Operação e Empilhamento Seguros",
      bullets: [
        "Regras de circulação interna, velocidade e prioridade ao pedestre.",
        "Sinalização sonora e visual; visibilidade da via.",
        "Empilhamento estável, sem exceder altura/limite do piso.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "A maioria dos acidentes vem de excesso de carga e pressa.",
        "Inspecione, sinalize e respeite os pedestres.",
        "Em dúvida sobre a carga, pare e consulte.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "NR 12": [
    {
      title: "NR 12 — Segurança em Máquinas e Equipamentos",
      bullets: [
        "Capacitação em segurança no trabalho em máquinas e equipamentos.",
        "Base legal: Norma Regulamentadora nº 12.",
        "Objetivo: prevenir acidentes por meio de proteções e procedimentos.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "Princípios Gerais",
      bullets: [
        "Medidas de proteção para garantir saúde e integridade dos operadores.",
        "Arranjo físico, instalações e áreas de circulação seguras.",
        "Análise de risco da máquina como ponto de partida.",
      ],
    },
    {
      title: "Dispositivos de Acionamento e Parada",
      bullets: [
        "Partida e acionamento seguros, sem risco de acionamento acidental.",
        "Parada de emergência acessível e eficaz.",
        "Comandos bimanuais quando aplicável.",
      ],
    },
    {
      title: "Proteções Fixas e Móveis",
      bullets: [
        "Proteções fixas para zonas de perigo permanentes.",
        "Proteções móveis com intertravamento (param a máquina ao abrir).",
        "Nunca anular ou burlar as proteções.",
      ],
    },
    {
      title: "Manutenção e Bloqueio (LOTO)",
      bullets: [
        "Procedimentos de trabalho seguro e manutenção.",
        "Bloqueio e etiquetagem de energias (Lockout/Tagout) antes de intervir.",
        "Somente profissionais capacitados e autorizados.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "Proteção de máquina existe para preservar você — não a remova.",
        "Antes de manutenção, bloqueie todas as fontes de energia.",
        "Comunique qualquer proteção danificada.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "NR 13": [
    {
      title: "NR 13 — Caldeiras e Vasos de Pressão",
      bullets: [
        "Capacitação para operação segura de caldeiras, vasos de pressão e tubulações.",
        "Base legal: Norma Regulamentadora nº 13.",
        "Objetivo: prevenir explosões e falhas catastróficas.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "Conceitos e Classificação",
      bullets: [
        "Caldeiras: equipamentos que geram vapor sob pressão.",
        "Vasos de pressão e tubulações de interligação.",
        "Categorias conforme pressão e risco.",
      ],
    },
    {
      title: "Dispositivos de Segurança",
      bullets: [
        "Válvula de segurança (alívio de pressão).",
        "Instrumentos de controle e indicação (pressão, nível, temperatura).",
        "Sistemas de bloqueio e intertravamento.",
      ],
    },
    {
      title: "Operação e Supervisão",
      bullets: [
        "Operador treinado e habilitado conforme a NR-13.",
        "Procedimentos de partida, operação e parada.",
        "Acompanhamento dos parâmetros e registros.",
      ],
    },
    {
      title: "Inspeções e Prontuário",
      bullets: [
        "Inspeção de segurança inicial, periódica e extraordinária.",
        "Prontuário e documentação obrigatória atualizados.",
        "Profissional Habilitado (PH) responsável.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "Pressão exige respeito: siga os procedimentos à risca.",
        "Dispositivos de segurança nunca devem ser anulados.",
        "Comunique anomalias imediatamente.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "NR 17": [
    {
      title: "NR 17 — Ergonomia",
      bullets: [
        "Capacitação em ergonomia aplicada ao trabalho.",
        "Base legal: Norma Regulamentadora nº 17.",
        "Objetivo: adaptar as condições de trabalho às características do trabalhador.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "Fundamentos da Ergonomia",
      bullets: [
        "Adaptar o trabalho ao ser humano, não o contrário.",
        "Conforto, segurança e desempenho eficiente.",
        "Aspectos físicos, cognitivos e organizacionais.",
      ],
    },
    {
      title: "Análise Ergonômica do Trabalho (AET)",
      bullets: [
        "Avaliação das condições reais de trabalho.",
        "Identifica fatores de risco ergonômico.",
        "Gera recomendações de melhoria.",
      ],
    },
    {
      title: "Levantamento e Transporte de Cargas",
      bullets: [
        "Postura correta: usar as pernas, manter a coluna ereta.",
        "Evitar torções e cargas excessivas.",
        "Uso de meios mecânicos quando possível.",
      ],
    },
    {
      title: "Posto de Trabalho e Ambiente",
      bullets: [
        "Mobiliário ajustável: cadeira, mesa e altura do monitor.",
        "Iluminação, ruído e temperatura adequados.",
        "Organização do trabalho e pausas; anexos de teleatendimento.",
      ],
    },
    {
      title: "Prevenção de LER/DORT",
      bullets: [
        "Reconhecer sinais de distúrbios osteomusculares.",
        "Alternância de tarefas e ginástica laboral.",
        "Comunicar desconfortos precocemente.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "Pequenos ajustes evitam grandes lesões.",
        "Postura, pausas e mobiliário corretos fazem diferença.",
        "Sua saúde a longo prazo agradece.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "NR 18": [
    {
      title: "NR 18 — Segurança na Construção Civil",
      bullets: [
        "Capacitação em condições e meio ambiente de trabalho na construção.",
        "Base legal: Norma Regulamentadora nº 18.",
        "Objetivo: prevenir acidentes no canteiro de obras.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "PGR na Construção",
      bullets: [
        "Programa de Gerenciamento de Riscos específico da obra.",
        "Planejamento das medidas de proteção por etapa.",
        "Acompanhamento e atualização contínuos.",
      ],
    },
    {
      title: "Áreas de Vivência e Sinalização",
      bullets: [
        "Instalações sanitárias, vestiário, refeitório e água potável.",
        "Sinalização de segurança em todo o canteiro.",
        "Organização e limpeza reduzem acidentes.",
      ],
    },
    {
      title: "Proteções Coletivas",
      bullets: [
        "Guarda-corpo e rodapé em aberturas e periferia.",
        "Plataformas de proteção e redes de segurança.",
        "Proteção de vãos e poços.",
      ],
    },
    {
      title: "Andaimes, Escadas e Rampas",
      bullets: [
        "Andaimes montados por trabalhador capacitado e com travamento.",
        "Escadas e rampas seguras, com corrimão.",
        "Inspeção antes do uso.",
      ],
    },
    {
      title: "Escavações, Demolições e Elétrica",
      bullets: [
        "Escavações com escoramento e sinalização.",
        "Demolições planejadas e isoladas.",
        "Instalações elétricas temporárias protegidas.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "No canteiro, proteção coletiva vem antes do EPI.",
        "Inspecione andaimes e aberturas todos os dias.",
        "Sinalize e isole áreas de risco.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "NR 20": [
    {
      title: "NR 20 — Inflamáveis e Combustíveis",
      bullets: [
        "Capacitação em segurança com inflamáveis e combustíveis.",
        "Base legal: Norma Regulamentadora nº 20.",
        "Objetivo: prevenir incêndios, explosões e vazamentos.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "Classificação das Instalações",
      bullets: [
        "Instalações classes I, II e III conforme atividade e quantidade.",
        "Define o nível de capacitação exigido (básico, intermediário, avançado).",
        "Trabalhadores próprios e terceirizados.",
      ],
    },
    {
      title: "Propriedades e Riscos",
      bullets: [
        "Ponto de fulgor, inflamabilidade e vapores.",
        "Atmosferas explosivas e fontes de ignição.",
        "Riscos à saúde por exposição.",
      ],
    },
    {
      title: "Análise de Riscos e Permissão de Trabalho",
      bullets: [
        "Análise de riscos das atividades.",
        "Permissão de Trabalho (PT) para serviços críticos.",
        "Procedimentos operacionais e de manutenção.",
      ],
    },
    {
      title: "Prevenção e Emergência",
      bullets: [
        "Controle de vazamentos, derrames e fontes de ignição.",
        "Plano de resposta a emergências e simulados.",
        "Combate a incêndio e rotas de fuga.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "Elimine fontes de ignição onde há vapores inflamáveis.",
        "Permissão de trabalho não é burocracia — é proteção.",
        "Conheça o plano de emergência da sua área.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "NR 23": [
    {
      title: "NR 23 — Proteção Contra Incêndios",
      bullets: [
        "Capacitação em prevenção e combate a incêndios.",
        "Base legal: Norma Regulamentadora nº 23.",
        "Objetivo: proteger pessoas e patrimônio e permitir a evacuação segura.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "Teoria do Fogo",
      bullets: [
        "Triângulo do fogo: combustível, comburente e calor.",
        "Tetraedro do fogo: inclui a reação em cadeia.",
        "Remover um dos elementos extingue o fogo.",
      ],
    },
    {
      title: "Classes de Incêndio",
      bullets: [
        "A: sólidos comuns (madeira, papel).",
        "B: líquidos inflamáveis; C: equipamentos energizados.",
        "D: metais; K: óleos e gorduras de cozinha.",
      ],
    },
    {
      title: "Agentes e Equipamentos",
      bullets: [
        "Água, pó químico, CO2 e espuma — conforme a classe.",
        "Extintores e hidrantes: uso e localização.",
        "Detecção e alarme de incêndio.",
      ],
    },
    {
      title: "Abandono e Brigada",
      bullets: [
        "Saídas de emergência e sinalização desobstruídas.",
        "Plano de abandono de área e ponto de encontro.",
        "Brigada de incêndio e primeiros socorros.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "Conheça a localização dos extintores e das saídas.",
        "Use o agente extintor certo para cada classe.",
        "Em emergência: alarme, abandono e ponto de encontro.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "NR 31": [
    {
      title: "NR 31 — Segurança no Trabalho Rural",
      bullets: [
        "Capacitação em SST na agricultura, pecuária, silvicultura e afins.",
        "Base legal: Norma Regulamentadora nº 31.",
        "Objetivo: prevenir acidentes e doenças no meio rural.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "Gestão de SST no Campo",
      bullets: [
        "Identificação e controle dos riscos da atividade rural.",
        "Organização do trabalho e responsabilidades.",
        "Informação e capacitação dos trabalhadores.",
      ],
    },
    {
      title: "Agrotóxicos e Produtos Químicos",
      bullets: [
        "Uso seguro: leitura do rótulo e da bula.",
        "EPI específico para aplicação e intervalo de reentrada.",
        "Armazenamento, tríplice lavagem e descarte de embalagens.",
      ],
    },
    {
      title: "Máquinas e Implementos Agrícolas",
      bullets: [
        "Tratores e implementos com proteções e estrutura de proteção (EPCC).",
        "Operação por trabalhador capacitado.",
        "Manutenção e inspeção periódicas.",
      ],
    },
    {
      title: "Riscos Biológicos e Ergonomia",
      bullets: [
        "Contato com animais, plantas e agentes biológicos.",
        "Ergonomia no levantamento de cargas e posturas.",
        "Trabalho em silvicultura e exploração florestal.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "Agrotóxico exige EPI e respeito ao intervalo de reentrada.",
        "Trator sem proteção é risco de tombamento.",
        "Cuide da hidratação e da exposição ao sol.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "NR 33": [
    {
      title: "NR 33 — Espaços Confinados",
      bullets: [
        "Capacitação para trabalho seguro em espaços confinados.",
        "Base legal: Norma Regulamentadora nº 33.",
        "Objetivo: prevenir mortes por atmosferas perigosas e soterramento.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "O que é Espaço Confinado",
      bullets: [
        "Área não projetada para ocupação contínua.",
        "Meios limitados de entrada e saída.",
        "Ventilação insuficiente para remover contaminantes.",
      ],
    },
    {
      title: "Riscos Atmosféricos",
      bullets: [
        "Deficiência ou enriquecimento de oxigênio.",
        "Gases inflamáveis (risco de explosão).",
        "Gases tóxicos (H2S, CO) e poeiras.",
      ],
    },
    {
      title: "Monitoramento e PET",
      bullets: [
        "Medição atmosférica antes e durante a entrada.",
        "Permissão de Entrada e Trabalho (PET) preenchida e assinada.",
        "Ventilação forçada e isolamento de energias.",
      ],
    },
    {
      title: "Funções e Equipamentos",
      bullets: [
        "Supervisor de entrada, vigia e trabalhador autorizado.",
        "Detector de gases, ventilador e cinturão com trava-quedas.",
        "Comunicação permanente entre vigia e trabalhador.",
      ],
    },
    {
      title: "Resgate e Emergência",
      bullets: [
        "Plano de resgate definido ANTES da entrada.",
        "Resgate sem entrada sempre que possível.",
        "Nunca entrar para socorrer sem equipamento e autorização.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "A maioria das mortes é de quem entra para 'salvar' sem preparo.",
        "Sem PET e sem medição, não se entra.",
        "Vigia nunca abandona o posto.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "NR 35": [
    {
      title: "NR 35 — Trabalho em Altura",
      bullets: [
        "Capacitação para trabalho em altura (acima de 2 m com risco de queda).",
        "Base legal: Norma Regulamentadora nº 35.",
        "Objetivo: prevenir quedas e proteger o trabalhador.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "Quando se Aplica",
      bullets: [
        "Toda atividade acima de 2 metros do nível inferior com risco de queda.",
        "Planejamento, organização e execução por trabalhador capacitado e autorizado.",
        "Aptidão para a função (exame médico).",
      ],
    },
    {
      title: "Análise de Risco e Permissão de Trabalho",
      bullets: [
        "Análise de Risco (AR) da atividade.",
        "Permissão de Trabalho (PT) para atividades não rotineiras.",
        "Condições impeditivas (clima, saúde) suspendem o trabalho.",
      ],
    },
    {
      title: "Proteção Coletiva x Individual",
      bullets: [
        "Prioridade às medidas de proteção coletiva (guarda-corpo, plataformas).",
        "EPI antiqueda quando a coletiva for inviável ou complementar.",
        "Isolamento e sinalização da área.",
      ],
    },
    {
      title: "EPI e Sistemas de Ancoragem",
      bullets: [
        "Cinturão tipo paraquedista, talabarte e trava-quedas.",
        "Inspeção do EPI antes de cada uso.",
        "Ancoragem confiável, linha de vida e atenção ao fator de queda.",
      ],
    },
    {
      title: "Acidentes, Resgate e Primeiros Socorros",
      bullets: [
        "Acidentes típicos: queda de pessoas e de materiais.",
        "Plano de resgate e atenção à síndrome da suspensão inerte.",
        "Primeiros socorros até o socorro especializado.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "Acima de 2 m, sempre conectado a ponto de ancoragem confiável.",
        "Inspecione o cinturão e o trava-quedas antes de subir.",
        "Tenha o plano de resgate definido antes de iniciar.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "NR 38": [
    {
      title: "NR 38 — Limpeza Urbana e Resíduos",
      bullets: [
        "Capacitação em SST na limpeza urbana e manejo de resíduos sólidos.",
        "Base legal: Norma Regulamentadora nº 38.",
        "Objetivo: proteger os trabalhadores da coleta e varrição.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "Disposições e Responsabilidades",
      bullets: [
        "Aplica-se às atividades de limpeza urbana e manejo de resíduos.",
        "Responsabilidades do empregador e dos trabalhadores.",
        "Organização e planejamento das atividades.",
      ],
    },
    {
      title: "Riscos da Atividade",
      bullets: [
        "Biológicos: contato com resíduos contaminados e perfurocortantes.",
        "Químicos e físicos.",
        "Trânsito: principal causa de acidentes graves na coleta.",
      ],
    },
    {
      title: "Coleta, Varrição e Operação",
      bullets: [
        "Técnicas seguras de coleta e varrição.",
        "Operação segura de veículos e equipamentos coletores.",
        "Uso de EPC e EPI adequados (luvas, calçado, alta visibilidade).",
      ],
    },
    {
      title: "Saúde e Emergências",
      bullets: [
        "Vacinação e cuidados com a saúde do trabalhador.",
        "Higienização após a jornada.",
        "Procedimentos em situações de emergência e primeiros socorros.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "Vista sempre roupa de alta visibilidade — o trânsito é o maior risco.",
        "Cuidado com perfurocortantes nos resíduos.",
        "Mantenha a vacinação em dia.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "GHS": [
    {
      title: "GHS — Classificação e Rotulagem de Químicos",
      bullets: [
        "Capacitação em GHS, FISPQ, NBR 14725 e NR-26.",
        "Objetivo: comunicar perigos químicos de forma padronizada.",
        "Aplica-se a quem produz, manuseia ou armazena produtos químicos.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "O que é o GHS",
      bullets: [
        "Sistema Globalmente Harmonizado de Classificação e Rotulagem.",
        "Padroniza critérios de perigo físico, à saúde e ao meio ambiente.",
        "Facilita o entendimento dos riscos em qualquer país.",
      ],
    },
    {
      title: "NBR 14725",
      bullets: [
        "Norma brasileira que adota o GHS.",
        "Define classificação, rotulagem e a FISPQ.",
        "Base para a comunicação de perigos no Brasil.",
      ],
    },
    {
      title: "Elementos do Rótulo",
      bullets: [
        "Pictogramas de perigo (losangos vermelhos).",
        "Palavra de advertência: 'Perigo' ou 'Atenção'.",
        "Frases de perigo (H) e de precaução (P).",
      ],
    },
    {
      title: "FISPQ / SDS e NR-26",
      bullets: [
        "FISPQ com 16 seções padronizadas.",
        "Consulta antes de manusear o produto.",
        "NR-26: sinalização, cores de segurança e identificação de tubulações.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "Leia o rótulo e a FISPQ antes de usar qualquer produto químico.",
        "Pictograma é alerta — saiba o que cada um significa.",
        "Rotulagem e armazenamento corretos previnem acidentes.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "IQ": [
    {
      title: "Incompatibilidade Química",
      bullets: [
        "Capacitação sobre segregação e armazenamento seguro de produtos químicos.",
        "Objetivo: evitar reações perigosas por mistura/contato indevido.",
        "Aplica-se a almoxarifados, laboratórios e indústrias.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "Conceitos e Classes de Perigo",
      bullets: [
        "Química aplicada à segurança no armazenamento.",
        "Classes de produtos perigosos (base GHS).",
        "Rotulagem preventiva e pictogramas.",
      ],
    },
    {
      title: "Grupos de Incompatibilidade",
      bullets: [
        "Ácidos x bases; oxidantes x inflamáveis.",
        "Reativos à água; cianetos x ácidos.",
        "Consultar a FISPQ para confirmar compatibilidades.",
      ],
    },
    {
      title: "Segregação e Armazenamento",
      bullets: [
        "Tabela de segregação por compatibilidade.",
        "Distâncias, barreiras e bacias de contenção.",
        "Identificação clara dos recipientes.",
      ],
    },
    {
      title: "Reações Perigosas e Emergência",
      bullets: [
        "Oxidação, corrosão, produtos pirofóricos e reativos à água.",
        "Ventilação e controle de derramamentos.",
        "Resposta a emergências químicas e primeiros socorros.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "Nunca armazene incompatíveis juntos — consulte a tabela.",
        "A FISPQ é sua maior aliada antes de estocar.",
        "Contenção e ventilação evitam tragédias.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "PQC": [
    {
      title: "Produtos Químicos Controlados",
      bullets: [
        "Capacitação no controle legal de produtos químicos (PF, Exército e PC-SP).",
        "Objetivo: cumprir as exigências de registro, controle e fiscalização.",
        "Aplica-se a empresas que usam/comercializam produtos controlados.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "Órgãos Fiscalizadores",
      bullets: [
        "Polícia Federal: produtos químicos que podem virar drogas (Lei 10.357/2001).",
        "Exército Brasileiro (DFPC): produtos controlados (R-105).",
        "Polícia Civil de SP: controle estadual.",
      ],
    },
    {
      title: "Licenças e Registros",
      bullets: [
        "Licença de Funcionamento, Certificado de Registro e Título de Registro.",
        "Validade e renovação dos documentos.",
        "Cada órgão tem sua exigência específica.",
      ],
    },
    {
      title: "Controle de Movimentação",
      bullets: [
        "Mapa de movimentação e controle de estoque.",
        "Prazos de envio das informações aos órgãos.",
        "Escrituração fiel das entradas e saídas.",
      ],
    },
    {
      title: "Transporte, Armazenamento e Penalidades",
      bullets: [
        "Transporte e armazenamento seguros dos produtos controlados.",
        "Fiscalização periódica dos órgãos.",
        "Infrações, multas e responsabilidade legal.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "Produto controlado exige registro nos órgãos competentes.",
        "Mantenha o mapa de movimentação e os prazos em dia.",
        "Irregularidade gera multa e responsabilização.",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],

  "LEI LUCAS 4H": [
    {
      title: "Lei Lucas nº 13.722 — Primeiros Socorros",
      bullets: [
        "Capacitação em noções básicas de primeiros socorros (Lei nº 13.722/2018).",
        "Objetivo: reconhecer emergências e agir corretamente até o socorro especializado.",
        "Aplica-se a quem atua com público, especialmente em ambientes escolares e recreativos.",
        "Avaliação final de homologação ao término.",
      ],
    },
    {
      title: "Sinais Vitais e Avaliação da Vítima",
      bullets: [
        "Sinais vitais: consciência, respiração, pulso e temperatura.",
        "Avaliar o local: garantir a segurança antes de socorrer.",
        "Interpretar sintomas e sinais para decidir a conduta.",
        "Acionar ajuda (SAMU 192 / Bombeiros 193) o quanto antes.",
      ],
    },
    {
      title: "OVACE — Obstrução de Vias Aéreas",
      bullets: [
        "OVACE: obstrução das vias aéreas por corpo estranho (engasgo).",
        "Reconhecer o sinal universal de asfixia (mãos no pescoço).",
        "Conduta diferente para adulto, criança e bebê.",
        "Estimular a tosse enquanto a obstrução for parcial.",
      ],
    },
    {
      title: "Manobra de Heimlich (Desengasgo)",
      bullets: [
        "Adulto/criança: compressões abdominais acima do umbigo.",
        "Bebê: 5 golpes nas costas + 5 compressões torácicas.",
        "Manter até desobstruir ou a vítima perder a consciência.",
        "Se desmaiar, iniciar a RCP e chamar socorro.",
      ],
    },
    {
      title: "Convulsões e Emergências Clínicas",
      bullets: [
        "Crise convulsiva: febril, por hipoglicemia ou epilepsia.",
        "Proteger a cabeça, afastar objetos e NÃO conter a vítima.",
        "Não colocar nada na boca; lateralizar após a crise.",
        "Cronometrar a crise e acionar socorro se prolongada.",
      ],
    },
    {
      title: "Traumas e Controle de Hemorragias",
      bullets: [
        "Traumas: crânio, ocular, face, membros e choques elétricos.",
        "Protocolo de traumas: imobilizar e não mover sem necessidade.",
        "Hemorragias: compressão direta no ferimento com pano limpo.",
        "Manter a vítima aquecida e monitorar os sinais vitais.",
      ],
    },
    {
      title: "PR e PCR — RCP",
      bullets: [
        "PR (parada respiratória): vítima não respira, mas tem pulso.",
        "PCR (parada cardiorrespiratória): sem respiração e sem pulso.",
        "RCP: 30 compressões torácicas para 2 ventilações.",
        "Compressões rápidas e fortes; usar o DEA assim que disponível.",
      ],
    },
    {
      title: "Encerramento",
      bullets: [
        "Primeiros socorros salvam vidas nos minutos iniciais.",
        "Garanta a segurança, acione o socorro e aja com calma.",
        "Conheça os canais de atendimento de urgência (SAMU 192, Bombeiros 193).",
        "Realize agora a avaliação final para homologação do certificado.",
      ],
    },
  ],
};
// Lei Lucas: a versão de 10h compartilha o mesmo deck de slides da de 4h.
SLIDES_BY_CODE["LEI LUCAS 10H"] = SLIDES_BY_CODE["LEI LUCAS 4H"];

// Vídeo de referência por NR (fallback quando o curso não tem vídeo no banco).
export const REFERENCE_VIDEO_BY_CODE: Record<string, string> = {
  "NR 06": "https://www.youtube.com/watch?v=qT5RwyBF2u0",
};

// Responsável técnico que assina (digitalmente, ICP-Brasil) TODOS os certificados,
// além do instrutor de cada treinamento.
export const RESPONSAVEL_TECNICO = {
  name: "Magnus Leandro de Souza",
  formation: "Engenheiro de Segurança do Trabalho",
  register: "CREA-SP 5070766148",
  document: "CPF 221.761.998-55",
  signatureUrl: "", // imagem da assinatura (opcional; se vazio, usa o nome em fonte manuscrita)
  icpEnabled: true,
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
  },
  {
    id: "cup-bemvindo10",
    code: "BEMVINDO10",
    description: "10% de desconto na sua primeira compra (boas-vindas)",
    value: 10,
    type: "percentage",
    isActive: true,
    associatedProducts: [] // vazio = vale para todos os treinamentos
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
    id: "enr-jessica-nr06",
    userId: "usr-2",
    userName: "Jéssica da Silva Ribeiro",
    userEmail: "jessica@gmail.com",
    courseId: "course-nr06",
    courseName: "NR 06 - Equipamentos de Proteção Individual (EPI)",
    courseCode: "NR 06",
    progress: 0,
    startDate: "2026-06-27",
    examScore: null,
    passed: false,
    certificateCode: null,
    enrolledAt: "2026-06-27"
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
// Prova de Primeiros Socorros (Lei Lucas) — usada pelas duas cargas (4h e 10h).
const LEI_LUCAS_EXAM: ExamQuestion[] = [
  {
    question: "A Lei Lucas (nº 13.722/2018) tornou obrigatória qual capacitação?",
    options: [
      "A) Treinamento de combate a incêndio para todos os trabalhadores",
      "B) Capacitação em noções básicas de primeiros socorros para profissionais de estabelecimentos de ensino e de recreação infantil",
      "C) Curso de direção defensiva para professores",
      "D) Capacitação em segurança em altura",
    ],
    correctIndex: 1,
  },
  {
    question: "O que significa OVACE?",
    options: [
      "A) Obstrução de Vias Aéreas por Corpo Estranho",
      "B) Oxigenação Venosa Arterial Cardíaca Especial",
      "C) Observação de Vítima em Atendimento Clínico de Emergência",
      "D) Operação de Ventilação Assistida Cardíaca",
    ],
    correctIndex: 0,
  },
  {
    question: "Diante de um adulto consciente engasgado (OVACE grave), a conduta correta é:",
    options: [
      "A) Oferecer água imediatamente",
      "B) Deitar a vítima e elevar as pernas",
      "C) Aplicar a Manobra de Heimlich (compressões abdominais)",
      "D) Não fazer nada e aguardar passar sozinho",
    ],
    correctIndex: 2,
  },
  {
    question: "Durante uma crise convulsiva, deve-se:",
    options: [
      "A) Conter firmemente os movimentos e colocar um objeto na boca",
      "B) Proteger a cabeça, afastar objetos, não conter e lateralizar após a crise",
      "C) Oferecer comida e água durante a crise",
      "D) Jogar água fria no rosto da vítima",
    ],
    correctIndex: 1,
  },
  {
    question: "Qual a diferença entre Parada Respiratória (PR) e Parada Cardiorrespiratória (PCR)?",
    options: [
      "A) São exatamente a mesma coisa",
      "B) Na PR a vítima não respira mas tem pulso; na PCR não há respiração nem pulso",
      "C) A PR é mais grave que a PCR",
      "D) A PCR ocorre apenas em crianças",
    ],
    correctIndex: 1,
  },
  {
    question: "Na Reanimação Cardiopulmonar (RCP) do adulto, a relação entre compressões e ventilações é:",
    options: ["A) 15 compressões para 1 ventilação", "B) 5 compressões para 1 ventilação", "C) 30 compressões para 2 ventilações", "D) 10 compressões para 5 ventilações"],
    correctIndex: 2,
  },
  {
    question: "Diante de uma hemorragia externa, a primeira conduta é:",
    options: [
      "A) Aplicar torniquete imediatamente em qualquer caso",
      "B) Fazer compressão direta sobre o ferimento com pano limpo",
      "C) Lavar o ferimento com álcool",
      "D) Aguardar o sangramento parar sozinho",
    ],
    correctIndex: 1,
  },
  {
    question: "Qual o número do SAMU (atendimento móvel de urgência)?",
    options: ["A) 190", "B) 193", "C) 199", "D) 192"],
    correctIndex: 3,
  },
];

export const RECORD_EXAMS: Record<string, ExamQuestion[]> = {
  "course-leilucas-4": LEI_LUCAS_EXAM,
  "course-leilucas-10": LEI_LUCAS_EXAM,
  "course-nr06": [
    {
      question: "Segundo a NR-06, o que é Equipamento de Proteção Individual (EPI)?",
      options: [
        "A) Todo equipamento usado coletivamente por uma equipe de trabalho",
        "B) Todo dispositivo ou produto de uso individual utilizado pelo trabalhador, destinado à proteção contra riscos à segurança e à saúde no trabalho",
        "C) Apenas o uniforme padrão da empresa",
        "D) Qualquer ferramenta utilizada na atividade",
      ],
      correctIndex: 1,
    },
    {
      question: "Qual a diferença entre EPI e EPC (Equipamento de Proteção Coletiva)?",
      options: [
        "A) Não há diferença, são sinônimos",
        "B) O EPI protege o ambiente e o EPC protege a máquina",
        "C) O EPI é de uso individual do trabalhador e o EPC protege um grupo de pessoas durante a atividade",
        "D) O EPC é de uso individual e o EPI é coletivo",
      ],
      correctIndex: 2,
    },
    {
      question: "O Conjugado de Proteção Individual é o equipamento composto por vários dispositivos. Qual é um exemplo citado?",
      options: [
        "A) Cinturão de segurança tipo paraquedista",
        "B) Óculos de proteção simples",
        "C) Protetor auditivo de inserção",
        "D) Creme protetor para as mãos",
      ],
      correctIndex: 0,
    },
    {
      question: "É responsabilidade do EMPREGADOR em relação ao EPI:",
      options: [
        "A) Comprar o próprio EPI com recursos do trabalhador",
        "B) Adquirir o EPI adequado ao risco, fornecer somente o aprovado (com CA), exigir e fiscalizar o uso e substituí-lo quando danificado",
        "C) Apenas recomendar o uso, sem fornecer",
        "D) Higienizar o EPI somente uma vez por ano",
      ],
      correctIndex: 1,
    },
    {
      question: "É responsabilidade do TRABALHADOR (empregado) quanto ao EPI:",
      options: [
        "A) Emitir o Certificado de Aprovação do equipamento",
        "B) Fiscalizar o uso pelos colegas",
        "C) Usar apenas para a finalidade a que se destina, responsabilizar-se pela guarda e conservação e comunicar quando estiver impróprio para uso",
        "D) Comprar o EPI de outra empresa",
      ],
      correctIndex: 2,
    },
    {
      question: "O que é o Certificado de Aprovação (CA) do EPI?",
      options: [
        "A) Um documento interno da empresa sem valor legal",
        "B) A nota fiscal de compra do equipamento",
        "C) O registro emitido pelo órgão nacional competente que comprova que o EPI é aprovado e indica validade, tipo e a proteção que oferece",
        "D) Um certificado emitido pelo próprio trabalhador",
      ],
      correctIndex: 2,
    },
    {
      question: "Quem é responsável por recomendar o uso do EPI adequado ao risco na empresa?",
      options: [
        "A) O setor financeiro da empresa",
        "B) O SESMT ou, na sua ausência, a CIPA; e onde não houver CIPA, o designado com orientação de profissional habilitado",
        "C) Exclusivamente o fornecedor do EPI",
        "D) Apenas o próprio trabalhador",
      ],
      correctIndex: 1,
    },
    {
      question: "Sobre a proteção auditiva, é correto afirmar:",
      options: [
        "A) Qualquer protetor serve, independentemente do ruído",
        "B) Existem modelos de inserção, circum-auricular (concha) e semi-auricular, e a seleção depende do tipo e da intensidade do ruído",
        "C) O protetor auditivo protege as vias respiratórias",
        "D) Não precisa ser bem dimensionado",
      ],
      correctIndex: 1,
    },
    {
      question: "Em atmosferas Imediatamente Perigosas à Vida e à Saúde (IPVS) ou com oxigênio abaixo de 18%, qual proteção respiratória é indicada?",
      options: [
        "A) Respirador purificador de ar com filtro para poeiras",
        "B) Apenas máscara de tecido",
        "C) Respirador de adução de ar (linha de ar comprimido ou autônomo) / respirador de fuga",
        "D) Nenhuma proteção é necessária",
      ],
      correctIndex: 2,
    },
    {
      question: "Para proteção contra quedas com diferença de nível, quais EPIs são utilizados?",
      options: [
        "A) Apenas o capacete de segurança",
        "B) Dispositivo trava-quedas em conjunto com o cinturão de segurança tipo paraquedista",
        "C) Somente luvas e óculos",
        "D) Protetor facial e creme protetor",
      ],
      correctIndex: 1,
    },
  ],
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
