import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { Request, Response } from 'express'
import type {
  EventDocument,
  EventVersionDocument,
  CreateEventPayload,
  UpdateEventPayload,
} from './events.types'
import { validateCreateEvent, validateUpdateEvent } from './events.validators'

const SCHEMA_VERSION = 1

async function generateEventHtml(json: object): Promise<string> {
  return JSON.stringify(json)
}

async function ensureSlugUnique(slug: string, excludeEventId?: string): Promise<boolean> {
  const db = getFirestore()
  const slugDoc = await db.collection('slugs').doc(slug).get()

  if (!slugDoc.exists) return true

  const data = slugDoc.data()
  if (excludeEventId && data?.['entityId'] === excludeEventId) return true

  return false
}

async function createVersion(
  eventId: string,
  operation: EventVersionDocument['operation'],
  snapshot: EventDocument,
  performedBy: { uid: string; name: string },
): Promise<string> {
  const db = getFirestore()
  const versionId = new Date().toISOString()

  await db.collection('events').doc(eventId).collection('versions').doc(versionId).set({
    operation,
    snapshot,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: performedBy,
  })

  return versionId
}

async function createAuditLog(
  eventId: string,
  operation: string,
  performedBy: { uid: string; name: string; email: string },
  summary: string,
  versionId: string,
  metadata?: object,
): Promise<void> {
  const db = getFirestore()

  await db.collection('auditLogs').add({
    entityType: 'event',
    entityId: eventId,
    operation,
    performedBy,
    timestamp: FieldValue.serverTimestamp(),
    summary,
    versionRef: `events/${eventId}/versions/${versionId}`,
    metadata: metadata ?? null,
  })
}

