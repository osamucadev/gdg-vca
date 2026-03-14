import { initializeApp } from 'firebase-admin/app'
import * as functions from 'firebase-functions'
import { app } from './app'

initializeApp()

export const api = functions.https.onRequest(app)
