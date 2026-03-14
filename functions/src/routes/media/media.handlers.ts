import { getStorage } from 'firebase-admin/storage'
import type { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_FILE_SIZE_MB = 10

export async function getUploadUrl(req: Request, res: Response): Promise<void> {
  const { fileName, mimeType, folder } = req.body

  if (!fileName || typeof fileName !== 'string') {
    res.status(400).json({
      success: false,
      error: { code: 'invalid_payload', message: 'fileName is required' },
    })
    return
  }

  if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'invalid_mime_type',
        message: `mimeType must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`,
      },
    })
    return
  }

  const sanitizedFolder = typeof folder === 'string' && folder.length > 0 ? folder : 'uploads'
  const ext = fileName.split('.').pop()
  const uniqueFileName = `${uuidv4()}.${ext}`
  const filePath = `${sanitizedFolder}/${uniqueFileName}`

  const bucket = getStorage().bucket()
  const file = bucket.file(filePath)

  const [uploadUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000,
    contentType: mimeType,
    extensionHeaders: {
      'x-goog-content-length-range': `0,${MAX_FILE_SIZE_MB * 1024 * 1024}`,
    },
  })

  const fileUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`

  res.status(200).json({
    success: true,
    data: { uploadUrl, fileUrl, filePath },
  })
}
