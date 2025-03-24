import { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import HTTP_STATUS from '~/constants/httpStatus'
import { STAFF_SLOTS_MESSAGES } from '~/constants/messages'

// Cấu hình lưu file vào memory
const storage = multer.memoryStorage()

// Khởi tạo middleware upload
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

// Middleware kiểm tra file Excel
export const validateExcelFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: STAFF_SLOTS_MESSAGES.FILE_REQUIRED
    })
  }

  const allowedMimes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']

  if (!allowedMimes.includes(req.file.mimetype)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: STAFF_SLOTS_MESSAGES.FILE_FORMAT_INVALID
    })
  }

  next()
}
