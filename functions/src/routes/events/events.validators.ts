export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateCreateEvent(body: unknown): ValidationResult {
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

  if (!payload['startAt'] || typeof payload['startAt'] !== 'string') {
    errors.push('startAt is required and must be an ISO date string')
  } else if (isNaN(Date.parse(payload['startAt'] as string))) {
    errors.push('startAt must be a valid ISO date string')
  }

  if (!payload['location'] || typeof payload['location'] !== 'object') {
    errors.push('location is required and must be an object')
  } else {
    const location = payload['location'] as Record<string, unknown>
    if (!location['name'] || typeof location['name'] !== 'string') {
      errors.push('location.name is required')
    }
    if (!location['address'] || typeof location['address'] !== 'string') {
      errors.push('location.address is required')
    }
    if (
      !location['type'] ||
      !['presential', 'online', 'hybrid'].includes(location['type'] as string)
    ) {
      errors.push('location.type must be presential, online or hybrid')
    }
  }

  return { valid: errors.length === 0, errors }
}

export function validateUpdateEvent(body: unknown): ValidationResult {
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

  if (payload['startAt'] !== undefined) {
    if (typeof payload['startAt'] !== 'string' || isNaN(Date.parse(payload['startAt'] as string))) {
      errors.push('startAt must be a valid ISO date string')
    }
  }

  if (payload['location'] !== undefined) {
    if (typeof payload['location'] !== 'object') {
      errors.push('location must be an object')
    } else {
      const location = payload['location'] as Record<string, unknown>
      if (
        location['type'] !== undefined &&
        !['presential', 'online', 'hybrid'].includes(location['type'] as string)
      ) {
        errors.push('location.type must be presential, online or hybrid')
      }
    }
  }

  return { valid: errors.length === 0, errors }
}
