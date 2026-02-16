import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Mail, Coins, Calendar, Settings, LogOut, Crown } from 'lucide-react';

const MyPage = ({ isOpen, onClose, user, onLogout }) => {
  const { t } = useTranslation();

  // user 객체에서 정보 추출
  const { email, tokens, createdAt, isPremium } = user || {};
  
  // 가입일 포맷팅
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ko-KR');
  };

  return (
    <>
      {/* 오버레이 */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* 마이페이지 패널 */}
      <div 
        className={`fixed right-0 top-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-2xl font-black text-slate-900">
            {t('mypage.title', '마이페이지')}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="overflow-y-auto h-[calc(100vh-80px)] p-6">
          {/* 프로필 카드 */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 mb-6 text-white shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold">{email?.split('@')[0] || 'User'}</h3>
                  {isPremium && (
                    <span className="bg-amber-400 text-amber-900 text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-sm">{email}</p>
              </div>
            </div>
            
            {/* 토큰 정보 */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-bold">{t('mypage.token.title')}</p>
                  <p className="text-2xl font-black">{tokens || 0}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold text-sm hover:bg-white/90 transition-colors">
                {t('mypage.token.charge')}
              </button>
            </div>
          </div>

          {/* 계정 정보 */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">
              {t('mypage.profile.title', '계정 정보')}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold">{t('mypage.profile.email')}</p>
                  <p className="font-bold text-slate-900">{email || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold">{t('mypage.profile.joinDate')}</p>
                  <p className="font-bold text-slate-900">{formatDate(createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Coins className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold">{t('mypage.profile.plan')}</p>
                  <p className="font-bold text-slate-900">
                    {isPremium ? 'Premium' : 'Free'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 사용 통계 */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">
              {t('mypage.statistics.title', '이용 통계')}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4">
                <p className="text-2xl font-black text-indigo-600 mb-1">12</p>
                <p className="text-xs text-slate-600 font-bold">{t('mypage.statistics.analyzed')}</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="text-2xl font-black text-emerald-600 mb-1">8</p>
                <p className="text-xs text-slate-600 font-bold">{t('mypage.statistics.risksFound')}</p>
              </div>
              
              <div className="bg-white rounded-xl p-4">
                <p className="text-2xl font-black text-purple-600 mb-1">24</p>
                <p className="text-xs text-slate-600 font-bold">{t('mypage.statistics.tokensUsed')}</p>
              </div>
            </div>
          </div>

        

          {/* 로그아웃 버튼 */}
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t('mypage.actions.logout')}
          </button>
        </div>
      </div>
    </>
  );
};

export default MyPage;