export async function createEvent(req: Request, res: Response): Promise<void> {
  const validation = validateCreateEvent(req.body)

  if (!validation.valid) {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_payload', message: validation.errors.join(', ') },
    })
    return
  }

  const payload = req.body as CreateEventPayload
  const db = getFirestore()

  const slugAvailable = await ensureSlugUnique(payload.slug)
  if (!slugAvailable) {
    res.status(409).json({
      success: false,
      error: { code: 'slug_conflict', message: 'This slug is already in use' },
    })
    return
  }

  const html = await generateEventHtml(payload.content.json)
  const now = FieldValue.serverTimestamp()
  const eventRef = db.collection('events').doc()
  const eventId = eventRef.id

  const eventDoc: Record<string, unknown> = {
    title: payload.title,
    slug: payload.slug,
    status: 'draft',
    visibility: payload.visibility ?? 'public',
    summary: payload.summary,
    content: { json: payload.content.json, html },
    startAt: Timestamp.fromDate(new Date(payload.startAt)),
    location: payload.location,
    countdownEnabled: payload.countdownEnabled ?? false,
    featuredOnHome: payload.featuredOnHome ?? false,
    gallery: payload.gallery ?? [],
    partners: payload.partners ?? [],
    speakers: payload.speakers ?? [],
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    createdBy: { uid: req.user!.uid, name: req.user!.name },
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  }

  if (payload.endAt) eventDoc['endAt'] = Timestamp.fromDate(new Date(payload.endAt))
  if (payload.registrationUrl) eventDoc['registrationUrl'] = payload.registrationUrl
  if (payload.homeOrder !== undefined) eventDoc['homeOrder'] = payload.homeOrder
  if (payload.coverImage) eventDoc['coverImage'] = payload.coverImage
  if (payload.seo) eventDoc['seo'] = payload.seo

  await db.runTransaction(async (tx) => {
    tx.set(eventRef, eventDoc)
    tx.set(db.collection('slugs').doc(payload.slug), {
      entityType: 'event',
      entityId: eventId,
      createdAt: now,
    })
  })

  const savedDoc = await eventRef.get()
  const versionId = await createVersion(eventId, 'create', savedDoc.data() as EventDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    eventId,
    'create',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Criou evento "${payload.title}"`,
    versionId,
  )

  res.status(201).json({
    success: true,
    data: { id: eventId, slug: payload.slug, status: 'draft' },
  })
}

export async function getEvent(req: Request, res: Response): Promise<void> {
  const eventId = req.params['eventId'] as string
  const db = getFirestore()

  const doc = await db.collection('events').doc(eventId).get()

  if (!doc.exists) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Event not found' },
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { id: doc.id, ...doc.data() },
  })
}

export async function listEvents(req: Request, res: Response): Promise<void> {
  const db = getFirestore()
  const status = req.query['status'] as string | undefined
  const limit = Math.min(parseInt(req.query['limit'] as string) || 20, 100)

  let query = db.collection('events').orderBy('startAt', 'desc')

  if (status) {
    query = query.where('status', '==', status) as typeof query
  }

  const snapshot = await query.limit(limit).get()

  const events = snapshot.docs.map((doc) => ({
    id: doc.id,
    title: doc.data()['title'],
    slug: doc.data()['slug'],
    status: doc.data()['status'],
    startAt: doc.data()['startAt'],
    featuredOnHome: doc.data()['featuredOnHome'],
    coverImage: doc.data()['coverImage'] ?? null,
    createdAt: doc.data()['createdAt'],
    updatedAt: doc.data()['updatedAt'],
  }))

  res.status(200).json({
    success: true,
    data: { events, total: events.length },
  })
}

export async function updateEvent(req: Request, res: Response): Promise<void> {
  const eventId = req.params['eventId'] as string
  const validation = validateUpdateEvent(req.body)

  if (!validation.valid) {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_payload', message: validation.errors.join(', ') },
    })
    return
  }

  const payload = req.body as UpdateEventPayload
  const db = getFirestore()

  const eventRef = db.collection('events').doc(eventId)
  const eventDoc = await eventRef.get()

  if (!eventDoc.exists) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Event not found' },
    })
    return
  }

  if (eventDoc.data()?.['status'] === 'archived') {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_operation', message: 'Archived events cannot be edited' },
    })
    return
  }

  if (payload.slug && payload.slug !== eventDoc.data()?.['slug']) {
    const slugAvailable = await ensureSlugUnique(payload.slug, eventId)
    if (!slugAvailable) {
      res.status(409).json({
        success: false,
        error: { code: 'slug_conflict', message: 'This slug is already in use' },
      })
      return
    }
  }

  const updates: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  }

  if (payload.title) updates['title'] = payload.title
  if (payload.summary) updates['summary'] = payload.summary
  if (payload.startAt) updates['startAt'] = Timestamp.fromDate(new Date(payload.startAt))
  if (payload.endAt) updates['endAt'] = Timestamp.fromDate(new Date(payload.endAt))
  if (payload.location) updates['location'] = payload.location
  if (payload.registrationUrl !== undefined) updates['registrationUrl'] = payload.registrationUrl
  if (payload.countdownEnabled !== undefined) updates['countdownEnabled'] = payload.countdownEnabled
  if (payload.featuredOnHome !== undefined) updates['featuredOnHome'] = payload.featuredOnHome
  if (payload.homeOrder !== undefined) updates['homeOrder'] = payload.homeOrder
  if (payload.coverImage !== undefined) updates['coverImage'] = payload.coverImage
  if (payload.gallery !== undefined) updates['gallery'] = payload.gallery
  if (payload.partners !== undefined) updates['partners'] = payload.partners
  if (payload.speakers !== undefined) updates['speakers'] = payload.speakers
  if (payload.seo !== undefined) updates['seo'] = payload.seo
  if (payload.visibility) updates['visibility'] = payload.visibility

  if (payload.content) {
    const html = await generateEventHtml(payload.content.json)
    updates['content'] = { json: payload.content.json, html }
  }

  if (payload.slug && payload.slug !== eventDoc.data()?.['slug']) {
    const oldSlug = eventDoc.data()?.['slug']
    await db.runTransaction(async (tx) => {
      tx.update(eventRef, updates)
      tx.delete(db.collection('slugs').doc(oldSlug))
      tx.set(db.collection('slugs').doc(payload.slug!), {
        entityType: 'event',
        entityId: eventId,
        createdAt: FieldValue.serverTimestamp(),
      })
    })
  } else {
    await eventRef.update(updates)
  }

  const updatedDoc = await eventRef.get()
  const versionId = await createVersion(eventId, 'update', updatedDoc.data() as EventDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    eventId,
    'update',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Atualizou evento "${updatedDoc.data()?.['title']}"`,
    versionId,
  )

  res.status(200).json({
    success: true,
    data: { id: eventId },
  })
}

