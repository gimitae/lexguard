<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, Phone, Clock, Send, HelpCircle, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// ✨ 파이어베이스
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
=======
import React, { useState } from 'react';
import { Mail, MessageCircle, Phone, Clock, Send, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
>>>>>>> origin/mypage

const SupportView = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    message: ''
  });

<<<<<<< HEAD
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myInquiries, setMyInquiries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); 

  // 1. 로그인 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setMyInquiries([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. ✨ 문의 내역 불러오기 (검색 기준 변경: UID -> Email)
  useEffect(() => {
    if (!currentUser) return;

    // 💡 [핵심 수정] 옛날 글도 다 보이게 'email'로 찾습니다!
    const q = query(
      collection(db, "inquiries"),
      where("email", "==", currentUser.email), 
      orderBy("createdAt", "desc") 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedInquiries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMyInquiries(loadedInquiries);
    }, (error) => {
      console.error("데이터 로딩 실패:", error);
      // 만약 에러가 나면 파이어베이스 콘솔에서 '색인(Index)'을 만들어주세요.
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
        uid: currentUser ? currentUser.uid : null, // UID는 나중을 위해 저장은 해둠
        name: formData.name,
        email: formData.email,
        category: formData.category,
        message: formData.message,
        status: 'pending', 
        reply: null,
        createdAt: serverTimestamp()
      });

      alert(t('support.form.successMessage') || "문의가 접수되었습니다.");
      setFormData(prev => ({ ...prev, message: '' })); 
      setIsHistoryOpen(true); 

    } catch (error) {
      console.error("Error:", error);
      alert("전송 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = t('support.faq.items', { returnObjects: true }) || [];
=======
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 백엔드 연결 시 구현
    alert(t('support.form.successMessage'));
    setFormData({ name: '', email: '', category: 'general', message: '' });
  };

  const faqs = t('support.faq.items', { returnObjects: true });
>>>>>>> origin/mypage

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">{t('support.title')}</h1>
<<<<<<< HEAD
          <p className="text-indigo-100 text-lg">{t('support.subtitle')}</p>
=======
          <p className="text-indigo-100 text-lg">
            {t('support.subtitle')}
          </p>
>>>>>>> origin/mypage
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
<<<<<<< HEAD
        
        {/* 나의 문의 내역 */}
        {currentUser && (
          <div className="mb-12">
             <button 
               onClick={() => setIsHistoryOpen(!isHistoryOpen)}
               className="w-full flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
             >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${isHistoryOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-black text-slate-900">나의 문의 내역</h2>
                    <p className="text-sm text-slate-500">
                      총 <span className="font-bold text-indigo-600">{myInquiries.length}</span>건의 문의가 있습니다.
                    </p>
                  </div>
                </div>
                {isHistoryOpen ? (
                  <ChevronUp className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                )}
             </button>
             
             {isHistoryOpen && (
               <div className="mt-4 animate-fade-in-down">
                 {myInquiries.length === 0 ? (
                   <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-500 border border-slate-200 border-dashed">
                     아직 작성한 문의 내역이 없습니다.
                   </div>
                 ) : (
                   <div className="grid gap-4">
                     {myInquiries.map((inquiry) => (
                       <div key={inquiry.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
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
                           <p className="text-slate-700 bg-slate-50 p-4 rounded-xl text-base leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
                         </div>
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
          </div>
        )}

        {/* 하단 폼 영역 (대칭 디자인 유지) */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 items-stretch">
          
          {/* 좌측: 폼 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl h-full flex flex-col">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Send className="w-6 h-6 text-indigo-600" />
              {t('support.form.title')}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('support.form.name')}</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none bg-slate-50 focus:bg-white transition-colors" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('support.form.email')}</label>
                <input type="email" value={formData.email} readOnly={!!currentUser} className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none ${currentUser ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 focus:bg-white'}`} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('support.form.category')}</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none bg-slate-50 focus:bg-white">
=======
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6">{t('support.form.title')}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {t('support.form.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none"
                  placeholder={t('support.form.namePlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {t('support.form.email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none"
                  placeholder={t('support.form.emailPlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {t('support.form.category')}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none"
                >
>>>>>>> origin/mypage
                  <option value="general">{t('support.categories.general')}</option>
                  <option value="technical">{t('support.categories.technical')}</option>
                  <option value="billing">{t('support.categories.billing')}</option>
                  <option value="partnership">{t('support.categories.partnership')}</option>
                </select>
              </div>
<<<<<<< HEAD
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('support.form.message')}</label>
                <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full h-full min-h-[160px] px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none bg-slate-50 focus:bg-white resize-none" required />
              </div>
              <button type="submit" disabled={isSubmitting} className={`w-full py-4 mt-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50' : ''}`}>
                <Send className="w-5 h-5" /> {isSubmitting ? '전송 중...' : t('support.form.submit')}
=======

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {t('support.form.message')}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-none h-32"
                  placeholder={t('support.form.messagePlaceholder')}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-5 h-5" />
                {t('support.form.submit')}
>>>>>>> origin/mypage
              </button>
            </form>
          </div>

<<<<<<< HEAD
          {/* 우측: 정보 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl h-full flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
                 <Phone className="w-6 h-6 text-indigo-600" />
                 Contact Info
              </h2>

              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{t('support.contact.email.title')}</h3>
                    <p className="text-slate-600 text-lg font-medium">{t('support.contact.email.value')}</p>
                    <p className="text-sm text-slate-400 mt-1">{t('support.contact.email.time')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{t('support.contact.kakao.title')}</h3>
                    <p className="text-slate-600 text-lg font-medium">{t('support.contact.kakao.value')}</p>
                    <p className="text-sm text-slate-400 mt-1">{t('support.contact.kakao.time')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{t('support.contact.phone.title')}</h3>
                    <p className="text-slate-600 text-lg font-medium">{t('support.contact.phone.value')}</p>
                    <p className="text-sm text-slate-400 mt-1">{t('support.contact.phone.time')}</p>
                  </div>
=======
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">{t('support.contact.email.title')}</h3>
                  <p className="text-slate-600">{t('support.contact.email.value')}</p>
                  <p className="text-sm text-slate-400 mt-1">{t('support.contact.email.time')}</p>
>>>>>>> origin/mypage
                </div>
              </div>
            </div>

<<<<<<< HEAD
            <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-100">
               <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">{t('support.contact.hours.title')}</h3>
                    <div className="space-y-1">
                      <p className="text-slate-600">{t('support.contact.hours.weekday')}</p>
                      <p className="text-slate-500 text-sm">{t('support.contact.hours.weekend')}</p>
                    </div>
                  </div>
               </div>
=======
            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">{t('support.contact.kakao.title')}</h3>
                  <p className="text-slate-600">{t('support.contact.kakao.value')}</p>
                  <p className="text-sm text-slate-400 mt-1">{t('support.contact.kakao.time')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">{t('support.contact.phone.title')}</h3>
                  <p className="text-slate-600">{t('support.contact.phone.value')}</p>
                  <p className="text-sm text-slate-400 mt-1">{t('support.contact.phone.time')}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 border border-indigo-100">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">{t('support.contact.hours.title')}</h3>
                  <p className="text-slate-600 text-sm">{t('support.contact.hours.weekday')}</p>
                  <p className="text-slate-600 text-sm">{t('support.contact.hours.weekend')}</p>
                </div>
              </div>
>>>>>>> origin/mypage
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
            <h2 className="text-3xl font-black text-slate-900">{t('support.faq.title')}</h2>
          </div>
<<<<<<< HEAD
          <div className="space-y-4">
            {Array.isArray(faqs) && faqs.map((faq, index) => (
              <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors">
                <h3 className="font-black text-slate-900 mb-3 flex items-start gap-2 text-lg">
                  <span className="text-indigo-600 font-black">Q.</span>
                  {faq.question}
                </h3>
                <p className="text-slate-600 leading-relaxed pl-7">
=======

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
>>>>>>> origin/mypage
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

<<<<<<< HEAD
export default SupportView;
=======
export default SupportView;
>>>>>>> origin/mypage
