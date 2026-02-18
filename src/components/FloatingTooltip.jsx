import React from 'react';
import { Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FloatingTooltip = ({ info, position, currentLang }) => {
  const { t } = useTranslation();

  if (!info) return null;

  const severityStyles = {
    CRITICAL: 'border-red-200 bg-red-50 text-red-700',
    WARNING: 'border-orange-200 bg-orange-50 text-orange-700',
    DISADVANTAGE: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    SAFE: 'border-green-200 bg-green-50 text-green-700'
  };

  // 다국어 텍스트 추출 헬퍼 (suggestion 객체 대응)
  const getSuggestionText = () => {
    const suggestion = info.suggestion;

    // 1. suggestion이 객체 {ko, en, ja}인 경우
    if (typeof suggestion === 'object' && suggestion !== null) {
      const text = suggestion[currentLang] || suggestion['ko'];
      if (text && text !== "해당 없음" && text !== "N/A") return text;
    }
    // 2. suggestion이 문자열인 경우
    else if (typeof suggestion === 'string' && suggestion !== "해당 없음" && suggestion !== "N/A" && suggestion !== "") {
      return suggestion;
    }

    return null;
  };

  const suggestionText = getSuggestionText();

  return (
    <div
      className={`fixed z-[9999] w-80 p-6 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl border-2 pointer-events-none transition-all duration-200 ${severityStyles[info.severity]}`}
      style={{
        top: position.y + 20,
        left: Math.min(position.x + 20, window.innerWidth - 340)
      }}
    >
      <div className="flex items-center gap-2 mb-4 opacity-80">
        <Zap size={14} fill="currentColor" />
        <span className="text-[10px] font-black uppercase tracking-widest">
          {t('tooltip.title', 'AI 전략적 수정 제안')}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[13px] font-bold text-slate-900 leading-snug italic">
            {suggestionText
              ? t('tooltip.suggestion_format', { text: suggestionText, defaultValue: `"${suggestionText}" (으)로 수정하여 권리를 보호하세요.` })
              : t('tooltip.default_advice', "법률 전문가를 통해 해당 독소 조항을 삭제하거나 근로기준법 준수 문구로 전면 수정을 권장합니다.")}
          </p>
        </div>
        <div className="pt-3 border-t border-slate-200/50">
          <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
            * {t('tooltip.law_basis', '근거 법령')}: {info.law_reference || t('tooltip.law_general', "근로기준법 관련 조항")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FloatingTooltip;

