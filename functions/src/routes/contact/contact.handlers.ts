import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import type { Request, Response } from 'express'
import { createHash } from 'crypto'

const HCAPTCHA_SECRET = process.env['HCAPTCHA_SECRET']
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

async function validateHCaptcha(token: string): Promise<boolean> {
  const res = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${HCAPTCHA_SECRET}&response=${token}`,
  })
  const data = (await res.json()) as { success: boolean }
  return data.success === true
}

async function checkRateLimit(ipHash: string): Promise<boolean> {
  const db = getFirestore()
  const ref = db.collection('rateLimits').doc(`contact_${ipHash}`)

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref)
    const now = Date.now()

    if (!doc.exists) {
      tx.set(ref, { count: 1, windowStart: now })
      return true
    }

    const data = doc.data()!
    const windowStart = data['windowStart'] as number
    const count = data['count'] as number

    if (now - windowStart > RATE_LIMIT_WINDOW_MS) {
      tx.set(ref, { count: 1, windowStart: now })
      return true
    }

    if (count >= RATE_LIMIT_MAX) {
      return false
    }

    tx.update(ref, { count: count + 1 })
    return true
  })
}

export async function submitContact(req: Request, res: Response): Promise<void> {
  const { name, email, subject, message, captchaToken } = req.body

  if (!captchaToken) {
    res.status(400).json({
      success: false,
      error: { code: 'missing_captcha', message: 'Captcha token is required' },
    })
    return
  }

  const captchaValid = await validateHCaptcha(captchaToken)
  if (!captchaValid) {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_captcha', message: 'Captcha validation failed' },
    })
    return
  }

  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
    req.socket.remoteAddress ??
    'unknown'
  const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16)

  const allowed = await checkRateLimit(ipHash)
  if (!allowed) {
    res.status(429).json({
      success: false,
      error: { code: 'rate_limit_exceeded', message: 'Too many submissions. Try again later.' },
    })
    return
  }

  if (!name || !email || !subject || !message) {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_payload', message: 'name, email, subject and message are required' },
    })
    return
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_email', message: 'Invalid email address' },
    })
    return
  }

  const db = getFirestore()
  await db.collection('contactSubmissions').add({
    name: String(name).slice(0, 100),
    email: String(email).slice(0, 200),
    subject: String(subject).slice(0, 200),
    message: String(message).slice(0, 2000),
    status: 'new',
    source: 'home_form',
    createdAt: FieldValue.serverTimestamp(),
    ipHash,
  })

  res.status(201).json({
    success: true,
    data: { message: 'Submission received' },
  })
}
