import React, { useState } from 'react';
import { X, Zap, CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// ✨ 파이어베이스 연동
import { db, auth } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

const TokenShopModal = ({ isOpen, onClose, userEmail }) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  // 💰 토큰 상품 목록
  const products = [
    { id: 'starter', tokens: 10, price: '5,000', label: 'Starter', popular: false },
    { id: 'pro', tokens: 50, price: '20,000', label: 'Pro', popular: true }, // 20% 할인 느낌
    { id: 'business', tokens: 100, price: '35,000', label: 'Business', popular: false },
  ];

  const handlePurchase = async (product) => {
    if (!auth.currentUser) return alert("로그인이 필요합니다.");
    
    // 가짜 결제 프로세스 (1.5초 딜레이)
    setIsProcessing(true);
    
    setTimeout(async () => {
      try {
        // 🔥 파이어베이스에 코인 추가 (increment 사용으로 안전하게 증가)
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          coins: increment(product.tokens)
        });

        alert(`${product.tokens} 토큰이 충전되었습니다! 🎉`);
        onClose(); // 창 닫기
      } catch (error) {
        console.error("Purchase failed:", error);
        alert("결제 중 오류가 발생했습니다.");
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative animate-scale-up">
        
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
                  <p className="font-black text-lg text-slate-900">{product.tokens} Tokens</p>
                  <p className="text-sm text-slate-500 font-medium">{product.label} Plan</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">₩{product.price}</p>
                <p className="text-xs text-slate-400">VAT 포함</p>
              </div>
            </button>
          ))}
        </div>

        {/* 푸터 */}
        <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold">
               <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
               결제 처리 중...
            </div>
          ) : (
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              안전한 결제를 위해 테스트 모드로 작동합니다. (실제 과금 X)
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default TokenShopModal;