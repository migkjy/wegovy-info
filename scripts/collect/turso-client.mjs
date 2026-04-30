// scripts/collect/turso-client.mjs
// 수집 스크립트 공통 Turso HTTP 클라이언트 (Node.js native fetch 사용)

const TURSO_URL = (process.env.TURSO_DB_URL ?? '').replace('libsql://', 'https://')
const TURSO_TOKEN = process.env.TURSO_DB_TOKEN ?? process.env.TURSO_AUTH_TOKEN

export function isTursoConfigured() {
  return !!(TURSO_URL && TURSO_TOKEN)
}

export async function tursoExecute(sql, args = []) {
  if (!TURSO_URL || !TURSO_TOKEN) {
    throw new Error('TURSO_DB_URL / TURSO_DB_TOKEN 환경변수 필요')
  }

  const typedArgs = args.map(a => {
    if (a === null || a === undefined) return { type: 'null' }
    if (typeof a === 'number' && Number.isInteger(a)) return { type: 'integer', value: String(a) }
    return { type: 'text', value: String(a) }
  })

  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: typedArgs } },
        { type: 'close' },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Turso HTTP ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  const result = data.results?.[0]?.response?.result
  if (!result && data.results?.[0]?.response?.type === 'error') {
    throw new Error(`Turso SQL error: ${JSON.stringify(data.results[0].response.error)}`)
  }
  return result
}

export async function tursoQuery(sql, args = []) {
  const result = await tursoExecute(sql, args)
  return {
    cols: result?.cols ?? [],
    rows: (result?.rows ?? []).map(row =>
      row.map(cell => (cell?.type === 'null' ? null : cell?.value ?? null))
    ),
    rowsRead: result?.rows_read ?? 0,
  }
}

export async function tursoBatchInsert(statements) {
  if (!TURSO_URL || !TURSO_TOKEN) return { inserted: 0 }
  if (statements.length === 0) return { inserted: 0 }

  let inserted = 0
  const BATCH_SIZE = 10

  for (let i = 0; i < statements.length; i += BATCH_SIZE) {
    const batch = statements.slice(i, i + BATCH_SIZE)
    const requests = batch.map(({ sql, args }) => ({
      type: 'execute',
      stmt: {
        sql,
        args: (args ?? []).map(a => {
          if (a === null || a === undefined) return { type: 'null' }
          if (typeof a === 'number' && Number.isInteger(a)) return { type: 'integer', value: String(a) }
          return { type: 'text', value: String(a) }
        }),
      },
    }))
    requests.push({ type: 'close' })

    try {
      const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TURSO_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      })

      if (res.ok) {
        const data = await res.json()
        inserted += data.results
          .filter(r => r?.response?.result?.affected_row_count > 0)
          .length
      }
    } catch (e) {
      console.error(`  DB 배치 삽입 오류 (${i}~${i + batch.length}): ${e.message}`)
    }
  }

  return { inserted, total: statements.length }
}

export async function logCollection(source, stats) {
  if (!isTursoConfigured()) return

  const id = `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  try {
    await tursoExecute(
      `INSERT INTO data_collection_logs (id, source, records_collected, records_inserted, records_updated, errors)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, source, stats.collected ?? 0, stats.inserted ?? 0, stats.updated ?? 0, stats.errors ?? null]
    )
  } catch (e) {
    console.error(`수집 로그 저장 실패: ${e.message}`)
  }
}
