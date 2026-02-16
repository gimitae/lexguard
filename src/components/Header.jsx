import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Coins, LogOut, ChevronDown, Menu } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const Header = ({ isLoggedIn, tokens, onLogout, onNavigate, currentView, onOpenMyPage }) => {
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
          <div className="flex items-center gap-3">
            {/* 토큰 표시 */}
            <div 
              className="bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-200 group"
              title="보유 토큰"
            >
              <Coins className="w-3 h-3 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-slate-700">{tokens}</span>
            </div>
            
            {/* 마이페이지 버튼 (햄버거 메뉴처럼 생긴 아이콘) */}
            <button 
              onClick={onOpenMyPage}
              className="p-2 hover:bg-indigo-50 rounded-lg transition-colors group"
              title="마이페이지"
            >
              <Menu className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
            </button>
          </div>
        ) : (
          /* 비로그인 상태일 때 */
          <div className="flex items-center gap-2">
            {/* 회원가입 버튼 */}
            <button 
              onClick={() => onNavigate('signup')}
              className="hidden md:block text-sm font-bold text-slate-500 hover:text-indigo-600 px-3 py-2 transition-colors"
            >
              {t('header.signup', '회원가입')}
            </button>

            {/* 로그인 버튼 */}
            <button 
              onClick={() => onNavigate('login')}
              className="text-sm font-bold text-slate-900 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all hover:scale-105 duration-300"
            >
              {t('header.login', '로그인')}
            </button>

            {/* 모바일 메뉴 */}
            <div className="md:hidden relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { 
                        onNavigate(item.id); 
                        setShowMenu(false); 
                      }}
                      className={`
                        block w-full text-left px-4 py-2 text-sm font-bold transition-colors
                        ${isActive(item.id)
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-slate-600 hover:bg-slate-50'
                        }
                      `}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;