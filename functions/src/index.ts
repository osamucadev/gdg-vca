import { initializeApp } from 'firebase-admin/app'
import * as functions from 'firebase-functions'

initializeApp()

export const healthCheck = functions.https.onRequest((_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      project: 'gdg-vca',
      timestamp: new Date().toISOString(),
    },
  })
})
