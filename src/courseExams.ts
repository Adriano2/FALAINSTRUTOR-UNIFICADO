/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Provas temáticas geradas por curso (banco de questões específico de cada NR /
 * tema). Mescladas em RECORD_EXAMS no data.ts. Editáveis depois no painel
 * (Editor de Provas), que tem precedência: o seed só aplica estas quando o
 * curso ainda usa a prova genérica ou não tem prova.
 */

import type { ExamQuestion } from './types';

export const GENERATED_EXAMS: Record<string, ExamQuestion[]> = {
  "course-nr01": [
    {
      "question": "De acordo com a NR 01, qual documento integra o Gerenciamento de Riscos Ocupacionais (GRO) e deve conter o inventário de riscos e o plano de ação da organização?",
      "options": [
        "A) PCMSO (Programa de Controle Médico de Saúde Ocupacional)",
        "B) PGR (Programa de Gerenciamento de Riscos)",
        "C) LTCAT (Laudo Técnico das Condições Ambientais de Trabalho)",
        "D) PPRA (Programa de Prevenção de Riscos Ambientais)"
      ],
      "correctIndex": 1
    },
    {
      "question": "Segundo a NR 01, as Ordens de Serviço sobre segurança e saúde no trabalho que o empregador deve emitir têm como principal finalidade:",
      "options": [
        "A) Substituir o uso de Equipamentos de Proteção Individual",
        "B) Definir o organograma hierárquico da empresa",
        "C) Dar conhecimento aos trabalhadores sobre riscos e medidas de prevenção adotadas",
        "D) Registrar a jornada de trabalho dos empregados"
      ],
      "correctIndex": 2
    },
    {
      "question": "Conforme a NR 01, o inventário de riscos ocupacionais deve ser mantido atualizado e revisto, no mínimo:",
      "options": [
        "A) A cada 6 meses, independentemente de ocorrências",
        "B) A cada 2 anos, ou a cada 3 anos para empresas com certificação no eSocial, ou quando houver alterações relevantes",
        "C) Somente quando ocorrer acidente fatal",
        "D) A cada 5 anos, em qualquer hipótese"
      ],
      "correctIndex": 1
    },
    {
      "question": "Na hierarquia de medidas de prevenção prevista no GRO da NR 01, qual medida deve ser priorizada?",
      "options": [
        "A) Fornecimento de EPI ao trabalhador",
        "B) Medidas administrativas ou de organização do trabalho",
        "C) Eliminação dos fatores de risco",
        "D) Sinalização de advertência"
      ],
      "correctIndex": 2
    },
    {
      "question": "Segundo a NR 01, constitui direito do trabalhador em relação à segurança e saúde no trabalho:",
      "options": [
        "A) Recusar-se a usar EPI fornecido gratuitamente pelo empregador",
        "B) Interromper suas atividades quando constatar situação de risco grave e iminente para sua segurança ou de terceiros",
        "C) Modificar dispositivos de segurança das máquinas conforme sua conveniência",
        "D) Dispensar a participação em treinamentos obrigatórios"
      ],
      "correctIndex": 1
    },
    {
      "question": "De acordo com a NR 01, as Microempresas (ME) e Empresas de Pequeno Porte (EPP) graus de risco 1 e 2 que declararem inexistência de exposição a riscos podem:",
      "options": [
        "A) Ficar dispensadas da elaboração do PGR",
        "B) Deixar de emitir Ordens de Serviço em qualquer caso",
        "C) Dispensar todos os trabalhadores de treinamentos",
        "D) Eliminar a CIPA permanentemente sem qualquer condição"
      ],
      "correctIndex": 0
    },
    {
      "question": "Na integração ao ambiente de trabalho, conforme os princípios da NR 01, é dever do empregador:",
      "options": [
        "A) Transferir integralmente a responsabilidade pelos riscos ao trabalhador",
        "B) Informar os trabalhadores sobre os riscos ocupacionais existentes e as medidas de controle adotadas",
        "C) Cobrar dos empregados o custo dos EPIs fornecidos",
        "D) Manter os procedimentos de segurança em sigilo dos trabalhadores"
      ],
      "correctIndex": 1
    }
  ],
  "course-nr12": [
    {
      "question": "Conforme a NR 12, as proteções fixas das máquinas e equipamentos devem ser instaladas de modo que:",
      "options": [
        "A) Possam ser removidas manualmente pelo operador durante a produção",
        "B) Sua remoção ou abertura exija o uso de ferramentas específicas",
        "C) Permaneçam abertas para facilitar a inspeção visual contínua",
        "D) Sejam dispensáveis quando a máquina opera em baixa velocidade"
      ],
      "correctIndex": 1
    },
    {
      "question": "Segundo a NR 12, o dispositivo de parada de emergência das máquinas deve:",
      "options": [
        "A) Ter rearme automático após o acionamento, religando a máquina sozinha",
        "B) Estar localizado apenas no painel central de comando, longe da zona de operação",
        "C) Ser de fácil acionamento e localização, e o restabelecimento não pode reiniciar a máquina, apenas permitir o reinício",
        "D) Funcionar somente quando a máquina estiver desligada"
      ],
      "correctIndex": 2
    },
    {
      "question": "De acordo com a NR 12, qual é a finalidade das proteções móveis intertravadas em uma máquina?",
      "options": [
        "A) Reduzir o consumo de energia da máquina",
        "B) Interromper as funções perigosas da máquina quando a proteção for aberta ou removida",
        "C) Aumentar a velocidade de produção",
        "D) Servir apenas como sinalização visual de área restrita"
      ],
      "correctIndex": 1
    },
    {
      "question": "Conforme a NR 12, em relação ao arranjo físico e às áreas de circulação ao redor das máquinas, deve-se garantir:",
      "options": [
        "A) Distância mínima de 0,60 m entre as partes móveis das máquinas e paredes ou outras máquinas",
        "B) Que os materiais sejam empilhados sobre as máquinas para economizar espaço",
        "C) Que não haja qualquer demarcação de pisos nas áreas de circulação",
        "D) Iluminação reduzida para evitar reflexos nos painéis"
      ],
      "correctIndex": 0
    },
    {
      "question": "Segundo a NR 12, a manutenção, inspeção e reparo de máquinas e equipamentos devem ser realizados:",
      "options": [
        "A) Sempre com a máquina em funcionamento para verificar os defeitos",
        "B) Por qualquer trabalhador disponível, sem necessidade de capacitação",
        "C) Por profissionais capacitados, com a máquina parada e adotando-se procedimentos de bloqueio e etiquetagem (lockout/tagout)",
        "D) Apenas pelo setor administrativo da empresa"
      ],
      "correctIndex": 2
    },
    {
      "question": "De acordo com os princípios gerais da NR 12, os dispositivos de segurança devem:",
      "options": [
        "A) Selecionar e garantir a eficácia das medidas de proteção conforme a análise de risco, sob responsabilidade do empregador",
        "B) Ser instalados apenas em máquinas novas, dispensando as máquinas antigas",
        "C) Ter sua manutenção sob exclusiva responsabilidade do fabricante após a venda",
        "D) Ser desativados durante a produção para não reduzir a produtividade"
      ],
      "correctIndex": 0
    },
    {
      "question": "Conforme a NR 12, sobre os procedimentos de trabalho e operação segura de máquinas, é correto afirmar que:",
      "options": [
        "A) Devem existir procedimentos de trabalho e segurança específicos, padronizados, com a descrição detalhada de cada tarefa",
        "B) Os procedimentos podem ser apenas verbais, sem registro documental",
        "C) A capacitação dos operadores é facultativa para máquinas de pequeno porte",
        "D) Cada operador pode definir livremente seu próprio método de operação"
      ],
      "correctIndex": 0
    }
  ],
  "course-nr13": [
    {
      "question": "De acordo com a NR 13, as caldeiras a vapor são classificadas em categorias conforme a pressão de operação. A Categoria A corresponde às caldeiras cuja pressão de operação é:",
      "options": [
        "A) Igual ou superior a 1,96 MPa (19,98 kgf/cm²)",
        "B) Inferior a 0,6 MPa",
        "C) Igual a zero (pressão atmosférica)",
        "D) Entre 0,1 e 0,5 MPa"
      ],
      "correctIndex": 0
    },
    {
      "question": "Conforme a NR 13, qual dispositivo de segurança é obrigatório nas caldeiras para limitar a pressão interna, abrindo automaticamente ao atingir a pressão máxima de trabalho admissível?",
      "options": [
        "A) Manômetro",
        "B) Válvula de segurança",
        "C) Injetor de água",
        "D) Termômetro"
      ],
      "correctIndex": 1
    },
    {
      "question": "Segundo a NR 13, o documento que reúne as características técnicas, dados de projeto e histórico de inspeções de uma caldeira é o:",
      "options": [
        "A) Prontuário da caldeira",
        "B) Manual do fabricante apenas",
        "C) Cartão de ponto do operador",
        "D) Laudo de insalubridade"
      ],
      "correctIndex": 0
    },
    {
      "question": "De acordo com a NR 13, a operação de caldeiras Categoria A deve ser realizada por:",
      "options": [
        "A) Qualquer trabalhador da empresa, sem exigência específica",
        "B) Operador com curso de segurança na operação de caldeiras e estágio prático supervisionado",
        "C) Profissional habilitado somente em manutenção mecânica",
        "D) Engenheiro de produção, exclusivamente"
      ],
      "correctIndex": 1
    },
    {
      "question": "Conforme a NR 13, a inspeção de segurança periódica das caldeiras compreende, em geral:",
      "options": [
        "A) Apenas exame visual externo a cada 5 anos",
        "B) Exames interno e externo, com periodicidades definidas conforme a categoria e a existência de SPIE",
        "C) Somente teste de funcionamento da válvula de segurança a cada 10 anos",
        "D) Nenhuma inspeção, bastando o registro inicial"
      ],
      "correctIndex": 1
    },
    {
      "question": "Segundo a NR 13, são considerados vasos de pressão os equipamentos que:",
      "options": [
        "A) Operam exclusivamente à pressão atmosférica",
        "B) Contêm fluidos sob pressão interna ou externa diferente da atmosférica",
        "C) Armazenam apenas materiais sólidos",
        "D) Transportam pessoas entre andares"
      ],
      "correctIndex": 1
    },
    {
      "question": "De acordo com a NR 13, em uma situação de emergência envolvendo uma caldeira, qual procedimento é adequado quando há falta de água no nível mínimo (baixo nível)?",
      "options": [
        "A) Adicionar imediatamente grande quantidade de água fria para resfriar o equipamento",
        "B) Aumentar a queima de combustível para manter a produção de vapor",
        "C) Bloquear a alimentação de combustível e seguir o procedimento de parada de emergência, sem injetar água bruscamente",
        "D) Ignorar o alarme e manter a operação normal"
      ],
      "correctIndex": 2
    }
  ],
  "course-nr17": [
    {
      "question": "Conforme a NR 17, o objetivo geral da norma de ergonomia é:",
      "options": [
        "A) Estabelecer parâmetros que permitam a adaptação das condições de trabalho às características psicofisiológicas dos trabalhadores",
        "B) Definir a carga tributária das empresas industriais",
        "C) Adaptar o trabalhador às máquinas, independentemente de suas limitações",
        "D) Regulamentar exclusivamente o uso de EPI em altura"
      ],
      "correctIndex": 0
    },
    {
      "question": "Segundo a NR 17, em atividades que exijam levantamento manual de cargas, deve-se observar que:",
      "options": [
        "A) Não há qualquer recomendação sobre transporte manual de cargas",
        "B) Toda carga superior a 10 kg deve ser obrigatoriamente transportada por dois trabalhadores",
        "C) Quando o transporte manual de cargas for realizado por trabalhador, devem ser adotadas medidas para evitar comprometimento da saúde e segurança",
        "D) O peso máximo é sempre fixo em 60 kg, sem distinção de gênero ou condição"
      ],
      "correctIndex": 2
    },
    {
      "question": "De acordo com a NR 17, nos trabalhos realizados na posição sentada, o mobiliário do posto de trabalho deve dispor de:",
      "options": [
        "A) Assento sem qualquer regulagem, fixo em altura padrão",
        "B) Assento com altura ajustável, borda frontal arredondada e encosto adaptável à coluna vertebral",
        "C) Apenas um banquinho de madeira sem encosto",
        "D) Cadeira giratória sem apoio para os pés em nenhuma hipótese"
      ],
      "correctIndex": 1
    },
    {
      "question": "Segundo a NR 17, a Análise Ergonômica do Trabalho (AET) deve:",
      "options": [
        "A) Ser realizada apenas após a ocorrência de doença ocupacional",
        "B) Abordar, no mínimo, as condições de trabalho, a organização do trabalho e os fatores de risco ergonômicos, com recomendações",
        "C) Limitar-se a medir a temperatura do ambiente",
        "D) Substituir integralmente o PGR da empresa"
      ],
      "correctIndex": 1
    },
    {
      "question": "Conforme a NR 17, em atividades que exijam sobrecarga muscular estática ou dinâmica do pescoço, ombros, dorso e membros, a organização do trabalho deve prever:",
      "options": [
        "A) Aumento contínuo do ritmo de produção",
        "B) Pausas para descanso, observando ritmos de trabalho compatíveis com as exigências da tarefa",
        "C) Eliminação de qualquer intervalo durante a jornada",
        "D) Substituição obrigatória do trabalhador a cada 30 dias"
      ],
      "correctIndex": 1
    },
    {
      "question": "De acordo com a NR 17, em relação às condições ambientais nos locais de trabalho onde são executadas atividades que exijam solicitação intelectual e atenção constante, recomenda-se que os níveis de ruído sejam:",
      "options": [
        "A) Mantidos acima de 90 dB para estimular o trabalhador",
        "B) Adequados, com valor recomendado de até 65 dB(A) para conforto acústico",
        "C) Ignorados, pois não influenciam a ergonomia",
        "D) Fixados sempre em exatamente 85 dB"
      ],
      "correctIndex": 1
    },
    {
      "question": "Segundo a NR 17, no que se refere ao trabalho em teleatendimento/telemarketing, um dos fundamentos ergonômicos é:",
      "options": [
        "A) A proibição de qualquer pausa durante a jornada",
        "B) A adoção de mobiliário e equipamentos adequados e a previsão de pausas no decorrer da jornada para reduzir a sobrecarga",
        "C) A obrigatoriedade de o operador permanecer em pé toda a jornada",
        "D) A dispensa de regulagem do mobiliário"
      ],
      "correctIndex": 1
    }
  ],
  "course-nr18": [
    {
      "question": "Conforme a NR 18, o documento de gerenciamento de riscos específico do setor da construção que substituiu o antigo PCMAT é o:",
      "options": [
        "A) PGR (Programa de Gerenciamento de Riscos), abrangendo a indústria da construção",
        "B) LTCAT da obra",
        "C) PPP do canteiro",
        "D) ASO coletivo"
      ],
      "correctIndex": 0
    },
    {
      "question": "Segundo a NR 18, as áreas de vivência dos canteiros de obra devem dispor, no mínimo, de:",
      "options": [
        "A) Apenas escritório administrativo",
        "B) Instalações sanitárias, vestiário, local para refeições e, conforme o caso, alojamento e área de lazer",
        "C) Somente bebedouros",
        "D) Estacionamento coberto exclusivo para veículos da empresa"
      ],
      "correctIndex": 1
    },
    {
      "question": "De acordo com a NR 18, o guarda-corpo utilizado como proteção coletiva contra quedas em aberturas e periferias deve possuir, além do rodapé, travessões a quais alturas?",
      "options": [
        "A) Travessa superior a 0,90 m e travessa intermediária a 0,70 m do piso",
        "B) Travessa superior a 1,20 m e travessa intermediária a 0,70 m, com rodapé de 0,20 m",
        "C) Travessa única a 0,50 m do piso",
        "D) Travessa superior a 2,00 m, sem travessa intermediária"
      ],
      "correctIndex": 1
    },
    {
      "question": "Segundo a NR 18, os andaimes devem ter seu piso de trabalho:",
      "options": [
        "A) Totalmente coberto, antiderrapante, nivelado e fixado de modo seguro, sem pontas soltas",
        "B) Composto por tábuas soltas, para facilitar a remoção",
        "C) Inclinado para escoar a água da chuva",
        "D) Dispensado quando o andaime for de pequena altura"
      ],
      "correctIndex": 0
    },
    {
      "question": "Conforme a NR 18, nas escavações com profundidade que exponha o trabalhador a risco de desmoronamento, deve-se adotar:",
      "options": [
        "A) Apenas sinalização luminosa noturna",
        "B) Escoramento/taludamento adequado quando houver risco de desmoronamento, e os taludes instáveis com mais de 1,25 m devem ter sua estabilidade garantida",
        "C) Nenhuma medida, pois o solo é sempre estável",
        "D) Aumento da velocidade da escavação para reduzir o tempo de exposição"
      ],
      "correctIndex": 1
    },
    {
      "question": "De acordo com a NR 18, as plataformas de proteção (bandejas) primária e secundárias instaladas no perímetro da edificação têm a finalidade de:",
      "options": [
        "A) Servir como local de armazenamento de materiais pesados",
        "B) Reter materiais e ferramentas que possam cair, protegendo trabalhadores e terceiros contra quedas de objetos",
        "C) Substituir os andaimes durante a alvenaria",
        "D) Funcionar apenas como elemento estético da fachada"
      ],
      "correctIndex": 1
    },
    {
      "question": "Segundo a NR 18, em trabalhos de demolição, antes do início dos serviços é necessário:",
      "options": [
        "A) Iniciar imediatamente pela base da estrutura para acelerar o processo",
        "B) Elaborar projeto/planejamento de demolição, desligar as redes de energia, água e gás, e remover vidros e materiais frágeis",
        "C) Manter todos os trabalhadores reunidos no interior da edificação",
        "D) Dispensar o uso de EPI por se tratar de atividade externa"
      ],
      "correctIndex": 1
    }
  ],
  "course-nr20": [
    {
      "question": "Conforme a NR-20, as instalações são classificadas de acordo com a quantidade de inflamáveis e combustíveis e a atividade desenvolvida. Como são denominadas essas classes de instalação?",
      "options": [
        "A) Classe I, Classe II e Classe III",
        "B) Classe 1, Classe 2 e Classe 3",
        "C) Classe A, Classe B e Classe C",
        "D) Classe baixa, média e alta complexidade"
      ],
      "correctIndex": 1
    },
    {
      "question": "Sobre o ponto de fulgor (flash point), conceito fundamental no estudo dos inflamáveis pela NR-20, é correto afirmar que ele representa:",
      "options": [
        "A) A temperatura mínima na qual um líquido libera vapores em quantidade suficiente para formar mistura inflamável com o ar na presença de uma fonte de ignição",
        "B) A temperatura na qual o líquido entra em combustão espontânea sem fonte externa de ignição",
        "C) A pressão necessária para liquefazer um gás combustível",
        "D) A concentração máxima de oxigênio que impede a combustão"
      ],
      "correctIndex": 0
    },
    {
      "question": "De acordo com a NR-20, considera-se líquido inflamável aquele que possui ponto de fulgor:",
      "options": [
        "A) Igual ou superior a 93°C",
        "B) Entre 60°C e 93°C",
        "C) Inferior ou igual a 60°C",
        "D) Apenas acima de 100°C"
      ],
      "correctIndex": 2
    },
    {
      "question": "Em relação aos limites de inflamabilidade de um vapor ou gás, é correto afirmar que a combustão só ocorre quando a concentração do combustível no ar está:",
      "options": [
        "A) Sempre abaixo do limite inferior de inflamabilidade (LII)",
        "B) Entre o limite inferior (LII) e o limite superior (LSI) de inflamabilidade",
        "C) Sempre acima do limite superior de inflamabilidade (LSI)",
        "D) Exatamente igual à pressão atmosférica"
      ],
      "correctIndex": 1
    },
    {
      "question": "Segundo a NR-20, a capacitação dos trabalhadores que atuam em instalações de inflamáveis e combustíveis é dividida em níveis. Os trabalhadores da área de operação de uma instalação Classe III devem possuir, no mínimo, qual nível de capacitação?",
      "options": [
        "A) Curso básico (8 horas)",
        "B) Curso intermediário (16 horas)",
        "C) Curso avançado I e II",
        "D) Apenas integração de admissão"
      ],
      "correctIndex": 2
    },
    {
      "question": "Entre as medidas de controle de risco previstas na NR-20 para áreas com atmosferas potencialmente explosivas, destaca-se a classificação de áreas. Qual o principal objetivo dessa classificação?",
      "options": [
        "A) Definir o salário dos trabalhadores expostos",
        "B) Determinar zonas onde podem ocorrer atmosferas explosivas para selecionar equipamentos elétricos adequados (à prova de explosão)",
        "C) Estabelecer a cor dos uniformes",
        "D) Calcular o ponto de fulgor dos produtos"
      ],
      "correctIndex": 1
    },
    {
      "question": "No contexto da prevenção e combate a emergências da NR-20, o Plano de Resposta a Emergências (PRE) deve contemplar, entre outros aspectos:",
      "options": [
        "A) Apenas a lista de fornecedores de combustível",
        "B) Os possíveis cenários de emergência, os recursos necessários e as ações de resposta e abandono",
        "C) Somente o organograma administrativo da empresa",
        "D) Exclusivamente os dados contábeis da instalação"
      ],
      "correctIndex": 1
    }
  ],
  "course-nr23": [
    {
      "question": "De acordo com a teoria do fogo, o chamado tetraedro do fogo é composto por quatro elementos. Quais são eles?",
      "options": [
        "A) Combustível, comburente, calor e reação em cadeia",
        "B) Água, areia, espuma e gás",
        "C) Oxigênio, nitrogênio, calor e fumaça",
        "D) Combustível, fumaça, fagulha e vento"
      ],
      "correctIndex": 0
    },
    {
      "question": "Conforme a classificação dos incêndios, um incêndio envolvendo equipamentos elétricos energizados é classificado como:",
      "options": [
        "A) Classe A",
        "B) Classe B",
        "C) Classe C",
        "D) Classe K"
      ],
      "correctIndex": 2
    },
    {
      "question": "Os incêndios envolvendo óleos e gorduras de cozinha, comuns em cozinhas industriais, pertencem a qual classe de fogo?",
      "options": [
        "A) Classe K",
        "B) Classe A",
        "C) Classe D",
        "D) Classe B"
      ],
      "correctIndex": 0
    },
    {
      "question": "Para combater um incêndio de Classe D, que envolve metais combustíveis como magnésio, sódio e titânio, o agente extintor adequado é:",
      "options": [
        "A) Água pressurizada",
        "B) Pó químico especial (classe D)",
        "C) Gás carbônico (CO2)",
        "D) Espuma mecânica"
      ],
      "correctIndex": 1
    },
    {
      "question": "Segundo a NR-23, as saídas de emergência e rotas de fuga dos locais de trabalho devem atender ao seguinte requisito básico:",
      "options": [
        "A) Permanecer trancadas durante o expediente para evitar furtos",
        "B) Manter-se desobstruídas, sinalizadas e de fácil acesso para permitir a saída rápida e segura em caso de emergência",
        "C) Ser utilizadas apenas pela gerência",
        "D) Ter largura inferior a 0,80 m para economizar espaço"
      ],
      "correctIndex": 1
    },
    {
      "question": "Sobre o extintor de gás carbônico (CO2), é correto afirmar que ele atua principalmente por:",
      "options": [
        "A) Resfriamento intenso por absorção de calor da água",
        "B) Abafamento, reduzindo a concentração de oxigênio, sendo indicado para incêndios classes B e C",
        "C) Reação química com metais combustíveis",
        "D) Saturação da superfície com espuma"
      ],
      "correctIndex": 1
    },
    {
      "question": "No âmbito do plano de abandono e da brigada de incêndio, qual é a função primordial da brigada durante uma emergência?",
      "options": [
        "A) Realizar o controle financeiro da empresa",
        "B) Atuar na prevenção, abandono de área, combate a princípios de incêndio e prestação de primeiros socorros até a chegada do socorro especializado",
        "C) Substituir definitivamente o Corpo de Bombeiros",
        "D) Apenas registrar fotograficamente o sinistro"
      ],
      "correctIndex": 1
    }
  ],
  "course-nr31": [
    {
      "question": "A NR-31 estabelece os preceitos a serem observados na organização e no ambiente de trabalho relacionados a quais atividades?",
      "options": [
        "A) Indústria metalúrgica e construção civil",
        "B) Agricultura, pecuária, silvicultura, exploração florestal e aquicultura",
        "C) Comércio varejista e serviços bancários",
        "D) Mineração subterrânea e petróleo"
      ],
      "correctIndex": 1
    },
    {
      "question": "No manejo de agrotóxicos, conforme a NR-31, é vedado ao empregador rural:",
      "options": [
        "A) Fornecer EPI adequado e em bom estado de conservação",
        "B) Permitir o trabalho com agrotóxicos a trabalhadores que não tenham recebido capacitação prévia",
        "C) Manter local apropriado para guarda dos produtos",
        "D) Respeitar o intervalo de reentrada nas áreas tratadas"
      ],
      "correctIndex": 1
    },
    {
      "question": "Sobre o intervalo de reentrada após a aplicação de agrotóxicos previsto na NR-31, entende-se por esse conceito:",
      "options": [
        "A) O tempo de validade do produto na embalagem",
        "B) O período que deve ser respeitado entre a aplicação do agrotóxico e a entrada de pessoas na área tratada, sem o uso de EPI",
        "C) O prazo para devolução das embalagens vazias",
        "D) O tempo entre duas refeições do trabalhador"
      ],
      "correctIndex": 1
    },
    {
      "question": "Em relação às máquinas e implementos agrícolas, a NR-31 determina que as partes móveis que ofereçam risco de acidente devem:",
      "options": [
        "A) Ser pintadas de amarelo apenas",
        "B) Possuir proteções fixas ou móveis (dispositivos de segurança) que impeçam o acesso às zonas de perigo",
        "C) Funcionar somente à noite",
        "D) Ser operadas sem qualquer treinamento"
      ],
      "correctIndex": 1
    },
    {
      "question": "Quanto ao transporte de trabalhadores rurais, a NR-31 estabelece que os veículos utilizados devem:",
      "options": [
        "A) Transportar pessoas junto com cargas, animais ou agrotóxicos para otimizar o tempo",
        "B) Ser exclusivos para esse fim quando se tratar de veículos adaptados, com assentos fixos e seguros, vedado o transporte conjunto com agrotóxicos",
        "C) Dispensar qualquer adaptação de segurança",
        "D) Permitir o transporte de pessoas na carroceria de caminhões sem proteção"
      ],
      "correctIndex": 1
    },
    {
      "question": "No campo da ergonomia e condições de trabalho rural, a NR-31 prevê, entre as medidas de conforto e segurança, a obrigatoriedade de:",
      "options": [
        "A) Fornecer água potável e fresca em quantidade suficiente nos locais de trabalho e instalações sanitárias adequadas",
        "B) Dispensar pausas durante toda a jornada",
        "C) Proibir áreas de vivência",
        "D) Eliminar refeitórios em qualquer hipótese"
      ],
      "correctIndex": 0
    },
    {
      "question": "Sobre a Gestão de Segurança e Saúde no Trabalho Rural (GSSTR) prevista na NR-31, é correto afirmar que ela tem como objetivo:",
      "options": [
        "A) Substituir todas as demais normas trabalhistas",
        "B) Garantir a adoção de medidas de prevenção por meio da identificação de riscos, planejamento de ações e adoção de medidas de controle compatíveis com o porte do estabelecimento rural",
        "C) Apenas controlar a produtividade da colheita",
        "D) Tratar exclusivamente de questões tributárias"
      ],
      "correctIndex": 1
    }
  ],
  "course-nr33": [
    {
      "question": "Segundo a NR-33, considerando que o teor normal de oxigênio na atmosfera é de aproximadamente 20,9%, qual a faixa considerada segura (aceitável) para a entrada em um espaço confinado?",
      "options": [
        "A) Entre 15% e 18% de O2",
        "B) Entre 19,5% e 23% de O2",
        "C) Entre 10% e 19% de O2",
        "D) Entre 23% e 30% de O2"
      ],
      "correctIndex": 1
    },
    {
      "question": "De acordo com a NR-33, espaço confinado é definido como:",
      "options": [
        "A) Qualquer ambiente fechado com ar-condicionado",
        "B) Qualquer área ou ambiente não projetado para ocupação humana contínua, que possua meios limitados de entrada e saída, cuja ventilação seja insuficiente para remover contaminantes ou onde possa existir deficiência ou enriquecimento de oxigênio",
        "C) Todo local de trabalho com mais de duas saídas",
        "D) Apenas reservatórios subterrâneos de água potável"
      ],
      "correctIndex": 1
    },
    {
      "question": "A NR-33 define funções específicas para o trabalho em espaços confinados. Quais são os três papéis previstos na norma?",
      "options": [
        "A) Supervisor de entrada, vigia e trabalhador autorizado",
        "B) Gerente, fiscal e operador",
        "C) Brigadista, motorista e ajudante",
        "D) Engenheiro, técnico e estagiário"
      ],
      "correctIndex": 0
    },
    {
      "question": "A Permissão de Entrada e Trabalho (PET) prevista na NR-33 é um documento que:",
      "options": [
        "A) Tem validade indeterminada e serve para qualquer espaço",
        "B) Contém o conjunto de medidas de controle visando à entrada e ao trabalho seguro, bem como as medidas de emergência e resgate, sendo válida somente para cada entrada",
        "C) Substitui o monitoramento atmosférico",
        "D) Pode ser preenchido após o término do trabalho"
      ],
      "correctIndex": 1
    },
    {
      "question": "No monitoramento atmosférico de espaços confinados, qual é a sequência correta de avaliação dos gases recomendada antes da entrada?",
      "options": [
        "A) Gases tóxicos, oxigênio e depois gases inflamáveis",
        "B) Oxigênio, gases inflamáveis (explosividade) e por último gases tóxicos",
        "C) Apenas oxigênio é suficiente",
        "D) Gases inflamáveis, gases tóxicos e por último oxigênio"
      ],
      "correctIndex": 1
    },
    {
      "question": "Conforme a NR-33, qual é a principal atribuição do vigia durante a realização do trabalho em espaço confinado?",
      "options": [
        "A) Entrar no espaço confinado para auxiliar nas tarefas",
        "B) Permanecer fora do espaço confinado, junto à entrada, mantendo comunicação contínua com os trabalhadores e acionando o resgate em caso de emergência, sem nunca abandonar o posto",
        "C) Assinar a PET no lugar do supervisor",
        "D) Operar os equipamentos internos do espaço"
      ],
      "correctIndex": 1
    },
    {
      "question": "Em relação ao resgate em espaços confinados, a NR-33 estabelece que o empregador deve:",
      "options": [
        "A) Aguardar sempre a chegada do Corpo de Bombeiros antes de qualquer ação",
        "B) Dispor de equipe de resgate, equipamentos adequados e procedimentos para resposta rápida e eficaz às emergências, priorizando o resgate sem a entrada da equipe (resgate externo) sempre que possível",
        "C) Permitir que qualquer trabalhador realize o resgate sem treinamento",
        "D) Dispensar a necessidade de plano de resgate"
      ],
      "correctIndex": 1
    }
  ],
  "course-nr38": [
    {
      "question": "A NR-38 tem como objetivo estabelecer os requisitos de segurança e saúde no trabalho nas atividades de:",
      "options": [
        "A) Construção de edifícios residenciais",
        "B) Limpeza urbana e manejo de resíduos sólidos",
        "C) Operação de usinas nucleares",
        "D) Transporte aéreo de cargas"
      ],
      "correctIndex": 1
    },
    {
      "question": "Entre os principais riscos a que estão expostos os trabalhadores da coleta de resíduos sólidos urbanos, destaca-se o risco de trânsito. Uma medida preventiva fundamental prevista para a coleta é:",
      "options": [
        "A) Realizar a coleta sempre correndo atrás do caminhão em movimento",
        "B) Utilizar vestimenta de alta visibilidade (faixas refletivas) e adotar procedimentos seguros de embarque e desembarque do veículo coletor",
        "C) Dispensar o uso de sinalização nas vias",
        "D) Proibir o uso de luvas para facilitar o manuseio"
      ],
      "correctIndex": 1
    },
    {
      "question": "Os trabalhadores da limpeza urbana estão expostos a riscos biológicos. Qual das alternativas representa uma medida de controle adequada para esse tipo de risco?",
      "options": [
        "A) Manusear resíduos perfurocortantes diretamente com as mãos",
        "B) Fornecimento e uso de EPI adequados (luvas resistentes a perfuração, calçados de segurança) e manutenção do esquema vacinal (ex.: tétano e hepatite)",
        "C) Realizar refeições no local de manuseio dos resíduos",
        "D) Reutilizar luvas descartáveis danificadas"
      ],
      "correctIndex": 1
    },
    {
      "question": "Na atividade de varrição manual de vias públicas, um dos principais riscos ergonômicos está relacionado a:",
      "options": [
        "A) Exposição a radiação ionizante",
        "B) Posturas inadequadas, movimentos repetitivos e esforço físico, exigindo medidas como ferramentas ergonômicas e pausas para recuperação",
        "C) Risco de afogamento",
        "D) Exposição a alta pressão atmosférica"
      ],
      "correctIndex": 1
    },
    {
      "question": "De acordo com os procedimentos operacionais seguros da NR-38, durante a coleta domiciliar com caminhão compactador, é correto afirmar que:",
      "options": [
        "A) É permitido transportar trabalhadores na parte traseira (estribo) em vias de alta velocidade ou em marcha à ré",
        "B) É vedado o transporte de trabalhadores nos estribos durante manobras de marcha à ré e em deslocamentos longos ou em alta velocidade",
        "C) Não há necessidade de proteção nos mecanismos de compactação",
        "D) O coletor deve introduzir as mãos no mecanismo compactador para acelerar o serviço"
      ],
      "correctIndex": 1
    },
    {
      "question": "Quanto aos riscos químicos no manejo de resíduos sólidos, a NR-38 orienta que, ao manusear resíduos com possível contaminação química, o trabalhador deve:",
      "options": [
        "A) Identificar o produto pelo cheiro, aproximando o rosto do resíduo",
        "B) Utilizar os EPI adequados ao agente químico e seguir os procedimentos estabelecidos, evitando o contato direto e a mistura indevida de produtos",
        "C) Misturar produtos químicos diferentes para neutralizá-los",
        "D) Dispensar qualquer proteção respiratória"
      ],
      "correctIndex": 1
    },
    {
      "question": "Sobre as disposições gerais da NR-38, é responsabilidade do empregador no setor de limpeza urbana e manejo de resíduos sólidos:",
      "options": [
        "A) Transferir integralmente aos trabalhadores os custos das medidas de segurança",
        "B) Implementar medidas de prevenção, fornecer gratuitamente EPI e EPC adequados, capacitar os trabalhadores e garantir condições seguras de trabalho",
        "C) Eliminar o Programa de Gerenciamento de Riscos",
        "D) Dispensar a capacitação dos trabalhadores recém-admitidos"
      ],
      "correctIndex": 1
    }
  ],
  "course-incompat-quimica": [
    {
      "question": "Por que ácidos fortes (como ácido clorídrico) e bases fortes (como hidróxido de sódio) são considerados incompatíveis e não devem ser armazenados juntos?",
      "options": [
        "A) Porque ambos são inertes e não reagem entre si em nenhuma condição",
        "B) Porque reagem entre si liberando grande quantidade de calor (reação exotérmica de neutralização), podendo causar respingos e projeções",
        "C) Porque juntos formam um gás inerte que apaga incêndios",
        "D) Porque a mistura reduz a corrosividade de ambos, tornando-os seguros"
      ],
      "correctIndex": 1
    },
    {
      "question": "Segundo o GHS, qual pictograma é utilizado para indicar produtos químicos corrosivos (que causam corrosão à pele e danos aos olhos)?",
      "options": [
        "A) A chama sobre um círculo (comburente)",
        "B) O ponto de exclamação",
        "C) Os tubos de ensaio derramando líquido sobre uma mão e uma superfície (corrosão)",
        "D) A bomba explodindo"
      ],
      "correctIndex": 2
    },
    {
      "question": "Na leitura da FISPQ (Ficha de Informações de Segurança de Produto Químico), em qual seção são encontradas as informações sobre incompatibilidades e materiais a evitar?",
      "options": [
        "A) Seção 10 - Estabilidade e reatividade",
        "B) Seção 4 - Medidas de primeiros socorros",
        "C) Seção 2 - Identificação de perigos",
        "D) Seção 16 - Outras informações"
      ],
      "correctIndex": 0
    },
    {
      "question": "Qual é o risco principal ao se misturar agentes oxidantes fortes (como permanganato de potássio ou peróxidos) com materiais combustíveis ou orgânicos?",
      "options": [
        "A) Neutralização mútua sem qualquer risco",
        "B) Formação de uma solução tampão estável",
        "C) Risco de ignição, combustão violenta ou explosão, pois o oxidante fornece oxigênio para a queima",
        "D) Solidificação imediata da mistura sem geração de calor"
      ],
      "correctIndex": 2
    },
    {
      "question": "Em uma tabela de segregação de produtos químicos, qual a principal função das classes incompatíveis sinalizadas?",
      "options": [
        "A) Indicar quais produtos podem ser descartados na mesma embalagem",
        "B) Determinar a ordem alfabética de catalogação dos produtos",
        "C) Orientar o armazenamento separado de substâncias que reagem perigosamente entre si, evitando contato acidental",
        "D) Definir o preço de mercado de cada produto químico"
      ],
      "correctIndex": 2
    },
    {
      "question": "Qual cuidado é fundamental no armazenamento de cilindros de gases comprimidos para garantir a segurança?",
      "options": [
        "A) Mantê-los deitados próximos a fontes de calor para acelerar o uso",
        "B) Armazená-los em pé, fixados/acorrentados, com a válvula protegida e separando gases incompatíveis (ex.: comburentes de inflamáveis)",
        "C) Armazenar oxigênio e acetileno sempre lado a lado para facilitar a soldagem",
        "D) Empilhar os cilindros horizontalmente sem qualquer fixação"
      ],
      "correctIndex": 1
    },
    {
      "question": "Em caso de contato de um produto químico corrosivo com os olhos, qual é o procedimento correto de primeiros socorros?",
      "options": [
        "A) Esfregar os olhos vigorosamente para remover o produto",
        "B) Aplicar uma pomada neutralizante imediatamente sem lavar",
        "C) Lavar abundantemente com água corrente por pelo menos 15 minutos, mantendo as pálpebras abertas, e procurar atendimento médico",
        "D) Vendar os olhos e aguardar a evaporação do produto"
      ],
      "correctIndex": 2
    },
    {
      "question": "O contato entre hipoclorito de sódio (água sanitária) e produtos ácidos (como ácido muriático) é perigoso porque:",
      "options": [
        "A) Produz apenas água e sal de cozinha, sem riscos",
        "B) Libera gás cloro (Cl2), tóxico e irritante para as vias respiratórias",
        "C) Forma um gel inerte que pode ser descartado normalmente",
        "D) Resfria o ambiente, congelando a mistura"
      ],
      "correctIndex": 1
    }
  ],
  "course-class-rotulagem": [
    {
      "question": "Quantas seções compõem a estrutura padronizada de uma FISPQ (Ficha de Informações de Segurança de Produto Químico) conforme a ABNT NBR 14725?",
      "options": [
        "A) 8 seções",
        "B) 12 seções",
        "C) 16 seções",
        "D) 20 seções"
      ],
      "correctIndex": 2
    },
    {
      "question": "No Sistema GHS, quais são as duas palavras de advertência (palavras-sinal) utilizadas nos rótulos de produtos químicos?",
      "options": [
        "A) \"Perigo\" e \"Atenção\"",
        "B) \"Cuidado\" e \"Aviso\"",
        "C) \"Urgente\" e \"Alerta\"",
        "D) \"Risco\" e \"Precaução\""
      ],
      "correctIndex": 0
    },
    {
      "question": "No GHS, o que identificam as frases que começam com a letra \"H\" (por exemplo, H225)?",
      "options": [
        "A) São frases de precaução, que indicam medidas de prevenção e resposta",
        "B) São frases de perigo (Hazard statements), que descrevem a natureza do perigo do produto",
        "C) São códigos de transporte rodoviário do produto",
        "D) São números de registro do produto na ANVISA"
      ],
      "correctIndex": 1
    },
    {
      "question": "Qual norma regulamentadora trata especificamente da sinalização de segurança e da rotulagem preventiva de produtos químicos no ambiente de trabalho no Brasil?",
      "options": [
        "A) NR-10",
        "B) NR-35",
        "C) NR-26",
        "D) NR-12"
      ],
      "correctIndex": 2
    },
    {
      "question": "No GHS, qual pictograma é representado por um ponto de exclamação e está associado a perigos como irritação da pele/olhos, toxicidade aguda menos severa e sensibilização cutânea?",
      "options": [
        "A) O pictograma do crânio e ossos cruzados (toxicidade aguda severa)",
        "B) O pictograma do ponto de exclamação",
        "C) O pictograma do perigo à saúde (silhueta com estrela no tórax)",
        "D) O pictograma do meio ambiente (peixe e árvore mortos)"
      ],
      "correctIndex": 1
    },
    {
      "question": "Qual é a finalidade principal do Sistema Globalmente Harmonizado (GHS) de classificação e rotulagem de produtos químicos?",
      "options": [
        "A) Estabelecer preços internacionais uniformes para produtos químicos",
        "B) Padronizar mundialmente os critérios de classificação de perigos e a comunicação de perigos (rótulos e FISPQ)",
        "C) Proibir a exportação de produtos químicos perigosos entre países",
        "D) Criar um imposto único sobre produtos químicos"
      ],
      "correctIndex": 1
    },
    {
      "question": "Conforme a NR-26, qual cor é utilizada para identificar equipamentos de combate a incêndio (como extintores e hidrantes)?",
      "options": [
        "A) Verde",
        "B) Amarelo",
        "C) Vermelho",
        "D) Azul"
      ],
      "correctIndex": 2
    },
    {
      "question": "Sobre os pictogramas de perigo do GHS, qual é a característica de seu formato visual padronizado?",
      "options": [
        "A) Um quadrado azul com símbolo branco",
        "B) Um losango (quadrado em pé) com borda vermelha, fundo branco e símbolo preto",
        "C) Um triângulo verde com símbolo amarelo",
        "D) Um círculo preto com símbolo vermelho"
      ],
      "correctIndex": 1
    }
  ],
  "course-quimicos-controlados": [
    {
      "question": "Qual lei federal dispõe sobre o controle de produtos químicos que podem ser destinados à elaboração ilícita de substâncias entorpecentes (precursores), sob fiscalização da Polícia Federal?",
      "options": [
        "A) Lei nº 10.357/2001",
        "B) Lei nº 8.666/1993",
        "C) Lei nº 6.938/1981",
        "D) Lei nº 9.605/1998"
      ],
      "correctIndex": 0
    },
    {
      "question": "No âmbito do controle pela Polícia Federal, qual decreto regulamenta a Lei nº 10.357/2001, estabelecendo as normas de controle e fiscalização de produtos químicos?",
      "options": [
        "A) Decreto nº 4.262/2002",
        "B) Decreto nº 5.123/2004",
        "C) Decreto nº 3.665/2000",
        "D) Decreto nº 4.074/2002"
      ],
      "correctIndex": 0
    },
    {
      "question": "O controle de produtos controlados pelo Exército Brasileiro (como explosivos e seus precursores) é regido principalmente por qual regulamento?",
      "options": [
        "A) R-105 (Regulamento de Fiscalização de Produtos Controlados - RFPC), administrado pela DFPC",
        "B) Norma Regulamentadora NR-19",
        "C) Resolução CONAMA nº 237",
        "D) Estatuto do Desarmamento (Lei nº 10.826/2003)"
      ],
      "correctIndex": 0
    },
    {
      "question": "Empresas que utilizam produtos químicos controlados pela Polícia Federal devem possuir qual documento obrigatório para exercer suas atividades?",
      "options": [
        "A) Apenas o alvará da prefeitura municipal",
        "B) Licença de Funcionamento e Certificado de Licenciamento (com renovação periódica)",
        "C) Carteira de habilitação dos sócios",
        "D) Certidão negativa de débitos trabalhistas apenas"
      ],
      "correctIndex": 1
    },
    {
      "question": "O que é o Mapa de Movimentação (ou Mapa de Controle) exigido das empresas que lidam com produtos químicos controlados?",
      "options": [
        "A) Um mapa rodoviário das rotas de entrega dos produtos",
        "B) Um demonstrativo periódico das quantidades de produtos controlados adquiridos, produzidos, consumidos, vendidos e em estoque",
        "C) Um mapa geográfico da localização das filiais da empresa",
        "D) Um plano de evacuação em caso de emergência química"
      ],
      "correctIndex": 1
    },
    {
      "question": "No Estado de São Paulo, qual órgão exerce o controle e a fiscalização de produtos químicos controlados em âmbito estadual?",
      "options": [
        "A) A Polícia Civil de SP (por meio de sua divisão de produtos controlados)",
        "B) A Secretaria Estadual da Educação",
        "C) O Corpo de Bombeiros, exclusivamente",
        "D) O Tribunal de Justiça de SP"
      ],
      "correctIndex": 0
    },
    {
      "question": "Quanto à fiscalização, qual pode ser a consequência para uma empresa que mantém produtos químicos controlados sem a devida licença ou com a documentação irregular?",
      "options": [
        "A) Nenhuma, pois o controle é apenas uma recomendação",
        "B) Apenas uma advertência verbal, sem registro",
        "C) Aplicação de multas, apreensão dos produtos, interdição e, em casos graves, responsabilização penal",
        "D) Desconto no valor das próximas licenças"
      ],
      "correctIndex": 2
    },
    {
      "question": "Um mesmo produto químico pode estar sujeito a controle simultâneo de mais de um órgão (Polícia Federal, Exército e/ou Polícia Civil). Nesse caso, a empresa deve:",
      "options": [
        "A) Escolher apenas um órgão de sua preferência para se registrar",
        "B) Atender às exigências de todos os órgãos competentes que controlam aquele produto, obtendo as licenças correspondentes",
        "C) Ignorar os controles estaduais e atender apenas ao federal",
        "D) Suspender o uso do produto até que os órgãos definam um único responsável"
      ],
      "correctIndex": 1
    }
  ]
};
