import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, User, Mail, Coins, Calendar, Settings,
  LogOut, Crown, UserX
} from 'lucide-react';
import {
  getAuth,
  deleteUser,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  EmailAuthProvider,
} from 'firebase/auth';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import TokenShopModal from './TokenShopModal';


// ─── 단순 확인 모달 ────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
      <p className="text-slate-800 font-bold text-center mb-6 whitespace-pre-line">{message}</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onCancel}
          className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">
          취소
        </button>
        <button onClick={onConfirm}
          className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors">
          확인
        </button>
      </div>
    </div>
  </div>
);


// ─── 재인증 모달 ───────────────────────────────────────
// 핵심: onReauthGoogle / onReauthPassword 는 버튼 onClick에 직접 연결.
//       그 앞에 await가 없으므로 브라우저 팝업 차단이 발생하지 않음.
const ReauthModal = ({ providerType, errorMsg, onReauthGoogle, onReauthPassword, onCancel }) => {
  const [password, setPassword] = useState('');


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 className="text-slate-800 font-black text-lg text-center mb-2">재인증 필요</h3>
        <p className="text-slate-500 text-sm text-center mb-5">
          보안을 위해 본인 확인 후 탈퇴가 진행됩니다.
        </p>


        {errorMsg && (
          <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg p-2 mb-4">{errorMsg}</p>
        )}


        {providerType === 'google.com' ? (
          <button onClick={onReauthGoogle}
            className="w-full flex items-center justify-center gap-3 p-3 bg-white border-2 border-slate-200 hover:border-indigo-400 rounded-xl font-bold transition-colors mb-3">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 계정으로 재인증
          </button>
        ) : (
          <>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="현재 비밀번호 입력"
              className="w-full border-2 border-slate-200 focus:border-indigo-400 rounded-xl p-3 mb-3 font-bold outline-none transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && password && onReauthPassword(password)}
              autoFocus
            />
            <button
              onClick={() => onReauthPassword(password)}
              disabled={!password}
              className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-bold transition-colors mb-3">
              확인
            </button>
          </>
        )}


        <button onClick={onCancel}
          className="w-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">
          취소
        </button>
      </div>
    </div>
  );
};


