import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { requirePermission } from '../../middleware/requirePermission'
import {
  createEvent,
  getEvent,
  listEvents,
  updateEvent,
  publishEvent,
  archiveEvent,
  listEventVersions,
  restoreEventVersion,
} from './events.handlers'

const router = Router()

router.get('/events', authenticate, listEvents)

router.get('/events/:eventId', authenticate, getEvent)

router.post('/events', authenticate, requirePermission('events.create'), createEvent)

router.put('/events/:eventId', authenticate, requirePermission('events.edit'), updateEvent)

router.post(
  '/events/:eventId/publish',
  authenticate,
  requirePermission('events.publish'),
  publishEvent,
)

router.post(
  '/events/:eventId/archive',
  authenticate,
  requirePermission('events.archive'),
  archiveEvent,
)

router.get(
  '/events/:eventId/versions',
  authenticate,
  requirePermission('versions.read'),
  listEventVersions,
)

router.post(
  '/events/:eventId/restore/:versionId',
  authenticate,
  requirePermission('versions.restore'),
  restoreEventVersion,
)

export { router as eventsRoutes }
