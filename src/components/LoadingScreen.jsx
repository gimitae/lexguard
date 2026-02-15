import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';  // ✅ 1. import 추가

const LoadingScreen = () => {
  const { t } = useTranslation();  // ✅ 2. 훅 사용
  const [currentStep, setCurrentStep] = useState(0);

  // ✅ 3. 번역 키로 변경
  const LOADING_STEPS = [
    { step: 1, message: t('analysis.loading.steps.scanning'), duration: 1000 },
    { step: 2, message: t('analysis.loading.steps.comparing'), duration: 1500 },
    { step: 3, message: t('analysis.loading.steps.complete'), duration: 500 }
  ];

  useEffect(() => {
    if (currentStep < LOADING_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, LOADING_STEPS[currentStep].duration);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const currentMessage = LOADING_STEPS[currentStep] || LOADING_STEPS[LOADING_STEPS.length - 1];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-lg w-full px-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          {/* ✅ 번역 적용 */}
          <h2 className="text-2xl font-black text-slate-900 mb-4">
            {t('analysis.loading.title')}
          </h2>
          
          <p className="text-lg font-bold text-indigo-600 mb-2">
            {currentMessage.message}
          </p>
          
          {/* ✅ 번역 적용 */}
          <p className="text-sm text-slate-500">
            {t('analysis.loading.wait')}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-600 h-full transition-all duration-500"
            style={{ width: `${(currentStep / LOADING_STEPS.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;