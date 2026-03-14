import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import type { Request, Response } from 'express'
import type {
  HomeBlockDocument,
  HomeBlockVersionDocument,
  UpdateHomeBlockPayload,
  BlockType,
} from './homeBlocks.types'
import { validateBlockProps } from './homeBlocks.validators'

const SCHEMA_VERSION = 1

async function createVersion(
  blockId: string,
  operation: HomeBlockVersionDocument['operation'],
  snapshot: HomeBlockDocument,
  performedBy: { uid: string; name: string },
): Promise<string> {
  const db = getFirestore()
  const versionId = new Date().toISOString()
  await db.collection('homeBlocks').doc(blockId).collection('versions').doc(versionId).set({
    operation,
    snapshot,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: performedBy,
  })
  return versionId
}

async function createAuditLog(
  blockId: string,
  operation: string,
  performedBy: { uid: string; name: string; email: string },
  summary: string,
  versionId: string,
): Promise<void> {
  const db = getFirestore()
  await db.collection('auditLogs').add({
    entityType: 'homeBlock',
    entityId: blockId,
    operation,
    performedBy,
    timestamp: FieldValue.serverTimestamp(),
    summary,
    versionRef: `homeBlocks/${blockId}/versions/${versionId}`,
    metadata: null,
  })
}

export async function listHomeBlocks(_req: Request, res: Response): Promise<void> {
  const db = getFirestore()
  const snapshot = await db.collection('homeBlocks').orderBy('order', 'asc').get()

  const blocks = snapshot.docs.map((doc) => ({
    id: doc.id,
    type: doc.data()['type'],
    enabled: doc.data()['enabled'],
    order: doc.data()['order'],
    props: doc.data()['props'],
    updatedAt: doc.data()['updatedAt'],
  }))

  res.status(200).json({ success: true, data: { blocks } })
}

export async function getHomeBlock(req: Request, res: Response): Promise<void> {
  const blockId = req.params['blockId'] as string
  const db = getFirestore()
  const doc = await db.collection('homeBlocks').doc(blockId).get()

  if (!doc.exists) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Block not found' },
    })
    return
  }

  res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } })
}

