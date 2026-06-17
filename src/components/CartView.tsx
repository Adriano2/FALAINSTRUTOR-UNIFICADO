/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingCart, Trash2, Tag, CreditCard, Receipt, Milestone, ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { Course, User, Coupon, SalesTransaction, Enrollment } from '../types';

interface CartViewProps {
  cartItems: Course[];
  currentUser: User | null;
  coupons: Coupon[];
  onRemoveFromCart: (courseId: string) => void;
  onClearCart: () => void;
  onCheckoutComplete: (transaction: Omit<SalesTransaction, 'id' | 'date'>, newEnrollments: Array<Omit<Enrollment, 'id' | 'enrolledAt'>>) => void;
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
}

export default function CartView({
  cartItems,
  currentUser,
  coupons,
  onRemoveFromCart,
  onClearCart,
  onCheckoutComplete,
  onNavigateHome,
  onNavigateLogin
}: CartViewProps) {
  const [couponCode, setCouponCode] = React.useState('');
  const [activeCoupon, setActiveCoupon] = React.useState<Coupon | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<'as_pix' | 'as_boleto' | 'as_credit'>('as_pix');
  const [installments, setInstallments] = React.useState(1);
  const [checkoutStep, setCheckoutStep] = React.useState<'cart' | 'processing' | 'success'>('cart');
  const [txDetails, setTxDetails] = React.useState<any>(null);

  // Subtotal Calculation
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  // Discount Calculation based on applied coupon and eligible products inside cart
  const discount = React.useMemo(() => {
    if (!activeCoupon) return 0;
    
    // Sum prices of products that match coupon restrictions
    const eligibleTotal = cartItems
      .filter((item) => activeCoupon.associatedProducts.includes(item.id))
      .reduce((acc, item) => acc + item.price, 0);
    
    if (activeCoupon.type === 'percentage') {
      return (eligibleTotal * activeCoupon.value) / 100;
    } else {
      return Math.min(eligibleTotal, activeCoupon.value);
    }
  }, [activeCoupon, cartItems]);

  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    
    const matched = coupons.find((cp) => cp.code.toUpperCase() === couponCode.trim().toUpperCase() && cp.isActive);
    if (matched) {
      // Check if coupon belongs to any items inside current cart
      const hasAssociated = cartItems.some((item) => matched.associatedProducts.includes(item.id));
      if (hasAssociated) {
        setActiveCoupon(matched);
        setCouponCode('');
        alert(`Cupom "${matched.code}" aplicado com sucesso!`);
      } else {
        alert("Este cupom é válido, mas não se aplica aos itens presentes em seu carrinho.");
      }
    } else {
      alert("Cupom inválido, vencido ou inexistente.");
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
  };

  const handleCheckoutSubmit = () => {
    if (cartItems.length === 0) {
      alert("Seu carrinho de compras está vazio!");
      return;
    }
    if (!currentUser) {
      alert("Por favor, faça logon ou cadastre uma conta nova para finalizar sua inscrição.");
      onNavigateLogin();
      return;
    }

    setCheckoutStep('processing');

    setTimeout(() => {
      // Create transaction logs
      const cleanTx: Omit<SalesTransaction, 'id' | 'date'> = {
        userId: currentUser.id,
        userName: currentUser.name,
        courseName: cartItems.map((c) => c.code).join(' + '),
        total: total,
        discount: discount,
        status: 'active',
        installments: paymentMethod === 'as_credit' ? installments : 1,
        couponCode: activeCoupon?.code
      };

      // Create new enrollments for each purchased item
      const cleanEnrollments: Array<Omit<Enrollment, 'id' | 'enrolledAt'>> = cartItems.map((item) => ({
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        courseId: item.id,
        courseName: item.name,
        courseCode: item.code,
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        examScore: null,
        passed: false,
        certificateCode: null
      }));

      // Trigger parents database state
      onCheckoutComplete(cleanTx, cleanEnrollments);
      
      setTxDetails({
        id: "TX-" + Math.floor(Math.random() * 89999 + 10000),
        items: [...cartItems],
        total: total,
        method: paymentMethod === 'as_pix' ? 'Pix' : paymentMethod === 'as_boleto' ? 'Boleto' : 'Cartão de Crédito',
        installments: paymentMethod === 'as_credit' ? installments : 1,
        date: new Date().toLocaleDateString('pt-BR')
      });
      
      setCheckoutStep('success');
      onClearCart();
    }, 2000);

  };

  if (checkoutStep === 'processing') {
    return (
      <div className="w-full bg-slate-50 dark:bg-slate-950 py-24 flex flex-col items-center justify-center font-sans space-y-4">
        {/* Loading Spin animation */}
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Conectando ao Asaas...</h2>
        <p className="text-xs text-slate-500 max-w-sm text-center leading-normal">
          Processando sua transação de treinamento e homologando sua pré-matrícula de forma totalmente segura. Não feche esta tela.
        </p>
      </div>
    );
  }

  if (checkoutStep === 'success' && txDetails) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 font-sans">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-lg shadow-lg text-center space-y-6">
          
          <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-500 rounded-full animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Compra Efetuada com Sucesso!</h1>
            <p className="text-xs text-slate-500">Transação ID: {txDetails.id} • Processadora Asaas</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded text-left space-y-3">
            <h3 className="font-bold text-xs text-slate-405 uppercase tracking-wider">Detalhes do Pedido</h3>
            <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
              {txDetails.items.map((item: Course) => (
                <li key={item.id} className="flex justify-between font-semibold">
                  <span>{item.name} ({item.code})</span>
                  <span>R$ {item.price.toFixed(2)}</span>
                </li>
              ))}
              <hr className="my-2 border-slate-200 dark:border-slate-700" />
              <li className="flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
                <span>Total Pago</span>
                <span>R$ {txDetails.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </li>
              <li className="flex justify-between text-[11px] text-slate-400">
                <span>Método de Pagamento</span>
                <span>{txDetails.method} {txDetails.installments > 1 ? `(${txDetails.installments}x)` : ''}</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded text-xs text-slate-700 dark:text-slate-350 text-left leading-relaxed">
            <span className="font-black text-amber-500 block mb-1 uppercase tracking-wider">Como iniciar os estudos?</span>
            Os treinamentos já foram adicionados e vinculados à sua conta corporativa. Clique no botão abaixo para acessar o painel de estudos, assistir às aulas e prosseguir com os exames avaliativos.
          </div>

          <button 
            onClick={() => onNavigateHome()} // return and let them use profiles
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Iniciar Meus Estudos <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
        Carrinho de Compras
      </h1>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart items listing */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 hover:shadow transition"
              >
                
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block w-16 h-12 rounded overflow-hidden bg-slate-100 shrink-0">
                    <img 
                      src={item.coverImage} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-slate-400 font-semibold uppercase">{item.code} • {item.duration} Horas</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    R$ {item.price.toFixed(2)}
                  </span>
                  
                  <button 
                    onClick={() => onRemoveFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Remover do carrinho"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}

            <button 
              onClick={onNavigateHome}
              className="text-xs text-amber-500 hover:underline font-bold tracking-wider uppercase select-none cursor-pointer"
            >
              + Adicionar outros treinamentos
            </button>
          </div>

          {/* Pricing Summary Side Cards */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Promo Coupon Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-500" /> Possui algum cupom?
              </h3>
              
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="EX: COUPON100"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none uppercase"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded hover:bg-amber-500 hover:text-slate-900 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Aplicar
                </button>
              </form>

              {activeCoupon && (
                <div className="flex items-center justify-between p-2 bg-amber-500/10 rounded text-xs text-amber-500 font-bold border border-amber-550/20">
                  <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> ATIVO: {activeCoupon.code} ({activeCoupon.value}% desc)</span>
                  <button onClick={handleRemoveCoupon} className="text-xs hover:text-red-500 uppercase font-bold tracking-wider">Remover</button>
                </div>
              )}
            </div>

            {/* Calculations and payment info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-lg shadow space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Resumo do Pedido
              </h3>

              <div className="space-y-2 text-xs text-slate-650 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold sm:subpixel-antialiased">R$ {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-amber-500 font-bold">
                    <span>Descontos aplicado</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Total Geral</span>
                  <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Payment Methods Options selector */}
              {total > 0 && (
                <div className="space-y-3.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs uppercase font-extrabold text-slate-400">Forma de pagamento</h4>
                  
                  <div className="space-y-2">
                    
                    <label className="flex items-center justify-between p-2.5 rounded border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="payment_opt" 
                          checked={paymentMethod === 'as_pix'}
                          onChange={() => setPaymentMethod('as_pix')}
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">PIX (Asaas)</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded uppercase font-bold">Aprovação imediata</span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="payment_opt"
                          checked={paymentMethod === 'as_boleto'}
                          onChange={() => setPaymentMethod('as_boleto')}
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">Boleto Bancário</span>
                      </div>
                      <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded uppercase font-bold">Até 24h compensação</span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="payment_opt"
                          checked={paymentMethod === 'as_credit'}
                          onChange={() => setPaymentMethod('as_credit')}
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">Cartão de Crédito</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Até 3x sem juros</span>
                    </label>

                  </div>

                  {paymentMethod === 'as_credit' && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 block">Número de parcelas</label>
                      <select 
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        className="w-full text-xs p-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value={1}>1x de R$ {total.toFixed(2)} (Sem juros)</option>
                        {total >= 50 && <option value={2}>2x de R$ {(total/2).toFixed(2)} (Sem juros)</option>}
                        {total >= 100 && <option value={3}>3x de R$ {(total/3).toFixed(2)} (Sem juros)</option>}
                      </select>
                    </div>
                  )}

                </div>
              )}

              {/* Logon trigger alert as fallback */}
              {!currentUser && (
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded text-center text-[11px] text-amber-500 font-semibold" id="cart-login-alert">
                  * Você precisará estar conectado à sua conta para liberar o curso. Faça logon antes de prosseguir.
                </div>
              )}

              {/* Checkout Trigger */}
              <button 
                onClick={handleCheckoutSubmit}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                id="cart-checkout-btn"
              >
                <ShieldCheck className="w-4.5 h-4.5 text-slate-950" /> Finalizar Matrícula
              </button>

            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
          <ShoppingCart className="w-16 h-16 text-slate-350 mx-auto mb-4" />
          <p className="text-base font-extrabold text-slate-500 uppercase tracking-tight">Seu carrinho está vazio!</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-normal">Selecione treinamentos em nosso catálogo para prosseguir com a emissão do certificado.</p>
          <button 
            onClick={onNavigateHome}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase rounded mt-4 transition"
          >
            Ver Treinamentos
          </button>
        </div>
      )}

    </div>
  );
}
