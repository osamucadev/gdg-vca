import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import type { Request, Response } from 'express'
import type { AdminUser, Role } from '../../modules/rbac/rbac.types'
import { clearRolesCache } from '../../modules/rbac/rbac.service'

const VALID_ROLES: Role[] = ['owner', 'admin', 'editor', 'media_manager', 'inbox_viewer']

export async function bootstrapOwner(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    res.status(400).json({
      success: false,
      error: {
        code: 'invalid_payload',
        message: 'name, email and password are required',
      },
    })
    return
  }

  const db = getFirestore()

  const existingOwners = await db
    .collection('adminUsers')
    .where('role', '==', 'owner')
    .limit(1)
    .get()

  if (!existingOwners.empty) {
    res.status(403).json({
      success: false,
      error: {
        code: 'forbidden',
        message: 'Bootstrap is disabled. An owner already exists.',
      },
    })
    return
  }

  try {
    const auth = getAuth()

    const userRecord = await auth.createUser({ email, password, displayName: name })

    await auth.setCustomUserClaims(userRecord.uid, { role: 'owner' })

    const now = FieldValue.serverTimestamp()

    const adminUser: Omit<AdminUser, 'lastLoginAt'> = {
      uid: userRecord.uid,
      name,
      email,
      role: 'owner',
      status: 'active',
      createdAt: now as FirebaseFirestore.Timestamp,
    }

    await db.collection('adminUsers').doc(userRecord.uid).set(adminUser)

    res.status(201).json({
      success: true,
      data: {
        uid: userRecord.uid,
        name,
        email,
        role: 'owner',
      },
    })
  } catch (err) {
    const error = err as { code?: string; message?: string }

    if (error.code === 'auth/email-already-exists') {
      res.status(409).json({
        success: false,
        error: {
          code: 'email_already_exists',
          message: 'An account with this email already exists',
        },
      })
      return
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'internal_error',
        message: 'Failed to create owner account',
      },
    })
  }
}

export async function createAdminUser(req: Request, res: Response): Promise<void> {
  const { name, email, password, role } = req.body

  if (!name || !email || !password || !role) {
    res.status(400).json({
      success: false,
      error: {
        code: 'invalid_payload',
        message: 'name, email, password and role are required',
      },
    })
    return
  }

  if (!VALID_ROLES.includes(role)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'invalid_role',
        message: `Invalid role. Valid roles are: ${VALID_ROLES.join(', ')}`,
      },
    })
    return
  }

  if (role === 'owner' && req.user?.role !== 'owner') {
    res.status(403).json({
      success: false,
      error: {
        code: 'permission_denied',
        message: 'Only an owner can create another owner',
      },
    })
    return
  }

  try {
    const auth = getAuth()
    const db = getFirestore()

    const userRecord = await auth.createUser({ email, password, displayName: name })

    await auth.setCustomUserClaims(userRecord.uid, { role })

    const now = FieldValue.serverTimestamp()

    const adminUser: Omit<AdminUser, 'lastLoginAt'> = {
      uid: userRecord.uid,
      name,
      email,
      role,
      status: 'active',
      createdAt: now as FirebaseFirestore.Timestamp,
      createdBy: {
        uid: req.user!.uid,
        name: req.user!.name,
      },
    }

    await db.collection('adminUsers').doc(userRecord.uid).set(adminUser)

    await db.collection('auditLogs').add({
      entityType: 'adminUser',
      entityId: userRecord.uid,
      operation: 'create',
      performedBy: {
        uid: req.user!.uid,
        name: req.user!.name,
        email: req.user!.email,
      },
      timestamp: now,
      summary: `Criou usuário admin ${name} com papel ${role}`,
      versionRef: null,
      metadata: { role },
    })

    res.status(201).json({
      success: true,
      data: {
        uid: userRecord.uid,
        name,
        email,
        role,
      },
    })
  } catch (err) {
    const error = err as { code?: string }

    if (error.code === 'auth/email-already-exists') {
      res.status(409).json({
        success: false,
        error: {
          code: 'email_already_exists',
          message: 'An account with this email already exists',
        },
      })
      return
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'internal_error',
        message: 'Failed to create admin user',
      },
    })
  }
}

export async function listAdminUsers(_req: Request, res: Response): Promise<void> {
  const db = getFirestore()

  const snapshot = await db.collection('adminUsers').orderBy('createdAt', 'desc').get()

  const users = snapshot.docs.map((doc) => {
    const data = doc.data() as AdminUser
    return {
      uid: doc.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      createdAt: data.createdAt,
      lastLoginAt: data.lastLoginAt ?? null,
    }
  })

  res.status(200).json({
    success: true,
    data: { users },
  })
}

export async function updateAdminUserRole(req: Request, res: Response): Promise<void> {
  const uid = req.params['uid'] as string
  const { role } = req.body

  if (!role || !VALID_ROLES.includes(role)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'invalid_role',
        message: `Invalid role. Valid roles are: ${VALID_ROLES.join(', ')}`,
      },
    })
    return
  }

  if (role === 'owner' && req.user?.role !== 'owner') {
    res.status(403).json({
      success: false,
      error: {
        code: 'permission_denied',
        message: 'Only an owner can assign the owner role',
      },
    })
    return
  }

  if (uid === req.user?.uid) {
    res.status(400).json({
      success: false,
      error: {
        code: 'invalid_operation',
        message: 'You cannot change your own role',
      },
    })
    return
  }

  const db = getFirestore()
  const auth = getAuth()

  const userDoc = await db.collection('adminUsers').doc(uid).get()

  if (!userDoc.exists) {
    res.status(404).json({
      success: false,
      error: {
        code: 'not_found',
        message: 'Admin user not found',
      },
    })
    return
  }

  const previousRole = (userDoc.data() as AdminUser).role

  await auth.setCustomUserClaims(uid, { role })
  await db.collection('adminUsers').doc(uid).update({
    role,
    updatedAt: FieldValue.serverTimestamp(),
  })

  clearRolesCache()

  const now = FieldValue.serverTimestamp()

  await db.collection('auditLogs').add({
    entityType: 'adminUser',
    entityId: uid,
    operation: 'update_role',
    performedBy: {
      uid: req.user!.uid,
      name: req.user!.name,
      email: req.user!.email,
    },
    timestamp: now,
    summary: `Alterou papel de ${previousRole} para ${role}`,
    versionRef: null,
    metadata: { previousRole, newRole: role },
  })

  res.status(200).json({
    success: true,
    data: { uid, role },
  })
}
