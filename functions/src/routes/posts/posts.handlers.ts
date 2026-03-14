import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { Request, Response } from 'express'
import type {
  PostDocument,
  PostVersionDocument,
  CreatePostPayload,
  UpdatePostPayload,
} from './posts.types'
import { validateCreatePost, validateUpdatePost } from './posts.validators'

const SCHEMA_VERSION = 1

async function generatePostHtml(json: object): Promise<string> {
  return JSON.stringify(json)
}

async function ensureSlugUnique(slug: string, excludePostId?: string): Promise<boolean> {
  const db = getFirestore()
  const slugDoc = await db.collection('slugs').doc(slug).get()
  if (!slugDoc.exists) return true
  const data = slugDoc.data()
  if (excludePostId && data?.['entityId'] === excludePostId) return true
  return false
}

async function createVersion(
  postId: string,
  operation: PostVersionDocument['operation'],
  snapshot: PostDocument,
  performedBy: { uid: string; name: string },
): Promise<string> {
  const db = getFirestore()
  const versionId = new Date().toISOString()
  await db.collection('posts').doc(postId).collection('versions').doc(versionId).set({
    operation,
    snapshot,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: performedBy,
  })
  return versionId
}

async function createAuditLog(
  postId: string,
  operation: string,
  performedBy: { uid: string; name: string; email: string },
  summary: string,
  versionId: string,
  metadata?: object,
): Promise<void> {
  const db = getFirestore()
  await db.collection('auditLogs').add({
    entityType: 'post',
    entityId: postId,
    operation,
    performedBy,
    timestamp: FieldValue.serverTimestamp(),
    summary,
    versionRef: `posts/${postId}/versions/${versionId}`,
    metadata: metadata ?? null,
  })
}

export async function createPost(req: Request, res: Response): Promise<void> {
  const validation = validateCreatePost(req.body)
  if (!validation.valid) {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_payload', message: validation.errors.join(', ') },
    })
    return
  }

  const payload = req.body as CreatePostPayload
  const db = getFirestore()

  const slugAvailable = await ensureSlugUnique(payload.slug)
  if (!slugAvailable) {
    res.status(409).json({
      success: false,
      error: { code: 'slug_conflict', message: 'This slug is already in use' },
    })
    return
  }

  const html = await generatePostHtml(payload.content.json)
  const now = FieldValue.serverTimestamp()
  const postRef = db.collection('posts').doc()
  const postId = postRef.id

  const postDoc: Record<string, unknown> = {
    title: payload.title,
    slug: payload.slug,
    status: 'draft',
    visibility: payload.visibility ?? 'public',
    excerpt: payload.excerpt,
    content: { json: payload.content.json, html },
    tags: payload.tags ?? [],
    showInCommunityHistory: payload.showInCommunityHistory ?? false,
    featuredOnHome: payload.featuredOnHome ?? false,
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    createdBy: { uid: req.user!.uid, name: req.user!.name },
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  }

  if (payload.coverImage) postDoc['coverImage'] = payload.coverImage
  if (payload.category) postDoc['category'] = payload.category
  if (payload.relatedEventId) postDoc['relatedEventId'] = payload.relatedEventId
  if (payload.historyDate)
    postDoc['historyDate'] = Timestamp.fromDate(new Date(payload.historyDate))
  if (payload.seo) postDoc['seo'] = payload.seo

  await db.runTransaction(async (tx) => {
    tx.set(postRef, postDoc)
    tx.set(db.collection('slugs').doc(payload.slug), {
      entityType: 'post',
      entityId: postId,
      createdAt: now,
    })
  })

  const savedDoc = await postRef.get()
  const versionId = await createVersion(postId, 'create', savedDoc.data() as PostDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    postId,
    'create',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Criou post "${payload.title}"`,
    versionId,
  )

  res.status(201).json({
    success: true,
    data: { id: postId, slug: payload.slug, status: 'draft' },
  })
}

export async function getPost(req: Request, res: Response): Promise<void> {
  const postId = req.params['postId'] as string
  const db = getFirestore()
  const doc = await db.collection('posts').doc(postId).get()
  if (!doc.exists) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Post not found' },
    })
    return
  }
  res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } })
}

export async function listPosts(req: Request, res: Response): Promise<void> {
  const db = getFirestore()
  const status = req.query['status'] as string | undefined
  const limit = Math.min(parseInt(req.query['limit'] as string) || 20, 100)

  let query = db.collection('posts').orderBy('createdAt', 'desc')
  if (status) {
    query = query.where('status', '==', status) as typeof query
  }

  const snapshot = await query.limit(limit).get()
  const posts = snapshot.docs.map((doc) => ({
    id: doc.id,
    title: doc.data()['title'],
    slug: doc.data()['slug'],
    status: doc.data()['status'],
    excerpt: doc.data()['excerpt'],
    featuredOnHome: doc.data()['featuredOnHome'],
    showInCommunityHistory: doc.data()['showInCommunityHistory'],
    coverImage: doc.data()['coverImage'] ?? null,
    publishedAt: doc.data()['publishedAt'] ?? null,
    createdAt: doc.data()['createdAt'],
    updatedAt: doc.data()['updatedAt'],
  }))

  res.status(200).json({ success: true, data: { posts, total: posts.length } })
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  const postId = req.params['postId'] as string
  const validation = validateUpdatePost(req.body)
  if (!validation.valid) {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_payload', message: validation.errors.join(', ') },
    })
    return
  }

  const payload = req.body as UpdatePostPayload
  const db = getFirestore()
  const postRef = db.collection('posts').doc(postId)
  const postDoc = await postRef.get()

  if (!postDoc.exists) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Post not found' },
    })
    return
  }

  if (postDoc.data()?.['status'] === 'archived') {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_operation', message: 'Archived posts cannot be edited' },
    })
    return
  }

  if (payload.slug && payload.slug !== postDoc.data()?.['slug']) {
    const slugAvailable = await ensureSlugUnique(payload.slug, postId)
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
  if (payload.excerpt) updates['excerpt'] = payload.excerpt
  if (payload.tags !== undefined) updates['tags'] = payload.tags
  if (payload.category !== undefined) updates['category'] = payload.category
  if (payload.relatedEventId !== undefined) updates['relatedEventId'] = payload.relatedEventId
  if (payload.showInCommunityHistory !== undefined)
    updates['showInCommunityHistory'] = payload.showInCommunityHistory
  if (payload.featuredOnHome !== undefined) updates['featuredOnHome'] = payload.featuredOnHome
  if (payload.coverImage !== undefined) updates['coverImage'] = payload.coverImage
  if (payload.seo !== undefined) updates['seo'] = payload.seo
  if (payload.visibility) updates['visibility'] = payload.visibility
  if (payload.historyDate)
    updates['historyDate'] = Timestamp.fromDate(new Date(payload.historyDate))
  if (payload.content) {
    const html = await generatePostHtml(payload.content.json)
    updates['content'] = { json: payload.content.json, html }
  }

  if (payload.slug && payload.slug !== postDoc.data()?.['slug']) {
    const oldSlug = postDoc.data()?.['slug']
    await db.runTransaction(async (tx) => {
      tx.update(postRef, updates)
      tx.delete(db.collection('slugs').doc(oldSlug))
      tx.set(db.collection('slugs').doc(payload.slug!), {
        entityType: 'post',
        entityId: postId,
        createdAt: FieldValue.serverTimestamp(),
      })
    })
  } else {
    await postRef.update(updates)
  }

  const updatedDoc = await postRef.get()
  const versionId = await createVersion(postId, 'update', updatedDoc.data() as PostDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    postId,
    'update',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Atualizou post "${updatedDoc.data()?.['title']}"`,
    versionId,
  )

  res.status(200).json({ success: true, data: { id: postId } })
}

