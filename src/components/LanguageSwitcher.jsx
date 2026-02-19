import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';


const LanguageSwitcher = () => {
  const { i18n } = useTranslation();


  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
  ];


  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };


  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
        <Globe className="w-4 h-4 text-slate-600" />
        <span className="text-sm font-bold text-slate-600">
          {languages.find(lang => lang.code === i18n.language)?.flag || '🌍'}
        </span>
      </button>


      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`
              w-full px-4 py-2 text-left text-sm font-bold transition-colors flex items-center gap-2
              ${i18n.language === lang.code
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-slate-600 hover:bg-slate-50'
              }
            `}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};


export default LanguageSwitcher;

