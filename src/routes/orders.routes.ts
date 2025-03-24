import { Router } from 'express'
import {
  bookServiceController,
  cancelOrderController,
  confirmPaymentController,
  getOrderController,
  getOrdersController,
  processPaymentController,
  purchaseProductController
} from '~/controllers/orders.controllers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/accounts.middleware'
import {
  bookServiceValidator,
  cancelOrderValidator,
  orderIdValidator,
  OrdersQueryValidator,
  paymentValidator,
  purchaseProductValidator
} from '~/middlewares/orders.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const ordersRouter = Router()

ordersRouter.get(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('read', 'Order'),
  OrdersQueryValidator,
  wrapRequestHandler(getOrdersController)
)

ordersRouter.get(
  '/:order_id',
  accessTokenValidator,
  verifiedAccountValidator,
  orderIdValidator,
  wrapRequestHandler(getOrderController)
)

ordersRouter.post(
  '/products',
  accessTokenValidator,
  verifiedAccountValidator,
  purchaseProductValidator,
  wrapRequestHandler(purchaseProductController)
)

ordersRouter.post(
  '/services',
  accessTokenValidator,
  verifiedAccountValidator,
  bookServiceValidator,
  wrapRequestHandler(bookServiceController)
)

ordersRouter.post(
  '/:order_id/payment',
  accessTokenValidator,
  verifiedAccountValidator,
  orderIdValidator,
  paymentValidator,
  wrapRequestHandler(processPaymentController)
)

ordersRouter.post(
  '/:order_id/payment/confirm',
  accessTokenValidator,
  verifiedAccountValidator,
  orderIdValidator,
  wrapRequestHandler(confirmPaymentController)
)

ordersRouter.post(
  '/:order_id/cancel',
  accessTokenValidator,
  verifiedAccountValidator,
  orderIdValidator,
  cancelOrderValidator,
  wrapRequestHandler(cancelOrderController)
)

export default ordersRouter
