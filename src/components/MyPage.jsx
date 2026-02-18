import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Mail, Coins, Calendar, Settings, LogOut, Crown } from 'lucide-react';
import TokenShopModal from './TokenShopModal';

const MyPage = ({ isOpen, onClose, user, onLogout }) => {
  const { t } = useTranslation();
  const [isShopOpen, setIsShopOpen] = useState(false);

  // [수정] user 객체에서 tokens -> coins 로 변경하여 추출
  const { email, coins, createdAt, isPremium, stats } = user || {};

  // 통계 데이터 기본값 처리
  const analyzedCount = stats?.analyzed || 0;
  const risksFoundCount = stats?.risksFound || 0;
  // (참고: DB 통계 필드명은 유지되더라도 UI 변수명은 coinsUsedCount로 명확히 할 수 있습니다)
  const coinsUsedCount = stats?.tokensUsed || 0; 

  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    if (!date) return '-';
    // Firebase Timestamp 객체와 일반 Date 객체 모두 대응
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString('ko-KR');
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* 마이페이지 사이드 패널 */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 헤더 섹션 */}
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

        {/* 메인 컨텐츠 */}
        <div className="overflow-y-auto h-[calc(100vh-80px)] p-6">

          {/* 프로필 카드 섹션 */}
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

            {/* 코인 잔액 및 충전 [수정됨] */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  {/* 번역 키가 'token'으로 되어있다면, 추후 translation.json에서 '코인'으로 텍스트를 변경해주세요 */}
                  <p className="text-white/60 text-xs font-bold">{t('mypage.token.title', '보유 코인')}</p>
                  {/* coins 변수 사용 */}
                  <p className="text-2xl font-black">{coins || 0}</p>
                </div>
              </div>
              <button
                onClick={() => setIsShopOpen(true)}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold text-sm hover:bg-white/90 transition-colors shadow-lg active:scale-95"
              >
                {t('mypage.token.charge', '충전하기')}
              </button>
            </div>
          </div>

          {/* 상세 계정 정보 */}
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
                  <p className="text-xs text-slate-500 font-bold">{t('mypage.profile.email', '이메일')}</p>
                  <p className="font-bold text-slate-900">{email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold">{t('mypage.profile.joinDate', '가입일')}</p>
                  <p className="font-bold text-slate-900">{formatDate(createdAt)}</p>
                </div>
              </div>
              {/* 플랜 정보는 코인과 별개이므로 유지 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold">{t('mypage.profile.plan', '이용 플랜')}</p>
                  <p className="font-bold text-slate-900">{isPremium ? 'Premium' : 'Free'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 이용 통계 섹션 */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">
              {t('mypage.statistics.title', '이용 통계')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-2xl font-black text-indigo-600 mb-1">{analyzedCount}</p>
                <p className="text-xs text-slate-600 font-bold">{t('mypage.statistics.analyzed', '분석 완료')}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-2xl font-black text-emerald-600 mb-1">{risksFoundCount}</p>
                <p className="text-xs text-slate-600 font-bold">{t('mypage.statistics.risksFound', '발견된 위험')}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm col-span-2">
                {/* [수정] tokensUsedCount -> coinsUsedCount */}
                <p className="text-2xl font-black text-purple-600 mb-1">{coinsUsedCount}</p>
                <p className="text-xs text-slate-600 font-bold">{t('mypage.statistics.tokensUsed', '사용된 코인')}</p>
              </div>
            </div>
          </div>

          {/* 로그아웃 버튼 */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t('mypage.actions.logout', '로그아웃')}
          </button>
        </div>
      </div>

      {/* 코인 충전 모달 (기존 TokenShopModal 재사용) */}
      <TokenShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        userEmail={email}
      />
    </>
  );
};

export default MyPage;