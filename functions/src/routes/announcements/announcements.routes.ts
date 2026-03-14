import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { requirePermission } from '../../middleware/requirePermission'
import {
  createAnnouncement,
  getAnnouncement,
  listAnnouncements,
  updateAnnouncement,
  publishAnnouncement,
  archiveAnnouncement,
  listAnnouncementVersions,
  restoreAnnouncementVersion,
} from './announcements.handlers'

const router = Router()

router.get('/announcements', authenticate, listAnnouncements)
router.get('/announcements/:id', authenticate, getAnnouncement)
router.post(
  '/announcements',
  authenticate,
  requirePermission('announcements.create'),
  createAnnouncement,
)
router.put(
  '/announcements/:id',
  authenticate,
  requirePermission('announcements.edit'),
  updateAnnouncement,
)
router.post(
  '/announcements/:id/publish',
  authenticate,
  requirePermission('announcements.publish'),
  publishAnnouncement,
)
router.post(
  '/announcements/:id/archive',
  authenticate,
  requirePermission('announcements.archive'),
  archiveAnnouncement,
)
router.get(
  '/announcements/:id/versions',
  authenticate,
  requirePermission('versions.read'),
  listAnnouncementVersions,
)
router.post(
  '/announcements/:id/restore/:versionId',
  authenticate,
  requirePermission('versions.restore'),
  restoreAnnouncementVersion,
)

export { router as announcementsRoutes }
