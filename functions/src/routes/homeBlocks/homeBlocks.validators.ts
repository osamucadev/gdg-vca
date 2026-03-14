import type { BlockType } from './homeBlocks.types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateTopBarProps(props: Record<string, unknown>): ValidationResult {
  const errors: string[] = []
  const validVariants = ['info', 'warning', 'success', 'brand']

  if (!props['text'] || typeof props['text'] !== 'string') {
    errors.push('props.text is required')
  }
  if (!props['variant'] || !validVariants.includes(props['variant'] as string)) {
    errors.push(`props.variant must be one of: ${validVariants.join(', ')}`)
  }

  return { valid: errors.length === 0, errors }
}

export function validateHeroProps(props: Record<string, unknown>): ValidationResult {
  const errors: string[] = []
  const validAligns = ['left', 'center', 'right']
  const validOverlays = ['none', 'light', 'dark']
  const validThemes = ['light', 'dark', 'brand', 'accent']
  const validTargets = ['same_tab', 'new_tab']

  if (!props['title'] || typeof props['title'] !== 'string') {
    errors.push('props.title is required')
  }
  if (props['contentAlign'] && !validAligns.includes(props['contentAlign'] as string)) {
    errors.push(`props.contentAlign must be one of: ${validAligns.join(', ')}`)
  }
  if (props['overlayVariant'] && !validOverlays.includes(props['overlayVariant'] as string)) {
    errors.push(`props.overlayVariant must be one of: ${validOverlays.join(', ')}`)
  }
  if (props['themeVariant'] && !validThemes.includes(props['themeVariant'] as string)) {
    errors.push(`props.themeVariant must be one of: ${validThemes.join(', ')}`)
  }
  if (props['ctaTarget'] && !validTargets.includes(props['ctaTarget'] as string)) {
    errors.push(`props.ctaTarget must be one of: ${validTargets.join(', ')}`)
  }
  if (
    props['secondaryCtaTarget'] &&
    !validTargets.includes(props['secondaryCtaTarget'] as string)
  ) {
    errors.push(`props.secondaryCtaTarget must be one of: ${validTargets.join(', ')}`)
  }

  return { valid: errors.length === 0, errors }
}

export function validateCountdownBannerProps(props: Record<string, unknown>): ValidationResult {
  const errors: string[] = []
  const validModes = ['linked_event', 'next_upcoming']

  if (!props['title'] || typeof props['title'] !== 'string') {
    errors.push('props.title is required')
  }
  if (!props['mode'] || !validModes.includes(props['mode'] as string)) {
    errors.push(`props.mode must be one of: ${validModes.join(', ')}`)
  }
  if (props['mode'] === 'linked_event' && !props['linkedEventId']) {
    errors.push('props.linkedEventId is required when mode is linked_event')
  }
  if (props['mode'] === 'next_upcoming' && props['linkedEventId']) {
    errors.push('props.linkedEventId must be absent when mode is next_upcoming')
  }

  return { valid: errors.length === 0, errors }
}

export function validateEventsCarouselProps(props: Record<string, unknown>): ValidationResult {
  const errors: string[] = []
  const validModes = ['upcoming', 'past', 'mixed', 'featured']

  if (!props['mode'] || !validModes.includes(props['mode'] as string)) {
    errors.push(`props.mode must be one of: ${validModes.join(', ')}`)
  }

  return { valid: errors.length === 0, errors }
}

export function validateAnnouncementsCarouselProps(
  props: Record<string, unknown>,
): ValidationResult {
  const errors: string[] = []
  const validZones = ['home_banner', 'home_carousel', 'announcements_page']

  if (!props['zone'] || !validZones.includes(props['zone'] as string)) {
    errors.push(`props.zone must be one of: ${validZones.join(', ')}`)
  }

  return { valid: errors.length === 0, errors }
}

export function validateImageCarouselProps(props: Record<string, unknown>): ValidationResult {
  const errors: string[] = []
  const validAspectRatios = ['landscape', 'square', 'banner']

  if (!Array.isArray(props['images'])) {
    errors.push('props.images must be an array')
  }
  if (
    props['aspectRatioVariant'] &&
    !validAspectRatios.includes(props['aspectRatioVariant'] as string)
  ) {
    errors.push(`props.aspectRatioVariant must be one of: ${validAspectRatios.join(', ')}`)
  }

  return { valid: errors.length === 0, errors }
}

export function validateCtaBannerProps(props: Record<string, unknown>): ValidationResult {
  const errors: string[] = []
  const validAligns = ['left', 'center', 'right']
  const validBgs = ['light', 'dark', 'brand', 'accent']
  const validOverlays = ['none', 'light', 'dark']

  if (!props['title'] || typeof props['title'] !== 'string') {
    errors.push('props.title is required')
  }
  if (props['contentAlign'] && !validAligns.includes(props['contentAlign'] as string)) {
    errors.push(`props.contentAlign must be one of: ${validAligns.join(', ')}`)
  }
  if (props['backgroundVariant'] && !validBgs.includes(props['backgroundVariant'] as string)) {
    errors.push(`props.backgroundVariant must be one of: ${validBgs.join(', ')}`)
  }
  if (props['overlayVariant'] && !validOverlays.includes(props['overlayVariant'] as string)) {
    errors.push(`props.overlayVariant must be one of: ${validOverlays.join(', ')}`)
  }

  return { valid: errors.length === 0, errors }
}

export function validateContactFormProps(_props: Record<string, unknown>): ValidationResult {
  return { valid: true, errors: [] }
}

export function validateBlockProps(
  type: BlockType,
  props: Record<string, unknown>,
): ValidationResult {
  switch (type) {
    case 'top-bar':
      return validateTopBarProps(props)
    case 'hero':
      return validateHeroProps(props)
    case 'countdown-banner':
      return validateCountdownBannerProps(props)
    case 'events-carousel':
      return validateEventsCarouselProps(props)
    case 'announcements-carousel':
      return validateAnnouncementsCarouselProps(props)
    case 'image-carousel':
      return validateImageCarouselProps(props)
    case 'cta-banner':
      return validateCtaBannerProps(props)
    case 'contact-form':
      return validateContactFormProps(props)
    default:
      return { valid: false, errors: ['Unknown block type'] }
  }
}
