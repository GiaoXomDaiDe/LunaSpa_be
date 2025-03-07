import { Router } from 'express'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/accounts.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const servicesRouter = Router()

/**
 * @route GET /services
 * @description Lấy danh sách tất cả dịch vụ
 * @access Public
 *
 * @query {number} [page=1] - Trang hiện tại
 * @query {number} [limit=20] - Số lượng kết quả trên một trang
 * @query {string} [category_id] - Lọc theo category
 * @query {string} [name] - Tìm kiếm theo tên
 * @query {number} [min_price] - Giá tối thiểu
 * @query {number} [max_price] - Giá tối đa
 * @query {number} [sort_by] - Sắp xếp theo (1: mới nhất, 2: cũ nhất, 3: giá tăng dần, 4: giá giảm dần)
 *
 * @returns {Object} 200 - Danh sách dịch vụ phân trang
 */
servicesRouter.get(
  '/',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getServicesController
    res.json({ message: 'Get services list successfully' })
  })
)
/**
 * @route GET /services/:id
 * @description Lấy chi tiết một dịch vụ
 * @access Public
 *
 * @param {string} id - ID dịch vụ
 *
 * @returns {Object} 200 - Chi tiết dịch vụ
 * @throws {404} - Dịch vụ không tồn tại
 */
servicesRouter.get(
  '/:id',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getServiceDetailController
    res.json({ message: 'Get service detail successfully' })
  })
)

/**
 * @route POST /services
 * @description Tạo mới dịch vụ
 * @access Private - Admin
 * @requires access_token
 *
 * @body {Object} request
 * @body {string} request.code - Mã dịch vụ
 * @body {string} request.name - Tên dịch vụ
 * @body {string} request.service_category_id - ID danh mục dịch vụ
 * @body {string} request.description - Mô tả dịch vụ
 * @body {Array<string>} request.images - Danh sách URL ảnh
 * @body {Array<Object>} request.durations - Các gói thời gian
 * @body {string} request.durations[].duration_name - Tên gói thời gian
 * @body {number} request.durations[].price - Giá gói
 * @body {number} [request.durations[].discount_price] - Giá khuyến mãi
 * @body {string} [request.durations[].sub_description] - Mô tả phụ
 * @body {number} request.durations[].duration_in_minutes - Thời gian (phút)
 * @body {Array<string>} [request.device_ids] - Danh sách ID thiết bị sử dụng
 *
 * @returns {Object} 201 - Dịch vụ đã được tạo
 * @throws {400} - Dữ liệu không hợp lệ
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền
 */
servicesRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement createServiceController
    res.status(201).json({ message: 'Create service successfully' })
  })
)

/**
 * @route PUT /services/:id
 * @description Cập nhật thông tin dịch vụ
 * @access Private - Admin
 * @requires access_token
 *
 * @param {string} id - ID dịch vụ
 * @body {Object} request
 * @body {string} [request.name] - Tên dịch vụ
 * @body {string} [request.service_category_id] - ID danh mục dịch vụ
 * @body {string} [request.description] - Mô tả dịch vụ
 * @body {Array<string>} [request.images] - Danh sách URL ảnh
 * @body {Array<Object>} [request.durations] - Các gói thời gian
 * @body {number} [request.status] - Trạng thái dịch vụ
 *
 * @returns {Object} 200 - Dịch vụ đã được cập nhật
 * @throws {400} - Dữ liệu không hợp lệ
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền
 * @throws {404} - Dịch vụ không tồn tại
 */
servicesRouter.put(
  '/:id',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement updateServiceController
    res.json({ message: 'Update service successfully' })
  })
)

/**
 * @route DELETE /services/:id
 * @description Xóa dịch vụ
 * @access Private - Admin
 * @requires access_token
 *
 * @param {string} id - ID dịch vụ
 *
 * @returns {Object} 200 - Thông báo xóa thành công
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền
 * @throws {404} - Dịch vụ không tồn tại
 */
servicesRouter.delete(
  '/:id',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement deleteServiceController
    res.json({ message: 'Delete service successfully' })
  })
)

/**
 * @route GET /services/categories
 * @description Lấy danh sách danh mục dịch vụ
 * @access Public
 *
 * @returns {Array<Object>} 200 - Danh sách danh mục dịch vụ
 */
servicesRouter.get(
  '/categories',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getServiceCategoriesController
    res.json({ message: 'Get service categories successfully' })
  })
)

/**
 * @route GET /services/popular
 * @description Lấy danh sách dịch vụ phổ biến
 * @access Public
 *
 * @query {number} [limit=10] - Số lượng dịch vụ
 *
 * @returns {Array<Object>} 200 - Danh sách dịch vụ phổ biến
 */
servicesRouter.get(
  '/popular',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getPopularServicesController
    res.json({ message: 'Get popular services successfully' })
  })
)

export default servicesRouter
