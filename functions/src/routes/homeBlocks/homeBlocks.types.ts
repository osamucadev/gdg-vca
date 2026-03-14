export type BlockType =
  | 'top-bar'
  | 'hero'
  | 'countdown-banner'
  | 'events-carousel'
  | 'announcements-carousel'
  | 'image-carousel'
  | 'cta-banner'
  | 'contact-form'

export type ContentAlign = 'left' | 'center' | 'right'
export type OverlayVariant = 'none' | 'light' | 'dark'
export type ThemeVariant = 'light' | 'dark' | 'brand' | 'accent'
export type BackgroundVariant = 'light' | 'dark' | 'brand' | 'accent'
export type CtaTarget = 'same_tab' | 'new_tab'
export type AspectRatioVariant = 'landscape' | 'square' | 'banner'
export type TopBarVariant = 'info' | 'warning' | 'success' | 'brand'
export type EventsCarouselMode = 'upcoming' | 'past' | 'mixed' | 'featured'
export type CountdownMode = 'linked_event' | 'next_upcoming'
export type HomeZone = 'home_banner' | 'home_carousel' | 'announcements_page'

export interface BlockImage {
  url: string
  alt: string
}

export interface CarouselImage {
  url: string
  alt: string
  href?: string
  target?: CtaTarget
}

export interface TopBarProps {
  text: string
  variant: TopBarVariant
  linkLabel?: string
  linkUrl?: string
  linkTarget?: CtaTarget
  closable?: boolean
}

export interface HeroProps {
  eyebrow?: string
  title: string
  subtitle?: string
  contentAlign?: ContentAlign
  desktopImage?: BlockImage
  mobileImage?: BlockImage
  overlayVariant?: OverlayVariant
  themeVariant?: ThemeVariant
  ctaLabel?: string
  ctaUrl?: string
  ctaTarget?: CtaTarget
  secondaryCtaLabel?: string
  secondaryCtaUrl?: string
  secondaryCtaTarget?: CtaTarget
}

export interface CountdownBannerProps {
  eyebrow?: string
  title: string
  label?: string
  mode: CountdownMode
  linkedEventId?: string
  desktopImage?: BlockImage
  mobileImage?: BlockImage
  overlayVariant?: OverlayVariant
  themeVariant?: ThemeVariant
  ctaLabel?: string
  ctaUrl?: string
  ctaTarget?: CtaTarget
}

export interface EventsCarouselProps {
  title?: string
  mode: EventsCarouselMode
  maxItems?: number
  ctaLabel?: string
  ctaUrl?: string
}

export interface AnnouncementsCarouselProps {
  title?: string
  maxItems?: number
  zone: HomeZone
  ctaLabel?: string
  ctaUrl?: string
}

export interface ImageCarouselProps {
  title?: string
  images: CarouselImage[]
  autoplay?: boolean
  aspectRatioVariant?: AspectRatioVariant
}

export interface CtaBannerProps {
  eyebrow?: string
  title: string
  subtitle?: string
  contentAlign?: ContentAlign
  backgroundVariant?: BackgroundVariant
  desktopImage?: BlockImage
  mobileImage?: BlockImage
  overlayVariant?: OverlayVariant
  ctaLabel?: string
  ctaUrl?: string
  ctaTarget?: CtaTarget
}

export interface ContactFormProps {
  title?: string
  subtitle?: string
  submitLabel?: string
  successMessage?: string
  privacyNote?: string
}

export type BlockProps =
  | TopBarProps
  | HeroProps
  | CountdownBannerProps
  | EventsCarouselProps
  | AnnouncementsCarouselProps
  | ImageCarouselProps
  | CtaBannerProps
  | ContactFormProps

export interface HomeBlockDocument {
  type: BlockType
  enabled: boolean
  order: number
  schemaVersion: number
  props: BlockProps
  createdAt?: FirebaseFirestore.Timestamp
  updatedAt: FirebaseFirestore.Timestamp
  createdBy?: { uid: string; name: string }
  updatedBy: { uid: string; name: string }
}

export interface HomeBlockVersionDocument {
  operation: 'update' | 'restore'
  snapshot: HomeBlockDocument
  createdAt: FirebaseFirestore.Timestamp
  createdBy: { uid: string; name: string }
}

export interface UpdateHomeBlockPayload {
  enabled?: boolean
  order?: number
  props?: Record<string, unknown>
}

export const VALID_BLOCK_TYPES: BlockType[] = [
  'top-bar',
  'hero',
  'countdown-banner',
  'events-carousel',
  'announcements-carousel',
  'image-carousel',
  'cta-banner',
  'contact-form',
]
