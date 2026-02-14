import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { RISK_SEVERITY } from '../constants';

const RiskCard = ({ risk, isSelected, onSelect }) => {
  const severity = RISK_SEVERITY[risk.severity.toUpperCase()] || RISK_SEVERITY.HIGH;

  return (
    <button
      onClick={() => onSelect(risk.id)}
      className={`w-full p-6 rounded-2xl border transition-all text-left ${
        isSelected 
          ? `${severity.borderClass} ${severity.bgClass}/30` 
          : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2 py-0.5 ${severity.badgeClass} text-white rounded text-[10px] font-black uppercase`}>
          {severity.label}
        </span>
        <AlertTriangle className={`w-4 h-4 ${severity.textClass}`} />
      </div>
      
      <h4 className="font-bold text-slate-900 mb-2">
        {risk.title}
      </h4>
      
      <p className="text-xs text-slate-500 leading-relaxed mb-6">
        {risk.description}
      </p>
      
      {risk.legalBasis && (
        <div className="mb-4 text-xs text-slate-400">
          <span className="font-bold">법적 근거:</span> {risk.legalBasis}
        </div>
      )}
      
      {risk.suggestion && (
        <div className={`p-4 bg-white border ${severity.borderClass}/30 rounded-xl`}>
          <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">
            수정 권장안
          </p>
          <p className="text-sm font-medium text-slate-800 italic">
            "{risk.suggestion}"
          </p>
        </div>
      )}
    </button>
  );
};

export default RiskCard;