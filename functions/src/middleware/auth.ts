import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import type { Request, Response, NextFunction } from 'express'
import type { AdminUser } from '../modules/rbac/rbac.types'

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'unauthenticated',
        message: 'Missing or invalid authorization header',
      },
    })
    return
  }

  const token = authHeader.split('Bearer ')[1]

  try {
    const decoded = await getAuth().verifyIdToken(token)

    const db = getFirestore()
    const userDoc = await db.collection('adminUsers').doc(decoded.uid).get()

    if (!userDoc.exists) {
      res.status(403).json({
        success: false,
        error: {
          code: 'forbidden',
          message: 'User is not registered as an admin',
        },
      })
      return
    }

    const adminUser = userDoc.data() as AdminUser

    if (adminUser.status !== 'active') {
      res.status(403).json({
        success: false,
        error: {
          code: 'forbidden',
          message: 'User account is inactive',
        },
      })
      return
    }

    req.user = {
      uid: decoded.uid,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
    }

    next()
  } catch (_err) {
    res.status(401).json({
      success: false,
      error: {
        code: 'unauthenticated',
        message: 'Invalid or expired token',
      },
    })
  }
}
