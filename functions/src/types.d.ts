import type { AuthenticatedUser } from './modules/rbac/rbac.types'

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}
