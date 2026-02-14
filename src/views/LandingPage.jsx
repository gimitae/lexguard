import React from 'react';
import { Lock, CheckCircle, ArrowRight, Star, Users, Shield } from 'lucide-react';
import FileUploadZone from '../components/FileUploadZone';
import { FEATURE_LIST } from '../constants';

const LandingPage = ({ onFileUpload }) => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center">
        <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[11px] font-bold mb-6 border border-emerald-100 flex items-center gap-2">
          <Lock className="w-3 h-3" /> 모든 문서는 분석 후 즉시 암호화 폐기됩니다.
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
          계약서 리스크를 <br className="md:hidden"/>
          <span className="text-indigo-600">3분 안에 찾으세요</span>
        </h1>
        
        <p className="text-slate-500 text-lg mb-12 max-w-xl font-medium">
          회원가입 없이 파일을 업로드하여 <br/>
          인공지능의 리스크 분석 결과를 즉시 확인하세요.
        </p>

        <FileUploadZone onFileUpload={onFileUpload} />

        <div className="mt-12 flex items-center gap-8 grayscale opacity-40">
          <span className="text-xs font-black tracking-widest text-slate-400">TRUSTED BY</span>
          <div className="flex gap-10 font-black italic text-slate-900">
            <span>LAW-TECH</span>
            <span>SECURE_LABS</span>
            <span>CORP_LEGAL</span>
          </div>
        </div>
      </section>

      {/* Proof of Work Section */}
      <section className="bg-slate-50 py-20 px-6 border-y border-slate-200">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">
              전문가가 검증한 <br/>정확한 수정 가이드
            </h2>
            <div className="space-y-4">
              {FEATURE_LIST.map((feature, i) => (
                <div key={feature.id} className="flex items-start gap-3">
                  <div className="mt-1 p-0.5 bg-indigo-600 rounded-full">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-slate-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-200 rotate-2">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              </div>
              <span className="text-[10px] font-black text-slate-300 tracking-widest">
                ANALYSIS PREVIEW
              </span>
            </div>
            <div className="space-y-4 opacity-50">
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-red-100 border-b-2 border-red-400 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6"></div>
              <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="h-3 bg-red-200 rounded w-1/4 mb-2"></div>
                <div className="h-2 bg-red-100 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Law Firm Consultation Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
              전문가와 1:1 상담이 필요하신가요?
            </h2>
            <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
              검증된 법률 전문가가 귀하의 계약서를 직접 검토하고<br/>
              맞춤 솔루션을 제공합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Stat 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-4xl font-black">120+</p>
                  <p className="text-indigo-200 text-sm">협력 변호사</p>
                </div>
              </div>
              <p className="text-white/80 text-sm">
                노동법, 계약법, 민사소송 등 다양한 분야의 전문가
              </p>
            </div>

            {/* Stat 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-4xl font-black">4.9</p>
                  <p className="text-indigo-200 text-sm">평균 만족도</p>
                </div>
              </div>
              <p className="text-white/80 text-sm">
                1,000+ 고객이 남긴 실제 리뷰
              </p>
            </div>

            {/* Stat 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-4xl font-black">95%</p>
                  <p className="text-indigo-200 text-sm">분쟁 해결률</p>
                </div>
              </div>
              <p className="text-white/80 text-sm">
                대부분의 사건을 협상으로 원만하게 해결
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all shadow-2xl active:scale-95"
            >
              전문가 상담 신청하기
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="mt-4 text-indigo-200 text-sm">
              첫 30분 상담 무료 • 평균 응답시간 2시간
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-slate-900 mb-16">
            간단한 3단계로 시작하세요
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-indigo-600">
                1
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">계약서 업로드</h3>
              <p className="text-slate-600">
                PDF 또는 Word 파일을 드래그하여 업로드하세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-indigo-600">
                2
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">AI 분석 확인</h3>
              <p className="text-slate-600">
                3분 내로 리스크와 수정 권장안을 확인하세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-indigo-600">
                3
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">전문가 상담</h3>
              <p className="text-slate-600">
                필요시 검증된 변호사와 1:1 상담 진행
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;