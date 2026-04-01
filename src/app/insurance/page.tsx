import type { Metadata } from 'next';
import {
  drugInsuranceData,
  eligibilityCriteriaList,
  realInsuranceItems,
  faqs,
} from '@/data/insurance';

export const metadata: Metadata = {
  title: 'GLP-1 비만치료제 보험 적용 정보 | 위고비·삭센다·마운자로 건강보험·실손보험',
  description:
    '위고비, 삭센다, 마운자로의 건강보험 급여 현황, 본인부담률, 실손보험 적용 여부를 한눈에 비교하세요. 2026년 최신 보험 정보.',
  alternates: {
    canonical: '/insurance',
  },
  openGraph: {
    title: 'GLP-1 비만치료제 보험 적용 정보',
    description:
      '위고비·삭센다·마운자로 건강보험 급여 현황과 실손보험 적용 여부를 비교합니다.',
    type: 'website',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

const STATUS_BADGE: Record<string, string> = {
  급여: 'bg-green-100 text-green-800',
  선별급여: 'bg-yellow-100 text-yellow-800',
  비급여: 'bg-red-100 text-red-800',
};

export default function InsurancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Hero */}
        <section className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            GLP-1 비만치료제 보험 적용 정보
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            위고비, 삭센다, 마운자로의 건강보험 급여 현황과 실손보험 적용 여부를 비교합니다.
            정확한 정보는 담당 의사 또는 건강보험심사평가원에서 확인하세요.
          </p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <strong>안내:</strong> 보험 정보는 2026년 기준이며 변경될 수 있습니다. 정확한 정보는{' '}
            <a
              href="https://www.hira.or.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              건강보험심사평가원
            </a>{' '}
            또는 담당 의사에게 문의하세요.
          </div>
        </section>

        {/* 건강보험 급여 현황표 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">건강보험 급여 현황 비교</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">약물</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">성분명</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">급여 상태</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">본인부담률</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">월 예상 비용</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drugInsuranceData.map((drug) => (
                  <tr key={drug.name} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{drug.name}</td>
                    <td className="px-5 py-4 text-gray-600">{drug.genericName}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[drug.coverageStatus]}`}
                      >
                        {drug.coverageStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{drug.coverageRate}</td>
                    <td className="px-5 py-4 text-gray-700">{drug.monthlyEstimate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 약물별 상세 카드 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">약물별 급여 상세 정보</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {drugInsuranceData.map((drug) => (
              <div
                key={drug.name}
                className="rounded-xl border border-gray-200 p-5 shadow-sm bg-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{drug.name}</h3>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[drug.coverageStatus]}`}
                  >
                    {drug.coverageStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{drug.genericName} · {drug.manufacturer}</p>
                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      급여 기준 (BMI)
                    </span>
                    <p className="text-sm text-gray-700 mt-0.5">{drug.eligibilityBmi}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      적용 조건
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {drug.eligibilityConditions.map((c, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-1.5">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">{drug.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 급여 적용 조건 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">급여 적용 조건 상세</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {eligibilityCriteriaList.map((criteria) => (
              <div
                key={criteria.title}
                className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 mb-3">{criteria.title}</h3>
                <ul className="space-y-2">
                  {criteria.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-teal-500 font-bold shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 실손보험 적용 여부 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">실손보험 적용 여부</h2>
          <p className="text-gray-600 mb-6">
            GLP-1 비만치료제는 대부분 실손보험 보장 제외 항목으로 처리됩니다. 아래 내용을 확인하세요.
          </p>
          <div className="space-y-4">
            {realInsuranceItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <strong>참고:</strong> 실손보험 보장 여부는 가입한 보험 상품의 약관에 따라 다를 수 있습니다.
            개별 보험사에 직접 문의하거나 약관을 확인하세요.
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">자주 묻는 질문 (FAQ)</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Q. {faq.question}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">A. {faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 면책조항 */}
        <section>
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-700 mb-1">면책조항</p>
            <p>
              본 페이지의 보험 정보는 일반적인 참고 목적으로만 제공되며, 의료적 조언이나 보험 상담을
              대체하지 않습니다. 개인별 급여 적용 여부는 담당 의사 및 건강보험심사평가원(
              <a
                href="https://www.hira.or.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-teal-700"
              >
                www.hira.or.kr
              </a>
              )에서 확인하시기 바랍니다. 보험 기준은 정부 고시에 따라 변경될 수 있습니다.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
