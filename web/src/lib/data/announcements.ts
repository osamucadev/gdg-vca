import { firestoreQuery } from '@/lib/firebase/admin'

export interface PublicAnnouncement {
  id: string
  title: string
  slug: string
  kind: string
  summary: string
  content: { html: string }
  image?: { url: string; alt: string }
  cta?: { label: string; url: string }
  startsAt?: { _seconds: number }
  endsAt?: { _seconds: number }
  featuredOnHome?: boolean
  homeZones?: string[]
  priority?: number
  countdownEnabled?: boolean
}

export async function getPublishedAnnouncements(): Promise<PublicAnnouncement[]> {
  const docs = await firestoreQuery(
    'announcements',
    [{ field: 'status', op: 'EQUAL', value: 'published' }],
    { field: 'priority', direction: 'DESCENDING' },
  )

  const now = Math.floor(Date.now() / 1000)

  return (docs as unknown as PublicAnnouncement[]).filter((a) => {
    if (a.startsAt && a.startsAt._seconds > now) return false
    if (a.endsAt && a.endsAt._seconds < now) return false
    return true
  })
}
