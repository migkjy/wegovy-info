// scripts/collect/hira-clinics.mjs
// 건강보험심사평가원(HIRA) 공공 Open API 기반 병원 정보 수집기
// Node.js 내장 모듈만 사용 — npm install 불필요
//
// Run: HIRA_API_KEY=xxx node scripts/collect/hira-clinics.mjs
// API 키 발급: https://www.data.go.kr/data/15001698/openapi.do
//   → 공공데이터포털 가입 후 "요양기관 기본정보 서비스" 신청 (무료, 즉시 발급)
//
// 수집 대상: 내과(01), 가정의학과(07), 내분비내과(08) — GLP-1 처방 가능 진료과

import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { isTursoConfigured, tursoBatchInsert, logCollection } from './turso-client.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, '../../.data-cache')

const HIRA_API_KEY = process.env.HIRA_API_KEY

const TARGET_SPECIALTIES = ['01', '07', '08']

const REGIONS = [
  { code: '110000', name: '서울' },
  { code: '210000', name: '부산' },
  { code: '220000', name: '대구' },
  { code: '230000', name: '인천' },
  { code: '240000', name: '광주' },
  { code: '250000', name: '대전' },
  { code: '260000', name: '울산' },
  { code: '290000', name: '세종' },
  { code: '310000', name: '경기' },
  { code: '320000', name: '강원' },
  { code: '330000', name: '충북' },
  { code: '340000', name: '충남' },
  { code: '350000', name: '전북' },
  { code: '360000', name: '전남' },
  { code: '370000', name: '경북' },
  { code: '380000', name: '경남' },
  { code: '390000', name: '제주' },
]

function fetchHiraPage(sidoCd, dgsbjtCd, pageNo = 1, numOfRows = 100) {
  return new Promise((resolve, reject) => {
    if (!HIRA_API_KEY) {
      reject(new Error('HIRA_API_KEY 환경변수 필요'))
      return
    }

    const params = new URLSearchParams({
      serviceKey: HIRA_API_KEY,
      sidoCd,
      dgsbjtCd,
      clCd: '11',
      pageNo: String(pageNo),
      numOfRows: String(numOfRows),
      _type: 'json',
    })

    const url = `https://apis.data.go.kr/B551182/MedBasisInfoService/getDetailInfo?${params}`
    const lib = url.startsWith('https') ? https : http

    lib.get(url, { timeout: 20000, headers: { 'User-Agent': 'WegovyHub/1.0' } }, (res) => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        try {
          const text = Buffer.concat(chunks).toString('utf8')
          if (text.includes('<OpenAPI_ServiceResponse>')) {
            reject(new Error(`API 오류: ${text.slice(0, 200)}`))
            return
          }
          resolve(JSON.parse(text))
        } catch (e) {
          reject(new Error(`파싱 실패: ${e.message}`))
        }
      })
    }).on('error', reject).on('timeout', () => reject(new Error('API 타임아웃')))
  })
}

function normalizeRegion(sido, sigungu) {
  const sidoClean = sido.replace('특별시', '').replace('광역시', '').replace('특별자치시', '').replace('특별자치도', '').trim()
  if (sidoClean === '서울') {
    const gu = sigungu || ''
    const 강남권 = ['강남', '서초', '송파', '강동', '용산', '성동', '광진']
    if (강남권.some(g => gu.includes(g))) return '서울강남'
    return '서울강북'
  }
  return sidoClean
}

function mapHiraItem(item, region) {
  const name = item.yadmNm || ''
  const address = [item.addr, item.addrDetail].filter(Boolean).join(' ')

  return {
    id: `hira-${item.ykiho || crypto.createHash('sha1').update(name + address).digest('hex').slice(0, 8)}`,
    name,
    region: normalizeRegion(item.sidoNm, item.sgguNm),
    address,
    phone: item.telno || null,
    website: item.hospUrl || null,
    dataSource: 'hira_api',
    isVerified: 0,
    glp1Drugs: JSON.stringify(['wegovy', 'saxenda', 'mounjaro']),
    hasOnlineConsultation: 0,
    latitude: item.YPos ? parseFloat(item.YPos) : null,
    longitude: item.XPos ? parseFloat(item.XPos) : null,
    hiraCode: item.ykiho,
    specialty: item.dgsbjtCdNm,
    rawRegion: region.name,
  }
}

