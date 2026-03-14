export interface EventLocation {
  name: string
  address: string
  type: 'presential' | 'online' | 'hybrid'
  mapUrl?: string
}

export interface EventSpeaker {
  name: string
  bio?: string
  avatarUrl?: string
  socialUrl?: string
}

export interface EventPartner {
  name: string
  logoUrl?: string
  websiteUrl?: string
}

export interface EventContent {
  json: object
  html: string
}

export interface EventImage {
  url: string
  alt: string
}

export interface EventSeo {
  title?: string
  description?: string
  ogImage?: string
}

export interface EventDocument {
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  visibility: 'public' | 'private'
  summary: string
  content: EventContent
  coverImage?: EventImage
  gallery?: EventImage[]
  startAt: FirebaseFirestore.Timestamp
  endAt?: FirebaseFirestore.Timestamp
  location: EventLocation
  registrationUrl?: string
  countdownEnabled?: boolean
  featuredOnHome?: boolean
  homeOrder?: number
  partners?: EventPartner[]
  speakers?: EventSpeaker[]
  seo?: EventSeo
  schemaVersion: number
  createdAt: FirebaseFirestore.Timestamp
  updatedAt: FirebaseFirestore.Timestamp
  publishedAt?: FirebaseFirestore.Timestamp
  createdBy: { uid: string; name: string }
  updatedBy: { uid: string; name: string }
}

export interface EventVersionDocument {
  operation: 'create' | 'update' | 'publish' | 'archive' | 'restore'
  snapshot: EventDocument
  createdAt: FirebaseFirestore.Timestamp
  createdBy: { uid: string; name: string }
}

export interface CreateEventPayload {
  title: string
  slug: string
  summary: string
  content: { json: object }
  startAt: string
  location: EventLocation
  endAt?: string
  visibility?: 'public' | 'private'
  registrationUrl?: string
  countdownEnabled?: boolean
  featuredOnHome?: boolean
  homeOrder?: number
  coverImage?: EventImage
  gallery?: EventImage[]
  partners?: EventPartner[]
  speakers?: EventSpeaker[]
  seo?: EventSeo
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}
