export type HomeZone = 'home_banner' | 'home_carousel' | 'announcements_page'

export interface AnnouncementContent {
  json: object
  html: string
}

export interface AnnouncementImage {
  url: string
  alt: string
}

export interface AnnouncementCta {
  label: string
  url: string
}

export interface AnnouncementSeo {
  title?: string
  description?: string
  ogImage?: string
}

export interface AnnouncementDocument {
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  visibility: 'public' | 'private'
  kind: string
  summary: string
  content: AnnouncementContent
  image?: AnnouncementImage
  cta?: AnnouncementCta
  startsAt?: FirebaseFirestore.Timestamp
  endsAt?: FirebaseFirestore.Timestamp
  featuredOnHome?: boolean
  homeZones?: HomeZone[]
  priority?: number
  countdownEnabled?: boolean
  seo?: AnnouncementSeo
  schemaVersion: number
  createdAt: FirebaseFirestore.Timestamp
  updatedAt: FirebaseFirestore.Timestamp
  publishedAt?: FirebaseFirestore.Timestamp
  createdBy: { uid: string; name: string }
  updatedBy: { uid: string; name: string }
}

export interface AnnouncementVersionDocument {
  operation: 'create' | 'update' | 'publish' | 'archive' | 'restore'
  snapshot: AnnouncementDocument
  createdAt: FirebaseFirestore.Timestamp
  createdBy: { uid: string; name: string }
}

export interface CreateAnnouncementPayload {
  title: string
  slug: string
  kind: string
  summary: string
  content: { json: object }
  visibility?: 'public' | 'private'
  image?: AnnouncementImage
  cta?: AnnouncementCta
  startsAt?: string
  endsAt?: string
  featuredOnHome?: boolean
  homeZones?: HomeZone[]
  priority?: number
  countdownEnabled?: boolean
  seo?: AnnouncementSeo
}

export interface UpdateAnnouncementPayload extends Partial<CreateAnnouncementPayload> {}
