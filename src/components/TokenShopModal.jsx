import React, { useState, useEffect } from 'react';
import { X, Zap, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// ✨ 파이어베이스 연동
import { db, auth } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

const TokenShopModal = ({ isOpen, onClose, userEmail }) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  // 💰 토큰 상품 목록 (가격은 문자열로 유지하되, 결제 시 숫자로 변환합니다)
  const products = [
    { id: 'starter', tokens: 10, price: '1,000', label: 'Starter', popular: false },
    { id: 'pro', tokens: 50, price: '4,500', label: 'Pro', popular: true }, 
    { id: 'business', tokens: 100, price: '8,000', label: 'Business', popular: false },
  ];

  // 모달 열릴 때 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePurchase = (product) => {
    if (!auth.currentUser) return alert("로그인이 필요합니다.");
    if (!window.IMP) return alert("결제 모듈을 불러오지 못했습니다. 새로고침 해주세요.");

    // 1. 포트원 초기화
    const { IMP } = window;
    // ⚠️ [중요] 본인의 가맹점 식별코드로 변경하세요! (admin.portone.io 내 정보 확인)
    // 예: "imp12345678"
    IMP.init("imp55403671"); 

    // 2. 가격 문자열('5,000')을 숫자(5000)로 변환
    const amount = parseInt(product.price.replace(/,/g, ''), 10);

    // 3. 결제 데이터 설정
    const data = {
      pg: "kakaopay.TC0ONETIME", // 카카오페이 테스트 모드
      pay_method: "card",
      merchant_uid: `mid_${new Date().getTime()}`, // 주문번호 (매번 달라야 함)
      name: `LexGuard ${product.tokens} 코인`,
      amount: amount,
      buyer_email: userEmail,
      buyer_name: userEmail ? userEmail.split('@')[0] : 'Guest',
    };

    // 4. 결제 요청
    IMP.request_pay(data, async (response) => {
      const { success, error_msg } = response;

      if (success) {
        // ✅ 결제 성공 시 파이어베이스 업데이트
        try {
          setIsProcessing(true); // 저장 중 로딩 표시
          
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, {
            coins: increment(product.tokens) // 안전하게 코인 증가
          });

          alert(`결제가 완료되었습니다! ${product.tokens} 코인이 충전되었습니다. 🎉`);
          onClose(); // 모달 닫기
          
        } catch (error) {
          console.error("Firebase update failed:", error);
          alert("결제는 성공했으나 코인 지급 중 오류가 발생했습니다. 관리자에게 문의하세요.");
        } finally {
          setIsProcessing(false);
        }
      } else {
        // ❌ 결제 실패 또는 취소
        alert(`결제 실패: ${error_msg}`);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-scale-up">
        
        {/* 헤더 */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              {t('shop.title') || "토큰 충전소"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">현재 계정: {userEmail}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* 상품 목록 */}
        <div className="p-6 space-y-4">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => handlePurchase(product)}
              disabled={isProcessing}
              className={`w-full group relative flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 ${
                product.popular 
                  ? 'border-indigo-500 bg-indigo-50 hover:bg-indigo-100' 
                  : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {/* 인기 뱃지 */}
              {product.popular && (
                <span className="absolute -top-3 left-6 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                  BEST VALUE
                </span>
              )}

              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  product.popular ? 'bg-indigo-200' : 'bg-slate-200'
                }`}>
                  <Zap className={`w-6 h-6 ${product.popular ? 'text-indigo-700 fill-indigo-700' : 'text-slate-500'}`} />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg text-slate-900">{product.tokens} Coins</p>
                  <p className="text-sm text-slate-500 font-medium">{product.label} Plan</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">₩{product.price}</p>
                <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">
                  구매하기 →
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* 푸터 */}
        <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold">
               <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
               지급 처리 중...
            </div>
          ) : (
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              카카오페이 테스트 결제가 지원됩니다. (실제 과금 X)
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default TokenShopModal;