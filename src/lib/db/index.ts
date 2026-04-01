// Turso DB client using HTTP API (no npm dependencies required)
// Uses the Turso v2/pipeline HTTP API instead of @libsql/client

const TURSO_URL = (process.env.TURSO_DB_URL ?? '').replace('libsql://', 'https://')
const TURSO_TOKEN = process.env.TURSO_DB_TOKEN ?? process.env.TURSO_AUTH_TOKEN

interface TursoArg {
  type: 'text' | 'integer' | 'null'
  value?: string
}

interface TursoResult {
  cols: { name: string }[]
  rows: (string | null)[][]
}

export async function tursoQuery(sql: string, args: (string | number | null)[] = []): Promise<TursoResult> {
  if (!TURSO_URL || !TURSO_TOKEN) {
    throw new Error('TURSO_DB_URL and TURSO_DB_TOKEN must be set')
  }

  const typedArgs: TursoArg[] = args.map((a) => {
    if (a === null) return { type: 'null' }
    return { type: 'text', value: String(a) }
  })

  const body = JSON.stringify({
    requests: [
      { type: 'execute', stmt: { sql, args: typedArgs } },
      { type: 'close' },
    ],
  })

  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body,
  })

  if (!res.ok) {
    throw new Error(`Turso HTTP error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return data.results[0].response.result as TursoResult
}

export async function tursoExecute(sql: string, args: (string | number | null)[] = []): Promise<void> {
  await tursoQuery(sql, args)
}

export * from './schema'
