import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { Request, Response } from 'express'
import type {
  AnnouncementDocument,
  AnnouncementVersionDocument,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
} from './announcements.types'
import { validateCreateAnnouncement, validateUpdateAnnouncement } from './announcements.validators'

const SCHEMA_VERSION = 1

async function generateAnnouncementHtml(json: object): Promise<string> {
  return JSON.stringify(json)
}

async function ensureSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const db = getFirestore()
  const slugDoc = await db.collection('slugs').doc(slug).get()
  if (!slugDoc.exists) return true
  const data = slugDoc.data()
  if (excludeId && data?.['entityId'] === excludeId) return true
  return false
}

async function createVersion(
  announcementId: string,
  operation: AnnouncementVersionDocument['operation'],
  snapshot: AnnouncementDocument,
  performedBy: { uid: string; name: string },
): Promise<string> {
  const db = getFirestore()
  const versionId = new Date().toISOString()
  await db
    .collection('announcements')
    .doc(announcementId)
    .collection('versions')
    .doc(versionId)
    .set({
      operation,
      snapshot,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: performedBy,
    })
  return versionId
}

async function createAuditLog(
  announcementId: string,
  operation: string,
  performedBy: { uid: string; name: string; email: string },
  summary: string,
  versionId: string,
  metadata?: object,
): Promise<void> {
  const db = getFirestore()
  await db.collection('auditLogs').add({
    entityType: 'announcement',
    entityId: announcementId,
    operation,
    performedBy,
    timestamp: FieldValue.serverTimestamp(),
    summary,
    versionRef: `announcements/${announcementId}/versions/${versionId}`,
    metadata: metadata ?? null,
  })
}

