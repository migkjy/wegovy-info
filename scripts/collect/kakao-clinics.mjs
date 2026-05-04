// scripts/collect/kakao-clinics.mjs
// 카카오 로컬 API 키워드 검색으로 비만클리닉/GLP-1 처방 병원 수집
// HIRA API 키 대기 중 대안 — 실 운영 병원 데이터 확보
//
// Run: KAKAO_REST_API_KEY=xxx node scripts/collect/kakao-clinics.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { isTursoConfigured, tursoBatchInsert, logCollection } from './turso-client.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, '../../.data-cache')
const KAKAO_KEY = process.env.KAKAO_REST_API_KEY

const KEYWORDS = [
  '비만클리닉',
  '비만전문 병원',
  '다이어트 클리닉',
  '체중감량 클리닉',
  '위고비 처방',
  '삭센다 처방',
  'GLP-1 비만',
]

const CITIES = [
  { name: '서울', x: '126.978', y: '37.566', radius: 20000 },
  { name: '서울강남', x: '127.047', y: '37.497', radius: 8000 },
  { name: '부산', x: '129.075', y: '35.179', radius: 15000 },
  { name: '대구', x: '128.601', y: '35.871', radius: 12000 },
  { name: '인천', x: '126.705', y: '37.456', radius: 15000 },
  { name: '광주', x: '126.852', y: '35.160', radius: 12000 },
  { name: '대전', x: '127.385', y: '36.350', radius: 12000 },
  { name: '울산', x: '129.311', y: '35.539', radius: 12000 },
  { name: '수원', x: '127.009', y: '37.263', radius: 10000 },
  { name: '성남', x: '127.126', y: '37.420', radius: 8000 },
  { name: '고양', x: '126.832', y: '37.656', radius: 10000 },
  { name: '용인', x: '127.177', y: '37.241', radius: 10000 },
  { name: '창원', x: '128.681', y: '35.228', radius: 10000 },
  { name: '천안', x: '127.152', y: '36.815', radius: 10000 },
  { name: '전주', x: '127.149', y: '35.824', radius: 10000 },
  { name: '청주', x: '127.487', y: '36.642', radius: 10000 },
  { name: '제주', x: '126.531', y: '33.499', radius: 12000 },
]

