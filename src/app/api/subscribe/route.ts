import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 })
    }

    // Store to Turso DB via HTTP API
    const TURSO_URL = (process.env.TURSO_DB_URL ?? '').replace('libsql://', 'https://')
    const TURSO_TOKEN = process.env.TURSO_DB_TOKEN ?? process.env.TURSO_AUTH_TOKEN

    if (!TURSO_URL || !TURSO_TOKEN) {
      return NextResponse.json({ error: 'DB 설정 오류' }, { status: 500 })
    }

    const id = randomUUID()
    const body = JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql: "INSERT OR IGNORE INTO subscribers (id, email, created_at) VALUES (?, ?, datetime('now'))",
            args: [
              { type: 'text', value: id },
              { type: 'text', value: email.toLowerCase().trim() }
            ]
          }
        },
        { type: 'close' }
      ]
    })

    const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TURSO_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body
    })

    if (!res.ok) {
      // Table might not exist yet — create it, then insert
      const createBody = JSON.stringify({
        requests: [
          {
            type: 'execute',
            stmt: {
              sql: `CREATE TABLE IF NOT EXISTS subscribers (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
              )`,
              args: []
            }
          },
          {
            type: 'execute',
            stmt: {
              sql: "INSERT OR IGNORE INTO subscribers (id, email, created_at) VALUES (?, ?, datetime('now'))",
              args: [
                { type: 'text', value: id },
                { type: 'text', value: email.toLowerCase().trim() }
              ]
            }
          },
          { type: 'close' }
        ]
      })

      const createRes = await fetch(`${TURSO_URL}/v2/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TURSO_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: createBody
      })

      if (!createRes.ok) {
        return NextResponse.json({ error: '구독 처리 중 오류가 발생했습니다.' }, { status: 500 })
      }
    }

    // TODO: Resend integration point — send welcome email when RESEND_API_KEY is configured
    // if (process.env.RESEND_API_KEY) { ... }

    return NextResponse.json({ success: true, message: '뉴스레터 구독이 완료되었습니다!' })
  } catch {
    return NextResponse.json({ error: '구독 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
