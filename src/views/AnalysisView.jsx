import React from 'react';
import { BarChart3, Download } from 'lucide-react';
import RiskCard from '../components/RiskCard';

const AnalysisView = ({ file, result, selectedRisk, onRiskSelect }) => {
  const { risks, details } = result || { 
    risks: { critical: 1, warning: 2 }, 
    details: [] 
  };

  const handleDownload = () => {
    // TODO: Implement actual document download with modifications
    alert('수정된 계약서 다운로드 기능은 곧 제공됩니다.');
  };

  return (
    <div className="h-[calc(100vh-73px)] flex bg-white overflow-hidden">
      {/* Document View */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-8 flex flex-col items-center">
        <div className="max-w-[800px] w-full bg-white shadow-lg p-16 font-serif leading-[2.2] text-slate-800 border border-slate-200 relative mb-20 min-h-[1000px]">
          <div className="flex justify-between items-start mb-12">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Confidential Document
            </span>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Page 1
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-16">
            근 로 계 약 서
          </h1>
          
          <p className="mb-8">
            ...중략... 제 2조 (계약의 해지) 갑은 경영상의 이유가 있을 경우{' '}
            <button
              onClick={() => onRiskSelect('R1')}
              className={`cursor-pointer transition-all ${
                selectedRisk === 'R1' 
                  ? 'bg-red-200 ring-2 ring-red-500' 
                  : 'bg-red-100 border-b-2 border-red-500 hover:bg-red-200'
              }`}
              aria-label="리스크 항목 R1 상세보기"
            >
              언제든 별도의 절차 없이 을을 해고할 수 있으며
            </button>
            {' '}을은 이에 일체의 이의를 제기하지 아니한다.
          </p>
          
          <p className="mb-8">
            제 3조 (비밀유지) 을은 퇴사 후 10년 동안 동종 업종에 취업할 수 없으며...
          </p>
        </div>
      </div>

      {/* Risk Panel */}
      <div className="w-[480px] border-l border-slate-200 bg-white flex flex-col shadow-2xl z-30">
        {/* Risk Summary */}
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <BarChart3 className="w-3 h-3" /> Risk Intelligence
          </h3>
          <div className="flex gap-4">
            <div className="flex-1 p-4 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-2xl font-black text-red-600">{risks.critical}</p>
              <p className="text-[10px] font-black text-red-400 uppercase">Critical</p>
            </div>
            <div className="flex-1 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-2xl font-black text-amber-600">{risks.warning}</p>
              <p className="text-[10px] font-black text-amber-400 uppercase">Warning</p>
            </div>
          </div>
        </div>

        {/* Risk List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {details.map((risk) => (
            <RiskCard
              key={risk.id}
              risk={risk}
              isSelected={selectedRisk === risk.id}
              onSelect={onRiskSelect}
            />
          ))}
          
          {details.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p>분석 결과가 없습니다.</p>
            </div>
          )}
        </div>

        {/* Download Button */}
        <div className="p-8 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={handleDownload}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            수정된 계약서 다운로드 (.docx)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;