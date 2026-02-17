import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import koTranslation from './locales/ko/translation.json';
import enTranslation from './locales/en/translation.json';
import jaTranslation from './locales/ja/translation.json'

const resources = {
  ko: {
    translation: koTranslation
  },
  en: {
    translation: enTranslation
  },
  ja: {
    translation: jaTranslation
  }
};

i18n
  // 브라우저 언어 자동 감지
  .use(LanguageDetector)
  // react-i18next 연결
  .use(initReactI18next)
  // 초기화
  .init({
    resources,
    fallbackLng: 'ko', // 기본 언어
    debug: false, // 개발 중에는 true로 설정
    
    interpolation: {
      escapeValue: false // React가 이미 XSS 방지함
    },
    
    detection: {
      // 언어 감지 순서
      order: ['localStorage', 'navigator', 'htmlTag'],
      // localStorage 키
      caches: ['localStorage']
    }
  });

export default i18n;