import { NextFunction, Request, RequestHandler, Response } from 'express'
import { MongoAPIError } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'

export const wrapRequestHandler = <P>(func: RequestHandler<P>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      if (error instanceof MongoAPIError) {
        next({
          message: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          error: error.message
        })
      } else {
        next(error)
      }
    }
  }
}
//hàm này được sử dụng để bọc các controller hoặc middleware của express
// khi mà lỗi thì nó sẽ trả next(err) về 1 cái error handler chung để xử lý
// giúp cho việc xử lý lỗi trở nên dễ dàng hơn
