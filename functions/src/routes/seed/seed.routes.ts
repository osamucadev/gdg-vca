import { Router } from 'express'
import { seedRoles } from './seed.handlers'
import { seedHomeBlocks } from '../homeBlocks/homeBlocks.handlers'
import { authenticate } from '../../middleware/auth'

const router = Router()

// Rota disponível apenas em ambiente de desenvolvimento
// Nunca deve ser registrada em produção

router.post(
  '/seed/roles',
  (_req, res, next) => {
    if (process.env['NODE_ENV'] === 'production') {
      res.status(404).json({
        success: false,
        error: { code: 'not_found', message: 'Route not found' },
      })
      return
    }
    next()
  },
  seedRoles,
)

router.post(
  '/seed/home-blocks',
  authenticate,
  (_req, res, next) => {
    if (process.env['NODE_ENV'] === 'production') {
      res.status(404).json({
        success: false,
        error: { code: 'not_found', message: 'Route not found' },
      })
      return
    }
    next()
  },
  seedHomeBlocks,
)

export { router as seedRoutes }
