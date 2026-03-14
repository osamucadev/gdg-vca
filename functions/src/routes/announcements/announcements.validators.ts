const VALID_KINDS = ['reminder', 'opportunity', 'highlight', 'partner', 'call', 'general']
const VALID_HOME_ZONES = ['home_banner', 'home_carousel', 'announcements_page']

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateCreateAnnouncement(body: unknown): ValidationResult {
  const errors: string[] = []

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Invalid payload'] }
  }

  const payload = body as Record<string, unknown>

  if (!payload['title'] || typeof payload['title'] !== 'string') {
    errors.push('title is required and must be a string')
  }

  if (!payload['slug'] || typeof payload['slug'] !== 'string') {
    errors.push('slug is required and must be a string')
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload['slug'] as string)) {
    errors.push('slug must be lowercase alphanumeric with hyphens only')
  }

  if (!payload['kind'] || !VALID_KINDS.includes(payload['kind'] as string)) {
    errors.push(`kind is required and must be one of: ${VALID_KINDS.join(', ')}`)
  }

  if (!payload['summary'] || typeof payload['summary'] !== 'string') {
    errors.push('summary is required and must be a string')
  }

  if (!payload['content'] || typeof payload['content'] !== 'object') {
    errors.push('content is required and must be an object')
  } else {
    const content = payload['content'] as Record<string, unknown>
    if (!content['json']) {
      errors.push('content.json is required')
    }
  }

  if (payload['homeZones'] !== undefined) {
    if (!Array.isArray(payload['homeZones'])) {
      errors.push('homeZones must be an array')
    } else {
      const invalidZones = (payload['homeZones'] as string[]).filter(
        (z) => !VALID_HOME_ZONES.includes(z),
      )
      if (invalidZones.length > 0) {
        errors.push(
          `Invalid homeZones: ${invalidZones.join(', ')}. Valid values: ${VALID_HOME_ZONES.join(', ')}`,
        )
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

export function validateUpdateAnnouncement(body: unknown): ValidationResult {
  const errors: string[] = []

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Invalid payload'] }
  }

  const payload = body as Record<string, unknown>

  if (payload['slug'] !== undefined) {
    if (typeof payload['slug'] !== 'string') {
      errors.push('slug must be a string')
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload['slug'] as string)) {
      errors.push('slug must be lowercase alphanumeric with hyphens only')
    }
  }

  if (payload['kind'] !== undefined && !VALID_KINDS.includes(payload['kind'] as string)) {
    errors.push(`kind must be one of: ${VALID_KINDS.join(', ')}`)
  }

  if (payload['homeZones'] !== undefined) {
    if (!Array.isArray(payload['homeZones'])) {
      errors.push('homeZones must be an array')
    } else {
      const invalidZones = (payload['homeZones'] as string[]).filter(
        (z) => !VALID_HOME_ZONES.includes(z),
      )
      if (invalidZones.length > 0) {
        errors.push(`Invalid homeZones: ${invalidZones.join(', ')}`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}
