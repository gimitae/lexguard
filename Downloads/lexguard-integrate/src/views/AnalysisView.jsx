import React, { useState, useCallback } from 'react';
// i18next 적용을 위한 임포트
import { useTranslation } from 'react-i18next';
import { BarChart3, Download, FileText, ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import FloatingTooltip from '../components/FloatingTooltip';

const AnalysisView = ({ result, selectedRisk, onRiskSelect }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language; // 'ko', 'en', 'ja' 중 하나를 가져옵니다.

  const [hoverInfo, setHoverInfo] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // 1. 데이터 처리 및 4단계 분류 로직 (라벨 번역 포함)
  const rawAnalysis = result?.analysis || result?.results || [];
  const processedAnalysis = rawAnalysis.map(item => {
    let severity = item.severity?.toUpperCase();
    if (severity === 'NONE' || !severity) severity = 'DISADVANTAGE';

    const config = {
      // t() 함수를 통해 UI 텍스트 다국어화 (두 번째 인자는 기본값)
      CRITICAL: { label: t('risk.critical', '위험'), color: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-900', icon: <AlertCircle size={16}/> },
      WARNING: { label: t('risk.warning', '경고'), color: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-900', icon: <AlertTriangle size={16}/> },
      DISADVANTAGE: { label: t('risk.disadvantage', '불리'), color: 'bg-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-900', icon: <Info size={16}/> },
      SAFE: { label: t('risk.safe', '안전'), color: 'bg-green-500', bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-900', icon: <CheckCircle size={16}/> }
    };
    return { ...item, severity, ui: config[severity] };
  });

  // 2. 통계 계산
  const stats = processedAnalysis.reduce((acc, curr) => {
    acc[curr.severity] = (acc[curr.severity] || 0) + 1;
    return acc;
  }, { CRITICAL: 0, WARNING: 0, DISADVANTAGE: 0, SAFE: 0 });

  // 3. 페이지네이션
  const totalPages = Math.ceil(processedAnalysis.length / ITEMS_PER_PAGE);
  const currentItems = processedAnalysis.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleMouseMove = useCallback((e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleDownloadPDF = () => {
    alert(t('alert.pdf_gen', "분석 보완사항이 포함된 PDF 리포트 생성을 시작합니다."));
  };

  // 다국어 텍스트 추출 헬퍼 함수
  const getTranslatedText = (field) => {
    if (typeof field === 'object' && field !== null) {
      return field[currentLang] || field['ko']; // 현재 언어 없으면 한국어 기본
    }
    return field; // 이미 문자열인 경우 그대로 반환
  };

  return (
    <div className="h-[calc(100vh-73px)] flex bg-slate-100 overflow-hidden" onMouseMove={handleMouseMove}>
      {/* 툴팁에 현재 언어 정보를 함께 전달 */}
      <FloatingTooltip info={hoverInfo} position={mousePos} currentLang={currentLang} />

      <div className="flex-1 overflow-y-auto p-12 flex justify-center">
        <div className="w-full max-w-[900px] bg-white shadow-2xl rounded-sm border border-slate-200 p-20 flex flex-col min-h-[1150px]">

          {/* 리포트 헤더 */}
          <div className="border-b-2 border-slate-900 pb-8 mb-12 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                {t('report.title', 'AI 법률 리스크 진단 보고서')}
              </h1>
              <p className="text-slate-400 text-sm mt-2 font-medium">LexGuard Analysis System v2.0</p>
            </div>
            <div className="text-right text-xs font-bold text-slate-400">
              {t('report.page', 'PAGE')} {currentPage} {t('report.of', 'OF')} {totalPages}
            </div>
          </div>

          {/* 분석 본문 */}
          <div className="flex-1 space-y-6">
            {currentItems.map((item, index) => (
              <div
                key={index}
                className={`group p-6 rounded-xl border transition-all ${item.ui.bg} ${item.ui.border}`}
                onMouseEnter={() => setHoverInfo(item)}
                onMouseLeave={() => setHoverInfo(null)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-black text-white uppercase ${item.ui.color}`}>
                      {item.ui.label}
                    </span>
                    <span className="text-xs font-bold text-slate-400 italic">#{item.clause_number || index + 1}</span>
                  </div>
                  <div className={item.ui.text}>{item.ui.icon}</div>
                </div>

                <p className={`text-lg font-bold mb-3 ${item.ui.text}`}>
                  "{item.original_text || item.clause}"
                </p>

                <div className="pl-4 border-l-2 border-slate-200 mt-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-900 mr-2">{t('report.opinion', '검토의견')}:</span>
                    {/* 다국어 객체 처리 */}
                    {getTranslatedText(item.explanation)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 페이지네이션 */}
          <div className="mt-16 pt-8 border-t border-slate-100 flex justify-center items-center gap-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 text-sm font-bold disabled:opacity-20 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft size={20}/> {t('common.prev', 'PREV')}
            </button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${currentPage === i+1 ? 'bg-slate-900 w-6' : 'bg-slate-200'} transition-all`}/>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 text-sm font-bold disabled:opacity-20 hover:text-indigo-600 transition-colors"
            >
              {t('common.next', 'NEXT')} <ChevronRight size={20}/>
            </button>
          </div>
        </div>
      </div>

      {/* 우측 패널 */}
      <div className="w-[360px] bg-white border-l border-slate-200 p-8 flex flex-col shadow-xl">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
          <BarChart3 size={14} className="text-indigo-600" /> {t('stats.title', '종합 진단 통계')}
        </h3>

        <div className="space-y-3 mb-12">
          <StatRow label={t('risk.critical_full', "위험 (Critical)")} count={stats.CRITICAL} color="bg-red-500" />
          <StatRow label={t('risk.warning_full', "경고 (Warning)")} count={stats.WARNING} color="bg-orange-500" />
          <StatRow label={t('risk.disadvantage_full', "불리 (Disadvantage)")} count={stats.DISADVANTAGE} color="bg-yellow-500" />
          <StatRow label={t('risk.safe_full', "안전 (Safe)")} count={stats.SAFE} color="bg-green-500" />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-slate-400">{t('stats.total', '전체 분석 조항')}</span>
              <span className="text-2xl font-black text-slate-900">{processedAnalysis.length}</span>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
            <p className="text-[11px] text-indigo-700 leading-relaxed font-semibold">
              💡 {t('report.tip', '각 항목에 마우스를 올리면 인공지능이 제안하는 유리한 수정 문구를 즉시 확인할 수 있습니다.')}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDownloadPDF}
            className="w-full py-4 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-100"
          >
            <Download size={16} /> {t('btn.save_pdf', '보완사항 PDF 저장')}
          </button>
          <button
            onClick={() => window.open('http://localhost:8000/api/download-template', '_blank')}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
          >
            <FileText size={16} /> {t('btn.download_template', '표준 계약서 양식')}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, count, color }) => (
  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[11px] font-bold text-slate-600">{label}</span>
    </div>
    <span className="text-sm font-black text-slate-900">{count}</span>
  </div>
);

export default AnalysisView;
