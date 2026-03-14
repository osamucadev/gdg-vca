import express from 'express'
import cors from 'cors'
import { adminUsersRoutes } from './routes/adminUsers/adminUsers.routes'
import { seedRoutes } from './routes/seed/seed.routes'

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
app.use('/api/v1', seedRoutes)

export { app }
