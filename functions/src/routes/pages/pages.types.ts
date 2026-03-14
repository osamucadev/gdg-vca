export type PageId = 'home' | 'about' | 'community' | 'contact' | 'code-of-conduct'

export interface PageSeo {
  title?: string
  description?: string
  ogImage?: string
}

export interface PageDocument {
  status: 'draft' | 'published' | 'archived'
  schemaVersion: number
  title?: string
  blocks: Record<string, unknown>
  seo?: PageSeo
  createdAt: FirebaseFirestore.Timestamp
  updatedAt: FirebaseFirestore.Timestamp
  publishedAt?: FirebaseFirestore.Timestamp
  createdBy?: { uid: string; name: string }
  updatedBy: { uid: string; name: string }
}

export interface PageVersionDocument {
  operation: 'update' | 'publish' | 'restore'
  snapshot: PageDocument
  createdAt: FirebaseFirestore.Timestamp
  createdBy: { uid: string; name: string }
}

export interface UpdatePagePayload {
  title?: string
  blocks?: Record<string, unknown>
  seo?: PageSeo
}

export const VALID_PAGE_IDS: PageId[] = ['home', 'about', 'community', 'contact', 'code-of-conduct']