async function main() {
  if (!HIRA_API_KEY) {
    console.error('❌ 환경변수 필요:')
    console.error('   HIRA_API_KEY=<공공데이터포털 API 키>')
    console.error('   발급: https://www.data.go.kr/data/15001698/openapi.do')
    console.error('   (공공데이터포털 회원가입 → "요양기관 기본정보 서비스" 활용신청 → 즉시 발급)')
    process.exit(1)
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const allClinics = []
  const seenIds = new Set()
  const runAt = new Date().toISOString()

  // MVP: 서울, 부산, 대구 먼저 → 전체 지역으로 확장 가능
  const targetRegions = REGIONS.slice(0, 3)

  for (const region of targetRegions) {
    for (const specialty of TARGET_SPECIALTIES) {
      console.log(`\n🏥 수집 중: ${region.name} / 진료과 ${specialty}`)
      try {
        const firstPage = await fetchHiraPage(region.code, specialty, 1, 100)
        const totalCount = firstPage?.response?.body?.totalCount ?? 0
        const items = firstPage?.response?.body?.items?.item ?? []

        const parsed = (Array.isArray(items) ? items : [items])
          .filter(item => item && item.yadmNm)
          .map(item => mapHiraItem(item, region))
          .filter(c => !seenIds.has(c.id))
        parsed.forEach(c => seenIds.add(c.id))
        allClinics.push(...parsed)

        console.log(`  ✅ ${parsed.length}개 (전체 ${totalCount}건 중 1페이지)`)
        await new Promise(r => setTimeout(r, 2000))
      } catch (e) {
        console.error(`  ❌ ${region.name}/${specialty} 실패: ${e.message}`)
      }
    }
  }

  // JSON 캐시 저장
  const outputPath = path.join(OUTPUT_DIR, 'clinics-hira.json')
  const existing = fs.existsSync(outputPath)
    ? JSON.parse(fs.readFileSync(outputPath, 'utf8'))
    : { items: [] }

  const existingIds = new Set(existing.items.map(i => i.id))
  const newItems = allClinics.filter(c => !existingIds.has(c.id))
  const updatedItems = allClinics.filter(c => existingIds.has(c.id))

  const itemMap = new Map(existing.items.map(i => [i.id, i]))
  updatedItems.forEach(c => itemMap.set(c.id, { ...itemMap.get(c.id), ...c }))
  newItems.forEach(c => itemMap.set(c.id, c))

  existing.items = Array.from(itemMap.values())
  existing.lastRun = runAt
  existing.totalCount = existing.items.length

  fs.writeFileSync(outputPath, JSON.stringify(existing, null, 2))
  console.log(`\n💾 JSON 저장: ${outputPath}`)
  console.log(`   신규 ${newItems.length}개 / 업데이트 ${updatedItems.length}개 / 누적 ${existing.items.length}개`)

  // Turso DB 삽입
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

  // 수집 로그
  const logPath = path.join(OUTPUT_DIR, 'collection-log.jsonl')
  fs.appendFileSync(logPath, JSON.stringify({
    runAt,
    script: 'hira-clinics',
    regions: targetRegions.map(r => r.name),
    specialties: TARGET_SPECIALTIES,
    totalCollected: allClinics.length,
    newItems: newItems.length,
    updatedItems: updatedItems.length,
    dbInserted,
  }) + '\n')

  await logCollection('hira-clinics', {
    collected: allClinics.length,
    inserted: dbInserted,
    updated: updatedItems.length,
  })

  console.log(`\n✨ 완료! ${allClinics.length}개 병원 수집, DB ${dbInserted}건 삽입`)
}

main().catch(e => { console.error('치명적 오류:', e); process.exit(1) })
