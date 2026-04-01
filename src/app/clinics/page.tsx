import { Metadata } from 'next'
import Link from 'next/link'
import { clinics, REGIONS, type Region } from '@/data/clinics'
import { SITE_URL } from '@/lib/constants'
import FaqSchema from '@/components/FaqSchema'

const CLINIC_FAQ_ITEMS = [
  {
    question: '위고비 처방받으려면 어떤 병원에 가야 하나요?',
    answer:
      '위고비는 전문의약품으로 내과, 가정의학과, 내분비내과 등 처방 권한이 있는 의사가 있는 의원이나 병원에서 처방받을 수 있습니다. 비만클리닉 전문 의원을 포함하여 다양한 형태의 의료기관에서 처방이 가능하며, 처방 전 BMI 측정 및 혈액검사 등 기본 검진이 진행될 수 있습니다.',
  },
  {
    question: '처방 비용은 얼마나 드나요?',
    answer:
      '비용은 병원과 처방 약물의 용량에 따라 크게 다릅니다. 위고비의 경우 약제비만 월 30만~60만 원 수준이 일반적이며, 초진 진찰료와 혈액검사 비용이 추가됩니다. 현재 비만 치료 목적의 GLP-1 비만치료제는 건강보험 급여 적용이 제한적입니다. 정확한 비용은 해당 의료기관에 직접 문의하시기 바랍니다.',
  },
  {
    question: '비대면 처방도 가능한가요?',
    answer:
      '조건에 따라 비대면(온라인) 진료를 통한 처방이 가능한 경우가 있습니다. 일반적으로 기존에 동일 약물을 처방받은 이력이 있는 재진 환자의 경우 비대면 진료가 허용될 수 있습니다. 초진의 경우 신체 검진과 혈액검사가 필요하여 대면 진료가 권장됩니다. 허용 범위는 의료기관 정책 및 관련 법령에 따라 다를 수 있습니다.',
  },
  {
    question: '처방 기준이 되는 BMI는 얼마인가요?',
    answer:
      '일반적으로 BMI 30 이상이거나, BMI 27 이상이면서 고혈압·제2형 당뇨병 등 비만 관련 동반 질환이 있는 경우 처방 대상이 될 수 있습니다. 그러나 최종 처방 여부는 환자의 전반적인 건강 상태, 동반 질환, 복용 중인 약물 등을 종합적으로 고려하여 담당 의사가 결정합니다.',
  },
  {
    question: '이 페이지의 병원 정보는 얼마나 정확한가요?',
    answer:
      '이 페이지에 제공되는 병원 정보와 가격은 참고용으로만 제공됩니다. 실제 처방 가능 여부, 가격, 진료 시간 등은 변경될 수 있으며 병원마다 다릅니다. 방문 전 반드시 해당 의료기관에 직접 문의하여 확인하시기 바랍니다.',
  },
]

export const metadata: Metadata = {
  title: '위고비 처방 병원 찾기 | GLP-1 비만치료제 처방 클리닉',
  description:
    '서울, 부산, 대구, 인천 등 지역별 위고비·삭센다·마운자로 처방 병원 목록과 참고 가격 정보를 제공합니다.',
  alternates: { canonical: `${SITE_URL}/clinics` },
}

const PRICE_DISCLAIMER =
  '가격은 참고용이며 실제와 다를 수 있습니다. 반드시 병원에 직접 문의하세요.'

function formatPrice(price?: number) {
  if (price == null) return '-'
  return `${price.toLocaleString('ko-KR')}원/월`
}

function FeatureBadge({ label }: { label: string }) {
  return (
    <span className="inline-block px-2 py-0.5 text-xs bg-teal-50 text-teal-700 rounded-full border border-teal-100">
      {label}
    </span>
  )
}

function ClinicCard({ clinic }: { clinic: (typeof clinics)[number] }) {
  return (
    <Link
      href={`/clinics/${clinic.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-teal-300 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 text-base leading-snug">{clinic.name}</h3>
        <span className="shrink-0 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
          {clinic.region}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-3">{clinic.address}</p>
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <div className="text-blue-400 font-medium mb-0.5">위고비</div>
          <div className="text-blue-700 font-semibold">{formatPrice(clinic.wegovyPrice)}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <div className="text-green-400 font-medium mb-0.5">삭센다</div>
          <div className="text-green-700 font-semibold">{formatPrice(clinic.saxendaPrice)}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-2 text-center">
          <div className="text-purple-400 font-medium mb-0.5">마운자로</div>
          <div className="text-purple-700 font-semibold">{formatPrice(clinic.mounjaroPrice)}</div>
        </div>
      </div>
      {clinic.features.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {clinic.features.map((f) => (
            <FeatureBadge key={f} label={f} />
          ))}
        </div>
      )}
    </Link>
  )
}

export default function ClinicsPage({
  searchParams,
}: {
  searchParams?: { region?: string }
}) {
  const selectedRegion = (searchParams?.region as Region | undefined) ?? null
  const filtered = selectedRegion
    ? clinics.filter((c) => c.region === selectedRegion)
    : clinics

  const grouped = REGIONS.reduce<Record<Region, (typeof clinics)[number][]>>(
    (acc, region) => {
      acc[region] = filtered.filter((c) => c.region === region)
      return acc
    },
    {} as Record<Region, (typeof clinics)[number][]>,
  )

  return (
    <>
      <FaqSchema faqs={CLINIC_FAQ_ITEMS} />
      <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">위고비 처방 병원 찾기</h1>
        <p className="text-gray-600 text-sm">
          GLP-1 비만치료제(위고비, 삭센다, 마운자로)를 처방하는 병원을 지역별로 찾아보세요.
        </p>
      </div>

      {/* 면책조항 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 mb-6">
        <strong>안내:</strong> {PRICE_DISCLAIMER} 이 정보는 참고용이며, 처방 결정은 반드시 전문의와 상담하세요.
      </div>

      {/* 지역 필터 탭 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/clinics"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedRegion == null
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-700'
          }`}
        >
          전체
        </Link>
        {REGIONS.map((region) => (
          <Link
            key={region}
            href={`/clinics?region=${encodeURIComponent(region)}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedRegion === region
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-700'
            }`}
          >
            {region}
          </Link>
        ))}
      </div>

      {/* 지역별 클리닉 목록 */}
      {selectedRegion ? (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedRegion} ({grouped[selectedRegion]?.length ?? 0}개)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(grouped[selectedRegion] ?? []).map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        </section>
      ) : (
        REGIONS.map((region) => {
          const regionClinics = grouped[region] ?? []
          if (regionClinics.length === 0) return null
          return (
            <section key={region} className="mb-10">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {region} ({regionClinics.length}개)
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {regionClinics.map((clinic) => (
                  <ClinicCard key={clinic.id} clinic={clinic} />
                ))}
              </div>
            </section>
          )
        })
      )}

      {/* 하단 면책조항 */}
      <div className="mt-10 p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
        <p className="mb-1 font-semibold text-gray-600">면책조항</p>
        <p>
          이 페이지의 병원 정보 및 가격은 참고용으로만 제공되며, 실제 처방 여부·가격·진료 시간은
          변경될 수 있습니다. 처방은 반드시 전문 의사의 진단과 처방을 따르시기 바랍니다. 이 사이트는
          특정 병원을 추천하거나 의학적 조언을 제공하지 않습니다.
        </p>
      </div>
      </main>
    </>
  )
}
