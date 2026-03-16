import express from 'express'
import cors from 'cors'
import { adminUsersRoutes } from './routes/adminUsers/adminUsers.routes'
import { eventsRoutes } from './routes/events/events.routes'
import { postsRoutes } from './routes/posts/posts.routes'
import { announcementsRoutes } from './routes/announcements/announcements.routes'
import { pagesRoutes } from './routes/pages/pages.routes'
import { homeBlocksRoutes } from './routes/homeBlocks/homeBlocks.routes'
import { mediaRoutes } from './routes/media/media.routes'
import { seedRoutes } from './routes/seed/seed.routes'
import { contactRoutes } from './routes/contact/contact.routes'

const app = express()

app.use(cors({ origin: true }))
app.use(express.json())

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      project: 'gdg-vca',
      timestamp: new Date().toISOString(),
    },
  })
})

app.use('/api/v1', adminUsersRoutes)
app.use('/api/v1', eventsRoutes)
app.use('/api/v1', postsRoutes)
app.use('/api/v1', announcementsRoutes)
app.use('/api/v1', pagesRoutes)
app.use('/api/v1', homeBlocksRoutes)
app.use('/api/v1', mediaRoutes)
app.use('/api/v1', contactRoutes)
app.use('/api/v1', seedRoutes)

export { app }
