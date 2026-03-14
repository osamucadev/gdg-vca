export interface PostContent {
  json: object
  html: string
}

export interface PostImage {
  url: string
  alt: string
}

export interface PostSeo {
  title?: string
  description?: string
  ogImage?: string
}

export interface PostDocument {
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  visibility: 'public' | 'private'
  excerpt: string
  content: PostContent
  coverImage?: PostImage
  tags?: string[]
  category?: string
  relatedEventId?: string
  showInCommunityHistory?: boolean
  historyDate?: FirebaseFirestore.Timestamp
  featuredOnHome?: boolean
  seo?: PostSeo
  schemaVersion: number
  createdAt: FirebaseFirestore.Timestamp
  updatedAt: FirebaseFirestore.Timestamp
  publishedAt?: FirebaseFirestore.Timestamp
  createdBy: { uid: string; name: string }
  updatedBy: { uid: string; name: string }
}

export interface PostVersionDocument {
  operation: 'create' | 'update' | 'publish' | 'archive' | 'restore'
  snapshot: PostDocument
  createdAt: FirebaseFirestore.Timestamp
  createdBy: { uid: string; name: string }
}

export interface CreatePostPayload {
  title: string
  slug: string
  excerpt: string
  content: { json: object }
  visibility?: 'public' | 'private'
  coverImage?: PostImage
  tags?: string[]
  category?: string
  relatedEventId?: string
  showInCommunityHistory?: boolean
  historyDate?: string
  featuredOnHome?: boolean
  seo?: PostSeo
}

export interface UpdatePostPayload extends Partial<CreatePostPayload> {}
