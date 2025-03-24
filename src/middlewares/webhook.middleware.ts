import { NextFunction, Request, Response } from 'express'

export const rawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let data = ''
  req.setEncoding('utf8')

  req.on('data', (chunk) => {
    data += chunk
  })

  req.on('end', () => {
    req.rawBody = data
    next()
  })
}
