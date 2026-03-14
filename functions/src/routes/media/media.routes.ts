import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { requirePermission } from '../../middleware/requirePermission'
import { getUploadUrl } from './media.handlers'

const router = Router()

router.post('/media/upload-url', authenticate, requirePermission('media.upload'), getUploadUrl)

export { router as mediaRoutes }
