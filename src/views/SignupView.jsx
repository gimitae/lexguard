import React from 'react';
import { useTranslation } from 'react-i18next';


const SignupView = ({ onAuth, onCancel }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6">
      <div className="max-w-md w-full p-10 bg-white border border-slate-200 rounded-[32px] shadow-2xl text-center">
        <h2 className="text-2xl font-black mb-8">{t('signup.title')}</h2>
        
        <button 
          onClick={onAuth}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold mb-4 hover:bg-slate-800 transition-all active:scale-95"
        >
          {t('header.login')} / {t('signup.loginSignup')}
        </button>
        
        <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-4">
          {t('signup.or')}
        </p>
        
        <button 
          onClick={onCancel}
          className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          {t('signup.skipForNow')}
        </button>
      </div>
    </div>
  );
};

export default SignupView;