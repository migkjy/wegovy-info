// scripts/collect/geocode-clinics.mjs
// 카카오 로컬 API로 clinics 테이블의 주소 → 위경도 좌표 변환
// Node.js 내장 모듈만 사용
//
// Run: KAKAO_REST_API_KEY=xxx node scripts/collect/geocode-clinics.mjs
// API 문서: https://developers.kakao.com/docs/latest/ko/local/dev-guide#address-coord

import https from 'https'
import { isTursoConfigured, tursoQuery, tursoExecute, logCollection } from './turso-client.mjs'

const KAKAO_KEY = process.env.KAKAO_REST_API_KEY

function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    if (!KAKAO_KEY) {
      reject(new Error('KAKAO_REST_API_KEY 환경변수 필요'))
      return
    }

    const encodedAddr = encodeURIComponent(address)
    const options = {
      hostname: 'dapi.kakao.com',
      path: `/v2/local/search/address.json?query=${encodedAddr}`,
      method: 'GET',
      headers: {
        Authorization: `KakaoAK ${KAKAO_KEY}`,
        'User-Agent': 'WegovyHub/1.0',
      },
    }

    const req = https.request(options, (res) => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Kakao HTTP ${res.statusCode}`))
          return
        }
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          if (data.documents && data.documents.length > 0) {
            const doc = data.documents[0]
            resolve({
              latitude: parseFloat(doc.y),
              longitude: parseFloat(doc.x),
              roadAddress: doc.road_address?.address_name || null,
              jibunAddress: doc.address?.address_name || null,
            })
          } else {
            resolve(null)
          }
        } catch (e) {
          reject(new Error(`파싱 실패: ${e.message}`))
        }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

// 주소 검색 실패 시 키워드 검색 폴백
function searchKeyword(keyword) {
  return new Promise((resolve, reject) => {
    const encodedKw = encodeURIComponent(keyword)
    const options = {
      hostname: 'dapi.kakao.com',
      path: `/v2/local/search/keyword.json?query=${encodedKw}&size=1`,
      method: 'GET',
      headers: {
        Authorization: `KakaoAK ${KAKAO_KEY}`,
        'User-Agent': 'WegovyHub/1.0',
      },
    }

    const req = https.request(options, (res) => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Kakao HTTP ${res.statusCode}`))
          return
        }
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          if (data.documents && data.documents.length > 0) {
            const doc = data.documents[0]
            resolve({
              latitude: parseFloat(doc.y),
              longitude: parseFloat(doc.x),
              roadAddress: doc.road_address_name || null,
              jibunAddress: doc.address_name || null,
            })
          } else {
            resolve(null)
          }
        } catch (e) {
          reject(new Error(`파싱 실패: ${e.message}`))
        }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

async function main() {
  if (!KAKAO_KEY) {
    console.error('❌ KAKAO_REST_API_KEY 환경변수 필요')
    console.error('   발급: https://developers.kakao.com/')
    process.exit(1)
  }

  if (!isTursoConfigured()) {
    console.error('❌ Turso DB 미설정')
    process.exit(1)
  }

  // 좌표 없는 클리닉 조회 (컬럼 명시, LIMIT 적용)
  const result = await tursoQuery(
    'SELECT id, name, address FROM clinics WHERE latitude IS NULL AND address IS NOT NULL LIMIT 50'
  )

  const clinics = result.rows.map(r => ({ id: r[0], name: r[1], address: r[2] }))
  console.log(`📍 좌표 변환 대상: ${clinics.length}개 클리닉`)

  if (clinics.length === 0) {
    console.log('✅ 모든 클리닉에 좌표가 설정되어 있습니다')
    return
  }

  let updated = 0
  let failed = 0
  const errors = []

  for (const clinic of clinics) {
    console.log(`  🔍 ${clinic.name} — ${clinic.address}`)
    try {
      // 1차: 주소 검색
      let geo = await geocodeAddress(clinic.address)

      // 2차: 주소 실패 시 병원명+주소 키워드 검색
      if (!geo) {
        console.log(`    → 주소 검색 실패, 키워드 검색 시도: "${clinic.name}"`)
        geo = await searchKeyword(`${clinic.name} ${clinic.address.split(' ').slice(0, 3).join(' ')}`)
      }

      if (geo) {
        await tursoExecute(
          'UPDATE clinics SET latitude = ?, longitude = ? WHERE id = ?',
          [geo.latitude, geo.longitude, clinic.id]
        )
        console.log(`    ✅ (${geo.latitude}, ${geo.longitude})`)
        updated++
      } else {
        console.log(`    ❌ 좌표를 찾을 수 없음`)
        errors.push(`${clinic.name}: 좌표 미발견`)
        failed++
      }

      // Rate limit (카카오 API: 초당 10회)
      await new Promise(r => setTimeout(r, 150))
    } catch (e) {
      console.error(`    ❌ 오류: ${e.message}`)
      errors.push(`${clinic.name}: ${e.message}`)
      failed++
    }
  }

  await logCollection('geocode-clinics', {
    collected: clinics.length,
    inserted: 0,
    updated,
    errors: errors.length > 0 ? errors.join('; ') : null,
  })

  console.log(`\n✨ 완료! 좌표 설정: ${updated}개 성공, ${failed}개 실패 (전체 ${clinics.length}개)`)
}

main().catch(e => { console.error('치명적 오류:', e); process.exit(1) })
