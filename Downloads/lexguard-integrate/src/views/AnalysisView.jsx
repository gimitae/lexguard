import React, { useState } from 'react';
// i18next 적용을 위한 임포트
import { useTranslation } from 'react-i18next';
import { BarChart3, Download, FileText, ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, Info, CheckCircle, Lightbulb } from 'lucide-react';

const AnalysisView = ({ result }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language; // 'ko', 'en', 'ja' 중 하나를 가져옵니다.

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5; // 한 페이지에 5개씩 보여주기 (가독성 위해 줄임)

  // 1. 데이터 처리 및 4단계 분류 로직 (라벨 번역 포함)
  const rawAnalysis = result?.analysis || result?.results || [];
  
  // 다국어 텍스트 추출 헬퍼 함수
  const getTranslatedText = (field) => {
    if (typeof field === 'object' && field !== null) {
      return field[currentLang] || field['ko'] || ""; // 현재 언어 없으면 한국어 기본
    }
    return field || ""; // 이미 문자열인 경우 그대로 반환
  };

  const processedAnalysis = rawAnalysis.map(item => {
    let severity = item.severity?.toUpperCase();
    if (severity === 'NONE' || !severity) severity = 'DISADVANTAGE';

    const config = {
      CRITICAL: { label: t('risk.critical', '위험'), color: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: <AlertCircle size={18}/> },
      WARNING: { label: t('risk.warning', '경고'), color: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', icon: <AlertTriangle size={18}/> },
      DISADVANTAGE: { label: t('risk.disadvantage', '불리'), color: 'bg-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', icon: <Info size={18}/> },
      SAFE: { label: t('risk.safe', '안전'), color: 'bg-green-500', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', icon: <CheckCircle size={18}/> }
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

  const handleDownloadPDF = () => {
    alert(t('alert.pdf_gen', "분석 보완사항이 포함된 PDF 리포트 생성을 시작합니다."));
    // 실제 다운로드 로직 연결 필요
    window.location.href = 'http://localhost:8000/api/download-highlighted-pdf';
  };

  return (
    // 전체 컨테이너: 화면 높이만큼 꽉 채우고(h-screen), 헤더 높이(73px) 뺌
    // overflow-hidden으로 바깥 스크롤 방지
    <div className="h-[calc(100vh-73px)] flex bg-slate-50 overflow-hidden">
      
      {/* 왼쪽 메인 컨텐츠 영역 (여기만 스크롤 됨) */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
        <div className="max-w-[900px] mx-auto bg-white shadow-xl rounded-2xl border border-slate-100 p-8 md:p-12 min-h-full">

          {/* 리포트 헤더 */}
          <div className="border-b-2 border-slate-900 pb-6 mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
                {t('report.title', 'AI 법률 리스크 진단 보고서')}
              </h1>
              <p className="text-slate-500 text-sm mt-2 font-medium">LexGuard Analysis System v2.0</p>
            </div>
            <div className="text-right text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              PAGE {currentPage} / {totalPages}
            </div>
          </div>

          {/* 분석 본문 리스트 */}
          <div className="space-y-8">
            {currentItems.map((item, index) => (
              <div
                key={index}
                className={`group rounded-2xl border-2 transition-all duration-200 hover:shadow-lg ${item.ui.bg} ${item.ui.border}`}
              >
                {/* 카드 헤더 */}
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[11px] font-black text-white uppercase tracking-wider shadow-sm ${item.ui.color}`}>
                        {item.ui.label}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        #{item.clause_number || ((currentPage - 1) * ITEMS_PER_PAGE) + index + 1}
                      </span>
                    </div>
                    <div className={`${item.ui.text} bg-white/50 p-1.5 rounded-full`}>
                      {item.ui.icon}
                    </div>
                  </div>

                  {/* 조항 원문 */}
                  <div className="bg-white/60 p-4 rounded-xl border border-black/5 mb-4">
                    <p className={`text-lg font-bold ${item.ui.text} leading-snug`}>
                      "{getTranslatedText(item.original_text) || item.clause}"
                    </p>
                  </div>

                  {/* 검토 의견 */}
                  <div className="pl-2">
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      <span className="font-bold text-slate-900 mr-2">📌 {t('report.opinion', '검토의견')}:</span>
                      {getTranslatedText(item.explanation)}
                    </p>
                  </div>
                </div>

                {/* [수정됨] AI 수정 제안 (툴팁 대신 하단 고정 박스로 변경) */}
                {/* 안전(SAFE) 등급이 아닐 때만 표시 */}
                {item.severity !== 'SAFE' && (
                  <div className="border-t border-black/5 bg-white/40 p-5 rounded-b-xl">
                    <div className="flex gap-3">
                      <div className="mt-0.5 min-w-[24px]">
                        <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg inline-flex">
                          <Lightbulb size={16} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-indigo-600 mb-1 uppercase tracking-wide">
                          AI Strategic Suggestion
                        </p>
                        <p className="text-sm text-slate-800 font-semibold leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
                          {getTranslatedText(item.suggestion) || "수정 제안이 없습니다."}
                        </p>
                        {item.law_reference && item.law_reference !== "N/A" && (
                           <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                             ⚖️ 관련 법령: {item.law_reference}
                           </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 하단 페이지네이션 */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center items-center gap-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors bg-slate-50 rounded-lg hover:bg-indigo-50"
            >
              <ChevronLeft size={18}/> {t('common.prev', '이전')}
            </button>
            
            <div className="flex gap-1.5">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentPage === i + 1 ? 'bg-indigo-600 w-6' : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors bg-slate-50 rounded-lg hover:bg-indigo-50"
            >
              {t('common.next', '다음')} <ChevronRight size={18}/>
            </button>
          </div>
        </div>
      </div>

      {/* 우측 사이드 패널 (고정됨 - 스크롤 안 됨) */}
      <div className="w-[320px] bg-white border-l border-slate-200 p-6 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <BarChart3 size={16} className="text-indigo-600" /> {t('stats.title', '종합 진단 통계')}
        </h3>

        {/* 통계 카드 */}
        <div className="space-y-3 mb-8">
          <StatRow label={t('risk.critical_full', "위험 (Critical)")} count={stats.CRITICAL} color="bg-red-500" textColor="text-red-600" bgColor="bg-red-50" />
          <StatRow label={t('risk.warning_full', "경고 (Warning)")} count={stats.WARNING} color="bg-orange-500" textColor="text-orange-600" bgColor="bg-orange-50" />
          <StatRow label={t('risk.disadvantage_full', "불리 (Disadvantage)")} count={stats.DISADVANTAGE} color="bg-yellow-500" textColor="text-yellow-600" bgColor="bg-yellow-50" />
          <StatRow label={t('risk.safe_full', "안전 (Safe)")} count={stats.SAFE} color="bg-green-500" textColor="text-green-600" bgColor="bg-green-50" />
          
          <div className="pt-4 mt-4 border-t border-slate-100">
            <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl shadow-lg">
              <span className="text-xs font-bold opacity-80">{t('stats.total', '전체 분석 조항')}</span>
              <span className="text-2xl font-black">{processedAnalysis.length}</span>
            </div>
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="flex-1">
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-3 items-start">
            <Info className="text-indigo-600 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-indigo-800 leading-relaxed font-medium">
              {t('report.tip_fixed', '위험 요소가 발견된 조항은 하단 박스에서 AI 수정 제안을 바로 확인할 수 있습니다.')}
            </p>
          </div>
        </div>

        {/* 하단 버튼 그룹 */}
        <div className="space-y-3 mt-4">
          <button
            onClick={handleDownloadPDF}
            className="w-full py-4 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-100"
          >
            <Download size={18} /> {t('btn.save_pdf', '보완사항 PDF 저장')}
          </button>
          <button
            onClick={() => window.open('http://localhost:8000/api/download-template', '_blank')}
            className="w-full py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
          >
            <FileText size={18} /> {t('btn.download_template', '표준 계약서 양식')}
          </button>
        </div>
      </div>
    </div>
  );
};

// 통계 행 컴포넌트
const StatRow = ({ label, count, color, textColor, bgColor }) => (
  <div className={`flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-slate-200 transition-colors ${bgColor}`}>
    <div className="flex items-center gap-3">
      <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm ${color}`} />
      <span className={`text-xs font-bold ${textColor}`}>{label}</span>
    </div>
    <span className={`text-sm font-black ${textColor}`}>{count}</span>
  </div>
);

export default AnalysisView;