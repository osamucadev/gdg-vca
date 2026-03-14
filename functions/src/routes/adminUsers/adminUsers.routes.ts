import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { requirePermission } from '../../middleware/requirePermission'
import {
  bootstrapOwner,
  createAdminUser,
  listAdminUsers,
  updateAdminUserRole,
} from './adminUsers.handlers'

const router = Router()

// Rota sem autenticação: cria o primeiro owner do sistema
// Deve ser desabilitada após o bootstrap inicial
router.post('/admin-users/bootstrap', bootstrapOwner)

// Rotas autenticadas
router.get('/admin-users', authenticate, requirePermission('adminUsers.manage'), listAdminUsers)

router.post('/admin-users', authenticate, requirePermission('adminUsers.manage'), createAdminUser)

router.put(
  '/admin-users/:uid/role',
  authenticate,
  requirePermission('adminUsers.manage'),
  updateAdminUserRole,
)

export { router as adminUsersRoutes }
