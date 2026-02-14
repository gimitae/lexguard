import React from 'react';
import { FileText, Shield, User, AlertCircle } from 'lucide-react';

const TermsView = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">이용약관</h1>
          <p className="text-slate-500">최종 업데이트: 2024년 1월 1일</p>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <section className="p-8 bg-slate-50 rounded-3xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-3">제1조 (목적)</h2>
                <p className="text-slate-600 leading-relaxed">
                  본 약관은 LEXGUARD(이하 "회사"라 함)가 제공하는 AI 기반 계약서 분석 서비스(이하 "서비스"라 함)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="p-8 bg-slate-50 rounded-3xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-3">제2조 (회원가입)</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  ① 회원가입은 이용자가 약관의 내용에 대하여 동의를 한 다음 회원가입 신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  ② 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다:
                </p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="text-slate-600">• 타인의 명의를 도용한 경우</li>
                  <li className="text-slate-600">• 허위의 정보를 기재한 경우</li>
                  <li className="text-slate-600">• 기타 회사가 정한 이용신청 요건이 미비한 경우</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-8 bg-slate-50 rounded-3xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-3">제3조 (서비스의 제공)</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  ① 회사는 다음과 같은 서비스를 제공합니다:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-slate-600">• AI 기반 계약서 리스크 분석</li>
                  <li className="text-slate-600">• 법률 전문가 상담 연결</li>
                  <li className="text-slate-600">• 계약서 수정안 제공</li>
                  <li className="text-slate-600">• 기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 서비스</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Placeholder for more sections */}
          <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl border border-slate-200 text-center">
            <p className="text-slate-600 font-medium">
              📄 상세 약관은 백엔드 연동 후 추가 예정입니다
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 p-8 bg-slate-900 text-white rounded-3xl">
          <h3 className="text-lg font-black mb-2">문의사항</h3>
          <p className="text-slate-300 text-sm">
            이용약관에 관한 문의는 고객지원을 통해 연락주시기 바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsView;