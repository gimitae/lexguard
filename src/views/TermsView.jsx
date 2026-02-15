import React from 'react';
import { FileText, Shield, User, AlertCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TermsView = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">{t('terms.title')}</h1>
          <p className="text-slate-500">{t('terms.lastUpdated')}</p>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <section className="p-8 bg-slate-50 rounded-3xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-3">
                  {t('terms.sections.article1.title')}
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  {t('terms.sections.article1.content')}
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
                <h2 className="text-xl font-black text-slate-900 mb-3">
                  {t('terms.sections.article2.title')}
                </h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  {t('terms.sections.article2.content1')}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {t('terms.sections.article2.content2')}
                </p>
                <ul className="mt-3 space-y-2 pl-6">
                  {t('terms.sections.article2.items', { returnObjects: true }).map((item, index) => (
                    <li key={index} className="text-slate-600">• {item}</li>
                  ))}
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
                <h2 className="text-xl font-black text-slate-900 mb-3">
                  {t('terms.sections.article3.title')}
                </h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  {t('terms.sections.article3.content')}
                </p>
                <ul className="space-y-2 pl-6">
                  {t('terms.sections.article3.services', { returnObjects: true }).map((service, index) => (
                    <li key={index} className="text-slate-600">• {service}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 - 면책조항 */}
          <section className="p-8 bg-amber-50 rounded-3xl border border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-3">
                  {t('terms.sections.article4.title')}
                </h2>
                <p className="text-slate-600 leading-relaxed mb-3">
                  {t('terms.sections.article4.content1')}
                </p>
                <p className="text-slate-600 leading-relaxed mb-3">
                  {t('terms.sections.article4.content2')}
                </p>
                <p className="text-slate-600 leading-relaxed mb-3">
                  {t('terms.sections.article4.content3')}
                </p>
                <p className="text-slate-600 leading-relaxed font-bold">
                  {t('terms.sections.article4.content4')}
                </p>
              </div>
            </div>
          </section>

          {/* Placeholder for more sections 삭제 완 */}
          
        </div>

        {/* Contact */}
        <div className="mt-12 p-8 bg-slate-900 text-white rounded-3xl">
          <h3 className="text-lg font-black mb-2">{t('terms.contact.title')}</h3>
          <p className="text-slate-300 text-sm">
            {t('terms.contact.description')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsView;