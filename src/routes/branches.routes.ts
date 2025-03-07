import { Router } from 'express'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/accounts.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const branchesRouter = Router()

/**
 * @route GET /branches
 * @description Lấy danh sách tất cả chi nhánh
 * @access Public
 *
 * @query {number} [page=1] - Trang hiện tại
 * @query {number} [limit=20] - Số lượng kết quả trên một trang
 * @query {string} [name] - Tìm kiếm theo tên
 * @query {string} [address] - Tìm kiếm theo địa chỉ
 * @query {number} [min_rating] - Đánh giá tối thiểu
 * @query {number} [sort_by] - Sắp xếp theo (1: mới nhất, 2: cũ nhất, 3: đánh giá cao nhất)
 *
 * @returns {Object} 200 - Danh sách chi nhánh phân trang
 */
branchesRouter.get(
  '/',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getBranchesController
    res.json({ message: 'Get branches list successfully' })
  })
)

/**
 * @route GET /branches/:id
 * @description Lấy chi tiết một chi nhánh
 * @access Public
 *
 * @param {string} id - ID chi nhánh
 *
 * @returns {Object} 200 - Chi tiết chi nhánh
 * @throws {404} - Chi nhánh không tồn tại
 */
branchesRouter.get(
  '/:id',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getBranchDetailController
    res.json({ message: 'Get branch detail successfully' })
  })
)

/**
 * @route POST /branches
 * @description Tạo mới chi nhánh
 * @access Private - Admin
 * @requires access_token
 *
 * @body {Object} request
 * @body {string} request.code - Mã chi nhánh
 * @body {string} request.name - Tên chi nhánh
 * @body {string} request.address - Địa chỉ chi nhánh
 * @body {string} [request.description] - Mô tả chi nhánh
 * @body {Array<string>} [request.images] - Danh sách URL ảnh
 * @body {Object} request.contact - Thông tin liên hệ
 * @body {string} request.contact.phone - Số điện thoại
 * @body {string} request.contact.email - Email
 * @body {string} request.contact.address - Địa chỉ đầy đủ
 * @body {Array<Object>} request.opening_hours - Giờ mở cửa
 * @body {number} request.opening_hours[].day - Thứ (0: CN, 1-6: Thứ 2-7)
 * @body {string} request.opening_hours[].open - Giờ mở cửa (HH:mm)
 * @body {string} request.opening_hours[].close - Giờ đóng cửa (HH:mm)
 * @body {Array<string>} [request.service_ids] - Danh sách ID dịch vụ
 * @body {Array<string>} [request.product_ids] - Danh sách ID sản phẩm
 *
 * @returns {Object} 201 - Chi nhánh đã được tạo
 * @throws {400} - Dữ liệu không hợp lệ
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền
 */
branchesRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement createBranchController
    res.status(201).json({ message: 'Create branch successfully' })
  })
)

/**
 * @route PUT /branches/:id
 * @description Cập nhật thông tin chi nhánh
 * @access Private - Admin
 * @requires access_token
 *
 * @param {string} id - ID chi nhánh
 * @body {Object} request
 * @body {string} [request.name] - Tên chi nhánh
 * @body {string} [request.address] - Địa chỉ chi nhánh
 * @body {string} [request.description] - Mô tả chi nhánh
 * @body {Array<string>} [request.images] - Danh sách URL ảnh
 * @body {Object} [request.contact] - Thông tin liên hệ
 * @body {Array<Object>} [request.opening_hours] - Giờ mở cửa
 * @body {number} [request.status] - Trạng thái chi nhánh
 * @body {Array<string>} [request.service_ids] - Danh sách ID dịch vụ
 * @body {Array<string>} [request.product_ids] - Danh sách ID sản phẩm
 *
 * @returns {Object} 200 - Chi nhánh đã được cập nhật
 * @throws {400} - Dữ liệu không hợp lệ
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền
 * @throws {404} - Chi nhánh không tồn tại
 */
branchesRouter.put(
  '/:id',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement updateBranchController
    res.json({ message: 'Update branch successfully' })
  })
)

/**
 * @route DELETE /branches/:id
 * @description Xóa chi nhánh
 * @access Private - Admin
 * @requires access_token
 *
 * @param {string} id - ID chi nhánh
 *
 * @returns {Object} 200 - Thông báo xóa thành công
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền
 * @throws {404} - Chi nhánh không tồn tại
 */
branchesRouter.delete(
  '/:id',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement deleteBranchController
    res.json({ message: 'Delete branch successfully' })
  })
)

/**
 * @route GET /branches/:id/services
 * @description Lấy danh sách dịch vụ của chi nhánh
 * @access Public
 *
 * @param {string} id - ID chi nhánh
 * @query {number} [page=1] - Trang hiện tại
 * @query {number} [limit=20] - Số lượng kết quả trên một trang
 *
 * @returns {Object} 200 - Danh sách dịch vụ phân trang
 * @throws {404} - Chi nhánh không tồn tại
 */
branchesRouter.get(
  '/:id/services',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getBranchServicesController
    res.json({ message: 'Get branch services successfully' })
  })
)

/**
 * @route GET /branches/:id/staff
 * @description Lấy danh sách nhân viên của chi nhánh
 * @access Public
 *
 * @param {string} id - ID chi nhánh
 * @query {number} [page=1] - Trang hiện tại
 * @query {number} [limit=20] - Số lượng kết quả trên một trang
 * @query {string} [staff_type] - Loại nhân viên (practitioner, receptionist)
 *
 * @returns {Object} 200 - Danh sách nhân viên phân trang
 * @throws {404} - Chi nhánh không tồn tại
 */
branchesRouter.get(
  '/:id/staff',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getBranchStaffController
    res.json({ message: 'Get branch staff successfully' })
  })
)

/**
 * @route GET /branches/nearest
 * @description Lấy danh sách chi nhánh gần nhất
 * @access Public
 *
 * @query {number} latitude - Vĩ độ
 * @query {number} longitude - Kinh độ
 * @query {number} [radius=10] - Bán kính (km)
 * @query {number} [limit=5] - Số lượng kết quả
 *
 * @returns {Array<Object>} 200 - Danh sách chi nhánh gần nhất
 * @throws {400} - Thiếu tọa độ
 */
branchesRouter.get(
  '/nearest',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getNearestBranchesController
    res.json({ message: 'Get nearest branches successfully' })
  })
)

export default branchesRouter
