import type { Request, Response, NextFunction } from 'express'
import { hasPermission } from '../modules/rbac/rbac.service'
import type { Permission } from '../modules/rbac/rbac.types'

export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'unauthenticated',
          message: 'User not authenticated',
        },
      })
      return
    }

    const allowed = await hasPermission(req.user.role, permission)

    if (!allowed) {
      res.status(403).json({
        success: false,
        error: {
          code: 'permission_denied',
          message: `User does not have permission: ${permission}`,
        },
      })
      return
    }

    next()
  }
}
