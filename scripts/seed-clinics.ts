import { clinics } from '../src/data/clinics';

const TURSO_URL = (process.env.TURSO_DB_URL ?? '').replace('libsql://', 'https://');
const TURSO_TOKEN = process.env.TURSO_DB_TOKEN ?? process.env.TURSO_AUTH_TOKEN;

async function seedClinics() {
  console.log(`Seeding ${clinics.length} clinics...`);
  
  const requests: any[] = [];
  
  for (const c of clinics) {
    requests.push({
      type: 'execute',
      stmt: {
        sql: `INSERT OR REPLACE INTO clinics (id, name, region, address, phone, wegovy_price, saxenda_price, mounjaro_price, features, website, data_source, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', datetime('now'))`,
        args: [
          { type: 'text', value: c.id },
          { type: 'text', value: c.name },
          { type: 'text', value: c.region },
          { type: 'text', value: c.address },
          { type: 'text', value: c.phone },
          c.wegovyPrice ? { type: 'integer', value: String(c.wegovyPrice) } : { type: 'null' },
          c.saxendaPrice ? { type: 'integer', value: String(c.saxendaPrice) } : { type: 'null' },
          c.mounjaroPrice ? { type: 'integer', value: String(c.mounjaroPrice) } : { type: 'null' },
          { type: 'text', value: JSON.stringify(c.features) },
          c.website ? { type: 'text', value: c.website } : { type: 'null' },
        ],
      },
    });
  }
  
  requests.push({ type: 'close' });

  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) {
    throw new Error(`Turso error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const okCount = data.results.filter((r: any) => r.type === 'ok').length;
  const errCount = data.results.filter((r: any) => r.type === 'error').length;
  
  console.log(`Done: ${okCount} succeeded, ${errCount} failed`);
  
  if (errCount > 0) {
    const errors = data.results.filter((r: any) => r.type === 'error');
    errors.forEach((e: any) => console.error('Error:', JSON.stringify(e)));
  }
}

seedClinics().catch(console.error);
