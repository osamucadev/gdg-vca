import { firestoreQuery } from '@/lib/firebase/admin'

export interface HomeBlock {
  id: string
  type: string
  enabled: boolean
  order: number
  props: Record<string, unknown>
}

export async function getEnabledHomeBlocks(): Promise<HomeBlock[]> {
  const docs = await firestoreQuery(
    'homeBlocks',
    [{ field: 'enabled', op: 'EQUAL', value: true }],
    { field: 'order', direction: 'ASCENDING' },
  )

  return (docs as unknown as HomeBlock[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}
