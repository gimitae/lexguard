import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, Phone, Clock, Send, HelpCircle, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// ✨ 파이어베이스
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const SupportView = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myInquiries, setMyInquiries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // 🛠️ 1단계: 로그인 상태 감지 (새로고침 대응)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("로그인 복구됨:", user.email);
        setCurrentUser(user);
      } else {
        console.log("로그아웃 상태");
        setCurrentUser(null);
        setMyInquiries([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 🛠️ 2단계: 유저가 확인되면 데이터 실시간 구독
  useEffect(() => {
    if (!currentUser) return;

    // 쿼리 생성: 내 이메일과 일치하는 글을 최신순으로 정렬
    const q = query(
      collection(db, "inquiries"),
      where("email", "==", currentUser.email),
      orderBy("createdAt", "desc")
    );

    // 실시간 데이터 받아오기 (onSnapshot)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedInquiries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("불러온 문의 개수:", loadedInquiries.length);
      setMyInquiries(loadedInquiries);
    }, (error) => {
      console.error("🔥 데이터 불러오기 실패 (인덱스 문제일 수 있음):", error);
      // 인덱스 에러라면 알림 띄우기
      if (error.code === 'failed-precondition') {
        alert("관리자 설정 필요: 파이어베이스 콘솔에서 '색인(Index)'을 생성해야 데이터가 보입니다. (개발자 도구 콘솔의 링크 확인)");
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 이메일 자동 입력
  useEffect(() => {
    if (currentUser?.email) {
      setFormData(prev => ({ ...prev, email: currentUser.email }));
    }
  }, [currentUser]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "inquiries"), {
        name: formData.name,
        email: formData.email,
        category: formData.category,
        message: formData.message,
        status: 'pending', 
        reply: null, // 초기 답변은 비어있음
        createdAt: serverTimestamp()
      });

      alert(t('support.form.successMessage') || "문의가 접수되었습니다.");
      setFormData(prev => ({ ...prev, message: '' })); 

    } catch (error) {
      console.error("Error:", error);
      alert("전송 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = t('support.faq.items', { returnObjects: true }) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">{t('support.title')}</h1>
          <p className="text-indigo-100 text-lg">{t('support.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* ✨ 나의 문의 내역 (로그인 시에만 표시) */}
        {currentUser && (
          <div className="mb-16 animate-fade-in-up">
             <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
                나의 문의 내역
             </h2>
             
             {myInquiries.length === 0 ? (
               <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500 shadow-sm">
                 아직 작성한 문의 내역이 없습니다.
               </div>
             ) : (
               <div className="grid gap-4">
                 {myInquiries.map((inquiry) => (
                   <div key={inquiry.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-start mb-3">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                         inquiry.status === 'replied' 
                           ? 'bg-green-100 text-green-700 border border-green-200' 
                           : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                       }`}>
                         {inquiry.status === 'replied' ? '답변 완료' : '답변 대기중'}
                       </span>
                       <span className="text-xs text-slate-400 font-medium">
                         {inquiry.createdAt?.toDate ? inquiry.createdAt.toDate().toLocaleDateString() : '방금 전'}
                       </span>
                     </div>
                     
                     <div className="mb-4">
                       <h3 className="font-bold text-slate-900 mb-2 text-sm text-indigo-600 uppercase tracking-wide">Q. {inquiry.category}</h3>
                       <p className="text-slate-700 bg-slate-50 p-4 rounded-xl text-base leading-relaxed">{inquiry.message}</p>
                     </div>

                     {/* ✨ 관리자 답변 표시 영역 */}
                     {inquiry.reply && (
                       <div className="mt-4 pt-4 border-t border-slate-100">
                         <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <span className="font-black text-indigo-600 text-xs">A</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1 text-sm">관리자 답변</h3>
                                <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                                    {inquiry.reply}
                                </p>
                            </div>
                         </div>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {/* 기존 문의 폼 및 연락처 섹션 (디자인 유지) */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6">{t('support.form.title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ... (입력 필드들 기존과 동일) ... */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('support.form.name')}</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('support.form.email')}</label>
                <input type="email" value={formData.email} readOnly={!!currentUser} className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none ${currentUser ? 'bg-slate-100 text-slate-500' : ''}`} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('support.form.category')}</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none">
                  <option value="general">{t('support.categories.general')}</option>
                  <option value="technical">{t('support.categories.technical')}</option>
                  <option value="billing">{t('support.categories.billing')}</option>
                  <option value="partnership">{t('support.categories.partnership')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('support.form.message')}</label>
                <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none h-32" required />
              </div>
              <button type="submit" disabled={isSubmitting} className={`w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50' : ''}`}>
                <Send className="w-5 h-5" /> {t('support.form.submit')}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            {/* Contact Info 유지 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200">
               <div className="flex items-start gap-4">
                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0"><Mail className="w-6 h-6 text-indigo-600" /></div>
                 <div><h3 className="text-lg font-black text-slate-900 mb-2">{t('support.contact.email.title')}</h3><p className="text-slate-600">{t('support.contact.email.value')}</p></div>
               </div>
            </div>
             <div className="bg-white rounded-3xl p-8 border border-slate-200">
               <div className="flex items-start gap-4">
                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0"><MessageCircle className="w-6 h-6 text-emerald-600" /></div>
                 <div><h3 className="text-lg font-black text-slate-900 mb-2">{t('support.contact.kakao.title')}</h3><p className="text-slate-600">{t('support.contact.kakao.value')}</p></div>
               </div>
            </div>
             <div className="bg-white rounded-3xl p-8 border border-slate-200">
               <div className="flex items-start gap-4">
                 <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0"><Phone className="w-6 h-6 text-amber-600" /></div>
                 <div><h3 className="text-lg font-black text-slate-900 mb-2">{t('support.contact.phone.title')}</h3><p className="text-slate-600">{t('support.contact.phone.value')}</p></div>
               </div>
            </div>
          </div>
        </div>

        {/* FAQ 유지 */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200">
          <div className="flex items-center gap-3 mb-8"><HelpCircle className="w-8 h-8 text-indigo-600" /><h2 className="text-3xl font-black text-slate-900">{t('support.faq.title')}</h2></div>
          <div className="space-y-6">
            {Array.isArray(faqs) && faqs.map((faq, index) => (
              <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="font-black text-slate-900 mb-3 flex items-start gap-2"><span className="text-indigo-600">Q.</span>{faq.question}</h3>
                <p className="text-slate-600 leading-relaxed pl-6">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportView;
