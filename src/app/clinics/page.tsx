import { Metadata } from 'next'
import Link from 'next/link'
import { clinics, REGIONS, type Region } from '@/data/clinics'
import { SITE_URL } from '@/lib/constants'

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
  )
}
