import React from 'react';
import { AlertTriangle, Scale } from 'lucide-react';
import { RISK_SEVERITY } from '../constants';

const RiskCard = ({ risk, isSelected, onSelect }) => {
  const severity = RISK_SEVERITY[risk.severity?.toUpperCase()] || RISK_SEVERITY.MEDIUM;

  return (
    <button
      onClick={() => onSelect(risk.id)}
      className={`w-full p-6 rounded-2xl border transition-all text-left ${
        isSelected 
          ? `${severity.borderClass} ${severity.bgClass}/30 ring-2 ring-offset-2 ${severity.borderClass.replace('border-', 'ring-')}` 
          : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 ${severity.badgeClass} text-white rounded-lg text-[10px] font-black uppercase tracking-wide`}>
          {severity.label}
        </span>
        <AlertTriangle className={`w-5 h-5 ${severity.textClass}`} />
      </div>

      <h4 className="font-bold text-slate-900 mb-3 text-base">
        {risk.title}
      </h4>

      {risk.clause && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-700 leading-relaxed">
            {risk.clause.length > 150
              ? `${risk.clause.substring(0, 150)}...`
              : risk.clause
            }
          </p>
        </div>
      )}

      {risk.law && (
        <div className="mb-4 flex items-start gap-2">
          <Scale className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-slate-700">법적 근거:</span>
            <span className="text-slate-600 ml-1">{risk.law}</span>
          </div>
        </div>
      )}

      {risk.issue && (
        <div className="mb-4">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">
            문제점
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            {risk.issue}
          </p>
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