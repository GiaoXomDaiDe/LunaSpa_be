import { NextFunction, Request, RequestHandler, Response } from 'express'

export const wrapRequestHandler = <P>(func: RequestHandler<P>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
//hàm này được sử dụng để bọc các controller hoặc middleware của express
// khi mà lỗi thì nó sẽ trả next(err) về 1 cái error handler chung để xử lý
// giúp cho việc xử lý lỗi trở nên dễ dàng hơn
