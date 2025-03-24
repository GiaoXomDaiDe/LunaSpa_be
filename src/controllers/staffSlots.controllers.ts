import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import fs from 'fs'
import HTTP_STATUS from '~/constants/httpStatus'
import { STAFF_SLOTS_MESSAGES } from '~/constants/messages'
import {
  CreateMultipleStaffSlotsReqBody,
  GenerateStaffSlotsReqBody,
  StaffProfileParams,
  StaffSlotParams,
  StaffSlotQuery,
  StaffSlotReqBody,
  UpdateStaffSlotReqBody,
  UpdateStaffSlotStatusReqBody
} from '~/models/request/StaffSlots.requests'
import staffSlotsService from '~/services/staffSlots.services'
import { handleUploadExcel } from '~/utils/file'

// Định nghĩa interface cho multer request
interface MulterRequest extends Request {
  file: Express.Multer.File
}

// Lấy danh sách các slot làm việc
export const getStaffSlotsController = async (
  req: Request<ParamsDictionary, any, any, StaffSlotQuery>,
  res: Response,
  next: NextFunction
) => {
  const { limit, page, staff_profile_id, date, start_date, end_date, status } = req.query
  console.log(req.query, 'req.query')
  const options = {
    limit: Number(limit) || undefined,
    page: Number(page) || undefined,
    staff_profile_id: staff_profile_id || '',
    date: date ? new Date(date) : undefined,
    start_date: start_date ? new Date(start_date) : undefined,
    end_date: end_date ? new Date(end_date) : undefined,
    status: status || undefined
  }

  const result = await staffSlotsService.getAllStaffSlots(options)

  res.status(HTTP_STATUS.OK).json({
    message: STAFF_SLOTS_MESSAGES.GET_STAFF_SLOTS_SUCCESS,
    result
  })
}

// Lấy chi tiết một slot làm việc
export const getStaffSlotController = async (
  req: Request<StaffSlotParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { staff_slot_id } = req.params
  const result = await staffSlotsService.getStaffSlot(staff_slot_id)

  res.status(HTTP_STATUS.OK).json({
    message: STAFF_SLOTS_MESSAGES.GET_STAFF_SLOT_SUCCESS,
    result
  })
}

// Tạo mới một slot làm việc
export const createStaffSlotController = async (
  req: Request<ParamsDictionary, any, StaffSlotReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await staffSlotsService.createStaffSlot(req.body)

  res.status(HTTP_STATUS.CREATED).json({
    message: STAFF_SLOTS_MESSAGES.CREATE_STAFF_SLOT_SUCCESS,
    result
  })
}

// Tạo nhiều slot làm việc cùng lúc
export const createMultipleStaffSlotsController = async (
  req: Request<ParamsDictionary, any, CreateMultipleStaffSlotsReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await staffSlotsService.createMultipleStaffSlots(req.body)

  res.status(HTTP_STATUS.CREATED).json({
    message: STAFF_SLOTS_MESSAGES.CREATE_STAFF_SLOTS_SUCCESS,
    result
  })
}

// Tạo tự động các slot làm việc
export const generateStaffSlotsController = async (
  req: Request<ParamsDictionary, any, GenerateStaffSlotsReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await staffSlotsService.generateStaffSlots(req.body)

  res.status(HTTP_STATUS.CREATED).json({
    message: STAFF_SLOTS_MESSAGES.GENERATE_STAFF_SLOTS_SUCCESS,
    result
  })
}

// Cập nhật thông tin slot làm việc
export const updateStaffSlotController = async (
  req: Request<StaffSlotParams, any, UpdateStaffSlotReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { staff_slot_id } = req.params
  const result = await staffSlotsService.updateStaffSlot(staff_slot_id, req.body)

  res.status(HTTP_STATUS.OK).json({
    message: STAFF_SLOTS_MESSAGES.UPDATE_STAFF_SLOT_SUCCESS,
    result
  })
}

// Cập nhật trạng thái của slot làm việc
export const updateStaffSlotStatusController = async (
  req: Request<StaffSlotParams, any, UpdateStaffSlotStatusReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { staff_slot_id } = req.params
  const result = await staffSlotsService.updateStaffSlotStatus(staff_slot_id, req.body)

  res.status(HTTP_STATUS.OK).json({
    message: STAFF_SLOTS_MESSAGES.UPDATE_STAFF_SLOT_SUCCESS,
    result
  })
}

// Xóa slot làm việc
export const deleteStaffSlotController = async (
  req: Request<StaffSlotParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { staff_slot_id } = req.params

  const result = await staffSlotsService.deleteStaffSlot(staff_slot_id)

  res.status(HTTP_STATUS.OK).json({
    message: STAFF_SLOTS_MESSAGES.DELETE_STAFF_SLOT_SUCCESS,
    result
  })
}

// Import Excel
export const importExcelController = async (
  req: Request<StaffProfileParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Sử dụng formidable để xử lý upload file
    const file = await handleUploadExcel(req)

    // Đọc nội dung file
    const buffer = fs.readFileSync(file.filepath)

    // Import Excel sử dụng service
    const result = await staffSlotsService.importExcel(buffer, req.params.staff_profile_id)

    // Xóa file tạm sau khi xử lý xong
    fs.unlinkSync(file.filepath)

    // Trả về kết quả
    res.status(HTTP_STATUS.OK).json({
      message: STAFF_SLOTS_MESSAGES.IMPORT_EXCEL_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Tải xuống mẫu Excel
export const downloadTemplateController = async (req: Request, res: Response, next: NextFunction) => {
  const buffer = await staffSlotsService.getExcelTemplate()
  //MIME type chuẩn cho file Excel (định dạng .xlsx).
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  // Đặt tên file mẫu là staff_slots_template.xlsx
  res.setHeader('Content-Disposition', 'attachment; filename=staff_slots_template.xlsx')
  // Đặt kích thước của file
  res.setHeader('Content-Length', Buffer.byteLength(buffer))

  res.send(buffer)
}

// Export Excel
export const exportExcelController = async (
  req: Request<StaffProfileParams, any, any, { start_date?: string; end_date?: string }>,
  res: Response,
  next: NextFunction
) => {
  const { staff_profile_id } = req.params
  console.log(staff_profile_id)
  const { start_date, end_date } = req.query

  const buffer = await staffSlotsService.exportExcel(
    staff_profile_id,
    start_date ? new Date(start_date) : undefined,
    end_date ? new Date(end_date) : undefined
  )

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename=staff_slots.xlsx')
  res.setHeader('Content-Length', Buffer.byteLength(buffer))

  res.send(buffer)
}
