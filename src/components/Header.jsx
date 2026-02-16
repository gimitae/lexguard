import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Coins, LogOut, ChevronDown } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const Header = ({ isLoggedIn, tokens, onLogout, onNavigate, currentView }) => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);

  const menuItems = [
    { id: 'lawfirms', label: t('header.menu.consultation') },
    { id: 'terms', label: t('header.menu.terms') },
    { id: 'support', label: t('header.menu.support') }
  ];

  const isActive = (viewId) => currentView === viewId;

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      {/* 로고 */}
      <button 
        onClick={() => onNavigate('landing')}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group"
      >
        <div className="bg-indigo-600 p-1 rounded-lg group-hover:scale-110 transition-transform duration-300">
          <Scale className="text-white w-5 h-5" />
        </div>
        <span className="text-lg font-black text-slate-900 tracking-tighter">
          {t('header.logo')}
        </span>
      </button>

      {/* 중앙 메뉴 (데스크탑) */}
      <div className="hidden md:flex items-center gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              relative px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300
              ${isActive(item.id) 
                ? 'text-indigo-600 bg-indigo-50' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 오른쪽 메뉴 */}
      <div className="flex items-center gap-4">
        <LanguageSwitcher />

        {isLoggedIn ? (
          /* 로그인 상태일 때 */
          <div className="flex items-center gap-4">
            <div 
              className="bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-200 group"
              title="보유 토큰"
            >
              <Coins className="w-3 h-3 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-slate-700">{tokens}</span>
            </div>
            <button 
              onClick={onLogout}
              className="text-slate-400 hover:text-red-500 transition-colors hover:scale-110 duration-300"
              title={t('header.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* 비로그인 상태일 때 */
          <div className="flex items-center gap-2">
            {/* ✨ 1. 회원가입 버튼 (번역 적용) */}
            <button 
              onClick={() => onNavigate('signup')}
              className="hidden md:block text-sm font-bold text-slate-500 hover:text-indigo-600 px-3 py-2 transition-colors"
            >
              {t('auth.signupTitle')}
            </button>

            {/* ✨ 2. 로그인 버튼 (번역 적용) */}
            <button 
              onClick={() => onNavigate('login')}
              className="text-sm font-bold text-white bg-indigo-600 px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all hover:scale-105 shadow-md shadow-indigo-200"
            >
              {t('auth.loginTitle')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
