import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { requirePermission } from '../../middleware/requirePermission'
import {
  getPage,
  updatePage,
  publishPage,
  listPageVersions,
  restorePageVersion,
} from './pages.handlers'

const router = Router()

router.get('/pages/:pageId', authenticate, getPage)
router.put('/pages/:pageId', authenticate, requirePermission('pages.edit'), updatePage)
router.post('/pages/:pageId/publish', authenticate, requirePermission('pages.edit'), publishPage)
router.get(
  '/pages/:pageId/versions',
  authenticate,
  requirePermission('versions.read'),
  listPageVersions,
)
router.post(
  '/pages/:pageId/restore/:versionId',
  authenticate,
  requirePermission('versions.restore'),
  restorePageVersion,
)

export { router as pagesRoutes }
