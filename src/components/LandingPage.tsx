/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Shield, Award, Clock, Search, BookOpen, MapPin, Send, HelpCircle, AlertTriangle, FileText, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Course, ContactMessage } from '../types';

interface LandingPageProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onSubmitContact: (message: Omit<ContactMessage, 'id' | 'date'>) => void;
}

// Banners for the slider
interface SliderBanner {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  hours: string;
  type: string;
  bgColor: string;
  imageUrl: string;
}

export default function LandingPage({ courses, onSelectCourse, onSubmitContact }: LandingPageProps) {
  // Slider State
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const slides: SliderBanner[] = [
    {
      id: 1,
      code: "NR 11",
      title: "SEGURANÇA NA OPERAÇÃO DE EMPILHADEIRA",
      subtitle: "Capacitação profissional teórica e prática para operadores industriais.",
      hours: "16 HORAS",
      type: "Presencial & Semipresencial",
      bgColor: "bg-amber-500",
      imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&h=500&q=80"
    },
    {
      id: 2,
      code: "DIREÇÃO DEFENSIVA",
      title: "DIREÇÃO DEFENSIVA",
      subtitle: "Prevenção de acidentes e direção preventiva de veículos corporativos.",
      hours: "16 HORAS",
      type: "SEMIPRESENCIAL",
      bgColor: "bg-amber-500",
      imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&h=500&q=80"
    },
    {
      id: 3,
      code: "LOTO",
      title: "LOCKOUT E TAGOUT (LOTO)",
      subtitle: "Controle de fontes de energias perigosas e prevenção de acidentes severos.",
      hours: "4 HORAS",
      type: "EAD 100% ONLINE",
      bgColor: "bg-red-600",
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&h=500&q=80"
    },
    {
      id: 4,
      code: "NR 01",
      title: "INTEGRAÇÃO DE SEGURANÇA E AMBIENTAL 1",
      subtitle: "Treinamento admissional obrigatório sobre ordens de serviço e riscos de SST.",
      hours: "4 HORAS",
      type: "ONLINE E PRESENCIAL",
      bgColor: "bg-slate-800",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&h=500&q=80"
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Filter Catalog State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState('all');

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedTag === 'all') return matchesSearch && c.isActive;
    if (selectedTag === 'nr') return matchesSearch && c.code.includes('NR') && c.isActive;
    if (selectedTag === 'transit') return matchesSearch && (c.name.includes('Direção') || c.code.includes('DIR')) && c.isActive;
    if (selectedTag === 'online') return matchesSearch && c.description.toLowerCase().includes('online') && c.isActive;
    return matchesSearch && c.isActive;
  });

  // Contact State
  const [contactName, setContactName] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [contactSubject, setContactSubject] = React.useState('');
  const [contactMessage, setContactMessage] = React.useState('');
  const [contactSuccess, setContactSuccess] = React.useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }
    onSubmitContact({
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      subject: contactSubject || "Dúvida Comercial Geral",
      message: contactMessage,
    });
    setContactSuccess(true);
    // Reset Form
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactSubject('');
    setContactMessage('');
    setTimeout(() => setContactSuccess(false), 5000);
  };

  // Recent News listing
  const newsItems = [
    {
      id: "news-1",
      tag: "NR-05",
      title: "O papel da CIPA na prevenção de acidentes de trabalho nas corporações",
      description: "A Comissão Interna de Prevenção de Acidentes e Assédio (CIPA) é um instrumento essencial para estreitar a relação entre colaboradores e a coordenação de SST, auxiliando na identificação ativa de gargalos, riscos mecânicos e desvios de conduta...",
      date: "05/06/2026",
      readTime: "4 min de leitura"
    },
    {
      id: "news-2",
      tag: "Trânsito",
      title: "Exame Toxicológico de CNH C, D e E: por que ele é indispensável e compulsório?",
      description: "Esclarecemos as diretrizes da nova legislação de trânsito sobre a obrigatoriedade de renovação periódica dos exames toxicológicos. O monitoramento contínuo previne acidentes mortais nas rodovias brasileiras de transporte pesado...",
      date: "01/06/2026",
      readTime: "5 min de leitura"
    },
    {
      id: "news-3",
      tag: "PGR / GRO",
      title: "Riscos Psicossociais no âmbito do PGR a partir das diretrizes de 2026",
      description: "As atualizações no Programa de Gerenciamento de Riscos (PGR) demandam avaliação aprofundada da ergonomia cognitiva, estressores emocionais e dinâmicas ambientais, visando um ambiente ocupacional verdadeiramente saudável e produtivo...",
      date: "28/05/2026",
      readTime: "6 min de leitura"
    }
  ];

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Slider Carousel Hero */}
      <section className="relative w-full h-[320px] sm:h-[440px] overflow-hidden" id="hero-carousel-slider">
        
        {slides.map((slide, idx) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Dark gradient overlay matching Clean Minimalism cinematic touch */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/85 to-transparent z-1" />
            
            {/* Slide Background Image */}
            <img 
              src={slide.imageUrl} 
              alt={slide.title} 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            {/* Slide Text Content inside maximum container */}
            <div className="absolute inset-0 z-10 flex items-center">
              <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl space-y-4">
                  
                  {/* Badge */}
                  <span className="inline-block px-3 py-1 bg-blue-650 text-white font-semibold text-[10px] uppercase rounded-md tracking-wider shadow-sm font-display">
                    {slide.code} • {slide.hours}
                  </span>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-none uppercase font-display">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-md text-slate-300 font-medium">
                    {slide.subtitle}
                  </p>

                  {/* Secondary info */}
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 text-blue-400">
                      <Clock className="w-4 h-4" /> {slide.hours} Homologado
                    </span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span className="flex items-center gap-1.5 text-slate-200">
                      <Award className="w-4 h-4 text-emerald-400" /> {slide.type}
                    </span>
                  </div>

                  {/* Button trigger */}
                  <button 
                    onClick={() => {
                      // find related course and navigate
                      const course = courses.find((c) => c.code === slide.code) || courses[0];
                      if (course) onSelectCourse(course);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all h-10 select-none cursor-pointer"
                  >
                    Ver detalhes curso
                  </button>

                </div>
              </div>
            </div>

          </div>
        ))}

        {/* Left / Right Navigation */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-lg bg-black/40 hover:bg-blue-600/60 text-slate-200 hover:text-white transition shadow opacity-70 hover:opacity-100 border border-white/10 backdrop-blur-xs"
          id="prev-slide-btn"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-lg bg-black/40 hover:bg-blue-600/60 text-slate-200 hover:text-white transition shadow opacity-70 hover:opacity-100 border border-white/10 backdrop-blur-xs"
          id="next-slide-btn"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel indicators dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-blue-500 w-5' : 'bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

      </section>

      {/* Main Courses Grid Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="courses-section">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3.5xl font-black text-slate-900 dark:text-white tracking-tight">
              Nossos Treinamentos
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              Todos os cursos homologados conforme as Normas Regulamentadoras da Secretaria do Trabalho MTE.
            </p>
          </div>
          
          {/* Quick Filter tabs */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'nr', label: 'Normas Regulamentadoras (NRs)' },
              { id: 'transit', label: 'Trânsito & Direção' },
              { id: 'online', label: 'Cursos Online' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTag(tab.id)}
                className={`px-3 py-2 rounded-xl transition-all duration-200 border text-xs font-bold ${
                  selectedTag === tab.id 
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-blue-600 dark:border-blue-600' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-805'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search tool block */}
        <div className="relative w-full max-w-md mb-10 flex items-center gap-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-605 shadow-xs transition duration-200">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Qual curso ou norma você procura? Ex: NR11..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium bg-transparent border-none text-slate-750 dark:text-slate-200 focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* Product Cards grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div 
                key={course.id}
                className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl p-0 hover:shadow-md transition-all duration-300 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden group"
              >
                
                {/* Course Image Wrapper */}
                <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-850">
                  <img 
                    src={course.coverImage} 
                    alt={course.name} 
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Floating Tag */}
                  <span className="absolute top-3.5 left-3.5 px-2.5 py-1 bg-blue-600 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg shadow-sm">
                    {course.code}
                  </span>

                  <span className="absolute bottom-3.5 right-3.5 px-2.5 py-0.5 bg-black/60 text-white font-medium text-[9px] uppercase tracking-wide rounded-md backdrop-blur-xs">
                    {course.duration}h Certificado
                  </span>
                </div>

                {/* Card description details */}
                <div className="flex-1 p-6 flex flex-col justify-between gap-5">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-150 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-405 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Preço promocional</span>
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        R$ {course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    <button 
                      onClick={() => onSelectCourse(course)}
                      className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-white rounded-xl font-bold text-xs transition duration-200 cursor-pointer select-none shadow-xs"
                    >
                      Ver detalhes
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-500">Nenhum treinamento correspondente encontrado.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedTag('all'); }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 font-bold"
            >
              Exibir catálogo completo
            </button>
          </div>
        )}

      </section>

      {/* Benefits Trust Badges Container */}
      <section className="border-y border-slate-200/80 dark:border-slate-900 bg-white/70 dark:bg-slate-900/10 py-16 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="flex flex-col items-center text-center space-y-3 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/60 dark:border-slate-800 rounded-2xl">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 rounded-xl transition duration-300">
                <Shield className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Conformidade Legal</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs font-medium">
                Currículos em estrita aderência às exigências da Portaria MTE e normas de segurança e medicina do trabalho (SST).
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/60 dark:border-slate-800 rounded-2xl">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 rounded-xl transition duration-300">
                <Award className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Homologação CREA</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs font-medium">
                Anotação de Responsabilidade Técnica (ART) emitida por engenheiro de segurança qualificado em todos os cursos.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/60 dark:border-slate-800 rounded-2xl">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 rounded-xl transition duration-300">
                <Clock className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Emissão Ágil</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs font-medium">
                Certificados digitais válidos emitidos imediatamente após a conclusão do curso com o QRCode público antifraude.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/60 dark:border-slate-800 rounded-2xl">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 rounded-xl transition duration-300">
                <BookOpen className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Prática Presencial</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs font-medium">
                Modelos híbridos semipresenciais adequados em termos funcionais com instrutores dedicados em campo.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Recent Blog and News section */}
      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-10">
          Notícias & Artigos Recentes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsItems.map((news) => (
            <div 
              key={news.id}
              className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-850 hover:shadow-md transition flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <span className="inline-block px-2.5 py-1 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-450 font-bold text-[9px] uppercase tracking-wider rounded-lg">
                  {news.tag}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug hover:text-blue-650 transition cursor-pointer" onClick={() => alert(`Artigo Completo: "${news.title}"`)}>
                  {news.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {news.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium select-none">
                <span>{news.date}</span>
                <span>{news.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* B2B / Student Inbound Contact Section */}
      <section className="mx-auto max-w-4xl px-4 py-12 lg:px-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-855 rounded-2xl shadow-sm mb-20" id="contact-section">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
          
          {/* Side Info */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight font-display">Entre em contato</h3>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
              Precisa de consultoria personalizada, cotações corporativas em grande lote, ou suporte técnico? Preencha o formulário institucional ao lado.
            </p>
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl border border-blue-105/30 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="font-bold text-blue-600 dark:text-blue-450 block mb-1 uppercase tracking-wider">Atendimento ágil</span>
              Nossa assessoria técnica retornará o seu contato institucional em até 2 horas úteis comercialmente.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleContactSubmit} className="md:col-span-3 space-y-4">
            {contactSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 text-xs rounded-xl font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Sua mensagem comercial foi transmitida com sucesso! Retornaremos de imediato.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-400 tracking-wider uppercase block">Nome Completo *</label>
                <input 
                  type="text" 
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Seu nome ou Razão Social"
                  required
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition duration-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-400 tracking-wider uppercase block">E-mail Corporativo *</label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="nome@empresa.com.br"
                  required
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-400 tracking-wider uppercase block">Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition duration-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-400 tracking-wider uppercase block">Assunto de interesse</label>
                <input 
                  type="text" 
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="Ex: Cotação para 11 funcionários"
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition duration-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-bold text-slate-400 tracking-wider uppercase block">Mensagem Detalhada *</label>
              <textarea 
                rows={4}
                required
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Descreva sua solicitação com o máximo de detalhes possível para agilizarmos a resposta técnica..."
                className="w-full text-xs p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition duration-200 resize-none font-sans"
              />
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs tracking-wider uppercase rounded-xl shadow-xs hover:shadow transition-all mt-3 cursor-pointer select-none"
            >
              <Send className="w-4 h-4" /> Enviar Mensagem Institucional
            </button>
          </form>

        </div>
      </section>

    </div>
  );
}
