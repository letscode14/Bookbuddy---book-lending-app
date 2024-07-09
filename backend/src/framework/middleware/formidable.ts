import formidable, { File } from 'formidable'
import { Express, Request, Response, NextFunction } from 'express'

declare global {
  namespace Express {
    interface Request {
      files: { [key: string]: File | File[] }
    }
  }
}
interface UploadedFile {
  mimetype: string
  originalFilename: string
}

export const fileParser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const form = formidable()
    const [fields, files] = await form.parse(req)
    const validImageMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
    ]

    if (!req.body) req.body = {}
    for (let key in fields) {
      const value = fields[key]
      if (value) req.body[key] = value[0]
    }
    if (!req.files) req.files = {}

    for (let key in files) {
      const value = files[key]
      if (value) {
        if (value.length > 1) {
          const isValid = value.every((file: formidable.File) =>
            validImageMimeTypes.includes(file.mimetype as string)
          )
          if (!isValid) {
            res.status(415).json({
              messages: 'Only allow extensions which are .jpg,.web,.png,.svg',
            })
            return
          }
          req.files[key] = value
        } else {
          const isValid = validImageMimeTypes.includes(
            value[0].mimetype as string
          )
          if (!isValid) {
            res.status(415).json({
              messages: 'Only allow extensions which are .jpg,.web,.png,.svg',
            })
            return
          }

          req.files[key] = value[0]
        }
      }
    }
    next()
  } catch (error) {
    console.log(error)
  }
}
