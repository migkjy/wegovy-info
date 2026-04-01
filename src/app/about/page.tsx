import { Metadata } from 'next';
import Link from 'next/link';
import { DISCLAIMER, SITE_NAME, SITE_URL } from '@/lib/constants';
import FaqSchema from '@/components/FaqSchema';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: '소개' },
  ],
};

export const metadata: Metadata = {
  title: '소개',
  description: `${SITE_NAME}는 GLP-1 비만치료제(위고비, 삭센다, 마운자로)에 관한 객관적 정보를 제공하는 비영리 정보 사이트입니다.`,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/about`,
    title: `소개 | ${SITE_NAME}`,
    description: `${SITE_NAME}는 GLP-1 비만치료제(위고비, 삭센다, 마운자로)에 관한 객관적 정보를 제공하는 비영리 정보 사이트입니다.`,
    locale: 'ko_KR',
    siteName: SITE_NAME,
  },
};

const FAQ_ITEMS = [
  {
    question: 'GLP-1 비만치료제란 무엇인가요?',
    answer:
      'GLP-1(글루카곤 유사 펩타이드-1) 수용체 작용제는 원래 제2형 당뇨병 치료를 위해 개발된 약물로, 식욕 조절과 체중 감소에 관여하는 호르몬 기전에 작용합니다. 현재 일부 GLP-1 제제가 비만 치료 목적으로 허가되어 사용되고 있습니다.',
  },
  {
    question: '위고비, 삭센다, 마운자로의 차이점은?',
    answer:
      '위고비(세마글루타이드)는 주 1회 투여, 삭센다(리라글루타이드)는 매일 투여하는 GLP-1 수용체 작용제입니다. 마운자로(티르제파타이드)는 GLP-1과 GIP 이중 수용체 작용제로 주 1회 투여합니다. 각 약물의 용법, 용량, 허가 범위가 다르므로 전문의 상담이 필요합니다.',
  },
  {
    question: '비만치료제는 누구나 사용할 수 있나요?',
    answer:
      '비만치료제는 전문의약품으로, 의사의 처방이 필요합니다. 일반적으로 BMI 30 이상이거나 BMI 27 이상이면서 체중 관련 동반 질환이 있는 경우 처방 대상이 될 수 있으며, 개인의 건강 상태에 따라 다를 수 있습니다.',
  },
  {
    question: '부작용은 어떤 것이 있나요?',
    answer:
      'GLP-1 비만치료제의 흔한 이상반응으로는 오심, 구토, 설사, 변비 등 위장관 관련 증상이 보고되고 있습니다. 드물지만 심각한 이상반응도 보고된 바 있으므로, 반드시 전문의와 상담 후 사용해야 합니다.',
  },
  {
    question: '건강보험 적용이 되나요?',
    answer:
      '현재 한국에서 비만 치료 목적의 GLP-1 제제에 대한 건강보험 적용은 제한적입니다. 제2형 당뇨병 치료 목적으로 처방되는 경우와 비만 치료 목적의 경우 보험 적용 기준이 다릅니다. 최신 급여 기준은 건강보험심사평가원에서 확인할 수 있습니다.',
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <FaqSchema faqs={FAQ_ITEMS} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-teal-600 transition-colors">홈</Link>
          <span>/</span>
          <span className="text-gray-600">소개</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          사이트 소개
        </h1>

        {/* 사이트 소개 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">GLP-1 비만치료제 정보 플랫폼</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            <strong className="text-gray-800">{SITE_NAME}</strong>는 위고비(세마글루타이드), 삭센다(리라글루타이드),
            마운자로(티르제파타이드) 등 GLP-1 비만치료제에 관한 객관적인 정보를 제공하기 위해 만들어진 정보 사이트입니다.
          </p>
          <p className="text-gray-600 leading-relaxed">
            비만치료제에 대한 관심이 높아지면서 정확하지 않은 정보도 많이 유통되고 있습니다.
            저희는 식품의약품안전처의 허가 정보, 임상 연구 결과, 제약사의 공식 자료를 바탕으로
            누구나 이해할 수 있는 형태로 정보를 정리하여 제공합니다.
          </p>
        </section>

        {/* 운영 원칙 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">운영 원칙</h2>
          <div className="space-y-3">
            {[
              {
                title: '약사법 준수',
                desc: '전문의약품 광고에 해당하는 표현을 사용하지 않습니다.',
              },
              {
                title: '광고가 아닙니다',
                desc: '특정 의약품의 구매나 사용을 권유하지 않으며, 특정 제약사와 상업적 관계가 없습니다.',
              },
              {
                title: '의학적 조언이 아닙니다',
                desc: '이 사이트의 정보는 전문의의 상담을 대체하지 않습니다. 약물 사용에 관한 결정은 반드시 전문의와 상의하세요.',
              },
              {
                title: '객관적 정보 제공',
                desc: '단정적 표현(예: "안전하다", "효과적이다")을 지양하고, 연구 결과와 공식 자료에 근거한 정보만 게재합니다.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-3 p-4 bg-white border border-gray-200 rounded-lg"
              >
                <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 면책조항 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">면책조항</h2>
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-amber-800 leading-relaxed">{DISCLAIMER}</p>
            </div>
            <p className="text-xs text-amber-600 mt-3 leading-relaxed">
              이 사이트에 게재된 모든 정보는 일반적인 교육 및 정보 제공 목적으로만 작성되었습니다.
              개인의 건강 상태에 따라 적용이 다를 수 있으므로, 의약품 사용에 관한 모든 결정은
              반드시 전문의와 상담 후 내려주시기 바랍니다.
            </p>
          </div>
        </section>

        {/* 정보 출처 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">정보 출처</h2>
          <p className="text-gray-600 mb-4">
            본 사이트에 게재된 정보는 다음과 같은 공신력 있는 출처를 기반으로 작성됩니다.
          </p>
          <ul className="space-y-2">
            {[
              '식품의약품안전처 (MFDS) 의약품 허가 정보',
              '국내외 임상 연구 논문 및 학회 발표 자료',
              '제약사(노보노디스크, 일라이릴리 등) 공식 제품 정보',
              '건강보험심사평가원 (HIRA) 급여 기준',
              '대한비만학회 등 관련 학회 가이드라인',
            ].map((source) => (
              <li key={source} className="flex items-start gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {source}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq) => (
              <div key={faq.question} className="p-4 bg-white border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 연락처/피드백 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">연락처 및 피드백</h2>
          <div className="p-5 bg-teal-50 border border-teal-200 rounded-xl">
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              정보의 오류를 발견하셨거나 개선 의견이 있으시면 아래 이메일로 연락해 주세요.
              여러분의 피드백은 더 정확한 정보 제공에 큰 도움이 됩니다.
            </p>
            <a
              href="mailto:contact@example.com"
              className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              contact@example.com
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
