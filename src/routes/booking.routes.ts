import { RequestHandler, Router } from 'express'
import { verifyBookingController } from '~/controllers/booking.controllers'
import { accessTokenValidator } from '~/middlewares/accounts.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const bookingRouter = Router()

/**
 * Route xác thực booking qua mã QR
 * @route GET /api/bookings/verify/:booking_id
 * @description Xác thực đơn đặt lịch thông qua mã QR
 * @access Private - Chỉ nhân viên mới được phép xác thực
 */
bookingRouter.get(
  '/verify/:order_id',
  accessTokenValidator,
  wrapRequestHandler(verifyBookingController as RequestHandler)
)

export default bookingRouter