export async function createAnnouncement(req: Request, res: Response): Promise<void> {
  const validation = validateCreateAnnouncement(req.body)
  if (!validation.valid) {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_payload', message: validation.errors.join(', ') },
    })
    return
  }

  const payload = req.body as CreateAnnouncementPayload
  const db = getFirestore()

  const slugAvailable = await ensureSlugUnique(payload.slug)
  if (!slugAvailable) {
    res.status(409).json({
      success: false,
      error: { code: 'slug_conflict', message: 'This slug is already in use' },
    })
    return
  }

  const html = await generateAnnouncementHtml(payload.content.json)
  const now = FieldValue.serverTimestamp()
  const ref = db.collection('announcements').doc()
  const announcementId = ref.id

  const doc: Record<string, unknown> = {
    title: payload.title,
    slug: payload.slug,
    status: 'draft',
    visibility: payload.visibility ?? 'public',
    kind: payload.kind,
    summary: payload.summary,
    content: { json: payload.content.json, html },
    featuredOnHome: payload.featuredOnHome ?? false,
    homeZones: payload.homeZones ?? [],
    priority: payload.priority ?? 0,
    countdownEnabled: payload.countdownEnabled ?? false,
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    createdBy: { uid: req.user!.uid, name: req.user!.name },
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  }

  if (payload.image) doc['image'] = payload.image
  if (payload.cta) doc['cta'] = payload.cta
  if (payload.startsAt) doc['startsAt'] = Timestamp.fromDate(new Date(payload.startsAt))
  if (payload.endsAt) doc['endsAt'] = Timestamp.fromDate(new Date(payload.endsAt))
  if (payload.seo) doc['seo'] = payload.seo

  await db.runTransaction(async (tx) => {
    tx.set(ref, doc)
    tx.set(db.collection('slugs').doc(payload.slug), {
      entityType: 'announcement',
      entityId: announcementId,
      createdAt: now,
    })
  })

  const savedDoc = await ref.get()
  const versionId = await createVersion(
    announcementId,
    'create',
    savedDoc.data() as AnnouncementDocument,
    { uid: req.user!.uid, name: req.user!.name },
  )

  await createAuditLog(
    announcementId,
    'create',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Criou aviso "${payload.title}"`,
    versionId,
  )

  res.status(201).json({
    success: true,
    data: { id: announcementId, slug: payload.slug, status: 'draft' },
  })
}

export async function getAnnouncement(req: Request, res: Response): Promise<void> {
  const id = req.params['id'] as string
  const db = getFirestore()
  const doc = await db.collection('announcements').doc(id).get()
  if (!doc.exists) {
    res
      .status(404)
      .json({ success: false, error: { code: 'not_found', message: 'Announcement not found' } })
    return
  }
  res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } })
}

export async function listAnnouncements(req: Request, res: Response): Promise<void> {
  const db = getFirestore()
  const status = req.query['status'] as string | undefined
  const limit = Math.min(parseInt(req.query['limit'] as string) || 20, 100)

  let query = db.collection('announcements').orderBy('createdAt', 'desc')
  if (status) {
    query = query.where('status', '==', status) as typeof query
  }

  const snapshot = await query.limit(limit).get()
  const announcements = snapshot.docs.map((doc) => ({
    id: doc.id,
    title: doc.data()['title'],
    slug: doc.data()['slug'],
    status: doc.data()['status'],
    kind: doc.data()['kind'],
    summary: doc.data()['summary'],
    priority: doc.data()['priority'],
    featuredOnHome: doc.data()['featuredOnHome'],
    startsAt: doc.data()['startsAt'] ?? null,
    endsAt: doc.data()['endsAt'] ?? null,
    createdAt: doc.data()['createdAt'],
    updatedAt: doc.data()['updatedAt'],
  }))

  res.status(200).json({ success: true, data: { announcements, total: announcements.length } })
}

export async function updateAnnouncement(req: Request, res: Response): Promise<void> {
  const id = req.params['id'] as string
  const validation = validateUpdateAnnouncement(req.body)
  if (!validation.valid) {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_payload', message: validation.errors.join(', ') },
    })
    return
  }

  const payload = req.body as UpdateAnnouncementPayload
  const db = getFirestore()
  const ref = db.collection('announcements').doc(id)
  const docSnap = await ref.get()

  if (!docSnap.exists) {
    res
      .status(404)
      .json({ success: false, error: { code: 'not_found', message: 'Announcement not found' } })
    return
  }

  if (docSnap.data()?.['status'] === 'archived') {
    res
      .status(400)
      .json({
        success: false,
        error: { code: 'invalid_operation', message: 'Archived announcements cannot be edited' },
      })
    return
  }

  if (payload.slug && payload.slug !== docSnap.data()?.['slug']) {
    const slugAvailable = await ensureSlugUnique(payload.slug, id)
    if (!slugAvailable) {
      res
        .status(409)
        .json({
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
  if (payload.kind) updates['kind'] = payload.kind
  if (payload.summary) updates['summary'] = payload.summary
  if (payload.visibility) updates['visibility'] = payload.visibility
  if (payload.featuredOnHome !== undefined) updates['featuredOnHome'] = payload.featuredOnHome
  if (payload.homeZones !== undefined) updates['homeZones'] = payload.homeZones
  if (payload.priority !== undefined) updates['priority'] = payload.priority
  if (payload.countdownEnabled !== undefined) updates['countdownEnabled'] = payload.countdownEnabled
  if (payload.image !== undefined) updates['image'] = payload.image
  if (payload.cta !== undefined) updates['cta'] = payload.cta
  if (payload.seo !== undefined) updates['seo'] = payload.seo
  if (payload.startsAt) updates['startsAt'] = Timestamp.fromDate(new Date(payload.startsAt))
  if (payload.endsAt) updates['endsAt'] = Timestamp.fromDate(new Date(payload.endsAt))
  if (payload.content) {
    const html = await generateAnnouncementHtml(payload.content.json)
    updates['content'] = { json: payload.content.json, html }
  }

  if (payload.slug && payload.slug !== docSnap.data()?.['slug']) {
    const oldSlug = docSnap.data()?.['slug']
    await db.runTransaction(async (tx) => {
      tx.update(ref, updates)
      tx.delete(db.collection('slugs').doc(oldSlug))
      tx.set(db.collection('slugs').doc(payload.slug!), {
        entityType: 'announcement',
        entityId: id,
        createdAt: FieldValue.serverTimestamp(),
      })
    })
  } else {
    await ref.update(updates)
  }

  const updatedDoc = await ref.get()
  const versionId = await createVersion(id, 'update', updatedDoc.data() as AnnouncementDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    id,
    'update',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Atualizou aviso "${updatedDoc.data()?.['title']}"`,
    versionId,
  )

  res.status(200).json({ success: true, data: { id } })
}

