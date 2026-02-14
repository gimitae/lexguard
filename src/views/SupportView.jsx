import React, { useState } from 'react';
import { Mail, MessageCircle, Phone, Clock, Send, HelpCircle } from 'lucide-react';

const SupportView = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 백엔드 연결 시 구현
    alert('문의가 접수되었습니다. 곧 답변드리겠습니다.');
    setFormData({ name: '', email: '', category: 'general', message: '' });
  };

  const faqs = [
    {
      question: '계약서 분석은 얼마나 정확한가요?',
      answer: 'AI 모델은 수천 건의 판례와 법률 데이터를 학습하여 95% 이상의 정확도로 리스크를 검출합니다. 다만, 최종 판단은 전문 변호사와 상담을 권장드립니다.'
    },
    {
      question: '업로드한 계약서는 안전한가요?',
      answer: '모든 문서는 분석 후 즉시 암호화되어 폐기됩니다. 귀하의 개인정보와 계약 내용은 철저히 보호됩니다.'
    },
    {
      question: '분석 결과를 다운로드할 수 있나요?',
      answer: '네, 분석 완료 후 PDF 형식으로 다운로드 가능합니다. 프리미엄 회원은 수정된 계약서도 다운로드할 수 있습니다.'
    },
    {
      question: '무료 버전과 유료 버전의 차이는?',
      answer: '무료 버전은 월 2건의 분석이 가능하며, 유료 버전은 무제한 분석과 전문가 상담, 계약서 자동 수정 기능이 포함됩니다.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">고객지원</h1>
          <p className="text-indigo-100 text-lg">
            무엇을 도와드릴까요? 언제든지 문의해주세요.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6">문의하기</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none"
                  placeholder="홍길동"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  문의 유형
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="general">일반 문의</option>
                  <option value="technical">기술 지원</option>
                  <option value="billing">결제/환불</option>
                  <option value="partnership">제휴 문의</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  문의 내용
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none h-32"
                  placeholder="문의 내용을 입력해주세요..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-5 h-5" />
                문의 보내기
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">이메일</h3>
                  <p className="text-slate-600">support@lexguard.com</p>
                  <p className="text-sm text-slate-400 mt-1">24시간 이내 답변</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">카카오톡</h3>
                  <p className="text-slate-600">@lexguard</p>
                  <p className="text-sm text-slate-400 mt-1">평일 09:00 - 18:00</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">전화</h3>
                  <p className="text-slate-600">1588-0000</p>
                  <p className="text-sm text-slate-400 mt-1">평일 09:00 - 18:00</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 border border-indigo-100">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">운영 시간</h3>
                  <p className="text-slate-600 text-sm">평일: 09:00 - 18:00</p>
                  <p className="text-slate-600 text-sm">주말 및 공휴일: 휴무</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
            <h2 className="text-3xl font-black text-slate-900">자주 묻는 질문</h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
              >
                <h3 className="font-black text-slate-900 mb-3 flex items-start gap-2">
                  <span className="text-indigo-600">Q.</span>
                  {faq.question}
                </h3>
                <p className="text-slate-600 leading-relaxed pl-6">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportView;