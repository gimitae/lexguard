import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Coins, User, Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const Header = ({ isLoggedIn, coins, onNavigate, currentView, onOpenMyPage }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'landing', label: t('header.menu.home', '홈') },
    { id: 'terms', label: t('header.menu.terms', '이용약관') },
    { id: 'support', label: t('header.menu.support', '고객센터') }
  ];

  const isActive = (viewId) => currentView === viewId;

  const handleMenuClick = (id) => {
    onNavigate(id);
    setIsMenuOpen(false);
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      {/* Logo */}
      <button
        onClick={() => onNavigate('landing')}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group"
      >
        <div className="bg-indigo-600 p-1 rounded-lg group-hover:scale-110 transition-transform duration-300">
          <Scale className="text-white w-5 h-5" />
        </div>
        <span className="text-lg font-black text-slate-900 tracking-tighter">
          {t('header.logo', 'Barungyeyak')}
        </span>
      </button>

      {/* Desktop menu */}
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

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            {/* Coin Display - 수정됨 */}
            <div
              // cursor-help를 지우고 cursor-default(기본)로 변경했습니다.
              className="bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-200 cursor-default transition-colors hover:bg-slate-200"
              title={t('header.coins', '보유 코인')}
            >
              <Coins className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-black text-slate-700">{coins}</span>
            </div>

            {/* My page */}
            <button
              onClick={onOpenMyPage}
              className="w-9 h-9 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center transition-all hover:scale-105"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('login')}
            className="text-sm font-bold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 whitespace-nowrap"
          >
            {t('auth.loginTitle', '로그인')}
          </button>
        )}

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl md:hidden flex flex-col p-4 space-y-2 z-40">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`text-left px-4 py-4 rounded-xl font-bold transition-colors ${
                isActive(item.id) 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="sm:hidden pt-3 border-t border-slate-100 flex justify-between items-center px-2 mt-2">
            <span className="text-sm font-bold text-slate-400">Language</span>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;