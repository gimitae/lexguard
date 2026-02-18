import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Download, FileText, AlertCircle, AlertTriangle, Info, CheckCircle, Lightbulb } from 'lucide-react';

const AnalysisView = ({ result }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [selectedId, setSelectedId] = useState(null);

  const rawText = result?.raw_text || "";
  const analysis = result?.analysis || [];

  const stats = useMemo(() => {
    return analysis.reduce((acc, curr) => {
      acc[curr.severity] = (acc[curr.severity] || 0) + 1;
      return acc;
    }, { CRITICAL: 0, WARNING: 0, DISADVANTAGE: 0, SAFE: 0 });
  }, [analysis]);

  const handleHighlightClick = (clauseNumber) => {
    setSelectedId(clauseNumber);
    setTimeout(() => {
      const element = document.getElementById(`risk-card-${clauseNumber}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const renderedDocument = useMemo(() => {
    if (!rawText) return <p className="text-slate-400">계약서 내용을 불러올 수 없습니다.</p>;

    const riskyClauses = analysis
      .filter(item => item.severity !== 'SAFE' && item.start !== undefined && item.end !== undefined)
      .sort((a, b) => a.start - b.start);

    const parts = [];
    let lastIndex = 0;

    riskyClauses.forEach((item, idx) => {
      if (item.start > lastIndex) {
        parts.push(rawText.substring(lastIndex, item.start));
      }

      const severityColor = item.severity === 'CRITICAL' ? 'bg-red-100 border-red-400' :
        item.severity === 'WARNING' ? 'bg-orange-100 border-orange-400' : 'bg-yellow-100 border-yellow-400';

      parts.push(
        <mark
          key={`highlight-${idx}`}
          onClick={() => handleHighlightClick(item.clause_number)}
          className={`cursor-pointer transition-all border-b-2 ${severityColor} ${
            selectedId === item.clause_number ? 'ring-2 ring-indigo-500 bg-opacity-100' : 'bg-opacity-50 hover:bg-opacity-80'
          }`}
          title={item.explanation[currentLang] || item.explanation['ko']}
        >
          {rawText.substring(item.start, item.end)}
        </mark>
      );
      lastIndex = item.end;
    });

    if (lastIndex < rawText.length) {
      parts.push(rawText.substring(lastIndex));
    }

    return (
      <div className="whitespace-pre-wrap leading-relaxed font-serif text-slate-800">
        {parts}
      </div>
    );
  }, [rawText, analysis, selectedId, currentLang]);

  const getTranslatedText = (field) => {
    if (typeof field === 'object' && field !== null) {
      return field[currentLang] || field['ko'] || "";
    }
    return field || "";
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col md:flex-row bg-white overflow-hidden">

      {/* Left: Document View */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-4 md:p-8 flex flex-col items-center">
        <div className="max-w-[800px] w-full bg-white shadow-lg p-4 md:p-16 border border-slate-200 relative mb-8 md:mb-20 min-h-[400px] md:min-h-[1000px]">
          <div className="flex justify-between items-start mb-6 md:mb-12">
            <span className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Digitalized Scan Document
            </span>
            <span className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Analysis Mode
            </span>
          </div>

          <h1 className="text-lg md:text-2xl font-bold text-center mb-8 md:mb-16 text-slate-900 border-b pb-4">
            계약서 분석 결과 전수조사
          </h1>

          {renderedDocument}
        </div>
      </div>

      {/* Right: Risk Panel */}
      <div className="w-full md:w-[480px] border-l border-slate-200 bg-white flex flex-col shadow-2xl z-30">
        <div className="p-4 md:p-8 border-b border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
            <BarChart3 className="w-3 h-3 text-indigo-600" /> Risk Intelligence Summary
          </h3>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <StatCard label="Critical" count={stats.CRITICAL} color="text-red-600" bgColor="bg-red-50" />
            <StatCard label="Warning" count={stats.WARNING} color="text-orange-600" bgColor="bg-orange-50" />
            <StatCard label="Disadvant" count={stats.DISADVANTAGE} color="text-yellow-600" bgColor="bg-yellow-50" />
            <StatCard label="Safe" count={stats.SAFE} color="text-green-600" bgColor="bg-green-50" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6">
          {analysis.map((item, idx) => (
            <div
              key={idx}
              id={`risk-card-${item.clause_number}`}
              onClick={() => setSelectedId(item.clause_number)}
              className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer ${
                selectedId === item.clause_number 
                  ? 'border-indigo-500 shadow-md bg-indigo-50/30' 
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-center mb-2 md:mb-3">
                <span className={`px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold text-white uppercase ${
                  item.severity === 'CRITICAL' ? 'bg-red-500' :
                  item.severity === 'WARNING' ? 'bg-orange-500' :
                  item.severity === 'DISADVANTAGE' ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                  {item.severity}
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-slate-300">#{item.clause_number}</span>
              </div>
              <p className="text-xs md:text-sm font-bold text-slate-900 mb-2 leading-relaxed line-clamp-2">
                "{getTranslatedText(item.original_text) || item.clause}"
              </p>
              <p className="text-[11px] md:text-xs text-slate-600 leading-relaxed">
                {getTranslatedText(item.explanation)}
              </p>

              {selectedId === item.clause_number && item.severity !== 'SAFE' && (
                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                  <div className="flex gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase">Suggestion</span>
                  </div>
                  <p className="text-[11px] md:text-xs font-bold text-slate-800 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                    {getTranslatedText(item.suggestion)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 md:p-8 border-t border-slate-100 bg-slate-50">
          <button
            onClick={() => window.location.href = 'http://localhost:8000/api/download-report'}
            className="w-full py-3 md:py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 active:scale-95 transition-all text-sm md:text-base"
          >
            <Download className="w-4 h-4" />
            분석 리포트 다운로드
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, count, color, bgColor }) => (
  <div className={`p-3 md:p-4 ${bgColor} rounded-xl md:rounded-2xl border border-black/5`}>
    <p className={`text-xl md:text-2xl font-black ${color}`}>{count}</p>
    <p className="text-[9px] md:text-[10px] font-black opacity-40 uppercase">{label}</p>
  </div>
);

export default AnalysisView;