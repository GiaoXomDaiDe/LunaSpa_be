import { RequestHandler, Router } from 'express'
import {
  createMultipleStaffSlotsController,
  createStaffSlotController,
  deleteStaffSlotController,
  downloadTemplateController,
  exportExcelController,
  generateStaffSlotsController,
  getAvailableSlotsByServiceIdController,
  getStaffSlotController,
  getStaffSlotsController,
  importExcelController,
  updateStaffSlotController,
  updateStaffSlotStatusController
} from '~/controllers/staffSlots.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { availableSlotsServiceIdValidator } from '~/middlewares/services.middleware'
import {
  createMultipleStaffSlotsValidator,
  generateStaffSlotsValidator,
  staffSlotIdValidator,
  staffSlotQueryValidator,
  staffSlotValidator,
  updateStaffSlotStatusValidator,
  updateStaffSlotValidator
} from '~/middlewares/staffSlots.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const staffSlotsRouter = Router()

/**
 * @route GET /staff-slots
 * @description Lấy danh sách các slot làm việc của nhân viên
 * @access Private
 * @requires access_token
 */
staffSlotsRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'StaffSlot'),
  staffSlotQueryValidator,
  wrapRequestHandler(getStaffSlotsController)
)

/**
 * @route GET /staff-slots/:slot_id
 * @description Lấy thông tin chi tiết một slot làm việc
 * @access Private
 * @requires access_token
 */
staffSlotsRouter.get(
  '/:staff_slot_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('read', 'StaffSlot'),
  staffSlotIdValidator,
  wrapRequestHandler(getStaffSlotController)
)

/**
 * @route POST /staff-slots
 * @description Tạo một slot làm việc mới
 * @access Private
 * @requires access_token
 */
staffSlotsRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'StaffSlot'),
  staffSlotValidator,
  wrapRequestHandler(createStaffSlotController)
)

/**
 * @route POST /staff-slots/batch
 * @description Tạo nhiều slot làm việc cùng lúc
 * @access Private
 * @requires access_token
 */
staffSlotsRouter.post(
  '/batch',
  accessTokenValidator,
  verifiedAccountValidator,
  createMultipleStaffSlotsValidator,
  wrapRequestHandler(createMultipleStaffSlotsController)
)

/**
 * @route POST /staff-slots/generate
 * @description Tạo tự động các slot làm việc dựa trên thông tin lịch làm việc
 * @access Private
 * @requires access_token
 */
staffSlotsRouter.post(
  '/generate',
  accessTokenValidator,
  verifiedAccountValidator,
  generateStaffSlotsValidator,
  wrapRequestHandler(generateStaffSlotsController)
)

/**
 * @route PUT /staff-slots/:slot_id
 * @description Cập nhật thông tin một slot làm việc
 * @access Private
 * @requires access_token
 */
staffSlotsRouter.put(
  '/:staff_slot_id',
  accessTokenValidator,
  verifiedAccountValidator,
  staffSlotIdValidator,
  updateStaffSlotValidator,
  wrapRequestHandler(updateStaffSlotController)
)

/**
 * @route PATCH /staff-slots/:slot_id/status
 * @description Cập nhật trạng thái của một slot làm việc
 * @access Private
 * @requires access_token
 */
staffSlotsRouter.patch(
  '/:staff_slot_id/status',
  accessTokenValidator,
  verifiedAccountValidator,
  staffSlotIdValidator,
  updateStaffSlotStatusValidator,
  wrapRequestHandler(updateStaffSlotStatusController)
)

/**
 * @route DELETE /staff-slots/:slot_id
 * @description Xóa một slot làm việc
 * @access Private
 * @requires access_token
 */
staffSlotsRouter.delete(
  '/:staff_slot_id',
  accessTokenValidator,
  verifiedAccountValidator,
  staffSlotIdValidator,
  wrapRequestHandler(deleteStaffSlotController)
)

/**
 * @route GET /staff-slots/excel/template
 * @description Tải xuống template Excel để import lịch làm việc
 * @access Private
 * @requires access_token
 */
staffSlotsRouter.get(
  '/excel/template',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('read', 'StaffSlot'),
  wrapRequestHandler(downloadTemplateController as RequestHandler)
)

/**
 * @route GET /staff-slots/available/service/:service_id
 * @description Lấy danh sách các slot có sẵn theo service_id
 * @access Public
 */
staffSlotsRouter.get(
  '/available/service/:service_id',
  availableSlotsServiceIdValidator,
  wrapRequestHandler(getAvailableSlotsByServiceIdController as RequestHandler)
)

/**
 * @route POST /staff-slots/excel/import
 * @description Import lịch làm việc từ file Excel
 * @access Private
 * @requires access_token
 */
staffSlotsRouter.post(
  '/excel/import',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'StaffSlot'),
  wrapRequestHandler(importExcelController as RequestHandler)
)

/**
 * @route GET /staff-slots/excel/export
 * @description Xuất lịch làm việc ra file Excel
 * @access Private
 * @requires access_token
 */
staffSlotsRouter.get(
  '/excel/export/:staff_profile_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('read', 'StaffSlot'),
  wrapRequestHandler(exportExcelController)
)

export default staffSlotsRouter