export async function publishPost(req: Request, res: Response): Promise<void> {
  const postId = req.params['postId'] as string
  const db = getFirestore()
  const postRef = db.collection('posts').doc(postId)
  const postDoc = await postRef.get()

  if (!postDoc.exists) {
    res
      .status(404)
      .json({ success: false, error: { code: 'not_found', message: 'Post not found' } })
    return
  }

  if (postDoc.data()?.['status'] === 'archived') {
    res
      .status(400)
      .json({
        success: false,
        error: { code: 'invalid_operation', message: 'Archived posts cannot be published' },
      })
    return
  }

  await postRef.update({
    status: 'published',
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  })

  const updatedDoc = await postRef.get()
  const versionId = await createVersion(postId, 'publish', updatedDoc.data() as PostDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    postId,
    'publish',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Publicou post "${updatedDoc.data()?.['title']}"`,
    versionId,
  )

  res.status(200).json({ success: true, data: { id: postId, status: 'published' } })
}

export async function archivePost(req: Request, res: Response): Promise<void> {
  const postId = req.params['postId'] as string
  const db = getFirestore()
  const postRef = db.collection('posts').doc(postId)
  const postDoc = await postRef.get()

  if (!postDoc.exists) {
    res
      .status(404)
      .json({ success: false, error: { code: 'not_found', message: 'Post not found' } })
    return
  }

  await postRef.update({
    status: 'archived',
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  })

  const updatedDoc = await postRef.get()
  const versionId = await createVersion(postId, 'archive', updatedDoc.data() as PostDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    postId,
    'archive',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Arquivou post "${updatedDoc.data()?.['title']}"`,
    versionId,
  )

  res.status(200).json({ success: true, data: { id: postId, status: 'archived' } })
}

export async function listPostVersions(req: Request, res: Response): Promise<void> {
  const postId = req.params['postId'] as string
  const db = getFirestore()

  const postDoc = await db.collection('posts').doc(postId).get()
  if (!postDoc.exists) {
    res
      .status(404)
      .json({ success: false, error: { code: 'not_found', message: 'Post not found' } })
    return
  }

  const versionsSnapshot = await db
    .collection('posts')
    .doc(postId)
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

export async function restorePostVersion(req: Request, res: Response): Promise<void> {
  const postId = req.params['postId'] as string
  const versionId = req.params['versionId'] as string
  const db = getFirestore()

  const versionDoc = await db
    .collection('posts')
    .doc(postId)
    .collection('versions')
    .doc(versionId)
    .get()

  if (!versionDoc.exists) {
    res
      .status(404)
      .json({ success: false, error: { code: 'not_found', message: 'Version not found' } })
    return
  }

  const snapshot = versionDoc.data()?.['snapshot'] as PostDocument
  const postRef = db.collection('posts').doc(postId)

  await postRef.update({
    ...snapshot,
    status: 'draft',
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  })

  const restoredDoc = await postRef.get()
  const newVersionId = await createVersion(postId, 'restore', restoredDoc.data() as PostDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    postId,
    'restore',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Restaurou post "${snapshot.title}" para versão ${versionId}`,
    newVersionId,
    { restoredFromVersion: versionId },
  )

  res
    .status(200)
    .json({ success: true, data: { id: postId, restoredFromVersion: versionId, status: 'draft' } })
}
