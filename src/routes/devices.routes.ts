import { RequestHandler, Router } from 'express'
import { PERMISSION, RESOURCE_NAME } from '~/constants/constants'
import {
  createDeviceController,
  deleteDeviceController,
  getAllDevicesController,
  getDeviceController,
  softDeleteDeviceController,
  updateDeviceController
} from '~/controllers/devices.controller'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  paginationValidator,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import {
  checkDeviceNotInactive,
  deviceIdValidator,
  devicesQueryValidator,
  deviceValidator,
  updateDeviceValidator
} from '~/middlewares/devices.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const devicesRouter = Router()

/**
 * @route GET /devices
 * @description Lấy danh sách tất cả thiết bị với phân trang và tìm kiếm
 * @query {number} page - Trang hiện tại (mặc định là 1)
 * @query {number} limit - Số lượng thiết bị trên một trang (mặc định là 10)
 * @query {string} search - Từ khóa tìm kiếm (tùy chọn)
 * @query {number} status - Trạng thái thiết bị để lọc (tùy chọn)
 * @access Yêu cầu xác thực, tài khoản đã xác minh và quyền đọc thiết bị
 */
devicesRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission(PERMISSION.READ, RESOURCE_NAME.DEVICE),
  verifiedAccountValidator,
  paginationValidator,
  devicesQueryValidator,
  wrapRequestHandler(getAllDevicesController as RequestHandler)
)

/**
 * @route GET /devices/:device_id
 * @description Lấy thông tin chi tiết của một thiết bị
 * @param {string} device_id - ID của thiết bị cần lấy thông tin
 * @access Yêu cầu xác thực và quyền đọc thiết bị
 */
devicesRouter.get(
  '/:device_id',
  accessTokenValidatorV2,
  checkPermission(PERMISSION.READ, RESOURCE_NAME.DEVICE),
  deviceIdValidator,
  checkDeviceNotInactive,
  wrapRequestHandler(getDeviceController as RequestHandler)
)

/**
 * @route POST /devices
 * @description Tạo mới một thiết bị
 * @body {string} name - Tên thiết bị (bắt buộc)
 * @body {string} description - Mô tả thiết bị (tùy chọn)
 * @body {number} status - Trạng thái thiết bị (tùy chọn)
 * @access Yêu cầu xác thực, tài khoản đã xác minh và quyền tạo thiết bị
 */
devicesRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.CREATE, RESOURCE_NAME.DEVICE),
  deviceValidator,
  wrapRequestHandler(createDeviceController as RequestHandler)
)

/**
 * @route PATCH /devices/:device_id
 * @description Cập nhật thông tin thiết bị
 * @param {string} device_id - ID của thiết bị cần cập nhật
 * @body {string} name - Tên mới của thiết bị (tùy chọn)
 * @body {string} description - Mô tả mới của thiết bị (tùy chọn)
 * @body {number} status - Trạng thái mới của thiết bị (tùy chọn)
 * @access Yêu cầu xác thực, tài khoản đã xác minh và quyền cập nhật thiết bị
 */
devicesRouter.patch(
  '/:device_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.UPDATE, RESOURCE_NAME.DEVICE),
  deviceIdValidator,
  updateDeviceValidator,
  wrapRequestHandler(updateDeviceController as RequestHandler)
)

/**
 * @route DELETE /devices/:device_id
 * @description Xóa vĩnh viễn một thiết bị
 * @param {string} device_id - ID của thiết bị cần xóa
 * @access Yêu cầu xác thực, tài khoản đã xác minh và quyền xóa thiết bị
 */
devicesRouter.delete(
  '/:device_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.DELETE, RESOURCE_NAME.DEVICE),
  deviceIdValidator,
  wrapRequestHandler(deleteDeviceController as RequestHandler)
)

/**
 * @route PATCH /devices/:device_id/soft-delete
 * @description Xóa mềm một thiết bị (đổi trạng thái thành inactive)
 * @param {string} device_id - ID của thiết bị cần xóa mềm
 * @access Yêu cầu xác thực, tài khoản đã xác minh và quyền cập nhật thiết bị
 */
devicesRouter.patch(
  '/:device_id/soft-delete',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.UPDATE, RESOURCE_NAME.DEVICE),
  deviceIdValidator,
  checkDeviceNotInactive,
  wrapRequestHandler(softDeleteDeviceController as RequestHandler)
)

export default devicesRouter
