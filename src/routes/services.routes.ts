import { RequestHandler, Router } from 'express'
import { PERMISSION, RESOURCE_NAME } from '~/constants/constants'
import { getServiceProductsByServiceIdController } from '~/controllers/serviceProducts.controllers'
import {
  createServiceController,
  deleteServiceController,
  getAllServicesController,
  getServiceController,
  getServiceDurationsController,
  softDeleteServiceController,
  updateServiceController
} from '~/controllers/services.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  paginationValidator,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import {
  checkServiceNotInactive,
  serviceIdValidator,
  servicesQueryValidator,
  serviceValidator,
  updateServiceValidator
} from '~/middlewares/services.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const servicesRouter = Router()

/**
 * @route GET /services
 * @description Lấy danh sách tất cả dịch vụ với phân trang, tìm kiếm và lọc
 * @query {number} page - Trang hiện tại (mặc định là 1)
 * @query {number} limit - Số lượng dịch vụ trên một trang (mặc định là 10)
 * @query {string} search - Từ khóa tìm kiếm (tùy chọn)
 * @query {string} sort - Tiêu chí sắp xếp
 * @query {string} order - Thứ tự sắp xếp: asc hoặc desc
 * @query {string} service_category_id - ID danh mục dịch vụ để lọc
 * @query {string|string[]} device_ids - ID thiết bị để lọc
 * @access Yêu cầu xác thực và quyền đọc dịch vụ
 */
servicesRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission(PERMISSION.READ, RESOURCE_NAME.SERVICE),
  paginationValidator,
  servicesQueryValidator,
  wrapRequestHandler(getAllServicesController as RequestHandler)
)

/**
 * @route GET /services/:service_id
 * @description Lấy thông tin chi tiết của một dịch vụ
 * @param {string} service_id - ID của dịch vụ cần lấy thông tin
 * @access Yêu cầu xác thực và quyền đọc dịch vụ
 */
servicesRouter.get(
  '/:service_id',
  accessTokenValidatorV2,
  checkPermission(PERMISSION.READ, RESOURCE_NAME.SERVICE),
  serviceIdValidator,
  checkServiceNotInactive,
  wrapRequestHandler(getServiceController)
)

/**
 * @route POST /services
 * @description Tạo mới một dịch vụ
 * @body {string} name - Tên dịch vụ (bắt buộc)
 * @body {string} description - Mô tả dịch vụ (bắt buộc)
 * @body {string} service_category_id - ID danh mục dịch vụ (bắt buộc)
 * @body {string[]} device_ids - Danh sách ID thiết bị liên quan (tùy chọn)
 * @body {object[]} durations - Thông tin về các gói thời gian (bắt buộc)
 * @body {string[]} images - Danh sách URL hình ảnh (tùy chọn)
 * @access Yêu cầu xác thực, tài khoản đã xác minh và quyền tạo dịch vụ
 */
servicesRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.CREATE, RESOURCE_NAME.SERVICE),
  serviceValidator,
  wrapRequestHandler(createServiceController)
)

/**
 * @route PATCH /services/:service_id
 * @description Cập nhật thông tin dịch vụ
 * @param {string} service_id - ID của dịch vụ cần cập nhật
 * @body {string} name - Tên dịch vụ (tùy chọn)
 * @body {string} description - Mô tả dịch vụ (tùy chọn)
 * @body {string} service_category_id - ID danh mục dịch vụ (tùy chọn)
 * @body {string[]} device_ids - Danh sách ID thiết bị liên quan (tùy chọn)
 * @body {object[]} durations - Thông tin về các gói thời gian (tùy chọn)
 * @body {string[]} images - Danh sách URL hình ảnh (tùy chọn)
 * @access Yêu cầu xác thực, tài khoản đã xác minh và quyền cập nhật dịch vụ
 */
servicesRouter.patch(
  '/:service_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.UPDATE, RESOURCE_NAME.SERVICE),
  serviceIdValidator,
  updateServiceValidator,
  wrapRequestHandler(updateServiceController)
)

/**
 * @route DELETE /services/:service_id
 * @description Xóa vĩnh viễn một dịch vụ
 * @param {string} service_id - ID của dịch vụ cần xóa
 * @access Yêu cầu xác thực, tài khoản đã xác minh và quyền xóa dịch vụ
 */
servicesRouter.delete(
  '/:service_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.DELETE, RESOURCE_NAME.SERVICE),
  serviceIdValidator,
  wrapRequestHandler(deleteServiceController)
)

/**
 * @route PATCH /services/:service_id/soft-delete
 * @description Xóa mềm một dịch vụ (đổi trạng thái thành inactive)
 * @param {string} service_id - ID của dịch vụ cần xóa mềm
 * @access Yêu cầu xác thực, tài khoản đã xác minh và quyền cập nhật dịch vụ
 */
servicesRouter.patch(
  '/:service_id/soft-delete',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.UPDATE, RESOURCE_NAME.SERVICE),
  serviceIdValidator,
  wrapRequestHandler(softDeleteServiceController)
)

/**
 * @route GET /services/:service_id/products
 * @description Lấy danh sách sản phẩm liên quan đến dịch vụ
 * @param {string} service_id - ID của dịch vụ cần lấy sản phẩm liên quan
 * @access Yêu cầu xác thực và quyền đọc dịch vụ
 */
servicesRouter.get(
  '/:service_id/products',
  accessTokenValidatorV2,
  checkPermission(PERMISSION.READ, RESOURCE_NAME.SERVICE),
  serviceIdValidator,
  wrapRequestHandler(getServiceProductsByServiceIdController)
)

/**
 * @route GET /services/:service_id/durations
 * @description Lấy danh sách thời lượng của một dịch vụ
 * @param {string} service_id - ID của dịch vụ cần lấy thông tin thời lượng
 * @access Public
 */
servicesRouter.get('/:service_id/durations', serviceIdValidator, wrapRequestHandler(getServiceDurationsController))

export default servicesRouter
