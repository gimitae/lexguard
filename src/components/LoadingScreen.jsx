import React, { useState, useEffect } from 'react';
import { FileSearch } from 'lucide-react';

const LOADING_STEPS = [
  { step: 1, message: '계약서 스캔 중...', duration: 1000 },
  { step: 2, message: '판례 DB 대조 중...', duration: 1500 },
  { step: 3, message: '리스크 분석 완료', duration: 500 }
];

const LoadingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= LOADING_STEPS.length) return;

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, LOADING_STEPS[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const currentMessage = LOADING_STEPS[currentStep] || LOADING_STEPS[LOADING_STEPS.length - 1];
  const progress = ((currentStep + 1) / LOADING_STEPS.length) * 100;

  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <FileSearch className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-400 animate-pulse" />
      </div>
      
      <h2 className="text-xl font-black text-slate-900 tracking-tight">
        AI 엔진이 법률 리스크를 분석하고 있습니다
      </h2>
      
      <div className="mt-6 w-64">
        <div className="flex items-center justify-between mb-2">
          <p className="text-slate-600 text-sm font-medium">{currentMessage.message}</p>
          <span className="text-xs font-black text-slate-400">
            {currentMessage.step}/{LOADING_STEPS.length}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <p className="text-slate-400 text-sm mt-4">잠시만 기다려 주세요...</p>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-in { animation: fade-in 0.5s ease-out forwards; }
      `}} />
    </div>
  );
};

export default LoadingScreen;