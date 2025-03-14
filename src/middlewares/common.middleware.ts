import { NextFunction, Request, Response } from 'express'
import { pick } from 'lodash'

type FilterKeys<T> = (keyof T)[]

export const filterMiddleware =
  <T>(filterKeys: FilterKeys<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }

export const isAccountLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // req.header và req.headers
    /*
  1) req.headers:
    - Là thuộc tính (property) của đối tượng req trong Express.
    - Chứa tất cả header dưới dạng một object, 
      các key thường ở dạng lowercase (vd: 'content-type', 'authorization', ...).
    - Ví dụ: req.headers = {
        'content-type': 'application/json',
        'authorization': 'Bearer abc123',
        ...
      }
  
  2) req.header(name):
    - Là một method (hàm) trong Express.
    - Dùng để lấy giá trị của một header cụ thể theo tên (name) - không phân biệt hoa thường.
    - Ví dụ: req.header('Content-Type') -> 'application/json'
    - req.header('Authorization') -> 'Bearer abc123'
      (Nếu header đó không tồn tại, sẽ trả về undefined)
  */
    if (req.headers.authorization) {
      //Authorization
      return middleware(req, res, next)
    }
    req.role_name = 'guest'
    next()
  }
}
