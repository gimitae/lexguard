import React from 'react';
import { Zap } from 'lucide-react';

const FloatingTooltip = ({ info, position }) => {
  if (!info) return null;

  const severityStyles = {
    CRITICAL: 'border-red-200 bg-red-50 text-red-700',
    WARNING: 'border-orange-200 bg-orange-50 text-orange-700',
    DISADVANTAGE: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    SAFE: 'border-green-200 bg-green-50 text-green-700'
  };

  return (
    <div
      className={`fixed z-[9999] w-80 p-6 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl border-2 pointer-events-none transition-all duration-200 ${severityStyles[info.severity]}`}
      style={{ top: position.y + 20, left: Math.min(position.x + 20, window.innerWidth - 340) }}
    >
      <div className="flex items-center gap-2 mb-4 opacity-80">
        <Zap size={14} fill="currentColor" />
        <span className="text-[10px] font-black uppercase tracking-widest">AI 전략적 수정 제안</span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[13px] font-bold text-slate-900 leading-snug italic">
            {/* AI가 생성한 유효한 수정안이 없을 경우를 대비한 가이드 멘트 */}
            {info.suggestion && info.suggestion !== "없음"
              ? `"${info.suggestion}" (으)로 수정하여 귀하의 권리를 보호하세요.`
              : "법률 전문가를 통해 해당 독소 조항을 삭제하거나 근로기준법 준수 문구로 전면 수정을 권장합니다."}
          </p>
        </div>
        <div className="pt-3 border-t border-slate-200/50">
          <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
            * 근거 법령: {info.law_reference || "근로기준법 관련 조항"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FloatingTooltip;