export async function publishAnnouncement(req: Request, res: Response): Promise<void> {
  const id = req.params['id'] as string
  const db = getFirestore()
  const ref = db.collection('announcements').doc(id)
  const docSnap = await ref.get()

  if (!docSnap.exists) {
    res
      .status(404)
      .json({ success: false, error: { code: 'not_found', message: 'Announcement not found' } })
    return
  }

  if (docSnap.data()?.['status'] === 'archived') {
    res
      .status(400)
      .json({
        success: false,
        error: { code: 'invalid_operation', message: 'Archived announcements cannot be published' },
      })
    return
  }

  await ref.update({
    status: 'published',
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  })

  const updatedDoc = await ref.get()
  const versionId = await createVersion(id, 'publish', updatedDoc.data() as AnnouncementDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    id,
    'publish',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Publicou aviso "${updatedDoc.data()?.['title']}"`,
    versionId,
  )

  res.status(200).json({ success: true, data: { id, status: 'published' } })
}

export async function archiveAnnouncement(req: Request, res: Response): Promise<void> {
  const id = req.params['id'] as string
  const db = getFirestore()
  const ref = db.collection('announcements').doc(id)
  const docSnap = await ref.get()

  if (!docSnap.exists) {
    res
      .status(404)
      .json({ success: false, error: { code: 'not_found', message: 'Announcement not found' } })
    return
  }

  await ref.update({
    status: 'archived',
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  })

  const updatedDoc = await ref.get()
  const versionId = await createVersion(id, 'archive', updatedDoc.data() as AnnouncementDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    id,
    'archive',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Arquivou aviso "${updatedDoc.data()?.['title']}"`,
    versionId,
  )

  res.status(200).json({ success: true, data: { id, status: 'archived' } })
}

export async function listAnnouncementVersions(req: Request, res: Response): Promise<void> {
  const id = req.params['id'] as string
  const db = getFirestore()

  const docSnap = await db.collection('announcements').doc(id).get()
  if (!docSnap.exists) {
    res
      .status(404)
      .json({ success: false, error: { code: 'not_found', message: 'Announcement not found' } })
    return
  }

  const versionsSnapshot = await db
    .collection('announcements')
    .doc(id)
    .collection('versions')
    .orderBy('createdAt', 'desc')
    .get()

  const versions = versionsSnapshot.docs.map((doc) => ({
    versionId: doc.id,
    operation: doc.data()['operation'],
    createdAt: doc.data()['createdAt'],
    createdBy: doc.data()['createdBy'],
  }))

  res.status(200).json({ success: true, data: { versions } })
}

export async function restoreAnnouncementVersion(req: Request, res: Response): Promise<void> {
  const id = req.params['id'] as string
  const versionId = req.params['versionId'] as string
  const db = getFirestore()

  const versionDoc = await db
    .collection('announcements')
    .doc(id)
    .collection('versions')
    .doc(versionId)
    .get()

  if (!versionDoc.exists) {
    res
      .status(404)
      .json({ success: false, error: { code: 'not_found', message: 'Version not found' } })
    return
  }

  const snapshot = versionDoc.data()?.['snapshot'] as AnnouncementDocument
  const ref = db.collection('announcements').doc(id)

  await ref.update({
    ...snapshot,
    status: 'draft',
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  })

  const restoredDoc = await ref.get()
  const newVersionId = await createVersion(
    id,
    'restore',
    restoredDoc.data() as AnnouncementDocument,
    { uid: req.user!.uid, name: req.user!.name },
  )

  await createAuditLog(
    id,
    'restore',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Restaurou aviso "${snapshot.title}" para versão ${versionId}`,
    newVersionId,
    { restoredFromVersion: versionId },
  )

  res
    .status(200)
    .json({ success: true, data: { id, restoredFromVersion: versionId, status: 'draft' } })
}
