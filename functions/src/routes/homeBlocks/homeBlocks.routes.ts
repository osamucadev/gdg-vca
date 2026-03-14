import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { requirePermission } from '../../middleware/requirePermission'
import {
  listHomeBlocks,
  getHomeBlock,
  updateHomeBlock,
  listHomeBlockVersions,
  restoreHomeBlockVersion,
} from './homeBlocks.handlers'

const router = Router()

router.get('/home-blocks', authenticate, listHomeBlocks)
router.get('/home-blocks/:blockId', authenticate, getHomeBlock)
router.put(
  '/home-blocks/:blockId',
  authenticate,
  requirePermission('homeBlocks.edit'),
  updateHomeBlock,
)
router.get(
  '/home-blocks/:blockId/versions',
  authenticate,
  requirePermission('versions.read'),
  listHomeBlockVersions,
)
router.post(
  '/home-blocks/:blockId/restore/:versionId',
  authenticate,
  requirePermission('versions.restore'),
  restoreHomeBlockVersion,
)

export { router as homeBlocksRoutes }
