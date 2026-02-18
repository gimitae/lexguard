import React from 'react';
import { AlertTriangle, Lock, ArrowRight } from 'lucide-react';

const PreviewResult = ({ file, result, onAuth }) => {
  const analysis = result?.analysis || [];
  const totalClauses = result?.total_clauses || 0;

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

  const risks = {
    critical: riskStats.critical + riskStats.high,
    warning: riskStats.medium,
    info: riskStats.low
  };

  const previewRisks = analysis
    .filter(item => item.severity !== 'NONE')
    .slice(0, 3)
    .map((item) => ({
      id: `R${item.clause_number || 0}`,
      severity: item.severity?.toUpperCase() || 'MEDIUM',
      title: `조항 ${item.clause_number || '?'}`,
      preview: item.clause?.substring(0, 100) + '...' || '내용 없음'
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
            <AlertTriangle className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">
            분석 완료
          </h1>
          <p className="text-slate-600">
            {file?.name || '계약서'}에서 총 <strong>{totalClauses}개 조항</strong>을 분석했습니다.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
            위험도 요약
          </h2>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-4xl font-black text-red-600 mb-2">{risks.critical}</p>
              <p className="text-xs font-black text-red-400 uppercase">위험</p>
            </div>
            <div className="text-center p-6 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-4xl font-black text-amber-600 mb-2">{risks.warning}</p>
              <p className="text-xs font-black text-amber-400 uppercase">주의</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-4xl font-black text-blue-600 mb-2">{risks.info}</p>
              <p className="text-xs font-black text-blue-400 uppercase">검토</p>
            </div>
          </div>

          {previewRisks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                발견된 주요 이슈 미리보기
              </h3>
              {previewRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 blur-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      risk.severity === 'CRITICAL' || risk.severity === 'HIGH' 
                        ? 'bg-red-100 text-red-700'
                        : risk.severity === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {risk.severity}
                    </span>
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">{risk.title}</h4>
                  <p className="text-sm text-slate-600">{risk.preview}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <Lock className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-slate-900 mb-3">
            전체 분석 결과 확인하기
          </h3>
          <p className="text-slate-600 mb-8">
            로그인하시면 모든 위험 조항의 상세 분석, 법적 근거,<br />
            그리고 수정 권장안을 확인하실 수 있습니다.
          </p>

          <button
            onClick={onAuth}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 active:scale-95 transition-all mb-4"
          >
            로그인하고 전체 결과 보기
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-xs text-slate-400">
            회원가입 시 무료 토큰 2개 제공 | 카카오 간편 로그인 지원
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            총 <strong className="text-slate-700">{totalClauses}개 조항</strong> 분석 완료 •
            <strong className="text-red-600"> {risks.critical}개 위험</strong> •
            <strong className="text-amber-600"> {risks.warning}개 주의</strong> •
            <strong className="text-blue-600"> {risks.info}개 검토</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreviewResult;