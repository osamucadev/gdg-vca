import { firestoreQuery } from '@/lib/firebase/admin'

export interface PublicPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: { html: string }
  coverImage?: { url: string; alt: string }
  tags?: string[]
  category?: string
  relatedEventId?: string
  showInCommunityHistory?: boolean
  historyDate?: { _seconds: number }
  featuredOnHome?: boolean
  publishedAt: { _seconds: number }
  seo?: { title?: string; description?: string; ogImage?: string }
}

export async function getPublishedPosts(): Promise<PublicPost[]> {
  const docs = await firestoreQuery(
    'posts',
    [{ field: 'status', op: 'EQUAL', value: 'published' }],
    { field: 'publishedAt', direction: 'DESCENDING' },
  )
  return docs as unknown as PublicPost[]
}

export async function getPostBySlug(slug: string): Promise<PublicPost | null> {
  const docs = await firestoreQuery('posts', [
    { field: 'status', op: 'EQUAL', value: 'published' },
    { field: 'slug', op: 'EQUAL', value: slug },
  ])
  return (docs[0] as unknown as PublicPost) ?? null
}

export async function getCommunityHistoryPosts(): Promise<PublicPost[]> {
  const docs = await firestoreQuery(
    'posts',
    [
      { field: 'status', op: 'EQUAL', value: 'published' },
      { field: 'showInCommunityHistory', op: 'EQUAL', value: true },
    ],
    { field: 'historyDate', direction: 'DESCENDING' },
  )
  return docs as unknown as PublicPost[]
}
