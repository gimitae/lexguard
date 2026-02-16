import React, { useState } from 'react';
import { Star, MapPin, Briefcase, Award, MessageCircle, Filter, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LawFirmsView = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 더미 데이터 (나중에 백엔드에서 받아올 예정)
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

  const categories = [
    { id: 'all', label: t('lawfirms.filters.all') },
    { id: 'labor', label: t('lawfirms.filters.labor') },
    { id: 'contract', label: t('lawfirms.filters.contract') },
    { id: 'civil', label: t('lawfirms.filters.civil') }
  ];

  const handleConsultation = (firmName) => {
    // TODO: 백엔드 연결 시 구현
    alert(t('lawfirms.consultationAlert', { firmName }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
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

        {/* Law Firms Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {lawFirms.map((firm) => (
            <div
              key={firm.id}
              className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-2xl hover:border-indigo-200 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">
                    {firm.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-slate-900">{firm.rating}</span>
                      <span className="text-sm text-slate-400">({firm.reviewCount})</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {firm.specialty.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 mb-6 leading-relaxed">
                {firm.description}
              </p>

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
                  onClick={() => handleConsultation(firm.name)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('lawfirms.consultation')}
                </button>
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default LawFirmsView;
