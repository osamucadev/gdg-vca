import { Router } from 'express'
import { submitContact } from './contact.handlers'

const router = Router()

router.post('/contact', submitContact)

export { router as contactRoutes }