export async function updateHomeBlock(req: Request, res: Response): Promise<void> {
  const blockId = req.params['blockId'] as string
  const payload = req.body as UpdateHomeBlockPayload
  const db = getFirestore()

  const blockRef = db.collection('homeBlocks').doc(blockId)
  const blockDoc = await blockRef.get()

  if (!blockDoc.exists) {
    res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Block not found' },
    })
    return
  }

  const currentType = blockDoc.data()?.['type'] as BlockType

  if (payload.props) {
    const validation = validateBlockProps(currentType, payload.props)
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: { code: 'invalid_props', message: validation.errors.join(', ') },
      })
      return
    }
  }

  const updates: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  }

  if (payload.enabled !== undefined) updates['enabled'] = payload.enabled
  if (payload.order !== undefined) updates['order'] = payload.order
  if (payload.props !== undefined) updates['props'] = payload.props

  await blockRef.update(updates)

  const updatedDoc = await blockRef.get()
  const versionId = await createVersion(blockId, 'update', updatedDoc.data() as HomeBlockDocument, {
    uid: req.user!.uid,
    name: req.user!.name,
  })

  await createAuditLog(
    blockId,
    'update',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Atualizou bloco "${currentType}" da Home`,
    versionId,
  )

  res.status(200).json({ success: true, data: { id: blockId } })
}

export async function seedHomeBlocks(req: Request, res: Response): Promise<void> {
  const db = getFirestore()

  const existing = await db.collection('homeBlocks').limit(1).get()
  if (!existing.empty) {
    res.status(409).json({
      success: false,
      error: { code: 'already_seeded', message: 'Home blocks already exist' },
    })
    return
  }

  const now = FieldValue.serverTimestamp()
  const batch = db.batch()

  const blocks: Array<{ id: string; data: Record<string, unknown> }> = [
    {
      id: 'top-bar',
      data: {
        type: 'top-bar',
        enabled: false,
        order: 0,
        schemaVersion: SCHEMA_VERSION,
        props: { text: 'Bem-vindo ao GDG Vitória da Conquista!', variant: 'brand' },
        createdAt: now,
        updatedAt: now,
        createdBy: { uid: req.user!.uid, name: req.user!.name },
        updatedBy: { uid: req.user!.uid, name: req.user!.name },
      },
    },
    {
      id: 'hero',
      data: {
        type: 'hero',
        enabled: true,
        order: 1,
        schemaVersion: SCHEMA_VERSION,
        props: {
          title: 'GDG Vitória da Conquista',
          subtitle: 'Comunidade de desenvolvedores do sudoeste baiano',
          contentAlign: 'center',
          themeVariant: 'dark',
          overlayVariant: 'dark',
          ctaLabel: 'Ver eventos',
          ctaUrl: '/eventos',
          ctaTarget: 'same_tab',
        },
        createdAt: now,
        updatedAt: now,
        createdBy: { uid: req.user!.uid, name: req.user!.name },
        updatedBy: { uid: req.user!.uid, name: req.user!.name },
      },
    },
    {
      id: 'countdown-banner',
      data: {
        type: 'countdown-banner',
        enabled: false,
        order: 2,
        schemaVersion: SCHEMA_VERSION,
        props: {
          title: 'Próximo evento',
          mode: 'next_upcoming',
          themeVariant: 'brand',
          overlayVariant: 'dark',
        },
        createdAt: now,
        updatedAt: now,
        createdBy: { uid: req.user!.uid, name: req.user!.name },
        updatedBy: { uid: req.user!.uid, name: req.user!.name },
      },
    },
    {
      id: 'events-carousel',
      data: {
        type: 'events-carousel',
        enabled: true,
        order: 3,
        schemaVersion: SCHEMA_VERSION,
        props: {
          title: 'Próximos eventos',
          mode: 'upcoming',
          maxItems: 6,
          ctaLabel: 'Ver todos os eventos',
          ctaUrl: '/eventos',
        },
        createdAt: now,
        updatedAt: now,
        createdBy: { uid: req.user!.uid, name: req.user!.name },
        updatedBy: { uid: req.user!.uid, name: req.user!.name },
      },
    },
    {
      id: 'announcements-carousel',
      data: {
        type: 'announcements-carousel',
        enabled: true,
        order: 4,
        schemaVersion: SCHEMA_VERSION,
        props: {
          title: 'Avisos',
          maxItems: 4,
          zone: 'home_carousel',
          ctaLabel: 'Ver todos os avisos',
          ctaUrl: '/avisos',
        },
        createdAt: now,
        updatedAt: now,
        createdBy: { uid: req.user!.uid, name: req.user!.name },
        updatedBy: { uid: req.user!.uid, name: req.user!.name },
      },
    },
    {
      id: 'image-carousel',
      data: {
        type: 'image-carousel',
        enabled: false,
        order: 5,
        schemaVersion: SCHEMA_VERSION,
        props: {
          title: 'Galeria',
          images: [],
          autoplay: true,
          aspectRatioVariant: 'landscape',
        },
        createdAt: now,
        updatedAt: now,
        createdBy: { uid: req.user!.uid, name: req.user!.name },
        updatedBy: { uid: req.user!.uid, name: req.user!.name },
      },
    },
    {
      id: 'cta-banner',
      data: {
        type: 'cta-banner',
        enabled: false,
        order: 6,
        schemaVersion: SCHEMA_VERSION,
        props: {
          title: 'Faça parte da comunidade',
          subtitle: 'Junte-se ao GDG Vitória da Conquista',
          contentAlign: 'center',
          backgroundVariant: 'brand',
          overlayVariant: 'none',
          ctaLabel: 'Saiba mais',
          ctaUrl: '/sobre',
          ctaTarget: 'same_tab',
        },
        createdAt: now,
        updatedAt: now,
        createdBy: { uid: req.user!.uid, name: req.user!.name },
        updatedBy: { uid: req.user!.uid, name: req.user!.name },
      },
    },
    {
      id: 'contact-form',
      data: {
        type: 'contact-form',
        enabled: true,
        order: 7,
        schemaVersion: SCHEMA_VERSION,
        props: {
          title: 'Entre em contato',
          subtitle: 'Tem alguma dúvida ou proposta? Fale com a gente.',
          submitLabel: 'Enviar mensagem',
          successMessage: 'Mensagem enviada! Em breve entraremos em contato.',
        },
        createdAt: now,
        updatedAt: now,
        createdBy: { uid: req.user!.uid, name: req.user!.name },
        updatedBy: { uid: req.user!.uid, name: req.user!.name },
      },
    },
  ]

  for (const block of blocks) {
    batch.set(db.collection('homeBlocks').doc(block.id), block.data)
  }

  await batch.commit()

  res.status(201).json({
    success: true,
    data: {
      message: 'Home blocks seeded successfully',
      blocks: blocks.map((b) => b.id),
    },
  })
}

export async function listHomeBlockVersions(req: Request, res: Response): Promise<void> {
  const blockId = req.params['blockId'] as string
  const db = getFirestore()

  const blockDoc = await db.collection('homeBlocks').doc(blockId).get()
  if (!blockDoc.exists) {
    res
      .status(404)
      .json({ success: false, error: { code: 'not_found', message: 'Block not found' } })
    return
  }

  const versionsSnapshot = await db
    .collection('homeBlocks')
    .doc(blockId)
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

export async function restoreHomeBlockVersion(req: Request, res: Response): Promise<void> {
  const blockId = req.params['blockId'] as string
  const versionId = req.params['versionId'] as string
  const db = getFirestore()

  const versionDoc = await db
    .collection('homeBlocks')
    .doc(blockId)
    .collection('versions')
    .doc(versionId)
    .get()

  if (!versionDoc.exists) {
    res
      .status(404)
      .json({ success: false, error: { code: 'not_found', message: 'Version not found' } })
    return
  }

  const snapshot = versionDoc.data()?.['snapshot'] as HomeBlockDocument
  const blockRef = db.collection('homeBlocks').doc(blockId)

  await blockRef.update({
    ...snapshot,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: { uid: req.user!.uid, name: req.user!.name },
  })

  const restoredDoc = await blockRef.get()
  const newVersionId = await createVersion(
    blockId,
    'restore',
    restoredDoc.data() as HomeBlockDocument,
    { uid: req.user!.uid, name: req.user!.name },
  )

  await createAuditLog(
    blockId,
    'restore',
    { uid: req.user!.uid, name: req.user!.name, email: req.user!.email },
    `Restaurou bloco "${snapshot.type}" para versão ${versionId}`,
    newVersionId,
  )

  res.status(200).json({
    success: true,
    data: { id: blockId, restoredFromVersion: versionId },
  })
}
