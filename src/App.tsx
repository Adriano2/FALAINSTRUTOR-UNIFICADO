/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
// Telas pesadas/secundárias carregadas sob demanda (code-splitting).
const CourseDetail = React.lazy(() => import('./components/CourseDetail'));
const CartView = React.lazy(() => import('./components/CartView'));
const ValidationView = React.lazy(() => import('./components/ValidationView'));
const StudentDashboard = React.lazy(() => import('./components/StudentDashboard'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const CompanyDashboard = React.lazy(() => import('./components/CompanyDashboard'));
const ProjetoPedagogico = React.lazy(() => import('./components/ProjetoPedagogico'));

import { 
  INITIAL_LAYOUT_CONFIG, 
  INITIAL_PAYMENT_CONFIG, 
  SEED_USERS, 
  SEED_COURSES, 
  SEED_ENROLLMENTS, 
  SEED_TRANSACTIONS, 
  SEED_COUPONS, 
  SEED_COMMENTS, 
  SEED_CONTACTS,
  SEED_EXAMS_SUBMISSIONS
} from './data';

import { User, Course, Enrollment, SalesTransaction, Coupon, Comment, ContactMessage, LayoutConfig, PaymentConfig, StudentExamSubmission } from './types';
import { authApi, coursesApi, enrollmentsApi, adminApi, mapApiEnrollment, clearToken, getToken } from './api';
import { Lock, Mail, UserPlus, Key, Info, HelpCircle, Check, AlertCircle } from 'lucide-react';

export default function App() {
  // Global App States
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  const [currentScreen, setCurrentScreen] = React.useState<string>(() => {
    return localStorage.getItem('fil_screen') || 'home';
  });

  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(() => {
    const saved = localStorage.getItem('fil_selected_course');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentUser, setCurrentUser] = React.useState<User | null>(() => {
    const saved = localStorage.getItem('fil_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // DB States
  const [users, setUsers] = React.useState<User[]>(() => {
    const saved = localStorage.getItem('fil_users');
    let loadedUsers: User[] = saved ? JSON.parse(saved) : SEED_USERS;
    
    // Always inject/overwrite master Adriano Ricardo to avoid old localstorage caching
    const masterEmail = "adriano.ricardo01@gmail.com";
    const masterUser: User = {
      id: "usr-1",
      name: "Adriano Ricardo",
      dob: "1985-04-15",
      cpf: "062.349.933-88",
      email: masterEmail,
      password: "Anthony9936#",
      role: "admin",
      isActive: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      registeredAt: "2025-06-10",
    };
    
    const index = loadedUsers.findIndex(u => u.id === "usr-1" || u.email.toLowerCase() === masterEmail);
    if (index !== -1) {
      loadedUsers[index] = masterUser;
    } else {
      loadedUsers = [masterUser, ...loadedUsers];
    }
    return loadedUsers;
  });

  const [courses, setCourses] = React.useState<Course[]>(() => {
    const saved = localStorage.getItem('fil_courses');
    return saved ? JSON.parse(saved) : SEED_COURSES;
  });

  const [enrollments, setEnrollments] = React.useState<Enrollment[]>(() => {
    const saved = localStorage.getItem('fil_enrollments');
    return saved ? JSON.parse(saved) : SEED_ENROLLMENTS;
  });

  // Matrículas do aluno autenticado, carregadas da API (banco compartilhado).
  const [myEnrollments, setMyEnrollments] = React.useState<Enrollment[]>([]);

  const [transactions, setTransactions] = React.useState<SalesTransaction[]>(() => {
    const saved = localStorage.getItem('fil_transactions');
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });

  const [coupons, setCoupons] = React.useState<Coupon[]>(() => {
    const saved = localStorage.getItem('fil_coupons');
    return saved ? JSON.parse(saved) : SEED_COUPONS;
  });

  const [comments, setComments] = React.useState<Comment[]>(() => {
    const saved = localStorage.getItem('fil_comments');
    return saved ? JSON.parse(saved) : SEED_COMMENTS;
  });

  const [contactMessages, setContactMessages] = React.useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem('fil_contacts');
    return saved ? JSON.parse(saved) : SEED_CONTACTS;
  });

  const [studentExams, setStudentExams] = React.useState<StudentExamSubmission[]>(() => {
    const saved = localStorage.getItem('fil_student_exams');
    return saved ? JSON.parse(saved) : SEED_EXAMS_SUBMISSIONS;
  });

  const [layoutConfig, setLayoutConfig] = React.useState<LayoutConfig>(() => {
    const saved = localStorage.getItem('fil_layout_config');
    let loaded: LayoutConfig = saved ? JSON.parse(saved) : INITIAL_LAYOUT_CONFIG;
    // Ensure the phone is always updated to the requested number
    loaded.phone = "+55 (11) 99625-5102";
    return loaded;
  });

  const [paymentConfig, setPaymentConfig] = React.useState<PaymentConfig>(() => {
    const saved = localStorage.getItem('fil_payment_config');
    let loaded: PaymentConfig = saved ? JSON.parse(saved) : INITIAL_PAYMENT_CONFIG;
    // Force the requested CNPJ and Address to avoid cache issues
    loaded.cnpj = "60.511.651/0001-78";
    loaded.street = "Rua das harpas";
    loaded.number = "24";
    loaded.complement = "";
    loaded.neighborhood = "";
    loaded.city = "São Paulo";
    loaded.state = "SP";
    return loaded;
  });

  const [cart, setCart] = React.useState<Course[]>(() => {
    const saved = localStorage.getItem('fil_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Login variables
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');

  // Register variables
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regCpf, setRegCpf] = React.useState('');
  const [regDob, setRegDob] = React.useState('');
  const [regPass, setRegPass] = React.useState('');
  const [regConfirmPass, setRegConfirmPass] = React.useState('');

  // Persist states in LocalStorage whenever changed
  React.useEffect(() => {
    localStorage.setItem('fil_theme', 'light');
    document.documentElement.className = 'light';
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem('fil_screen', currentScreen);
  }, [currentScreen]);

  React.useEffect(() => {
    if (selectedCourse) {
      localStorage.setItem('fil_selected_course', JSON.stringify(selectedCourse));
    } else {
      localStorage.removeItem('fil_selected_course');
    }
  }, [selectedCourse]);

  React.useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fil_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fil_current_user');
    }
  }, [currentUser]);

  // Carrega todos os dados do painel administrativo a partir do banco.
  const loadAdminData = React.useCallback(async () => {
    try {
      const data = await adminApi.loadAll();
      setUsers(data.users);
      setEnrollments(data.enrollments);
      setTransactions(data.transactions);
      setStudentExams(data.exams);
      setComments(data.comments);
      setContactMessages(data.contacts);
      setCoupons(data.coupons);
      if (data.layout) setLayoutConfig(data.layout);
      if (data.payment) setPaymentConfig(data.payment);
    } catch {
      /* mantém os dados locais se a API falhar */
    }
  }, []);

  // Carrega as matrículas do aluno autenticado a partir da API.
  const refreshMyEnrollments = React.useCallback(async (user: User | null) => {
    if (!user || !getToken()) {
      setMyEnrollments([]);
      return;
    }
    try {
      const list = await enrollmentsApi.listMine();
      setMyEnrollments(list.map((e) => mapApiEnrollment(e, user)));
    } catch {
      setMyEnrollments([]);
    }
  }, []);

  // Restore the session on load: if a JWT exists, validate it against the API.
  // An invalid/expired token is cleared. Evaluator shortcuts (local, no token)
  // are left untouched.
  React.useEffect(() => {
    if (!getToken()) return;
    authApi
      .me()
      .then((freshUser) => {
        setCurrentUser(freshUser);
        refreshMyEnrollments(freshUser);
        if (freshUser.role === 'admin') loadAdminData();
      })
      .catch(() => {
        clearToken();
        setCurrentUser(null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the page is opened from a certificate QR Code (?cert=CODE), jump
  // straight to the public validation screen with the code pre-filled.
  const [certParam, setCertParam] = React.useState<string | null>(null);
  React.useEffect(() => {
    const cert = new URLSearchParams(window.location.search).get('cert');
    if (cert) {
      setCertParam(cert);
      setCurrentScreen('validate-certificate');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Retorno do pagamento (Asaas): ?payment=success. Esvazia o carrinho,
  // leva ao painel e avisa o aluno; a matrícula é liberada pelo webhook.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pay = params.get('payment');
    if (pay) {
      setCart([]);
      setCurrentScreen('student-dashboard');
      if (pay === 'success') {
        alert('Pagamento recebido! Assim que for confirmado, seus treinamentos aparecerão no painel.');
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the course catalog from the API. Falls back silently to the locally
  // cached/seed catalog if the backend is unavailable.
  React.useEffect(() => {
    coursesApi
      .list()
      .then((apiCourses) => {
        if (apiCourses.length > 0) setCourses(apiCourses);
      })
      .catch(() => {
        /* mantém o catálogo local como fallback */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    localStorage.setItem('fil_users', JSON.stringify(users));
  }, [users]);

  React.useEffect(() => {
    localStorage.setItem('fil_courses', JSON.stringify(courses));
  }, [courses]);

  React.useEffect(() => {
    localStorage.setItem('fil_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  React.useEffect(() => {
    localStorage.setItem('fil_transactions', JSON.stringify(transactions));
  }, [transactions]);

  React.useEffect(() => {
    localStorage.setItem('fil_coupons', JSON.stringify(coupons));
  }, [coupons]);

  React.useEffect(() => {
    localStorage.setItem('fil_comments', JSON.stringify(comments));
  }, [comments]);

  React.useEffect(() => {
    localStorage.setItem('fil_contacts', JSON.stringify(contactMessages));
  }, [contactMessages]);

  React.useEffect(() => {
    localStorage.setItem('fil_student_exams', JSON.stringify(studentExams));
  }, [studentExams]);

  React.useEffect(() => {
    localStorage.setItem('fil_layout_config', JSON.stringify(layoutConfig));
  }, [layoutConfig]);

  React.useEffect(() => {
    localStorage.setItem('fil_payment_config', JSON.stringify(paymentConfig));
  }, [paymentConfig]);

  React.useEffect(() => {
    localStorage.setItem('fil_cart', JSON.stringify(cart));
  }, [cart]);

  // Actions
  const handleNavigate = (screen: string, extra?: any) => {
    setCurrentScreen(screen);
    if (screen === 'course-detail' && extra) {
      setSelectedCourse(extra);
    }
    if (screen === 'validate-certificate' && typeof extra === 'string') {
      setCertParam(extra);
    }
    // smooth scroll to top on screen change
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleLogout = () => {
    clearToken();
    setCurrentUser(null);
    setMyEnrollments([]);
    handleNavigate('home');
    alert("Sessão finalizada com sucesso. Até breve!");
  };

  // Tela inicial conforme o papel do usuário.
  const dashboardForRole = (role: string) =>
    role === 'admin' ? 'admin-dashboard' : role === 'company' ? 'company-dashboard' : 'student-dashboard';

  // Login handler — autentica no backend (senha verificada com bcrypt + JWT).
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await authApi.login(loginEmail, loginPassword);
      setCurrentUser(user);
      refreshMyEnrollments(user);
      if (user.role === 'admin') loadAdminData();
      setLoginEmail('');
      setLoginPassword('');
      handleNavigate(dashboardForRole(user.role));
      alert(`Bem-vindo de volta, ${user.name}!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível efetuar o login.");
    }
  };

  // Evaluator Quick Login shortcut — faz login real (token) com as contas
  // semente para que os dados venham do banco. Cai para sessão local apenas
  // se o backend estiver indisponível.
  const handleEvaluatorShortcut = async (role: 'admin' | 'student' | 'company') => {
    const creds =
      role === 'admin'
        ? { email: 'adriano.ricardo01@gmail.com', password: 'Anthony9936#' }
        : role === 'company'
          ? { email: 'empresa@gmail.com', password: 'empresa123' }
          : { email: 'jessica@gmail.com', password: 'aluno123' };
    const label = role === 'admin' ? 'Administrador' : role === 'company' ? 'Empresa' : 'Aluno';
    try {
      const user = await authApi.login(creds.email, creds.password);
      setCurrentUser(user);
      await refreshMyEnrollments(user);
      if (user.role === 'admin') await loadAdminData();
      handleNavigate(dashboardForRole(user.role));
      alert(`Sessão ${label}: ${user.name}`);
    } catch {
      if (role === 'company') {
        alert('Não foi possível acessar a conta de empresa de demonstração. Verifique se o servidor está ativo.');
        return;
      }
      // Fallback local (offline / sem backend)
      const acc = role === 'admin'
        ? users.find((u) => u.role === 'admin') || SEED_USERS[0]
        : users.find((u) => u.email === 'jessica@gmail.com') || SEED_USERS[1];
      setCurrentUser(acc);
      handleNavigate(dashboardForRole(role));
      alert(`Sessão ${label} (local): ${acc.name}`);
    }
  };

  // Signup Register handler — cria a conta no backend.
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPass.length < 6) {
      alert("A senha deve possuir no mínimo 6 caracteres.");
      return;
    }
    if (regPass !== regConfirmPass) {
      alert("As senhas informadas não coincidem.");
      return;
    }

    try {
      const newUser = await authApi.register({
        name: regName,
        email: regEmail,
        cpf: regCpf,
        password: regPass,
        dob: regDob || undefined,
      });
      setCurrentUser(newUser);
      refreshMyEnrollments(newUser);

      // Clear registration fields
      setRegName('');
      setRegEmail('');
      setRegCpf('');
      setRegDob('');
      setRegPass('');
      setRegConfirmPass('');

      handleNavigate('student-dashboard');
      alert(`Seja bem-vindo, ${newUser.name}! Sua conta de SST foi criada e habilitada.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível concluir o cadastro.");
    }
  };

  // Cart operations
  const handleAddToCart = (course: Course) => {
    const exists = cart.some((c) => c.id === course.id);
    if (exists) {
      alert("Este treinamento já se encontra em seu carrinho.");
    } else {
      setCart([...cart, course]);
    }
    handleNavigate('cart');
  };

  const handleRemoveFromCart = (courseId: string) => {
    setCart(cart.filter((c) => c.id !== courseId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Checkout completions
  const handleCheckoutComplete = async (
    txDetails: Omit<SalesTransaction, 'id' | 'date'>,
    newEnrollments: Array<Omit<Enrollment, 'id' | 'enrolledAt'>>
  ) => {
    // Save transaction log (localStorage; admin dashboard — Fase 2.4 via API)
    const newTx: SalesTransaction = {
      ...txDetails,
      id: "TX-" + Math.floor(Math.random() * 89999 + 10000),
      date: new Date().toLocaleDateString('pt-BR')
    };
    setTransactions([newTx, ...transactions]);

    // Matricula de verdade no banco (ponte até o pagamento real — Fase 3).
    if (getToken() && currentUser) {
      try {
        for (const env of newEnrollments) {
          await enrollmentsApi.enroll(env.courseId);
        }
        await refreshMyEnrollments(currentUser);
      } catch {
        /* mantém a transação registrada mesmo se a matrícula falhar */
      }
      return;
    }

    // Fallback local (sessão sem token)
    const addedEnrollments: Enrollment[] = newEnrollments.map((env) => ({
      ...env,
      id: "enr-" + Math.floor(Math.random() * 89999 + 10000),
      enrolledAt: new Date().toISOString().split('T')[0]
    }));
    setEnrollments([...addedEnrollments, ...enrollments]);
  };

  // B2B Landing contact messages submission
  const handleContactSubmission = (msg: Omit<ContactMessage, 'id' | 'date'>) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: "msg-" + Date.now(),
      date: new Date().toLocaleDateString('pt-BR')
    };
    setContactMessages([newMsg, ...contactMessages]);
  };

  // Student profile operations
  const handleUpdateStudentProfile = (updatedProps: Partial<User>) => {
    if (!currentUser) return;
    const nextUser = { ...currentUser, ...updatedProps };
    setCurrentUser(nextUser);
    setUsers(users.map(u => u.id === currentUser.id ? nextUser : u));
  };

  // Submit Comments / plantão de dúvidas
  const handlePostComment = (commentProps: Omit<Comment, 'id' | 'date'>) => {
    const newComment: Comment = {
      ...commentProps,
      id: "com-" + Date.now(),
      date: new Date().toLocaleDateString('pt-BR')
    };
    setComments([newComment, ...comments]);
  };

  // Student completes exam and gets certified — persiste no banco.
  const handleCompleteEnrollment = async (
    enrollmentId: string,
    score: number,
    passed: boolean,
    _certificateCode: string,
    answers: Record<number, number> = {}
  ): Promise<Enrollment | undefined> => {
    if (getToken() && currentUser) {
      try {
        const updated = await enrollmentsApi.submitExam(enrollmentId, { score, passed, answers });
        const mapped = mapApiEnrollment(updated, currentUser);
        setMyEnrollments((prev) => prev.map((e) => (e.id === enrollmentId ? mapped : e)));
        return mapped;
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Não foi possível registrar o exame.');
        return undefined;
      }
    }
    return undefined;
  };

  // --- Ações administrativas (persistem no banco via API) ---
  const refreshCourses = async () => {
    try {
      const list = await coursesApi.list();
      if (list.length) setCourses(list);
    } catch { /* ignore */ }
  };

  const handleAdminCreateUser = async (input: { name: string; email: string; cpf: string; dob?: string; role?: 'ADMIN' | 'STUDENT' }) => {
    try {
      await adminApi.createUser(input);
      await loadAdminData();
      alert("Usuário registrado com sucesso! Senha inicial padrão: falainstrutor123");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível registrar o usuário.");
    }
  };

  const handleAdminToggleUser = async (id: string, isActive: boolean) => {
    try { await adminApi.toggleUserActive(id, isActive); await loadAdminData(); } catch { /* ignore */ }
  };

  const handleAdminReplyComment = async (id: string, reply: string) => {
    try {
      await adminApi.replyComment(id, reply);
      await loadAdminData();
      alert("Resposta publicada e transmitida ao aluno!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível publicar a resposta.");
    }
  };

  const handleAdminBatchEnroll = async (userIds: string[], courseId: string) => {
    try {
      const res: any = await adminApi.batchEnroll(userIds, courseId);
      await loadAdminData();
      alert(`Matrícula em lote concluída! ${res?.created ?? 0} nova(s) matrícula(s).`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível matricular em lote.");
    }
  };

  const handleAdminCreateCoupon = async (input: { code: string; description: string; value: number; type: 'PERCENTAGE' | 'FIXED'; associatedProducts: string[] }) => {
    try { await adminApi.createCoupon(input); await loadAdminData(); alert("Cupom criado com sucesso!"); }
    catch (err) { alert(err instanceof Error ? err.message : "Não foi possível criar o cupom."); }
  };

  const handleAdminToggleCoupon = async (id: string, isActive: boolean) => {
    try { await adminApi.toggleCoupon(id, isActive); await loadAdminData(); } catch { /* ignore */ }
  };

  const handleAdminAddInstructor = async (courseId: string, input: { name: string; formation: string; mte?: string; crea?: string; crq?: string; signatureUrl?: string; icpEnabled: boolean }) => {
    try {
      await adminApi.addInstructor(courseId, input);
      await refreshCourses();
      alert("Instrutor associado com sucesso!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível associar o instrutor.");
    }
  };

  const handleAdminAddModule = async (courseId: string, module: string) => {
    try { await adminApi.addModule(courseId, module); await refreshCourses(); alert("Módulo adicionado com sucesso!"); }
    catch (err) { alert(err instanceof Error ? err.message : "Não foi possível adicionar o módulo."); }
  };

  const handleAdminSaveCourseContent = async (courseId: string, input: { videoUrl?: string; moduleVideos?: string[]; documents?: { name: string; url: string }[]; modality?: string }) => {
    try { await adminApi.saveCourseContent(courseId, input); await refreshCourses(); alert("Conteúdo do curso salvo com sucesso!"); }
    catch (err) { alert(err instanceof Error ? err.message : "Não foi possível salvar o conteúdo do curso."); }
  };

  const handleAdminSaveConfig = async (layout: LayoutConfig, payment: PaymentConfig) => {
    try {
      await adminApi.saveConfig(layout, payment);
      setLayoutConfig(layout);
      setPaymentConfig(payment);
      alert("Configurações gerais salvas no banco com sucesso!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível salvar as configurações.");
    }
  };

  // Watch classroom studies and save progress rate — persiste no banco.
  const handleUpdateEnrollmentProgress = async (enrollmentId: string, progressFraction: number) => {
    if (getToken() && currentUser) {
      try {
        const updated = await enrollmentsApi.updateProgress(enrollmentId, progressFraction);
        const mapped = mapApiEnrollment(updated, currentUser);
        setMyEnrollments((prev) => prev.map((e) => (e.id === enrollmentId ? mapped : e)));
      } catch {
        /* progresso é atualizado de forma otimista no componente */
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-250 transition-colors duration-200">
      
      {/* Dynamic Header Component */}
      <Header 
        currentUser={currentUser}
        cartCount={cart.length}
        layoutConfig={layoutConfig}
        theme={theme}
        setTheme={setTheme}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {/* Main Content Workspace routing */}
      <main className="flex-grow">
        <React.Suspense fallback={<div className="flex items-center justify-center py-32 text-slate-400 text-sm">Carregando…</div>}>
        {currentScreen === 'home' && (
          <LandingPage
            courses={courses}
            onSelectCourse={(course) => handleNavigate('course-detail', course)}
            onSubmitContact={handleContactSubmission}
          />
        )}

        {currentScreen === 'course-detail' && selectedCourse && (
          <CourseDetail 
            course={selectedCourse}
            onAddToCart={handleAddToCart}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {currentScreen === 'cart' && (
          <CartView 
            cartItems={cart}
            currentUser={currentUser}
            coupons={coupons}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onCheckoutComplete={handleCheckoutComplete}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateLogin={() => handleNavigate('login')}
          />
        )}

        {currentScreen === 'validate-certificate' && (
          <ValidationView initialCode={certParam ?? undefined} />
        )}

        {currentScreen === 'projeto-pedagogico' && (
          <ProjetoPedagogico courses={courses} onNavigateHome={() => handleNavigate('home')} />
        )}

        {currentScreen === 'student-dashboard' && currentUser && (
          <StudentDashboard
            currentUser={currentUser}
            courses={courses}
            enrollments={myEnrollments}
            comments={comments}
            studentExams={studentExams}
            paymentConfig={paymentConfig}
            onUpdateProfile={handleUpdateStudentProfile}
            onPostComment={handlePostComment}
            onCompleteEnrollment={handleCompleteEnrollment}
            onUpdateProgress={handleUpdateEnrollmentProgress}
          />
        )}

        {currentScreen === 'company-dashboard' && currentUser && currentUser.role === 'company' && (
          <CompanyDashboard onValidateCertificate={(code) => handleNavigate('validate-certificate', code)} />
        )}

        {currentScreen === 'admin-dashboard' && currentUser && currentUser.role === 'admin' && (
          <AdminDashboard
            users={users}
            courses={courses}
            enrollments={enrollments}
            transactions={transactions}
            coupons={coupons}
            comments={comments}
            contactMessages={contactMessages}
            studentExams={studentExams}
            layoutConfig={layoutConfig}
            paymentConfig={paymentConfig}
            onUpdateUsers={setUsers}
            onUpdateCourses={setCourses}
            onUpdateEnrollments={setEnrollments}
            onUpdateTransactions={setTransactions}
            onUpdateCoupons={setCoupons}
            onUpdateComments={setComments}
            onUpdateLayout={setLayoutConfig}
            onUpdatePayment={setPaymentConfig}
            onCreateUser={handleAdminCreateUser}
            onToggleUserActive={handleAdminToggleUser}
            onReplyComment={handleAdminReplyComment}
            onBatchEnroll={handleAdminBatchEnroll}
            onCreateCoupon={handleAdminCreateCoupon}
            onToggleCoupon={handleAdminToggleCoupon}
            onAddInstructor={handleAdminAddInstructor}
            onAddModule={handleAdminAddModule}
            onSaveCourseContent={handleAdminSaveCourseContent}
            onSaveConfig={handleAdminSaveConfig}
            onRefreshCourses={refreshCourses}
          />
        )}

        {/* LOGIN SCREEN SECTION */}
        {currentScreen === 'login' && (
          <div className="mx-auto max-w-md px-4 py-20 font-sans">
            
            {/* Quick evaluator login guides */}
            <div className="mb-6 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5 font-display">
                <Info className="w-4 h-4 shrink-0" /> Guia de avaliação ágil
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Para fins de teste das perspectivas (Administrador, Aluno ou Empresa), utilize os atalhos de acesso instantâneo abaixo:
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEvaluatorShortcut('admin')}
                  className="flex-1 py-1.5 bg-slate-900 dark:bg-slate-800 text-white font-semibold text-[10px] uppercase tracking-wide rounded-xl hover:bg-blue-600 transition cursor-pointer font-display"
                >
                  Administrador
                </button>
                <button
                  onClick={() => handleEvaluatorShortcut('student')}
                  className="flex-1 py-1.5 bg-slate-905 bg-slate-900 dark:bg-slate-800 text-white font-semibold text-[10px] uppercase tracking-wide rounded-xl hover:bg-blue-600 transition cursor-pointer font-display"
                >
                  Aluno
                </button>
                <button
                  onClick={() => handleEvaluatorShortcut('company')}
                  className="flex-1 py-1.5 bg-slate-900 dark:bg-slate-800 text-white font-semibold text-[10px] uppercase tracking-wide rounded-xl hover:bg-blue-600 transition cursor-pointer font-display"
                >
                  Empresa
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
              
              <div className="text-center space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold uppercase text-slate-900 dark:text-white tracking-tight font-display">Acessar Conta</h1>
                <p className="text-xs text-slate-505 dark:text-slate-400 font-sans">Informe suas credenciais FalaInstrutor do portal.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-medium text-slate-505">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block font-display">E-mail Cadastrado</label>
                  <div className="relative flex items-center gap-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <input 
                      type="email" 
                      placeholder="seuemail@empresa.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="w-full text-slate-900 dark:text-white bg-transparent border-none focus:outline-none font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center select-none text-[10px] uppercase font-display">
                    <label className="font-bold text-slate-400 block p-0">Senha de acesso</label>
                    <a href="#reset" onClick={(e) => { e.preventDefault(); alert("Instruções de redefinição de segurança enviadas ao e-mail informado."); }} className="text-blue-600 hover:underline">Esqueceu a senha?</a>
                  </div>
                  <div className="relative flex items-center gap-2 bg-slate-50 dark:bg-slate-850 border border-slate-205 border-slate-200 dark:border-slate-700 p-2.5 rounded-xl">
                    <Key className="w-4 h-4 text-slate-400 shrink-0" />
                    <input 
                      type="password" 
                      placeholder="••••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full text-slate-905 dark:text-white bg-transparent border-none focus:outline-none font-sans"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer select-none font-display shadow-2xs"
                >
                  Acessar Minha Área
                </button>
              </form>

              <div className="text-center pt-2 text-xs text-slate-505 dark:text-slate-400 font-sans">
                Não tem conta?{' '}
                <button 
                  onClick={() => handleNavigate('register')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Cadastre-se grátis
                </button>
              </div>

            </div>

          </div>
        )}

        {/* REGISTER ACCOUNT SECTION */}
        {currentScreen === 'register' && (
          <div className="mx-auto max-w-md px-4 py-16 font-sans">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
              
              <div className="text-center space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold uppercase text-slate-900 dark:text-white tracking-tight font-display">Crie sua Conta</h1>
                <p className="text-xs text-slate-505 dark:text-slate-400 font-sans">Cadastre-se para iniciar seus treinamentos e certificações.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-medium text-slate-505">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block font-display">Nome Completo *</label>
                  <input 
                    type="text" 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Seu nome completo para o certificado"
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-705 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block font-display">CPF do Profissional *</label>
                    <input 
                      type="text" 
                      value={regCpf}
                      onChange={(e) => setRegCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-705 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block font-display">Nascimento *</label>
                    <input 
                      type="date" 
                      value={regDob}
                      onChange={(e) => setRegDob(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-705 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900 dark:text-white font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block font-display">E-mail Corporativo *</label>
                  <input 
                    type="email" 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seuemail@empresa.com.br"
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-705 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block font-display">Senha *</label>
                    <input 
                      type="password" 
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-705 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block font-display">Confirmar Senha *</label>
                    <input 
                      type="password" 
                      value={regConfirmPass}
                      onChange={(e) => setRegConfirmPass(e.target.value)}
                      placeholder="Repita a senha"
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-705 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer select-none font-display shadow-2xs"
                >
                  Cadastrar & Iniciar Estudos
                </button>
              </form>

              <div className="text-center pt-2 text-xs text-slate-505 dark:text-slate-400 font-sans">
                Já possui uma conta?{' '}
                <button 
                  onClick={() => handleNavigate('login')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Entrar agora
                </button>
              </div>

            </div>
          </div>
        )}

        </React.Suspense>
      </main>

      {/* Dynamic Footer Component */}
      <Footer 
        layoutConfig={layoutConfig}
        paymentConfig={paymentConfig}
        onNavigate={handleNavigate}
      />

    </div>
  );
}
