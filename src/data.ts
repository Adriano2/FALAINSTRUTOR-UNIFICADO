/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course, User, Enrollment, SalesTransaction, Coupon, Comment, ContactMessage, LayoutConfig, PaymentConfig, StudentExamSubmission, ExamQuestion } from './types';

export const INITIAL_LAYOUT_CONFIG: LayoutConfig = {
  companyName: "FalaInstrutor",
  hostname: "https://falainstrutor.com.br",
  twitterUrl: "https://twitter.com/falainstrutor",
  instagramUrl: "https://instagram.com/falainstrutor.treinamentos",
  youtubeUrl: "https://youtube.com/falainstrutor",
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
  digitalCertificateName: "FRANCISCO_MAILSON_DA_COSTA_CERT.pfx",
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

export const SEED_COURSES: Course[] = [
  {
    id: "course-nr10",
    code: "NR 10",
    name: "NR 10 - Básico - Segurança em Instalações e Serviços em Eletricidade",
    description: "Treinamento normativo essencial focado em segurança elétrica, prevenção de acidentes, riscos elétricos, aterramento seguro e procedimentos técnicos com base na NR10.",
    duration: 40,
    price: 250,
    isActive: true,
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=350&q=80",
    modules: [
      "Módulo 01 - Introdução à segurança com eletricidade",
      "Módulo 02 - Riscos em instalações e serviços",
      "Módulo 03 - Técnicas de análise de risco elétrico",
      "Módulo 04 - Medidas de controle de risco",
      "Módulo 05 - Normas técnicas brasileiras aplicáveis",
      "Módulo 06 - Regulamentos do Ministério do Trabalho",
      "Módulo 07 - Equipamentos de proteção coletiva (EPC)",
      "Módulo 08 - Equipamentos de proteção individual (EPI)",
      "Módulo 09 - Rotinas e procedimentos de trabalho",
      "Módulo 10 - Documentação de instalações elétricas",
      "Módulo 11 - Riscos adicionais (altura, umidade, etc.)",
      "Módulo 12 - Proteção e combate a incêndio",
      "Módulo 13 - Acidentes de origem elétrica",
      "Módulo 14 - Primeiros socorros e RCP",
      "Módulo 15 - Responsabilidades e deveres"
    ],
    instructors: [
      { id: "inst-1", name: "José Ronaldo Mérida", formation: "Engenheiro Eletricista" }
    ],
    manualActivities: ["Instalação com Linha Viva", "Bloqueio e Travamento de Disjuntores"]
  },
  {
    id: "course-nr11",
    code: "NR 11",
    name: "NR 11 - Segurança na Operação de Empilhadeira",
    description: "Formação completa para operadores de empilhadeiras. Aborda técnicas de movimentação, carregamento, transporte estável e movimentação segura de cargas industriais.",
    duration: 16,
    price: 226,
    isActive: true,
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&h=350&q=80",
    modules: [
      "Módulo 01 - Legislação, NR 11 e Conceitos Básicos",
      "Módulo 02 - Tipos de Empilhadeiras e Componentes",
      "Módulo 03 - Estabilidade Física e Equilíbrio de Carga",
      "Módulo 04 - Checklists antes do início de turno",
      "Módulo 05 - Técnicas Seguras de Empilhamento e Desempilhamento",
      "Módulo 06 - Prática de Circulação e Desvios de Obstáculos"
    ],
    instructors: [
      { id: "inst-2", name: "Instrutor Qualificado", formation: "Engenheiro de Segurança / Civil" }
    ],
    manualActivities: ["Operação e Manobra em Rampa com Carga Seca", "Curvas em Ângulo de 90 com Palette de Madeira"]
  },
  {
    id: "course-nr345",
    code: "NR 34.5",
    name: "NR 34.5 - Segurança para Trabalho a Quente",
    description: "Estudo detalhado de riscos e medidas preventivas em operações a quente, soldagem, corte térmico e outras atividades afins que produzem fagulhas e calor intenso.",
    duration: 8,
    price: 159,
    isActive: true,
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&h=350&q=80",
    modules: [
      "Módulo 01 - Introdução aos Fundamentos do Trabalho a Quente",
      "Módulo 02 - Riscos de Incêndio e Explosão em Atmosferas Inflamáveis",
      "Módulo 03 - Medidas e Sistemas de Linha de Contenção de Fagulhas",
      "Módulo 04 - Equipamentos Críticos e Monitoramento de Gases"
    ],
    instructors: [
      { id: "inst-2", name: "Instrutor Qualificado", formation: "Engenheiro de Segurança / Civil" }
    ],
    manualActivities: ["Controle de Atmosfera e Permissão de Trabalho (PET)"]
  },
  {
    id: "course-nr35",
    code: "NR 35",
    name: "NR 35 - Segurança no Trabalho em Altura",
    description: "Capacitação completa para profissionais que executam tarefas acima de 2 metros de altura utilizando ancoragens, cinturões antiqueda e cabos de segurança.",
    duration: 8,
    price: 199,
    isActive: true,
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1541535650810-10d26f5c2ab3?auto=format&fit=crop&w=600&h=350&q=80",
    modules: [
      "Módulo 01 - Regulamentação jurídica aplicável - NR 35",
      "Módulo 02 - Análise de Riscos e Condições Impeditivas",
      "Módulo 03 - Sistemas, Equipamentos e Procedimentos de Proteção Coletiva",
      "Módulo 04 - Linha de Vida, Cabo de Aço e Pontos de Ancoragem Seguros",
      "Módulo 05 - EPI para Trabalho em Altura: Seleção, Uso e Critérios de Inspeção",
      "Módulo 06 - Resgate Emergencial em Altura e Primeiros Socorros"
    ],
    instructors: [
      { id: "inst-2", name: "Instrutor Qualificado", formation: "Engenheiro de Segurança / Civil" },
      { id: "inst-3", name: "Wanderson Lírio", formation: "Engenheiro de Segurança do Trabalho" }
    ],
    manualActivities: ["Instalação com Ancoragem de Cabos Recartilhados", "Inspeção e Descarte de Cinto de Segurança"]
  },
  {
    id: "course-dirdef-16",
    code: "DIR-DEF-16",
    name: "Direção Defensiva - 16 Horas (SEMIPRESENCIAL)",
    description: "Métodos modernos de segurança no trânsito para motoristas profissionais, condutores de veículos de emergência e transporte pesado. Formato híbrido: EAD + Prática.",
    duration: 16,
    price: 299,
    isActive: true,
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&h=350&q=80",
    modules: [
      "Módulo 01 - Fundamentos Conceituais do Trânsito",
      "Módulo 02 - Condições Adversas e Prevenção de Colisões",
      "Módulo 03 - Legislação, Álcool, Drogas e Direção Segura",
      "Módulo 04 - Manutenção Preventiva do Veículo",
      "Módulo 05 - Primeiros Socorros em Vias Públicas"
    ],
    instructors: [
      { id: "inst-2", name: "Instrutor Qualificado", formation: "Engenheiro de Segurança / Civil" }
    ],
    manualActivities: ["Manobra de Slalom para Controle de Tração", "Frenagem e Desvio de Emergência com ABS"]
  },
  {
    id: "course-loto",
    code: "LOTO",
    name: "Loto - Lockout e Tagout - Isolamento de Fontes de Energia Perigosas",
    description: "Treinamento especializado em sistemas de bloqueio e identificação (travas e cadeados) de energia em reformas, manutenções e reparos mecânicos/elétricos.",
    duration: 4,
    price: 14,
    isActive: true,
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&h=350&q=80",
    modules: [
      "Módulo 01 - Conceitos Básicos de Energias Perigosas",
      "Módulo 02 - Dispositivos de Bloqueio Físico (Cadeados, Garras, Dispositivos)",
      "Módulo 03 - Cartões de Etiquetagem e Procedimentos de Trabalho",
      "Módulo 04 - Zero Energia e Testes de Confirmação"
    ],
    instructors: [
      { id: "inst-2", name: "Instrutor Qualificado", formation: "Engenheiro de Segurança / Civil" }
    ],
    manualActivities: ["Etiquetagem com Tag de Identificação Individual", "Travamento Mecânico de Válvula Globo"]
  }
];

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
