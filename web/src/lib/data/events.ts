import { firestoreQuery } from '@/lib/firebase/admin'

export interface PublicEvent {
  id: string
  title: string
  slug: string
  summary: string
  content: { html: string }
  coverImage?: { url: string; alt: string }
  gallery?: { url: string; alt: string }[]
  startAt: { _seconds: number }
  endAt?: { _seconds: number }
  location: { name: string; address: string; type: string; mapUrl?: string }
  registrationUrl?: string
  countdownEnabled?: boolean
  featuredOnHome?: boolean
  speakers?: { name: string; bio?: string; avatarUrl?: string; socialUrl?: string }[]
  partners?: { name: string; logoUrl?: string; websiteUrl?: string }[]
  seo?: { title?: string; description?: string; ogImage?: string }
}

export async function getPublishedEvents(): Promise<PublicEvent[]> {
  const docs = await firestoreQuery(
    'events',
    [{ field: 'status', op: 'EQUAL', value: 'published' }],
    { field: 'startAt', direction: 'ASCENDING' },
  )
  return docs as unknown as PublicEvent[]
}

export async function getEventBySlug(slug: string): Promise<PublicEvent | null> {
  const docs = await firestoreQuery('events', [
    { field: 'status', op: 'EQUAL', value: 'published' },
    { field: 'slug', op: 'EQUAL', value: slug },
  ])
  return (docs[0] as unknown as PublicEvent) ?? null
}
