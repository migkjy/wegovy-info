// scripts/collect/index.mjs
// Wegovy Hub 데이터 수집 통합 실행기
// Run: node scripts/collect/index.mjs [--rss] [--naver] [--hira]
//
// 환경변수:
//   TURSO_DB_URL, TURSO_DB_TOKEN  — DB 삽입 (없으면 JSON만 저장)
//   NAVER_CLIENT_ID, NAVER_CLIENT_SECRET  — 네이버 뉴스 수집
//   HIRA_API_KEY  — 병원 정보 수집

import { execFileSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SCRIPTS = {
  rss:   path.join(__dirname, 'rss-feeds.mjs'),
  naver: path.join(__dirname, 'naver-news.mjs'),
  hira:  path.join(__dirname, 'hira-clinics.mjs'),
}

const args = process.argv.slice(2)
const runAll = args.length === 0
const targets = runAll
  ? Object.keys(SCRIPTS)
  : args.map(a => a.replace('--', '')).filter(a => a in SCRIPTS)

if (targets.length === 0) {
  console.error('사용법: node scripts/collect/index.mjs [--rss] [--naver] [--hira]')
  process.exit(1)
}

console.log(`🚀 Wegovy Hub 데이터 수집 시작 (${new Date().toLocaleString('ko-KR')})`)
console.log(`   대상: ${targets.join(', ')}`)
console.log()

for (const target of targets) {
  console.log(`\n${'═'.repeat(50)}`)
  console.log(`▶ ${target.toUpperCase()} 수집기 실행`)
  console.log('═'.repeat(50))

  try {
    execFileSync(process.execPath, [SCRIPTS[target]], {
      stdio: 'inherit',
      env: process.env,
      timeout: 5 * 60 * 1000,  // 5분 타임아웃
    })
  } catch (e) {
    console.error(`\n❌ ${target} 실패 (종료코드: ${e.status})`)
    // 하나 실패해도 나머지 계속 실행
  }
}

console.log(`\n${'═'.repeat(50)}`)
console.log(`✅ 수집 완료 (${new Date().toLocaleString('ko-KR')})`)