// ─── 메인 컴포넌트 ─────────────────────────────────────
const MyPage = ({ isOpen, onClose, user, onLogout }) => {
  const { t } = useTranslation();
  const [isShopOpen, setIsShopOpen]     = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [reauthState, setReauthState]   = useState(null); // { providerType, errorMsg }
  const [isDeleting, setIsDeleting]     = useState(false);


  const auth = getAuth();
  const db   = getFirestore();


  const {
    email = '',
    coins = 0,
    createdAt,
    isPremium = false,
    stats = {},
    uid,
  } = user || {};


  const analyzedCount   = stats?.analyzed  ?? 0;
  const risksFoundCount = stats?.risksFound ?? 0;
  const coinsUsedCount  = stats?.tokensUsed  ?? 0;


  const formatDate = (date) => {
    if (!date) return '-';
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString('ko-KR');
  };


  // ─── 커스텀 confirm ──────────────────────────────────
  const showConfirm = (message) =>
    new Promise((resolve) => {
      setConfirmState({
        message,
        onConfirm: () => { setConfirmState(null); resolve(true); },
        onCancel:  () => { setConfirmState(null); resolve(false); },
      });
    });


  // ─── Firestore + Auth 삭제 공통 로직 ────────────────
  const executeDelete = async (freshUser) => {
    if (uid) await deleteDoc(doc(db, 'users', uid));
    await deleteUser(freshUser);
    onClose();
    onLogout();
  };


  // ─── 재인증 모달 → Google 버튼 클릭 ─────────────────
  // ✅ 이 함수는 버튼 onClick에서 직접 호출 → 팝업 차단 없음
  const handleReauthGoogle = async () => {
    setReauthState((prev) => ({ ...prev, errorMsg: null }));
    setIsDeleting(true);
    try {
      const provider = new GoogleAuthProvider();
      const result   = await reauthenticateWithPopup(auth.currentUser, provider);
      setReauthState(null);
      await executeDelete(result.user);
    } catch (e) {
      setReauthState((prev) => ({
        ...prev,
        errorMsg: e.code === 'auth/popup-closed-by-user'
          ? '팝업이 닫혔습니다. 다시 시도해 주세요.'
          : '재인증에 실패했습니다. 다시 시도해 주세요.',
      }));
    } finally {
      setIsDeleting(false);
    }
  };


  // ─── 재인증 모달 → 비밀번호 입력 확인 ───────────────
  const handleReauthPassword = async (password) => {
    setReauthState((prev) => ({ ...prev, errorMsg: null }));
    setIsDeleting(true);
    try {
      const credential = EmailAuthProvider.credential(email, password);
      const result     = await reauthenticateWithCredential(auth.currentUser, credential);
      setReauthState(null);
      await executeDelete(result.user);
    } catch (e) {
      setReauthState((prev) => ({
        ...prev,
        errorMsg: e.code === 'auth/wrong-password'
          ? '비밀번호가 올바르지 않습니다.'
          : '재인증에 실패했습니다. 다시 시도해 주세요.',
      }));
    } finally {
      setIsDeleting(false);
    }
  };


  // ─── 회원 탈퇴 버튼 ─────────────────────────────────
  const handleDeleteAccount = async () => {
    const confirmed = await showConfirm(
      '정말로 회원 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
    );
    if (!confirmed) return;


    setIsDeleting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('NO_USER');
      await executeDelete(currentUser);
    } catch (error) {
      const code = error?.code || error?.message || 'UNKNOWN';


      if (code === 'auth/requires-recent-login') {
        // ✅ showConfirm(await) 없이 즉시 재인증 모달로 전환
        //    다음 단계에서 버튼 클릭 → 팝업 호출이므로 차단 없음
        const providerType =
          auth.currentUser?.providerData?.[0]?.providerId ?? 'password';
        setReauthState({ providerType, errorMsg: null });
      } else if (code === 'NO_USER') {
        await showConfirm('사용자 정보를 찾을 수 없습니다.');
      } else {
        await showConfirm('회원 탈퇴 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />


      {/* 사이드 패널 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('mypage.title', '마이페이지')}
        className={`fixed right-0 top-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-2xl font-black text-slate-900">
            {t('mypage.title', '마이페이지')}
          </h2>
          <button onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors" aria-label="닫기">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>


        {/* 스크롤 영역 */}
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
                      <Crown className="w-3 h-3" />PRO
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-sm">{email}</p>
              </div>
            </div>


            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-bold">{t('mypage.token.title', '보유 코인')}</p>
                  <p className="text-2xl font-black">{coins}</p>
                </div>
              </div>
              <button onClick={() => setIsShopOpen(true)}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold text-sm hover:bg-white/90 transition-colors shadow-lg active:scale-95">
                {t('mypage.token.charge', '충전하기')}
              </button>
            </div>
          </div>


          {/* 계정 정보 */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">
              {t('mypage.profile.title', '계정 정보')}
            </h3>
            <div className="space-y-4">
              {[
                { Icon: Mail,     label: t('mypage.profile.email',    '이메일'), value: email || '-' },
                { Icon: Calendar, label: t('mypage.profile.joinDate', '가입일'), value: formatDate(createdAt) },
                { Icon: Settings, label: t('mypage.profile.plan',     '이용 플랜'), value: isPremium ? 'Premium' : 'Free' },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold">{label}</p>
                    <p className="font-bold text-slate-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* 이용 통계 */}
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
                <p className="text-2xl font-black text-purple-600 mb-1">{coinsUsedCount}</p>
                <p className="text-xs text-slate-600 font-bold">{t('mypage.statistics.tokensUsed', '사용된 코인')}</p>
              </div>
            </div>
          </div>


          {/* 하단 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onLogout}
              className="flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors">
              <LogOut className="w-5 h-5" />
              {t('mypage.actions.logout', '로그아웃')}
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 p-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <UserX className="w-5 h-5" />
              {isDeleting ? '처리 중...' : t('mypage.actions.withdraw', '회원 탈퇴')}
            </button>
          </div>
        </div>
      </div>


      {/* 코인 충전 모달 */}
      <TokenShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        userEmail={email}
      />


      {/* 삭제 확인 모달 */}
      {confirmState && (
        <ConfirmModal
          message={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onCancel={confirmState.onCancel}
        />
      )}


      {/* 재인증 모달 */}
      {reauthState && (
        <ReauthModal
          providerType={reauthState.providerType}
          errorMsg={reauthState.errorMsg}
          onReauthGoogle={handleReauthGoogle}
          onReauthPassword={handleReauthPassword}
          onCancel={() => setReauthState(null)}
        />
      )}
    </>
  );
};


export default MyPage;
