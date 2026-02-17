import { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { Check, X, ChevronLeft } from 'lucide-react';

function SignUp({ onAuth, onCancel, onNavigate }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  // 약관 동의 상태
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    age: false,
    marketing: false
  });

  // 전체 동의 체크박스 토글
  const handleAllCheck = () => {
    const newValue = !agreements.all;
    setAgreements({
      all: newValue,
      terms: newValue,
      privacy: newValue,
      age: newValue,
      marketing: newValue
    });
  };

  // 개별 체크박스 토글
  const handleSingleCheck = (key) => {
    const newAgreements = {
      ...agreements,
      [key]: !agreements[key]
    };
    
    // 필수 항목이 모두 체크되었는지 확인
    const allRequired = newAgreements.terms && 
                        newAgreements.privacy && 
                        newAgreements.age && 
                        newAgreements.marketing;
    
    newAgreements.all = allRequired;
    setAgreements(newAgreements);
  };

  // 필수 약관 모두 동의했는지 확인
  const canProceed = agreements.terms && 
                     agreements.privacy && 
                     agreements.age && 
                     agreements.marketing;

  // 이용약관 상세보기
  const handleViewTerms = () => {
    if (onNavigate) {
      onNavigate('terms');
    }
  };

  // 개인정보 처리방침 상세보기
  const handleViewPrivacy = () => {
    if (onNavigate) {
      onNavigate('privacy');
    }
  };

  // 다음 단계로 (이메일/비밀번호 입력)
  const handleNext = () => {
    if (canProceed) {
      setShowForm(true);
    }
  };

  // 회원가입 처리
  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        tokens: 5,
        createdAt: new Date().toISOString(),
        agreements: {
          terms: agreements.terms,
          privacy: agreements.privacy,
          age: agreements.age,
          marketing: agreements.marketing,
          agreedAt: new Date().toISOString()
        }
      });

      alert(t('auth.signupSuccess', '회원가입이 완료되었습니다!'));
      onAuth();
      
    } catch (error) {
      console.error(error);
      alert(t('auth.signupFail', '회원가입 실패: ') + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black/50 backdrop-blur-sm fixed inset-0 z-50 px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl overflow-hidden">
        {!showForm ? (
          /* 약관 동의 화면 */
          <>
            {/* 헤더 */}
            <div className="p-8 border-b border-slate-100 relative">
              <button 
                onClick={onCancel}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label={t('common.close', '닫기')}
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
              
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                {t('signup.title', '회원가입')}
              </h2>
              <p className="text-sm text-slate-500">
                {t('signup.subtitle', '서비스 이용을 위해 약관에 동의해주세요')}
              </p>
            </div>

            {/* 약관 동의 */}
            <div className="p-8">
              {/* 전체 동의 */}
              <button
                onClick={handleAllCheck}
                className={`w-full p-4 rounded-2xl border-2 transition-all mb-4 ${
                  agreements.all
                    ? 'bg-indigo-50 border-indigo-500'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    agreements.all
                      ? 'bg-indigo-600'
                      : 'bg-white border-2 border-slate-300'
                  }`}>
                    {agreements.all && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="font-bold text-slate-900 flex-1 text-left">
                    {t('signup.agreements.all', '전체 동의')}
                  </span>
                </div>
              </button>

              {/* 개별 약관 */}
              <div className="space-y-3">
                {/* 이용약관 동의 (필수) */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSingleCheck('terms')}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                      agreements.terms
                        ? 'bg-indigo-600'
                        : 'bg-white border-2 border-slate-300'
                    }`}
                  >
                    {agreements.terms && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className="text-sm text-slate-700 flex-1">
                    {t('signup.agreements.termsPrefix', '[필수]')}{' '}
                    <button 
                      onClick={handleViewTerms}
                      className="text-indigo-600 hover:text-indigo-700 underline font-medium"
                    >
                      {t('signup.agreements.termsLink', '이용약관')}
                    </button>
                    {' '}{t('signup.agreements.termsSuffix', '동의')}
                  </span>
                </div>

                {/* 개인정보 처리방침 동의 (필수) */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSingleCheck('privacy')}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                      agreements.privacy
                        ? 'bg-indigo-600'
                        : 'bg-white border-2 border-slate-300'
                    }`}
                  >
                    {agreements.privacy && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className="text-sm text-slate-700 flex-1">
                    {t('signup.agreements.privacyPrefix', '[필수]')}{' '}
                    <button 
                      onClick={handleViewPrivacy}
                      className="text-indigo-600 hover:text-indigo-700 underline font-medium"
                    >
                      {t('signup.agreements.privacyLink', '개인정보 처리방침')}
                    </button>
                    {' '}{t('signup.agreements.privacySuffix', '동의')}
                  </span>
                </div>

                {/* 만 14세 이상 확인 (필수) */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSingleCheck('age')}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                      agreements.age
                        ? 'bg-indigo-600'
                        : 'bg-white border-2 border-slate-300'
                    }`}
                  >
                    {agreements.age && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className="text-sm text-slate-700 flex-1">
                    {t('signup.agreements.age', '[필수] 만 14세 이상입니다')}
                  </span>
                </div>

                {/* 마케팅 정보 수신 동의 (필수) */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSingleCheck('marketing')}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                      agreements.marketing
                        ? 'bg-indigo-600'
                        : 'bg-white border-2 border-slate-300'
                    }`}
                  >
                    {agreements.marketing && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className="text-sm text-slate-700 flex-1">
                    {t('signup.agreements.marketing', '[필수] 마케팅 정보 수신 동의')}
                  </span>
                </div>
              </div>

              {/* 안내 문구 */}
              {!canProceed && (
                <p className="text-xs text-slate-400 mt-4 text-center">
                  {t('signup.agreements.notice', '필수 항목에 모두 동의해주세요')}
                </p>
              )}

              {/* 다음 단계 버튼 */}
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`w-full py-4 rounded-xl font-bold mt-6 transition-all ${
                  canProceed
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {t('common.next', '다음')}
              </button>

              {/* 나중에 하기 */}
              <button
                onClick={onCancel}
                className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors mt-3"
              >
                {t('signup.skipForNow', '나중에 하기')}
              </button>
            </div>
          </>
        ) : (
          /* 이메일/비밀번호 입력 화면 */
          <>
            {/* 헤더 */}
            <div className="p-8 border-b border-slate-100 relative">
              <button 
                onClick={() => setShowForm(false)}
                className="absolute top-4 left-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label={t('common.back', '뒤로')}
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              
              <button 
                onClick={onCancel}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label={t('common.close', '닫기')}
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
              
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                {t('signup.accountInfo', '계정 정보 입력')}
              </h2>
              <p className="text-sm text-slate-500">
                {t('signup.accountSubtitle', '이메일과 비밀번호를 입력해주세요')}
              </p>
            </div>

            {/* 입력 폼 */}
            <form onSubmit={handleSignUp} className="p-8">
              <div className="space-y-4">
                <div>
                  <label htmlFor="signup-email" className="block text-sm font-bold text-slate-700 mb-2">
                    {t('auth.email', '이메일')}
                  </label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-password" className="block text-sm font-bold text-slate-700 mb-2">
                    {t('auth.password', '비밀번호')}
                  </label>
                  <input
                    id="signup-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder={t('auth.passwordPlaceholder', '6자 이상 입력')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold mt-6 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                {t('signup.button', '회원가입')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default SignUp;