import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHash, randomUUID } from 'crypto'
import { validatePost } from '@/lib/community-validation'

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  drug TEXT NOT NULL,
  content TEXT NOT NULL,
  week INTEGER,
  weight_loss TEXT,
  ip_hash TEXT,
  status TEXT DEFAULT 'visible',
  created_at TEXT DEFAULT (datetime('now'))
)`

function getTursoConfig() {
  const TURSO_URL = (process.env.TURSO_DB_URL ?? '').replace('libsql://', 'https://')
  const TURSO_TOKEN = process.env.TURSO_DB_TOKEN ?? process.env.TURSO_AUTH_TOKEN
  return { TURSO_URL, TURSO_TOKEN }
}

async function tursoRequest(url: string, token: string, requests: unknown[]) {
  return fetch(`${url}/v2/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nickname, drug, content, week, weightLoss, turnstileToken } = body

    // Validate Turnstile token
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    if (!turnstileSecret) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Turnstile not configured' }, { status: 500 })
      }
      // Non-production: skip Turnstile verification
    } else {
      const verifyRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: turnstileSecret,
            response: turnstileToken ?? '',
          }),
        }
      )
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        return NextResponse.json(
          { error: '스팸 방지 검증에 실패했습니다. 다시 시도해주세요.' },
          { status: 400 }
        )
      }
    }

    // Validate post content
    const validationError = validatePost({ nickname, drug, content, weightLoss })
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // Validate week
    let weekInt: number | null = null
    if (week != null && week !== '') {
      weekInt = parseInt(String(week), 10)
      if (isNaN(weekInt) || weekInt < 1 || weekInt > 200) {
        return NextResponse.json(
          { error: '복용 주차는 1~200 사이여야 합니다.' },
          { status: 400 }
        )
      }
    }

    const { TURSO_URL, TURSO_TOKEN } = getTursoConfig()
    if (!TURSO_URL || !TURSO_TOKEN) {
      return NextResponse.json({ error: 'DB 설정 오류' }, { status: 500 })
    }

    // IP rate limiting: max 5 posts per IP per hour
    const rawIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
    const ipHash = createHash('sha256').update(rawIp).digest('hex').slice(0, 16)

    const rateLimitRequests = [
      {
        type: 'execute',
        stmt: {
          sql: "SELECT COUNT(*) as cnt FROM community_posts WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')",
          args: [{ type: 'text', value: ipHash }],
        },
      },
      { type: 'close' },
    ]

    const rateLimitRes = await tursoRequest(TURSO_URL, TURSO_TOKEN, rateLimitRequests)
    if (rateLimitRes.ok) {
      const rateLimitData = await rateLimitRes.json()
      const result = rateLimitData.results?.[0]
      if (result && result.type !== 'error') {
        const rows = result.response?.result?.rows ?? []
        const count = Number(rows[0]?.[0]?.value ?? 0)
        if (count >= 5) {
          return NextResponse.json(
            { error: '1시간에 최대 5개의 게시물만 등록할 수 있습니다.' },
            { status: 429 }
          )
        }
      }
    }

    const id = randomUUID()
    const weekValue =
      weekInt !== null
        ? { type: 'integer', value: String(weekInt) }
        : { type: 'null', value: null }
    const weightLossValue = weightLoss
      ? { type: 'text', value: String(weightLoss) }
      : { type: 'null', value: null }

    const insertRequests = [
      {
        type: 'execute',
        stmt: {
          sql: "INSERT INTO community_posts (id, nickname, drug, content, week, weight_loss, ip_hash, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'visible', datetime('now'))",
          args: [
            { type: 'text', value: id },
            { type: 'text', value: nickname.trim() },
            { type: 'text', value: drug },
            { type: 'text', value: content.trim() },
            weekValue,
            weightLossValue,
            { type: 'text', value: ipHash },
          ],
        },
      },
      { type: 'close' },
    ]

    const res = await tursoRequest(TURSO_URL, TURSO_TOKEN, insertRequests)

    if (!res.ok) {
      // Table might not exist — create it then retry
      const createAndInsertRequests = [
        {
          type: 'execute',
          stmt: { sql: CREATE_TABLE_SQL, args: [] },
        },
        {
          type: 'execute',
          stmt: {
            sql: "INSERT INTO community_posts (id, nickname, drug, content, week, weight_loss, ip_hash, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'visible', datetime('now'))",
            args: [
              { type: 'text', value: id },
              { type: 'text', value: nickname.trim() },
              { type: 'text', value: drug },
              { type: 'text', value: content.trim() },
              weekValue,
              weightLossValue,
              { type: 'text', value: ipHash },
            ],
          },
        },
        { type: 'close' },
      ]

      const createRes = await tursoRequest(TURSO_URL, TURSO_TOKEN, createAndInsertRequests)
      if (!createRes.ok) {
        return NextResponse.json({ error: '게시물 저장 중 오류가 발생했습니다.' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: '게시물이 등록되었습니다.' })
  } catch {
    return NextResponse.json({ error: '게시물 등록 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { TURSO_URL, TURSO_TOKEN } = getTursoConfig()
    if (!TURSO_URL || !TURSO_TOKEN) {
      return NextResponse.json({ error: 'DB 설정 오류' }, { status: 500 })
    }

    const selectRequests = [
      {
        type: 'execute',
        stmt: {
          sql: "SELECT id, nickname, drug, content, week, weight_loss, created_at FROM community_posts WHERE status = 'visible' ORDER BY created_at DESC LIMIT 20",
          args: [],
        },
      },
      { type: 'close' },
    ]

    const res = await tursoRequest(TURSO_URL, TURSO_TOKEN, selectRequests)

    if (!res.ok) {
      // Table likely doesn't exist yet — create it and return empty
      const createRequests = [
        {
          type: 'execute',
          stmt: { sql: CREATE_TABLE_SQL, args: [] },
        },
        { type: 'close' },
      ]
      await tursoRequest(TURSO_URL, TURSO_TOKEN, createRequests)
      return NextResponse.json({ posts: [] })
    }

    const data = await res.json()
    const result = data.results?.[0]

    if (!result || result.type === 'error') {
      return NextResponse.json({ posts: [] })
    }

    const cols = result.response?.result?.cols ?? []
    const rows = result.response?.result?.rows ?? []

    const colIndex = (name: string) => cols.findIndex((c: { name: string }) => c.name === name)
    const idIdx = colIndex('id')
    const nicknameIdx = colIndex('nickname')
    const drugIdx = colIndex('drug')
    const contentIdx = colIndex('content')
    const weekIdx = colIndex('week')
    const weightLossIdx = colIndex('weight_loss')
    const createdAtIdx = colIndex('created_at')

    const posts = rows.map((row: Array<{ value: string | number | null }>) => ({
      id: row[idIdx]?.value,
      nickname: row[nicknameIdx]?.value,
      drug: row[drugIdx]?.value,
      content: row[contentIdx]?.value,
      week: row[weekIdx]?.value ?? null,
      weightLoss: row[weightLossIdx]?.value ?? null,
      createdAt: row[createdAtIdx]?.value,
    }))

    return NextResponse.json({ posts })
  } catch {
    return NextResponse.json({ error: '게시물 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
