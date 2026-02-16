import React from 'react';
<<<<<<< HEAD
import { BarChart3, Download, FileText } from 'lucide-react';
import RiskCard from '../components/RiskCard';

const AnalysisView = ({ file, result, selectedRisk, onRiskSelect }) => {
  // 백엔드 API 응답 파싱
  const analysis = result?.analysis || [];
  const totalClauses = result?.total_clauses || 0;
  const metadata = result?.metadata || {};

  // Severity별 통계 계산
  const calculateRiskStats = () => {
    const stats = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      none: 0
    };

    analysis.forEach(item => {
      const severity = item.severity?.toUpperCase() || 'NONE';
      if (severity === 'CRITICAL') stats.critical++;
      else if (severity === 'HIGH') stats.high++;
      else if (severity === 'MEDIUM') stats.medium++;
      else if (severity === 'LOW') stats.low++;
      else stats.none++;
    });

    return stats;
  };

  const riskStats = calculateRiskStats();

  // Severity별 색상 매핑
  const getSeverityColor = (severity) => {
    const colors = {
      'CRITICAL': 'bg-red-100 border-red-500 hover:bg-red-200',
      'HIGH': 'bg-red-100 border-red-400 hover:bg-red-200',
      'MEDIUM': 'bg-yellow-100 border-yellow-500 hover:bg-yellow-200',
      'LOW': 'bg-green-100 border-green-400 hover:bg-green-200',
      'NONE': 'bg-gray-50 border-gray-300'
    };
    return colors[severity?.toUpperCase()] || colors['NONE'];
  };

  const getSeverityRingColor = (severity) => {
    const colors = {
      'CRITICAL': 'ring-red-500 bg-red-200',
      'HIGH': 'ring-red-400 bg-red-200',
      'MEDIUM': 'ring-yellow-500 bg-yellow-200',
      'LOW': 'ring-green-400 bg-green-200',
      'NONE': 'ring-gray-400 bg-gray-100'
    };
    return colors[severity?.toUpperCase()] || colors['NONE'];
  };

  // RiskCard용 데이터 변환
  const riskDetails = analysis
    .filter(item => item.severity !== 'NONE') // 안전한 조항은 제외
    .map((item) => ({
      id: `R${item.clause_number || 0}`,
      severity: item.severity?.toUpperCase() || 'MEDIUM',
      title: `조항 ${item.clause_number || '?'}${item.violation ? ' - 법률 위반 가능성' : ''}`,
      clause: item.clause || '',
      law: item.law_reference || '법률 근거 없음',
      issue: item.explanation || '설명 없음',
      suggestion: item.violation
        ? '근로기준법을 준수하도록 해당 조항을 수정하거나 삭제하는 것을 권장합니다.'
        : '이 조항을 검토하거나 수정하는 것을 권장합니다.'
    }));

  // 하이라이트된 PDF 다운로드
  const handleDownloadHighlightedPDF = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/download-highlighted-pdf');

      if (!response.ok) {
        const error = await response.json();
        alert(error.detail || 'PDF 다운로드에 실패했습니다.');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `highlighted_${file?.name || 'contract'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('다운로드 중 오류가 발생했습니다.');
    }
  };

  // 표준 근로계약서 다운로드
  const handleDownloadTemplate = async () => {
    try {
      window.open('http://localhost:8000/api/download-template', '_blank');
    } catch (error) {
      console.error('Template download error:', error);
      alert('템플릿 다운로드 중 오류가 발생했습니다.');
    }
=======
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
>>>>>>> origin/mypage
  };

  return (
    <div className="h-[calc(100vh-73px)] flex bg-white overflow-hidden">
      {/* Document View */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-8 flex flex-col items-center">
        <div className="max-w-[800px] w-full bg-white shadow-lg p-16 font-serif leading-[2.2] text-slate-800 border border-slate-200 relative mb-20 min-h-[1000px]">
          <div className="flex justify-between items-start mb-12">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
<<<<<<< HEAD
              Analyzed Document
            </span>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              {metadata.filename || file?.name || '계약서'}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-center mb-16">
            근 로 계 약 서 분석 결과
          </h1>

          {/* 조항별 렌더링 */}
          <div className="space-y-6">
            {analysis.map((item, index) => {
              const riskId = `R${item.clause_number || index + 1}`;
              const severity = item.severity?.toUpperCase() || 'NONE';
              const isRisky = severity !== 'NONE';

              return (
                <div key={index} className="mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-slate-400 mt-1 min-w-[60px]">
                      조항 {item.clause_number || index + 1}
                    </span>
                    <p className="flex-1">
                      {isRisky ? (
                        <button
                          onClick={() => onRiskSelect(riskId)}
                          className={`cursor-pointer transition-all px-2 py-1 rounded border-b-2 ${
                            selectedRisk === riskId 
                              ? `ring-2 ${getSeverityRingColor(severity)}` 
                              : getSeverityColor(severity)
                          }`}
                          aria-label={`리스크 항목 ${riskId} 상세보기`}
                        >
                          {item.clause}
                        </button>
                      ) : (
                        <span className="text-slate-700">
                          {item.clause}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {analysis.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>분석 결과를 표시할 수 없습니다.</p>
            </div>
          )}
=======
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
>>>>>>> origin/mypage
        </div>
      </div>

      {/* Risk Panel */}
      <div className="w-[480px] border-l border-slate-200 bg-white flex flex-col shadow-2xl z-30">
        {/* Risk Summary */}
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
<<<<<<< HEAD
            <BarChart3 className="w-3 h-3" /> 분석 결과
          </h3>

          {/* 위험도별 통계 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-2xl font-black text-red-600">
                {riskStats.critical + riskStats.high}
              </p>
              <p className="text-[10px] font-black text-red-400 uppercase">위험</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-2xl font-black text-amber-600">{riskStats.medium}</p>
              <p className="text-[10px] font-black text-amber-400 uppercase">주의</p>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-2xl font-black text-green-600">{riskStats.low}</p>
              <p className="text-[10px] font-black text-green-400 uppercase">검토</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-2xl font-black text-blue-600">{riskStats.none}</p>
              <p className="text-[10px] font-black text-blue-400 uppercase">안전</p>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            총 {totalClauses}개 조항 분석 완료
=======
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
>>>>>>> origin/mypage
          </div>
        </div>

        {/* Risk List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
<<<<<<< HEAD
          {riskDetails.map((risk) => (
=======
          {details.map((risk) => (
>>>>>>> origin/mypage
            <RiskCard
              key={risk.id}
              risk={risk}
              isSelected={selectedRisk === risk.id}
              onSelect={onRiskSelect}
            />
          ))}
<<<<<<< HEAD

          {riskDetails.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-bold mb-2"> 위험 조항 없음</p>
              <p className="text-xs">모든 조항이 안전합니다.</p>
=======
          
          {details.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p>분석 결과가 없습니다.</p>
>>>>>>> origin/mypage
            </div>
          )}
        </div>

<<<<<<< HEAD
        {/* Download Buttons */}
        <div className="p-8 border-t border-slate-100 bg-slate-50 space-y-3">
          <button
            onClick={handleDownloadHighlightedPDF}
            className="w-full py-4 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-red-700 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            하이라이트된 PDF 다운로드
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
          >
            <FileText className="w-4 h-4" />
            표준 근로계약서 양식 다운로드
=======
        {/* Download Button */}
        <div className="p-8 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={handleDownload}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            수정된 계약서 다운로드 (.docx)
>>>>>>> origin/mypage
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;