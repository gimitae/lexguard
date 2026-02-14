import React from 'react';
import { Info, ArrowRight } from 'lucide-react';

const DemoNotice = ({ onConfirm, onCancel }) => {
  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-6">
      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden p-10">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Info className="w-8 h-8 text-indigo-600" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-4 text-center">
          AI 분석 모드
        </h2>
        
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
          <p className="text-slate-600 leading-relaxed mb-4">
            현재 <strong className="text-slate-900">AI 분석 환경</strong>에서 작동 중입니다.
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>실제 AI 분석이 표시됩니다</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>업로드된 파일은 서버에 저장되지 않습니다</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>프로덕션 버전에서는 실제 법률 AI가 작동합니다</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            계속하기 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoNotice;