import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Coins, User, Menu, X } from 'lucide-react'; // ✨ Menu, X 아이콘 추가
import LanguageSwitcher from './LanguageSwitcher';

const Header = ({ isLoggedIn, tokens, onNavigate, currentView, onOpenMyPage }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // ✨ 모바일 메뉴 열림/닫힘 상태

  const menuItems = [
    { id: 'lawfirms', label: t('header.menu.consultation') },
    { id: 'terms', label: t('header.menu.terms') },
    { id: 'support', label: t('header.menu.support') }
  ];

  const isActive = (viewId) => currentView === viewId;

  // 메뉴 클릭 시 페이지 이동하고 드롭다운 닫기
  const handleMenuClick = (id) => {
    onNavigate(id);
    setIsMenuOpen(false);
  };

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

      {/* 🖥️ 데스크탑 메뉴 (화면이 클 때만 보임) */}
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

      {/* 우측 상단 버튼들 */}
      <div className="flex items-center gap-3">
        {/* 언어 변경 (화면 작으면 숨김 -> 드롭다운으로 이동) */}
        <div className="hidden sm:block">
            <LanguageSwitcher />
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            {/* 토큰 표시 */}
            <div 
              className="bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-200"
              title="보유 토큰"
            >
              <Coins className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-black text-slate-700">{tokens}</span>
            </div>
            
            {/* 마이페이지 버튼 */}
            <button 
              onClick={onOpenMyPage}
              className="w-9 h-9 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center transition-all hover:scale-105"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onNavigate('login')}
              className="text-sm font-bold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 whitespace-nowrap"
            >
              {t('auth.loginTitle')}
            </button>
          </div>
        )}

        {/* 📱 모바일 햄버거 버튼 (화면 작을 때만 보임) */}
        <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 📱 모바일 메뉴 드롭다운 (열렸을 때만 보임) */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl md:hidden flex flex-col p-4 space-y-2 animate-fade-in-down z-40">
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
            
            {/* 모바일용 언어 설정 (위에서 숨겨진 경우 여기서 표시) */}
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