export async function publishEvent(req: Request, res: Response): Promise<void> {
  const eventId = req.params['eventId'] as string
  const db = getFirestore()

  const eventRef = db.collection('events').doc(eventId)
  const eventDoc = await eventRef.get()

  if (!eventDoc.exists) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Event not found' },
    })
    return
  }

  if (eventDoc.data()?.['status'] === 'archived') {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_operation', message: 'Archived events cannot be published' },
    })
    return
  }

  await eventRef.update({
    status: 'published',
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  })

  const updatedDoc = await eventRef.get()
  const versionId = await createVersion(eventId, 'publish', updatedDoc.data() as EventDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    eventId,
    'publish',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Publicou evento "${updatedDoc.data()?.['title']}"`,
    versionId,
  )

  res.status(200).json({
    success: true,
    data: { id: eventId, status: 'published' },
  })
}

export async function archiveEvent(req: Request, res: Response): Promise<void> {
  const eventId = req.params['eventId'] as string
  const db = getFirestore()

  const eventRef = db.collection('events').doc(eventId)
  const eventDoc = await eventRef.get()

  if (!eventDoc.exists) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Event not found' },
    })
    return
  }

  await eventRef.update({
    status: 'archived',
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  })

  const updatedDoc = await eventRef.get()
  const versionId = await createVersion(eventId, 'archive', updatedDoc.data() as EventDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    eventId,
    'archive',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Arquivou evento "${updatedDoc.data()?.['title']}"`,
    versionId,
  )

  res.status(200).json({
    success: true,
    data: { id: eventId, status: 'archived' },
  })
}

export async function listEventVersions(req: Request, res: Response): Promise<void> {
  const eventId = req.params['eventId'] as string
  const db = getFirestore()

  const eventDoc = await db.collection('events').doc(eventId).get()
  if (!eventDoc.exists) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Event not found' },
    })
    return
  }

  const versionsSnapshot = await db
    .collection('events')
    .doc(eventId)
    .collection('versions')
    .orderBy('createdAt', 'desc')
    .get()

  const versions = versionsSnapshot.docs.map((doc) => ({
    versionId: doc.id,
    operation: doc.data()['operation'],
    createdAt: doc.data()['createdAt'],
    createdBy: doc.data()['createdBy'],
  }))

  res.status(200).json({
    success: true,
    data: { versions },
  })
}

export async function restoreEventVersion(req: Request, res: Response): Promise<void> {
  const eventId = req.params['eventId'] as string
  const versionId = req.params['versionId'] as string
  const db = getFirestore()

  const versionDoc = await db
    .collection('events')
    .doc(eventId)
    .collection('versions')
    .doc(versionId)
    .get()

  if (!versionDoc.exists) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Version not found' },
    })
    return
  }

  const snapshot = versionDoc.data()?.['snapshot'] as EventDocument
  const eventRef = db.collection('events').doc(eventId)

  await eventRef.update({
    ...snapshot,
    status: 'draft',
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  })

  const restoredDoc = await eventRef.get()
  const newVersionId = await createVersion(
    eventId,
    'restore',
    restoredDoc.data() as EventDocument,
    { uid: req.user!.uid, name: req.user!.name },
  )

  await createAuditLog(
    eventId,
    'restore',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Restaurou evento "${snapshot.title}" para versão ${versionId}`,
    newVersionId,
    { restoredFromVersion: versionId },
  )

  res.status(200).json({
    success: true,
    data: { id: eventId, restoredFromVersion: versionId, status: 'draft' },
  })
}
