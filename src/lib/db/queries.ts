import { tursoQuery } from './index'

export interface NewsRow {
  id: string
  title: string
  url: string
  source: string
  category: string | null
  drugTags: string | null
  publishedAt: string
  summary: string | null
  isFeatured: boolean
}

export interface ClinicRow {
  id: string
  name: string
  region: string
  address: string | null
  phone: string | null
  wegovyPrice: number | null
  saxendaPrice: number | null
  mounjaroPrice: number | null
  features: string | null
  website: string | null
  latitude: number | null
  longitude: number | null
  operatingHours: string | null
  isVerified: boolean
  hasOnlineConsultation: boolean
  glp1Drugs: string | null
  dataSource: string | null
  updatedAt: string | null
}

function rowToNews(cols: { name: string }[], row: (string | null)[]): NewsRow {
  const obj: Record<string, string | null> = {}
  cols.forEach((c, i) => { obj[c.name] = row[i] })
  return {
    id: obj.id ?? '',
    title: obj.title ?? '',
    url: obj.url ?? '',
    source: obj.source ?? '',
    category: obj.category ?? null,
    drugTags: obj.drug_tags ?? null,
    publishedAt: obj.published_at ?? '',
    summary: obj.summary ?? null,
    isFeatured: obj.is_featured === '1',
  }
}

function rowToClinic(cols: { name: string }[], row: (string | null)[]): ClinicRow {
  const obj: Record<string, string | null> = {}
  cols.forEach((c, i) => { obj[c.name] = row[i] })
  return {
    id: obj.id ?? '',
    name: obj.name ?? '',
    region: obj.region ?? '',
    address: obj.address ?? null,
    phone: obj.phone ?? null,
    wegovyPrice: obj.wegovy_price ? Number(obj.wegovy_price) : null,
    saxendaPrice: obj.saxenda_price ? Number(obj.saxenda_price) : null,
    mounjaroPrice: obj.mounjaro_price ? Number(obj.mounjaro_price) : null,
    features: obj.features ?? null,
    website: obj.website ?? null,
    latitude: obj.latitude ? Number(obj.latitude) : null,
    longitude: obj.longitude ? Number(obj.longitude) : null,
    operatingHours: obj.operating_hours ?? null,
    isVerified: obj.is_verified === '1',
    hasOnlineConsultation: obj.has_online_consultation === '1',
    glp1Drugs: obj.glp1_drugs ?? null,
    dataSource: obj.data_source ?? null,
    updatedAt: obj.updated_at ?? null,
  }
}

const isTursoConfigured = () =>
  !!(process.env.TURSO_DB_URL && (process.env.TURSO_DB_TOKEN || process.env.TURSO_AUTH_TOKEN))

export async function getNewsList(
  offset = 0,
  limit = 20,
  category?: string,
): Promise<{ items: NewsRow[]; total: number }> {
  if (!isTursoConfigured()) return { items: [], total: 0 }

  try {
    const whereClause = category ? 'WHERE category = ?' : ''
    const args: (string | number)[] = category ? [category] : []

    const countResult = await tursoQuery(
      `SELECT COUNT(id) as cnt FROM news ${whereClause}`,
      args,
    )
    const total = Number(countResult.rows[0]?.[0] ?? 0)

    const dataResult = await tursoQuery(
      `SELECT id, title, url, source, category, drug_tags, published_at, summary, is_featured
       FROM news ${whereClause}
       ORDER BY published_at DESC
       LIMIT ? OFFSET ?`,
      [...args, limit, offset],
    )
    const items = dataResult.rows.map((r) => rowToNews(dataResult.cols, r))

    return { items, total }
  } catch {
    return { items: [], total: 0 }
  }
}

export async function getNewsById(id: string): Promise<NewsRow | null> {
  if (!isTursoConfigured()) return null

  try {
    const result = await tursoQuery(
      `SELECT id, title, url, source, category, drug_tags, published_at, summary, is_featured
       FROM news WHERE id = ? LIMIT 1`,
      [id],
    )
    if (result.rows.length === 0) return null
    return rowToNews(result.cols, result.rows[0])
  } catch {
    return null
  }
}

export async function getLatestNews(limit = 3): Promise<NewsRow[]> {
  if (!isTursoConfigured()) return []

  try {
    const result = await tursoQuery(
      `SELECT id, title, url, source, category, drug_tags, published_at, summary, is_featured
       FROM news ORDER BY published_at DESC LIMIT ?`,
      [limit],
    )
    return result.rows.map((r) => rowToNews(result.cols, r))
  } catch {
    return []
  }
}

export async function getClinicsList(
  offset = 0,
  limit = 50,
  region?: string,
  search?: string,
): Promise<{ items: ClinicRow[]; total: number }> {
  if (!isTursoConfigured()) return { items: [], total: 0 }

  try {
    const conditions: string[] = []
    const args: (string | number)[] = []

    if (region) {
      conditions.push('region = ?')
      args.push(region)
    }
    if (search) {
      conditions.push('(name LIKE ? OR address LIKE ?)')
      args.push(`%${search}%`, `%${search}%`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const countResult = await tursoQuery(
      `SELECT COUNT(id) as cnt FROM clinics ${whereClause}`,
      args,
    )
    const total = Number(countResult.rows[0]?.[0] ?? 0)

    const dataResult = await tursoQuery(
      `SELECT id, name, region, address, phone, wegovy_price, saxenda_price, mounjaro_price,
              features, website, latitude, longitude, operating_hours, is_verified,
              has_online_consultation, glp1_drugs, data_source, updated_at
       FROM clinics ${whereClause}
       ORDER BY name ASC
       LIMIT ? OFFSET ?`,
      [...args, limit, offset],
    )
    const items = dataResult.rows.map((r) => rowToClinic(dataResult.cols, r))

    return { items, total }
  } catch {
    return { items: [], total: 0 }
  }
}

export async function getClinicById(id: string): Promise<ClinicRow | null> {
  if (!isTursoConfigured()) return null

  try {
    const result = await tursoQuery(
      `SELECT id, name, region, address, phone, wegovy_price, saxenda_price, mounjaro_price,
              features, website, latitude, longitude, operating_hours, is_verified,
              has_online_consultation, glp1_drugs, data_source, updated_at
       FROM clinics WHERE id = ? LIMIT 1`,
      [id],
    )
    if (result.rows.length === 0) return null
    return rowToClinic(result.cols, result.rows[0])
  } catch {
    return null
  }
}

export async function getClinicRegions(): Promise<string[]> {
  if (!isTursoConfigured()) return []

  try {
    const result = await tursoQuery(
      `SELECT DISTINCT region FROM clinics ORDER BY region ASC LIMIT 50`,
    )
    return result.rows.map((r) => r[0] ?? '').filter(Boolean)
  } catch {
    return []
  }
}
