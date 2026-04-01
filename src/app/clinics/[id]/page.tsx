import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { clinics } from '@/data/clinics'
import { SITE_URL } from '@/lib/constants'

interface Props {
  params: { id: string }
}

export function generateStaticParams() {
  return clinics.map((clinic) => ({ id: clinic.id }))
}

export function generateMetadata({ params }: Props): Metadata {
  const clinic = clinics.find((c) => c.id === params.id)
  if (!clinic) return {}
  return {
    title: `${clinic.name} | 위고비 처방 병원`,
    description: `${clinic.region} ${clinic.name} — GLP-1 비만치료제(위고비, 삭센다, 마운자로) 처방 병원 정보 및 참고 가격`,
    alternates: { canonical: `${SITE_URL}/clinics/${clinic.id}` },
  }
}

function formatPrice(price?: number) {
  if (price == null) return null
  return `${price.toLocaleString('ko-KR')}원/월`
}

export default function ClinicDetailPage({ params }: Props) {
  const clinic = clinics.find((c) => c.id === params.id)
  if (!clinic) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: clinic.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinic.address,
    },
    telephone: clinic.phone,
    description: `GLP-1 비만치료제(위고비, 삭센다, 마운자로) 처방 병원 - ${clinic.region}`,
    url: clinic.website ?? `${SITE_URL}/clinics/${clinic.id}`,
  }

  const prices = [
    { label: '위고비 (세마글루타이드)', value: formatPrice(clinic.wegovyPrice), color: 'blue' },
    { label: '삭센다 (리라글루타이드)', value: formatPrice(clinic.saxendaPrice), color: 'green' },
    { label: '마운자로 (티르제파타이드)', value: formatPrice(clinic.mounjaroPrice), color: 'purple' },
  ].filter((p) => p.value != null)

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100 text-blue-800',
    green: 'bg-green-50 border-green-100 text-green-800',
    purple: 'bg-purple-50 border-purple-100 text-purple-800',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/clinics" className="hover:text-teal-700 transition-colors">
            병원 찾기
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{clinic.name}</span>
        </nav>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-teal-600 px-6 py-5">
            <span className="inline-block px-2 py-0.5 text-xs bg-white/20 text-white rounded-full mb-2">
              {clinic.region}
            </span>
            <h1 className="text-xl font-bold text-white">{clinic.name}</h1>
          </div>

          <div className="p-6 space-y-6">
            {/* 기본 정보 */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                기본 정보
              </h2>
              <dl className="space-y-2">
                <div className="flex gap-3">
                  <dt className="text-sm text-gray-500 w-16 shrink-0">주소</dt>
                  <dd className="text-sm text-gray-800">{clinic.address}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="text-sm text-gray-500 w-16 shrink-0">전화</dt>
                  <dd className="text-sm text-gray-800">
                    <a
                      href={`tel:${clinic.phone.replace(/-/g, '')}`}
                      className="text-teal-700 hover:underline"
                    >
                      {clinic.phone}
                    </a>
                  </dd>
                </div>
                {clinic.website && (
                  <div className="flex gap-3">
                    <dt className="text-sm text-gray-500 w-16 shrink-0">웹사이트</dt>
                    <dd className="text-sm">
                      <a
                        href={clinic.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 hover:underline"
                      >
                        바로가기
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {/* 가격 정보 */}
            {prices.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  참고 가격 (월)
                </h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {prices.map((p) => (
                    <div
                      key={p.label}
                      className={`border rounded-xl p-3 text-center ${colorMap[p.color]}`}
                    >
                      <div className="text-xs font-medium opacity-70 mb-1">{p.label}</div>
                      <div className="text-base font-bold">{p.value}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  가격은 참고용이며 실제와 다를 수 있습니다. 반드시 병원에 직접 문의하세요.
                </p>
              </section>
            )}

            {/* 특징 */}
            {clinic.features.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  특징
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {clinic.features.map((f) => (
                    <li
                      key={f}
                      className="px-3 py-1 text-sm bg-teal-50 text-teal-700 rounded-full border border-teal-100"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {/* 면책조항 */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
          <p className="mb-1 font-semibold text-gray-600">면책조항</p>
          <p>
            이 페이지의 정보는 참고용으로만 제공됩니다. 실제 처방 여부, 가격, 진료 시간은 변경될 수
            있으며, 반드시 병원에 직접 문의하시기 바랍니다. 이 사이트는 특정 병원을 추천하거나
            의학적 조언을 제공하지 않습니다. GLP-1 비만치료제는 전문의약품으로, 반드시 전문 의사의
            처방이 필요합니다.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/clinics"
            className="inline-flex items-center gap-1 text-sm text-teal-700 hover:underline"
          >
            ← 병원 목록으로 돌아가기
          </Link>
        </div>
      </main>
    </>
  )
}
