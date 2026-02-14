import React from 'react';
import { CheckCircle, FileText, ShieldCheck, ArrowRight } from 'lucide-react';

const PreviewResult = ({ file, result, onAuth }) => {
  const { risks } = result || { risks: { critical: 1, warning: 2 } };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-6">
      <div className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden relative">
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            분석이 완료되었습니다!
          </h2>
          
          <p className="text-slate-500 font-medium mb-8">
            <span className="text-red-500 font-bold">치명적 리스크 {risks.critical}건</span>과{' '}
            <span className="text-amber-500 font-bold">주의 조항 {risks.warning}건</span>이 발견되었습니다.<br/>
            지금 무료 가입하고 상세 내용을 확인하세요.
          </p>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 text-left space-y-3">
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <FileText className="w-4 h-4" /> 
              <span>{file?.name || "Contract.pdf"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <ShieldCheck className="w-4 h-4" /> 
              <span>2,400개 판례 대조 분석 완료</span>
            </div>
          </div>

          <button 
            onClick={onAuth}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95"
          >
            결과 무료로 확인하기 <ArrowRight className="w-5 h-5" />
          </button>
          
          <p className="mt-6 text-xs text-slate-400 font-medium">
            소셜 계정으로 3초 만에 시작하기
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreviewResult;