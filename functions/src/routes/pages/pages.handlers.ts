import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import type { Request, Response } from 'express'
import type { PageDocument, PageVersionDocument, UpdatePagePayload, PageId } from './pages.types'
import { VALID_PAGE_IDS } from './pages.types'

const SCHEMA_VERSION = 1

async function createVersion(
  pageId: string,
  operation: PageVersionDocument['operation'],
  snapshot: PageDocument,
  performedBy: { uid: string; name: string },
): Promise<string> {
  const db = getFirestore()
  const versionId = new Date().toISOString()
  await db.collection('pages').doc(pageId).collection('versions').doc(versionId).set({
    operation,
    snapshot,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: performedBy,
  })
  return versionId
}

async function createAuditLog(
  pageId: string,
  operation: string,
  performedBy: { uid: string; name: string; email: string },
  summary: string,
  versionId: string,
): Promise<void> {
  const db = getFirestore()
  await db.collection('auditLogs').add({
    entityType: 'page',
    entityId: pageId,
    operation,
    performedBy,
    timestamp: FieldValue.serverTimestamp(),
    summary,
    versionRef: `pages/${pageId}/versions/${versionId}`,
    metadata: null,
  })
}

export async function getPage(req: Request, res: Response): Promise<void> {
  const pageId = req.params['pageId'] as string

  if (!VALID_PAGE_IDS.includes(pageId as PageId)) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Page not found' },
    })
    return
  }

  const db = getFirestore()
  const doc = await db.collection('pages').doc(pageId).get()

  if (!doc.exists) {
    res.status(200).json({
      success: true,
      data: { id: pageId, exists: false },
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { id: doc.id, ...doc.data() },
  })
}

export async function updatePage(req: Request, res: Response): Promise<void> {
  const pageId = req.params['pageId'] as string

  if (!VALID_PAGE_IDS.includes(pageId as PageId)) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Page not found' },
    })
    return
  }

  const payload = req.body as UpdatePagePayload

  if (!payload || (!payload.blocks && !payload.title && !payload.seo)) {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_payload', message: 'At least one field is required' },
    })
    return
  }

  const db = getFirestore()
  const pageRef = db.collection('pages').doc(pageId)
  const pageDoc = await pageRef.get()

  const now = FieldValue.serverTimestamp()

  if (!pageDoc.exists) {
    const newDoc: Record<string, unknown> = {
      status: 'draft',
      schemaVersion: SCHEMA_VERSION,
      updatedAt: now,
      createdAt: now,
      updatedBy: { uid: req.user!.uid, name: req.user!.name },
      createdBy: { uid: req.user!.uid, name: req.user!.name },
    }
    if (payload.title) newDoc['title'] = payload.title
    if (payload.blocks) newDoc['blocks'] = payload.blocks
    if (payload.seo) newDoc['seo'] = payload.seo

    await pageRef.set(newDoc)
  } else {
    const updates: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: { uid: req.user!.uid, name: req.user!.name },
    }
    if (payload.title !== undefined) updates['title'] = payload.title
    if (payload.blocks !== undefined) updates['blocks'] = payload.blocks
    if (payload.seo !== undefined) updates['seo'] = payload.seo

    await pageRef.update(updates)
  }

  const savedDoc = await pageRef.get()
  const versionId = await createVersion(pageId, 'update', savedDoc.data() as PageDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    pageId,
    'update',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Atualizou página "${pageId}"`,
    versionId,
  )

  res.status(200).json({
    success: true,
    data: { id: pageId },
  })
}

export async function publishPage(req: Request, res: Response): Promise<void> {
  const pageId = req.params['pageId'] as string

  if (!VALID_PAGE_IDS.includes(pageId as PageId)) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Page not found' },
    })
    return
  }

  const db = getFirestore()
  const pageRef = db.collection('pages').doc(pageId)
  const pageDoc = await pageRef.get()

  if (!pageDoc.exists) {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_operation', message: 'Page has no content to publish' },
    })
    return
  }

  await pageRef.update({
    status: 'published',
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  })

  const updatedDoc = await pageRef.get()
  const versionId = await createVersion(pageId, 'publish', updatedDoc.data() as PageDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    pageId,
    'publish',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Publicou página "${pageId}"`,
    versionId,
  )

  res.status(200).json({
    success: true,
    data: { id: pageId, status: 'published' },
  })
}

export async function listPageVersions(req: Request, res: Response): Promise<void> {
  const pageId = req.params['pageId'] as string

  if (!VALID_PAGE_IDS.includes(pageId as PageId)) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Page not found' },
    })
    return
  }

  const db = getFirestore()
  const versionsSnapshot = await db
    .collection('pages')
    .doc(pageId)
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

export async function restorePageVersion(req: Request, res: Response): Promise<void> {
  const pageId = req.params['pageId'] as string
  const versionId = req.params['versionId'] as string

  if (!VALID_PAGE_IDS.includes(pageId as PageId)) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Page not found' },
    })
    return
  }

  const db = getFirestore()
  const versionDoc = await db
    .collection('pages')
    .doc(pageId)
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

  const snapshot = versionDoc.data()?.['snapshot'] as PageDocument
  const pageRef = db.collection('pages').doc(pageId)

  await pageRef.update({
    ...snapshot,
    status: 'draft',
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  })

  const restoredDoc = await pageRef.get()
  const newVersionId = await createVersion(pageId, 'restore', restoredDoc.data() as PageDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    pageId,
    'restore',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Restaurou página "${pageId}" para versão ${versionId}`,
    newVersionId,
  )

  res.status(200).json({
    success: true,
    data: { id: pageId, restoredFromVersion: versionId, status: 'draft' },
  })
}
