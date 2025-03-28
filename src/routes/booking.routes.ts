import { RequestHandler, Router } from 'express'
import { verifyBookingController } from '~/controllers/booking.controllers'
import { accessTokenValidator } from '~/middlewares/accounts.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const bookingRouter = Router()

bookingRouter.get(
  '/verify/:order_id',
  accessTokenValidator,
  wrapRequestHandler(verifyBookingController as RequestHandler)
)

export default bookingRouter
