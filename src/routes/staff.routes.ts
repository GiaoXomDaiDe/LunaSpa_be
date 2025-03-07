import { Router } from 'express'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/accounts.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const staffRouter = Router()

/**
 * @route GET /staff
 * @description Lấy danh sách tất cả nhân viên
 * @access Private - Admin
 * @requires access_token
 *
 * @query {number} [page=1] - Trang hiện tại
 * @query {number} [limit=20] - Số lượng kết quả trên một trang
 * @query {string} [name] - Tìm kiếm theo tên
 * @query {string} [staff_type] - Loại nhân viên (practitioner, receptionist)
 * @query {string} [specialty_id] - Lọc theo chuyên môn
 * @query {number} [min_rating] - Đánh giá tối thiểu
 * @query {number} [sort_by] - Sắp xếp theo (1: mới nhất, 2: cũ nhất, 3: đánh giá cao nhất)
 *
 * @returns {Object} 200 - Danh sách nhân viên phân trang
 */
staffRouter.get(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getStaffController
    res.json({ message: 'Get staff list successfully' })
  })
)

/**
 * @route GET /staff/practitioners
 * @description Lấy danh sách nhân viên thực hiện dịch vụ (practitioners)
 * @access Public
 *
 * @query {number} [page=1] - Trang hiện tại
 * @query {number} [limit=20] - Số lượng kết quả trên một trang
 * @query {string} [name] - Tìm kiếm theo tên
 * @query {string} [specialty_id] - Lọc theo chuyên môn
 * @query {number} [min_rating] - Đánh giá tối thiểu
 * @query {number} [sort_by] - Sắp xếp theo (1: mới nhất, 2: cũ nhất, 3: đánh giá cao nhất)
 *
 * @returns {Object} 200 - Danh sách practitioners phân trang
 */
staffRouter.get(
  '/practitioners',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getPractitionersController
    res.json({ message: 'Get practitioners list successfully' })
  })
)

/**
 * @route GET /staff/:id
 * @description Lấy chi tiết một nhân viên
 * @access Public (với thông tin cơ bản) hoặc Private (với thông tin đầy đủ)
 *
 * @param {string} id - ID nhân viên
 *
 * @returns {Object} 200 - Chi tiết nhân viên
 * @throws {404} - Nhân viên không tồn tại
 */
staffRouter.get(
  '/:id',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getStaffDetailController
    res.json({ message: 'Get staff detail successfully' })
  })
)

/**
 * @route POST /staff
 * @description Tạo mới profile nhân viên
 * @access Private - Admin
 * @requires access_token
 *
 * @body {Object} request
 * @body {string} request.account_id - ID tài khoản
 * @body {string} request.staff_type - Loại nhân viên (practitioner, receptionist)
 * @body {Array<string>} [request.specialty_ids] - Danh sách ID chuyên môn
 * @body {number} [request.year_of_experience] - Số năm kinh nghiệm
 * @body {string} [request.bio] - Tiểu sử
 *
 * @returns {Object} 201 - Profile nhân viên đã được tạo
 * @throws {400} - Dữ liệu không hợp lệ
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền
 * @throws {404} - Tài khoản không tồn tại
 */
staffRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement createStaffProfileController
    res.status(201).json({ message: 'Create staff profile successfully' })
  })
)

/**
 * @route PUT /staff/:id
 * @description Cập nhật thông tin profile nhân viên
 * @access Private - Admin hoặc Chính chủ
 * @requires access_token
 *
 * @param {string} id - ID profile nhân viên
 * @body {Object} request
 * @body {string} [request.staff_type] - Loại nhân viên (practitioner, receptionist)
 * @body {Array<string>} [request.specialty_ids] - Danh sách ID chuyên môn
 * @body {number} [request.year_of_experience] - Số năm kinh nghiệm
 * @body {string} [request.bio] - Tiểu sử
 *
 * @returns {Object} 200 - Profile nhân viên đã được cập nhật
 * @throws {400} - Dữ liệu không hợp lệ
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền
 * @throws {404} - Profile nhân viên không tồn tại
 */
staffRouter.put(
  '/:id',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement updateStaffProfileController
    res.json({ message: 'Update staff profile successfully' })
  })
)

/**
 * @route DELETE /staff/:id
 * @description Xóa profile nhân viên
 * @access Private - Admin
 * @requires access_token
 *
 * @param {string} id - ID profile nhân viên
 *
 * @returns {Object} 200 - Thông báo xóa thành công
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền
 * @throws {404} - Profile nhân viên không tồn tại
 */
staffRouter.delete(
  '/:id',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement deleteStaffProfileController
    res.json({ message: 'Delete staff profile successfully' })
  })
)

/**
 * @route GET /staff/:id/reviews
 * @description Lấy danh sách đánh giá của một nhân viên
 * @access Public
 *
 * @param {string} id - ID profile nhân viên
 * @query {number} [page=1] - Trang hiện tại
 * @query {number} [limit=20] - Số lượng kết quả trên một trang
 * @query {number} [rating] - Lọc theo số sao (1-5)
 *
 * @returns {Object} 200 - Danh sách đánh giá phân trang
 * @throws {404} - Profile nhân viên không tồn tại
 */
staffRouter.get(
  '/:id/reviews',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getStaffReviewsController
    res.json({ message: 'Get staff reviews successfully' })
  })
)

/**
 * @route POST /staff/:id/reviews
 * @description Thêm đánh giá cho nhân viên
 * @access Private
 * @requires access_token
 *
 * @param {string} id - ID profile nhân viên
 * @body {Object} request
 * @body {number} request.rating - Số sao (1-5)
 * @body {string} [request.comment] - Nhận xét
 * @body {string} request.order_id - ID đơn hàng đã hoàn thành
 *
 * @returns {Object} 201 - Đánh giá đã được thêm
 * @throws {400} - Dữ liệu không hợp lệ
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền hoặc đơn hàng chưa hoàn thành
 * @throws {404} - Profile nhân viên không tồn tại
 */
staffRouter.post(
  '/:id/reviews',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement addStaffReviewController
    res.status(201).json({ message: 'Add staff review successfully' })
  })
)

/**
 * @route GET /staff/specialties
 * @description Lấy danh sách chuyên môn
 * @access Public
 *
 * @returns {Array<Object>} 200 - Danh sách chuyên môn
 */
staffRouter.get(
  '/specialties',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getSpecialtiesController
    res.json({ message: 'Get specialties successfully' })
  })
)

export default staffRouter
