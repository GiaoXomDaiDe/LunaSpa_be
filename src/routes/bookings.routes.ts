import { Router } from 'express'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/accounts.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const bookingsRouter = Router()

/**
 * @route GET /bookings
 * @description Lấy danh sách đơn hàng/đặt lịch của người dùng hiện tại
 * @access Private
 * @requires access_token
 *
 * @query {number} [page=1] - Trang hiện tại
 * @query {number} [limit=20] - Số lượng kết quả trên một trang
 * @query {number} [status] - Lọc theo trạng thái (1: pending, 2: confirmed, 3: cancelled, 4: completed)
 * @query {string} [start_date] - Lọc từ ngày (YYYY-MM-DD)
 * @query {string} [end_date] - Lọc đến ngày (YYYY-MM-DD)
 *
 * @returns {Object} 200 - Danh sách đơn hàng phân trang
 */
bookingsRouter.get(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getMyBookingsController
    res.json({ message: 'Get my bookings successfully' })
  })
)

/**
 * @route GET /bookings/all
 * @description Lấy danh sách tất cả đơn hàng/đặt lịch (cho admin)
 * @access Private - Admin
 * @requires access_token
 *
 * @query {number} [page=1] - Trang hiện tại
 * @query {number} [limit=20] - Số lượng kết quả trên một trang
 * @query {number} [status] - Lọc theo trạng thái (1: pending, 2: confirmed, 3: cancelled, 4: completed)
 * @query {string} [start_date] - Lọc từ ngày (YYYY-MM-DD)
 * @query {string} [end_date] - Lọc đến ngày (YYYY-MM-DD)
 * @query {string} [customer_account_id] - Lọc theo khách hàng
 * @query {string} [branch_id] - Lọc theo chi nhánh
 *
 * @returns {Object} 200 - Danh sách đơn hàng phân trang
 */
bookingsRouter.get(
  '/all',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getAllBookingsController
    res.json({ message: 'Get all bookings successfully' })
  })
)

/**
 * @route GET /bookings/:id
 * @description Lấy chi tiết một đơn hàng/đặt lịch
 * @access Private - Admin hoặc chủ đơn hàng
 * @requires access_token
 *
 * @param {string} id - ID đơn hàng
 *
 * @returns {Object} 200 - Chi tiết đơn hàng
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền
 * @throws {404} - Đơn hàng không tồn tại
 */
bookingsRouter.get(
  '/:id',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getBookingDetailController
    res.json({ message: 'Get booking detail successfully' })
  })
)

/**
 * @route POST /bookings
 * @description Tạo mới đơn hàng/đặt lịch
 * @access Private
 * @requires access_token
 *
 * @body {Object} request
 * @body {string} request.branch_id - ID chi nhánh
 * @body {Array<Object>} request.items - Danh sách mục đặt
 * @body {string} request.items[].item_type - Loại mục ('service' hoặc 'product')
 * @body {string} request.items[].item_id - ID của dịch vụ hoặc sản phẩm
 * @body {number} request.items[].quantity - Số lượng
 * @body {string} [request.items[].staff_profile_id] - ID nhân viên thực hiện (cho dịch vụ)
 * @body {string} [request.items[].slot_id] - ID slot thời gian (cho dịch vụ)
 * @body {string} [request.booking_time] - Thời gian đặt lịch (YYYY-MM-DD HH:mm)
 * @body {number} [request.payment_method] - Phương thức thanh toán (1: credit card, 2: momo, 3: zalopay, 4: vnpay)
 * @body {string} [request.note] - Ghi chú
 *
 * @returns {Object} 201 - Đơn hàng đã được tạo
 * @throws {400} - Dữ liệu không hợp lệ
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền
 */
bookingsRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement createBookingController
    res.status(201).json({ message: 'Create booking successfully' })
  })
)

/**
 * @route PUT /bookings/:id/status
 * @description Cập nhật trạng thái đơn hàng
 * @access Private - Admin, nhân viên hoặc chủ đơn hàng (trong một số trường hợp)
 * @requires access_token
 *
 * @param {string} id - ID đơn hàng
 * @body {Object} request
 * @body {number} request.status - Trạng thái mới (1: pending, 2: confirmed, 3: cancelled, 4: completed)
 * @body {string} [request.reason] - Lý do (bắt buộc nếu hủy)
 *
 * @returns {Object} 200 - Đơn hàng đã được cập nhật trạng thái
 * @throws {400} - Dữ liệu không hợp lệ
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền
 * @throws {404} - Đơn hàng không tồn tại
 */
bookingsRouter.put(
  '/:id/status',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement updateBookingStatusController
    res.json({ message: 'Update booking status successfully' })
  })
)

/**
 * @route GET /bookings/:id/details
 * @description Lấy danh sách chi tiết đơn hàng
 * @access Private - Admin hoặc chủ đơn hàng
 * @requires access_token
 *
 * @param {string} id - ID đơn hàng
 *
 * @returns {Array<Object>} 200 - Danh sách chi tiết đơn hàng
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền
 * @throws {404} - Đơn hàng không tồn tại
 */
bookingsRouter.get(
  '/:id/details',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getBookingDetailsController
    res.json({ message: 'Get booking details successfully' })
  })
)

/**
 * @route POST /bookings/check-availability
 * @description Kiểm tra tính khả dụng của các slot và dịch vụ
 * @access Public
 *
 * @body {Object} request
 * @body {string} request.branch_id - ID chi nhánh
 * @body {Array<Object>} request.services - Danh sách dịch vụ
 * @body {string} request.services[].service_id - ID dịch vụ
 * @body {string} [request.services[].staff_profile_id] - ID nhân viên
 * @body {string} request.date - Ngày kiểm tra (YYYY-MM-DD)
 *
 * @returns {Object} 200 - Kết quả kiểm tra và danh sách các slot khả dụng
 */
bookingsRouter.post(
  '/check-availability',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement checkBookingAvailabilityController
    res.json({ message: 'Check booking availability successfully' })
  })
)

/**
 * @route POST /bookings/:id/payment
 * @description Thanh toán đơn hàng
 * @access Private
 * @requires access_token
 *
 * @param {string} id - ID đơn hàng
 * @body {Object} request
 * @body {number} request.payment_method - Phương thức thanh toán (1: credit card, 2: momo, 3: zalopay, 4: vnpay)
 *
 * @returns {Object} 200 - Thông tin thanh toán hoặc URL chuyển hướng
 * @throws {400} - Dữ liệu không hợp lệ
 * @throws {401} - Unauthorized
 * @throws {403} - Không có quyền
 * @throws {404} - Đơn hàng không tồn tại
 */
bookingsRouter.post(
  '/:id/payment',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement processBookingPaymentController
    res.json({ message: 'Process booking payment successfully' })
  })
)

/**
 * @route GET /bookings/statistics
 * @description Lấy thống kê đơn hàng/đặt lịch (cho admin)
 * @access Private - Admin
 * @requires access_token
 *
 * @query {string} [start_date] - Thống kê từ ngày (YYYY-MM-DD)
 * @query {string} [end_date] - Thống kê đến ngày (YYYY-MM-DD)
 * @query {string} [branch_id] - Lọc theo chi nhánh
 *
 * @returns {Object} 200 - Thống kê đơn hàng
 */
bookingsRouter.get(
  '/statistics',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getBookingStatisticsController
    res.json({ message: 'Get booking statistics successfully' })
  })
)

export default bookingsRouter
