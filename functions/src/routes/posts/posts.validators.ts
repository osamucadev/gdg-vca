export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateCreatePost(body: unknown): ValidationResult {
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

  if (!payload['excerpt'] || typeof payload['excerpt'] !== 'string') {
    errors.push('excerpt is required and must be a string')
  }

  if (!payload['content'] || typeof payload['content'] !== 'object') {
    errors.push('content is required and must be an object')
  } else {
    const content = payload['content'] as Record<string, unknown>
    if (!content['json']) {
      errors.push('content.json is required')
    }
  }

  return { valid: errors.length === 0, errors }
}

export function validateUpdatePost(body: unknown): ValidationResult {
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

  return { valid: errors.length === 0, errors }
}
