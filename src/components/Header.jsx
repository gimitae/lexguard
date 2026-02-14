import React, { useState } from 'react';
import { Scale, Coins, LogOut, ChevronDown } from 'lucide-react';

const Header = ({ isLoggedIn, tokens, onLogout, onNavigate, currentView }) => {
  const [showMenu, setShowMenu] = useState(false);

  const menuItems = [
    { id: 'lawfirms', label: '전문 상담' },
    { id: 'terms', label: '이용약관' },
    { id: 'support', label: '고객지원' }
  ];

  const isActive = (viewId) => currentView === viewId;

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      {/* Logo */}
      <button 
        onClick={() => onNavigate('landing')}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group"
        aria-label="홈으로 이동"
      >
        <div className="bg-indigo-600 p-1 rounded-lg group-hover:scale-110 transition-transform duration-300">
          <Scale className="text-white w-5 h-5" />
        </div>
        <span className="text-lg font-black text-slate-900 tracking-tighter">
          LEXGUARD
        </span>
      </button>

      {/* Center Menu */}
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
            {/* Active Indicator */}
            {isActive(item.id) && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-600 rounded-t-full animate-slide-up" />
            )}
          </button>
        ))}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <div 
              className="bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-200 hover:border-amber-300 transition-all duration-300 group"
              title="분석 1회당 토큰 1개 사용"
            >
              <Coins className="w-3 h-3 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-slate-700">{tokens}</span>
            </div>
            <button 
              onClick={onLogout}
              className="text-slate-400 hover:text-red-500 transition-colors hover:scale-110 duration-300"
              aria-label="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Menu */}
            <div className="md:hidden relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 animate-fade-in-down">
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
            
            <button 
              onClick={() => onNavigate('signup')}
              className="text-sm font-bold text-slate-900 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all hover:scale-105 duration-300"
            >
              로그인
            </button>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.2s ease-out;
        }
      `}} />
    </nav>
  );
};

export default Header;