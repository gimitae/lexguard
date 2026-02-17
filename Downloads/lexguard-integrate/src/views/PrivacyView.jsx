import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

const PrivacyView = ({ onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">{t('common.back', '뒤로')}</span>
          </button>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {t('privacy.title', '개인정보 처리방침')}
          </h1>
          <p className="text-sm text-slate-500">
            {t('privacy.lastUpdated', '최종 수정일')}: 2024년 2월 16일
          </p>
        </div>
      </div>

      {/* 내용 */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-8">
          {/* 제1조 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4">
              {t('privacy.article1.title', '제1조 (개인정보의 수집 및 이용 목적)')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              {t('privacy.article1.content', '회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>{t('privacy.article1.item1', '회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공, 본인 식별·인증')}</li>
              <li>{t('privacy.article1.item2', '서비스 제공: 계약서 분석 서비스 제공, 콘텐츠 제공, 맞춤 서비스 제공')}</li>
              <li>{t('privacy.article1.item3', '마케팅 및 광고 활용: 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 정보 및 광고성 정보 제공')}</li>
            </ul>
          </section>

          {/* 제2조 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4">
              {t('privacy.article2.title', '제2조 (수집하는 개인정보의 항목)')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              {t('privacy.article2.content', '회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집하고 있습니다.')}
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 mb-2">
                  {t('privacy.article2.required', '필수 수집 항목')}
                </h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>{t('privacy.article2.requiredItem1', '이메일 주소')}</li>
                  <li>{t('privacy.article2.requiredItem2', '비밀번호 (암호화 저장)')}</li>
                  <li>{t('privacy.article2.requiredItem3', '서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">
                  {t('privacy.article2.optional', '선택 수집 항목')}
                </h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>{t('privacy.article2.optionalItem1', '이름, 연락처 (상담 신청 시)')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 제3조 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4">
              {t('privacy.article3.title', '제3조 (개인정보의 보유 및 이용 기간)')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              {t('privacy.article3.content', '회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>{t('privacy.article3.item1', '회원 탈퇴 시: 회원 탈퇴 즉시 삭제')}</li>
              <li>{t('privacy.article3.item2', '관련 법령에 따른 보관: 전자상거래법, 통신비밀보호법 등 관련 법령에 따라 일정 기간 보관')}</li>
              <li>{t('privacy.article3.item3', '계약서 분석 데이터: 분석 완료 후 즉시 암호화 및 폐기')}</li>
            </ul>
          </section>

          {/* 제4조 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4">
              {t('privacy.article4.title', '제4조 (개인정보의 제3자 제공)')}
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {t('privacy.article4.content', '회사는 원칙적으로 이용자의 개인정보를 제1조에서 명시한 범위 내에서 처리하며, 이용자의 사전 동의 없이는 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mt-4">
              <li>{t('privacy.article4.item1', '이용자가 사전에 동의한 경우')}</li>
              <li>{t('privacy.article4.item2', '법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우')}</li>
            </ul>
          </section>

          {/* 제5조 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4">
              {t('privacy.article5.title', '제5조 (개인정보의 파기 절차 및 방법)')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              {t('privacy.article5.content', '회사는 원칙적으로 개인정보 처리목적이 달성된 경우에는 지체없이 해당 개인정보를 파기합니다.')}
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 mb-2">
                  {t('privacy.article5.procedure', '파기 절차')}
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {t('privacy.article5.procedureDesc', '이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류) 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.')}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">
                  {t('privacy.article5.method', '파기 방법')}
                </h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>{t('privacy.article5.methodItem1', '전자적 파일 형태: 복구 불가능한 방법으로 영구 삭제')}</li>
                  <li>{t('privacy.article5.methodItem2', '종이 문서: 분쇄기로 분쇄하거나 소각')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 제6조 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4">
              {t('privacy.article6.title', '제6조 (정보주체의 권리·의무 및 행사방법)')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              {t('privacy.article6.content', '이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>{t('privacy.article6.item1', '개인정보 열람 요구')}</li>
              <li>{t('privacy.article6.item2', '오류 등이 있을 경우 정정 요구')}</li>
              <li>{t('privacy.article6.item3', '삭제 요구')}</li>
              <li>{t('privacy.article6.item4', '처리정지 요구')}</li>
            </ul>
          </section>

          {/* 제7조 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4">
              {t('privacy.article7.title', '제7조 (개인정보 보호책임자)')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              {t('privacy.article7.content', '회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.')}
            </p>
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="space-y-2 text-slate-700">
                <p><span className="font-bold">{t('privacy.article7.name', '이름')}:</span> 바른개인정보</p>
                <p><span className="font-bold">{t('privacy.article7.email', '이메일')}:</span> barunprivacy@barungyeyak.com</p>
                <p><span className="font-bold">{t('privacy.article7.phone', '전화')}:</span> 02-1234-5678</p>
              </div>
            </div>
          </section>

          {/* 제8조 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4">
              {t('privacy.article8.title', '제8조 (개인정보 처리방침 변경)')}
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {t('privacy.article8.content', '이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.')}
            </p>
          </section>

          {/* 공고일 */}
          <div className="border-t border-slate-200 pt-6 mt-8">
            <p className="text-sm text-slate-500 text-center">
              {t('privacy.announcement', '공고일자: 2024년 2월 16일')}
            </p>
            <p className="text-sm text-slate-500 text-center">
              {t('privacy.effective', '시행일자: 2024년 2월 16일')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyView;