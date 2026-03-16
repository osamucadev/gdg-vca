const PROJECT_ID = process.env['FIREBASE_PROJECT_ID']!
const API_KEY = process.env['FIREBASE_API_KEY']!
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

export async function firestoreQuery(
  collection: string,
  filters: { field: string; op: string; value: unknown }[],
  orderBy?: { field: string; direction: 'ASCENDING' | 'DESCENDING' },
  limit?: number,
): Promise<Record<string, unknown>[]> {
  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId: collection }],
  }

  if (filters.length > 0) {
    const conditions = filters.map((f) => ({
      fieldFilter: {
        field: { fieldPath: f.field },
        op: f.op,
        value: toFirestoreValue(f.value),
      },
    }))

    structuredQuery['where'] =
      conditions.length === 1
        ? conditions[0]
        : { compositeFilter: { op: 'AND', filters: conditions } }
  }

  if (orderBy) {
    structuredQuery['orderBy'] = [
      { field: { fieldPath: orderBy.field }, direction: orderBy.direction },
    ]
  }

  if (limit) {
    structuredQuery['limit'] = limit
  }

  const res = await fetch(`${FIRESTORE_BASE}:runQuery?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('Firestore query failed:', res.status, text)
    return []
  }

  const results = await res.json()

  return results
    .filter((r: Record<string, unknown>) => r['document'])
    .map((r: Record<string, unknown>) => {
      const doc = r['document'] as Record<string, unknown>
      const name = doc['name'] as string
      const id = name.split('/').pop()!
      return { id, ...fromFirestoreFields(doc['fields'] as Record<string, unknown>) }
    })
}

function toFirestoreValue(value: unknown): Record<string, unknown> {
  if (value === null) return { nullValue: null }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') return { integerValue: String(value) }
  if (typeof value === 'string') return { stringValue: value }
  return { stringValue: String(value) }
}

function fromFirestoreFields(fields: Record<string, unknown>): Record<string, unknown> {
  if (!fields) return {}
  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(fields)) {
    result[key] = fromFirestoreValue(val as Record<string, unknown>)
  }
  return result
}

function fromFirestoreValue(val: Record<string, unknown>): unknown {
  if ('stringValue' in val) return val['stringValue']
  if ('integerValue' in val) return parseInt(val['integerValue'] as string)
  if ('doubleValue' in val) return val['doubleValue']
  if ('booleanValue' in val) return val['booleanValue']
  if ('nullValue' in val) return null
  if ('timestampValue' in val) {
    const ts = val['timestampValue'] as string
    const seconds = Math.floor(new Date(ts).getTime() / 1000)
    return { _seconds: seconds }
  }
  if ('arrayValue' in val) {
    const arr = val['arrayValue'] as Record<string, unknown>
    const values = (arr['values'] as Record<string, unknown>[]) ?? []
    return values.map(fromFirestoreValue)
  }
  if ('mapValue' in val) {
    const map = val['mapValue'] as Record<string, unknown>
    return fromFirestoreFields(map['fields'] as Record<string, unknown>)
  }
  return null
}
