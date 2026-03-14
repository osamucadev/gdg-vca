import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { requirePermission } from '../../middleware/requirePermission'
import {
  createPost,
  getPost,
  listPosts,
  updatePost,
  publishPost,
  archivePost,
  listPostVersions,
  restorePostVersion,
} from './posts.handlers'

const router = Router()

router.get('/posts', authenticate, listPosts)
router.get('/posts/:postId', authenticate, getPost)
router.post('/posts', authenticate, requirePermission('posts.create'), createPost)
router.put('/posts/:postId', authenticate, requirePermission('posts.edit'), updatePost)
router.post('/posts/:postId/publish', authenticate, requirePermission('posts.publish'), publishPost)
router.post('/posts/:postId/archive', authenticate, requirePermission('posts.archive'), archivePost)
router.get(
  '/posts/:postId/versions',
  authenticate,
  requirePermission('versions.read'),
  listPostVersions,
)
router.post(
  '/posts/:postId/restore/:versionId',
  authenticate,
  requirePermission('versions.restore'),
  restorePostVersion,
)

export { router as postsRoutes }
