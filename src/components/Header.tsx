/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingCart, Moon, Sun, User as UserIcon, LogOut, ShieldCheck, ClipboardList, BookOpen, Settings } from 'lucide-react';
import { User, Course, LayoutConfig } from '../types';
import { ShieldEmblem } from './BrandLogo';

interface HeaderProps {
  currentUser: User | null;
  cartCount: number;
  layoutConfig: LayoutConfig;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onNavigate: (screen: string, extra?: any) => void;
  onLogout: () => void;
}

export default function Header({
  currentUser,
  cartCount,
  layoutConfig,
  theme,
  setTheme,
  onNavigate,
  onLogout
}: HeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleProfileClick = (actionName: string) => {
    setProfileDropdownOpen(false);
    if (actionName === 'profile') {
      onNavigate('student-dashboard');
    } else if (actionName === 'admin') {
      onNavigate('admin-dashboard');
    } else if (actionName === 'logout') {
      onLogout();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm/50 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Branding - FalaInstrutor */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          id="header-brand-logo"
        >
          <ShieldEmblem className="h-9 w-auto shrink-0 group-hover:scale-105 transition-transform duration-200" />
          <span className="font-display font-semibold text-lg text-slate-800 dark:text-slate-100">
            Fala<span className="text-blue-600 dark:text-blue-400 font-bold transition-colors">Instrutor</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7" id="header-nav-menu">
          <button 
            onClick={() => onNavigate('home')}
            className="text-xs tracking-wide font-semibold text-slate-600 dark:text-slate-350 hover:text-blue-600 dark:hover:text-blue-400 uppercase transition-colors"
          >
            Início
          </button>
          <button 
            onClick={() => onNavigate('home')} // scroll to trainings or show grid
            className="text-xs tracking-wide font-semibold text-slate-600 dark:text-slate-350 hover:text-blue-600 dark:hover:text-blue-400 uppercase transition-colors"
          >
            Treinamentos
          </button>
          <button 
            onClick={() => {
              onNavigate('home');
              setTimeout(() => {
                const el = document.getElementById('contact-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-xs tracking-wide font-semibold text-slate-600 dark:text-slate-350 hover:text-blue-600 dark:hover:text-blue-400 uppercase transition-colors"
          >
            Contato
          </button>
          <button 
            onClick={() => onNavigate('validate-certificate')}
            className="text-xs tracking-wide font-semibold text-slate-600 dark:text-slate-350 hover:text-blue-600 dark:hover:text-blue-400 uppercase transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Validar Certificado
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3.5">
          
          {/* Cart Icon */}
          <button 
            onClick={() => onNavigate('cart')}
            className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors"
            id="cart-navigation-btn"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-650 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Section dropdown */}
          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer focus:outline-none"
                id="profile-dropdown-trigger"
              >
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar}
                    alt={currentUser.name} 
                    className="w-7.5 h-7.5 rounded-full object-cover ring-2 ring-blue-600/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex w-7.5 h-7.5 rounded-full items-center justify-center bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-slate-200 text-xs font-bold ring-2 ring-blue-600/20">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-200 pr-1 max-w-[120px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>

              {profileDropdownOpen && (
                <>
                  <div 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="fixed inset-0 z-30"
                  />
                  <div 
                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-slate-905 p-1.5 shadow-lg border border-slate-200/80 dark:border-slate-800 focus:outline-none z-40 transition-all transform duration-100 animate-fade-in"
                    id="profile-dropdown-content"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Conta ativa</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-450 truncate">{currentUser.email}</p>
                    </div>

                    <button 
                      onClick={() => handleProfileClick('profile')}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-605"
                    >
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      Minhas Compras
                    </button>

                    {currentUser.role === 'admin' && (
                      <button 
                        onClick={() => handleProfileClick('admin')}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-500"
                        id="header-admin-portal-btn"
                      >
                        <Settings className="w-4 h-4 text-blue-500" />
                        Painel Administrador
                      </button>
                    )}

                    <hr className="my-1 border-slate-100 dark:border-slate-800" />
                    
                    <button 
                      onClick={() => handleProfileClick('logout')}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-rose-650 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da conta
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onNavigate('login')}
                className="text-xs font-bold text-slate-650 dark:text-slate-305 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
                id="header-login-btn"
              >
                Login
              </button>
              <button 
                onClick={() => onNavigate('register')}
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-605 dark:hover:bg-blue-700 transition-all px-4 py-2 rounded-lg shadow-sm"
                id="header-register-btn"
              >
                Cadastre-se
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
