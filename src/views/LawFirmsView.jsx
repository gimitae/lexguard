import React, { useState, useEffect } from 'react';
import { Star, MapPin, Briefcase, Award, MessageCircle, Filter, Search, X, FileText, Send, CheckCircle, User, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const LawFirmsView = ({ onAuth }) => {
  const { t } = useTranslation();
  
  // 🔍 검색 및 필터 상태
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 🔐 로그인 & 모달 상태
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFirm, setSelectedFirm] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📝 상담 신청 폼 데이터
  const [consultTitle, setConsultTitle] = useState('');
  const [content, setContent] = useState('');

  // 1. 로그인 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. 상담 신청 버튼 클릭 (모달 열기)
  const handleConsultationClick = (firmName) => {
    setSelectedFirm(firmName);
    setConsultTitle(`[${firmName}] 상담 신청합니다`); 
    setIsModalOpen(true);
  };

  // 3. 상담 신청 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "consultations"), {
        uid: currentUser.uid,
        userEmail: currentUser.email,
        targetFirm: selectedFirm, 
        title: consultTitle,
        content: content,
        status: 'received', 
        createdAt: serverTimestamp()
      });

      // ✨ [수정됨] 이메일 안내 문구 추가
      alert("상담 신청이 완료되었습니다!\n담당 변호사가 검토 후 입력하신 이메일로 연락드릴 예정입니다.");
      
      setIsModalOpen(false); 
      setContent('');

    } catch (error) {
      console.error("Error:", error);
      alert("신청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 더미 데이터
  const lawFirms = [
    {
      id: 1,
      name: 'A 법률사무소',
      specialty: ['노동법', '계약법'],
      rating: 4.9,
      reviewCount: 127,
      experience: '15년',
      location: '서울 강남구',
      description: '노동 및 계약 분쟁 전문. 대기업 자문 다수.',
      consultationFee: '무료',
      responseTime: '평균 2시간',
      cases: 450
    },
    {
      id: 2,
      name: 'B 법률그룹',
      specialty: ['민사소송', '계약법'],
      rating: 4.8,
      reviewCount: 95,
      experience: '12년',
      location: '서울 서초구',
      description: '계약서 검토 및 민사 소송 전문가 그룹',
      consultationFee: '30분 무료',
      responseTime: '평균 3시간',
      cases: 380
    },
    {
      id: 3,
      name: 'C 로펌',
      specialty: ['노동법', '부당해고'],
      rating: 4.7,
      reviewCount: 156,
      experience: '20년',
      location: '서울 영등포구',
      description: '부당해고 및 노동 분쟁 승소율 95%',
      consultationFee: '무료',
      responseTime: '평균 1시간',
      cases: 620
    },
    {
      id: 4,
      name: 'D 법률파트너스',
      specialty: ['계약법', '지적재산권'],
      rating: 4.9,
      reviewCount: 89,
      experience: '10년',
      location: '서울 중구',
      description: 'IT 및 스타트업 계약 전문',
      consultationFee: '무료',
      responseTime: '평균 4시간',
      cases: 290
    }
  ];

  // ✨ [추가됨] 필터링 로직 구현
  const filteredFirms = lawFirms.filter((firm) => {
    // 1. 카테고리 필터 (선택한 카테고리가 'all'이거나, 로펌 전문분야에 포함되어 있는지)
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'labor' && firm.specialty.some(s => s.includes('노동') || s.includes('해고'))) ||
      (selectedCategory === 'contract' && firm.specialty.some(s => s.includes('계약'))) ||
      (selectedCategory === 'civil' && firm.specialty.some(s => s.includes('민사')));

    // 2. 검색어 필터 (이름, 설명, 전문분야 중 하나라도 검색어 포함)
    const matchesSearch = 
      firm.name.includes(searchTerm) || 
      firm.description.includes(searchTerm) || 
      firm.specialty.some(s => s.includes(searchTerm));

    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: t('lawfirms.filters.all') },
    { id: 'labor', label: t('lawfirms.filters.labor') },
    { id: 'contract', label: t('lawfirms.filters.contract') },
    { id: 'civil', label: t('lawfirms.filters.civil') }
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            {t('lawfirms.title')}
          </h1>
          <p className="text-indigo-100 text-lg max-w-2xl">
            {t('lawfirms.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('lawfirms.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 focus:outline-none text-slate-900 font-medium"
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Law Firms Grid (필터링된 목록 보여주기) */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredFirms.length > 0 ? (
            filteredFirms.map((firm) => (
              <div
                key={firm.id}
                className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-2xl hover:border-indigo-200 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{firm.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-slate-900">{firm.rating}</span>
                      <span className="text-sm text-slate-400">({firm.reviewCount})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {firm.specialty.map((spec, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">{spec}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 mb-6 leading-relaxed">{firm.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-400">{t('lawfirms.stats.experience')}</p>
                      <p className="font-bold text-slate-900">{firm.experience}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-400">{t('lawfirms.stats.cases')}</p>
                      <p className="font-bold text-slate-900">{firm.cases}{t('lawfirms.stats.casesUnit')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-400">{t('lawfirms.stats.location')}</p>
                      <p className="font-bold text-slate-900">{firm.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-400">{t('lawfirms.stats.responseTime')}</p>
                      <p className="font-bold text-slate-900">{firm.responseTime}</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{t('lawfirms.consultationFee')}</p>
                    <p className="text-lg font-black text-emerald-600">{firm.consultationFee}</p>
                  </div>
                  <button
                    onClick={() => handleConsultationClick(firm.name)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2 active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('lawfirms.consultation')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 text-slate-500">
              검색 결과가 없습니다.
            </div>
          )}
        </div>

        {/* CTA Bottom */}
        <div className="mt-16 text-center bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-12 border border-indigo-100">
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            {t('lawfirms.cta.title')}
          </h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            {t('lawfirms.cta.description')}
          </p>
          <button className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl">
            {t('lawfirms.cta.button')}
          </button>
        </div>
      </div>

      {/* 상담 신청 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative animate-scale-up">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {currentUser ? (
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">상담 신청서</h2>
                    <p className="text-indigo-600 font-bold text-sm">To. {selectedFirm}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">신청자 이메일</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={currentUser.email} 
                        disabled 
                        className="block w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-bold" 
                      />
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                    </div>
                    <p className="mt-1 text-xs text-indigo-500">* 로그인 계정으로 자동 신청됩니다.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">상담 제목</label>
                    <input 
                      type="text" 
                      required 
                      value={consultTitle} 
                      onChange={(e) => setConsultTitle(e.target.value)} 
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">상담 내용</label>
                    <textarea 
                      required 
                      rows={5} 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      placeholder="계약서의 어떤 부분이 궁금하신가요? 구체적으로 적어주세요." 
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${isSubmitting ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
                  >
                    {isSubmitting ? '저장 중...' : <><Send className="w-5 h-5" /> 상담 신청하기</>}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">로그인이 필요합니다</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  전문가 상담은 회원 전용 서비스입니다.<br/>
                  로그인하고 <strong>{selectedFirm}</strong>에게 상담을 신청하세요.
                </p>
                <button 
                  onClick={() => { setIsModalOpen(false); onAuth(); }} 
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" /> 로그인 / 회원가입 하러 가기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default LawFirmsView;