async function searchKakao(query, x, y, radius, page = 1) {
  const params = new URLSearchParams({
    query,
    x, y,
    radius: String(radius),
    page: String(page),
    size: '15',
    category_group_code: 'HP8',
  })

  const res = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params}`, {
    headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
  })

  if (!res.ok) {
    throw new Error(`Kakao API ${res.status}: ${await res.text().then(t => t.slice(0, 200))}`)
  }

  return res.json()
}

function normalizeRegion(addressName) {
  if (!addressName) return '기타'
  const sido = addressName.split(' ')[0]
  if (sido.includes('서울')) {
    const gu = addressName.split(' ')[1] || ''
    const gangnam = ['강남구', '서초구', '송파구', '강동구', '용산구', '성동구', '광진구']
    return gangnam.some(g => gu.includes(g)) ? '서울강남' : '서울강북'
  }
  return sido.replace('특별시', '').replace('광역시', '').replace('특별자치시', '').replace('특별자치도', '').replace('도', '').trim()
}

function detectGlp1Drugs(name, category) {
  const drugs = []
  const text = `${name} ${category}`.toLowerCase()
  if (text.includes('위고비') || text.includes('wegovy') || text.includes('세마글루타이드')) drugs.push('wegovy')
  if (text.includes('삭센다') || text.includes('saxenda') || text.includes('리라글루타이드')) drugs.push('saxenda')
  if (text.includes('마운자로') || text.includes('mounjaro') || text.includes('티르제파타이드')) drugs.push('mounjaro')
  if (drugs.length === 0 && (text.includes('비만') || text.includes('다이어트') || text.includes('체중'))) {
    drugs.push('wegovy', 'saxenda')
  }
  return drugs
}

function mapKakaoPlace(place) {
  const drugs = detectGlp1Drugs(place.place_name, place.category_name)
  return {
    id: `kakao-${place.id}`,
    name: place.place_name,
    region: normalizeRegion(place.address_name),
    address: place.road_address_name || place.address_name,
    phone: place.phone || null,
    website: place.place_url || null,
    dataSource: 'kakao_local',
    isVerified: 0,
    glp1Drugs: JSON.stringify(drugs.length > 0 ? drugs : ['wegovy', 'saxenda']),
    hasOnlineConsultation: 0,
    latitude: parseFloat(place.y),
    longitude: parseFloat(place.x),
    naverPlaceId: null,
    googlePlaceId: null,
    kakaoPlaceId: place.id,
    categoryName: place.category_name,
  }
}

function isRelevantClinic(place) {
  const name = (place.place_name || '').toLowerCase()
  const cat = (place.category_name || '').toLowerCase()
  const combined = `${name} ${cat}`

  const positiveTerms = ['비만', '다이어트', '체중', '클리닉', '내과', '가정의학', '내분비', '피부', '성형', '에스테틱']
  const negativeTerms = ['동물', '수의', '치과', '한의', '약국', '정형', '안과', '이비인후']

  if (negativeTerms.some(t => combined.includes(t))) return false
  if (positiveTerms.some(t => combined.includes(t))) return true

  return cat.includes('병원') || cat.includes('의원')
}

async function main() {
  if (!KAKAO_KEY) {
    console.error('❌ KAKAO_REST_API_KEY 환경변수 필요')
    process.exit(1)
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const seenIds = new Set()
  const allClinics = []
  let apiCalls = 0

  for (const city of CITIES) {
    for (const keyword of KEYWORDS) {
      for (let page = 1; page <= 3; page++) {
        try {
          const data = await searchKakao(keyword, city.x, city.y, city.radius, page)
          apiCalls++
          const places = data.documents || []

          if (places.length === 0) break

          const relevant = places.filter(isRelevantClinic)
          for (const place of relevant) {
            const clinic = mapKakaoPlace(place)
            if (!seenIds.has(clinic.id)) {
              seenIds.add(clinic.id)
              allClinics.push(clinic)
            }
          }

          if (data.meta?.is_end) break
          await new Promise(r => setTimeout(r, 120))
        } catch (e) {
          console.error(`  ❌ ${city.name}/${keyword}/p${page}: ${e.message}`)
          break
        }
      }
    }
    console.log(`🏥 ${city.name}: 누적 ${allClinics.length}개 (API ${apiCalls}회)`)
  }

  console.log(`\n📊 총 ${allClinics.length}개 고유 클리닉 수집 (API ${apiCalls}회 호출)`)

  const outputPath = path.join(OUTPUT_DIR, 'clinics-kakao.json')
  const existing = fs.existsSync(outputPath)
    ? JSON.parse(fs.readFileSync(outputPath, 'utf8'))
    : { items: [] }

  const existingIds = new Set(existing.items.map(i => i.id))
  const newItems = allClinics.filter(c => !existingIds.has(c.id))

  const itemMap = new Map(existing.items.map(i => [i.id, i]))
  allClinics.forEach(c => itemMap.set(c.id, c))
  existing.items = Array.from(itemMap.values())
  existing.lastRun = new Date().toISOString()
  existing.totalCount = existing.items.length

  fs.writeFileSync(outputPath, JSON.stringify(existing, null, 2))
  console.log(`💾 JSON 저장: ${outputPath} (신규 ${newItems.length}개 / 누적 ${existing.items.length}개)`)

  let dbInserted = 0
  if (allClinics.length > 0 && isTursoConfigured()) {
    console.log(`\n🗄️  Turso DB 삽입 시작 (${allClinics.length}건)...`)
    const statements = allClinics.map(c => ({
      sql: `INSERT OR REPLACE INTO clinics
            (id, name, region, address, phone, website, data_source, is_verified,
             glp1_drugs, has_online_consultation, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        c.id, c.name, c.region, c.address, c.phone, c.website,
        c.dataSource, c.isVerified, c.glp1Drugs, c.hasOnlineConsultation,
        c.latitude, c.longitude,
      ],
    }))

    const result = await tursoBatchInsert(statements)
    dbInserted = result.inserted
    console.log(`  ✅ DB 삽입: ${dbInserted}/${allClinics.length}건`)
  } else if (!isTursoConfigured()) {
    console.log('⚠️  Turso 미설정 — JSON 파일로만 저장')
  }

  await logCollection('kakao-clinics', {
    collected: allClinics.length,
    inserted: dbInserted,
    updated: 0,
  })

  const regionStats = {}
  allClinics.forEach(c => { regionStats[c.region] = (regionStats[c.region] || 0) + 1 })
  console.log('\n📍 지역별 분포:')
  Object.entries(regionStats).sort((a, b) => b[1] - a[1]).forEach(([r, n]) => {
    console.log(`  ${r}: ${n}개`)
  })

  console.log(`\n✨ 완료! ${allClinics.length}개 병원 수집, DB ${dbInserted}건 삽입`)
}

main().catch(e => { console.error('치명적 오류:', e); process.exit(1) })
