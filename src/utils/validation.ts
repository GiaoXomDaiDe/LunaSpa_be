import { NextFunction, Request, Response } from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Error'

//Thông thường nếu dùng express-validator theo kiểu checkSchema thì nó sẽ chỉ kiểm tra
// nếu thấy lỗi thì sẽ ko trả về lỗi gì cả mà chỉ đơn giản là ko pass qua đc cái đầu lọc

//Đây là hàm dùng để kiểm tra schema middleware, đồng thời trả về lỗi nếu có (giải quyết vấn đề trên)
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)
    // validation.run(req) thực hiện các quy tắc validation tuần tự theo thứ tự mà bạn đã định nghĩa.
    // Nếu một quy tắc validation nào đó không được đáp ứng(fail), quá trình validation sẽ ko dừng lại
    // hoàn toàn mà sẽ tiếp tục kiểm tra các quy tắc còn lại
    // tại đó và không tiếp tục thực hiện các quy tắc phía sau.
    const errors = validationResult(req)
    // validationResult(req) trả về một object chứa các lỗi nếu có
    if (errors.isEmpty()) {
      //Nếu ko có lỗi thì next
      return next()
      // next() sẽ chuyển quyền điều khiển tới middleware tiếp theo
    }
    // res.status(400).json({ errors: errors.mapped() })
    // dùng hàm mapped() để chuyển đổi object lỗi từ dạng array sang dạng object
    const errorsObject = errors.mapped()
    // lấy ra object lỗi
    const entityError = new EntityError({ errors: {} })
    // Tạo ra một object lỗi sẵn của EntityError
    for (const key in errorsObject) {
      //lấy ra các tên field lỗi
      const { msg } = errorsObject[key]
      //destructuring lấy ra message lỗi
      //msg là một object chứa message lỗi và status lỗi
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        //Nếu lỗi trả ra mang dạng là ErrorWithStatus và status lỗi khác 422
        // thì trả về lỗi đó luôn
        return next(msg)
      }
      //Nếu không thì gán vào object lỗi của EntityError
      entityError.errors[key] = errorsObject[key]
    }
    //Tức là cái hàm validate của các schema sẽ giúp hỗ trợ trong
    // việc custom được các dạng lỗi hơn thay vì chỉ check là lỗi 422

    next(entityError)
    //Gửi lỗi về cho các error handler xử lý
    //Nếu ko có error handler nào thì nó sẽ chuyển qua cho default error handler ở index.ts xử lý
  }
}
