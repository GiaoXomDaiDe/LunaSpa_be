import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { ORDER_MESSAGES, PAYMENT_MESSAGES } from '~/constants/messages'
import webhookController from '~/controllers/webhook.controller'
import {
  BookServiceReqBody,
  CancelOrderReqBody,
  CreateProductOrderReqBody,
  OrderParams,
  OrdersQuery,
  ProcessPaymentReqBody
} from '~/models/request/Orders.request'
import ordersService from '~/services/orders.services'

export const getOrdersController = async (
  req: Request<ParamsDictionary, any, any, OrdersQuery>,
  res: Response,
  next: NextFunction
) => {
  const { limit, page, customer_id, branch_id, status, start_date, end_date, order_id } = req.query
  const options = {
    limit: Number(limit) || undefined,
    page: Number(page) || undefined,
    customer_id: customer_id || undefined,
    branch_id: branch_id || undefined,
    status: status || undefined,
    start_date: start_date ? new Date(start_date) : undefined,
    end_date: end_date ? new Date(end_date) : undefined,
    order_id: order_id || undefined
  }

  const result = await ordersService.getAllOrders(options)

  res.status(HTTP_STATUS.OK).json({
    message: ORDER_MESSAGES.GET_ORDERS_SUCCESS,
    result
  })
}

export const getOrderController = async (req: Request<OrderParams, any, any>, res: Response, next: NextFunction) => {
  const { order_id } = req.params
  const result = await ordersService.getOrderById(order_id)

  res.status(HTTP_STATUS.OK).json({
    message: ORDER_MESSAGES.GET_ORDER_SUCCESS,
    result
  })
}

export const purchaseProductController = async (
  req: Request<ParamsDictionary, any, CreateProductOrderReqBody>,
  res: Response,
  next: NextFunction
) => {
  // @ts-expect-error - Thêm để sử dụng req.decoded_authorization từ middleware
  const { account_id } = req.decoded_authorization
  const result = await ordersService.createProductOrder(account_id, req.body)

  res.status(HTTP_STATUS.CREATED).json({
    message: ORDER_MESSAGES.CREATE_PRODUCT_ORDER_SUCCESS,
    result
  })
}

export const bookServiceController = async (
  req: Request<ParamsDictionary, any, BookServiceReqBody>,
  res: Response,
  next: NextFunction
) => {
  // @ts-expect-error - Thêm để sử dụng req.decoded_authorization từ middleware
  const { account_id } = req.decoded_authorization
  // Gọi service để đặt lịch dịch vụ
  const result = await ordersService.bookService(account_id, req.body)

  res.status(HTTP_STATUS.CREATED).json({
    message: ORDER_MESSAGES.CREATE_SERVICE_BOOKING_SUCCESS,
    result
  })
}

export const processPaymentController = async (
  req: Request<OrderParams, any, ProcessPaymentReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { order_id } = req.params
  // @ts-expect-error - Thêm để sử dụng req.decoded_authorization từ middleware
  const { account_id } = req.decoded_authorization

  // Gọi service để xử lý thanh toán
  const result = await ordersService.processPayment(order_id, account_id, req.body)

  res.status(HTTP_STATUS.OK).json({
    message: PAYMENT_MESSAGES.PAYMENT_INITIATED,
    result
  })
}

//Ma don hang ko dc de id ma la 1 ma random
export const confirmPaymentController = async (
  req: Request<OrderParams, any, { payment_intent_id: string; payment_method_id: string }>,
  res: Response,
  next: NextFunction
) => {
  const { order_id } = req.params
  const { payment_intent_id, payment_method_id } = req.body
  // @ts-expect-error - Thêm để sử dụng req.decoded_authorization từ middleware
  const { account_id } = req.decoded_authorization

  // Gọi service để xác nhận thanh toán thành công
  const result = await ordersService.confirmPayment(order_id, payment_intent_id, payment_method_id, account_id)

  res.status(HTTP_STATUS.OK).json({
    message: PAYMENT_MESSAGES.PAYMENT_SUCCESS,
    result
  })
}

export const cancelOrderController = async (
  req: Request<OrderParams, any, CancelOrderReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { order_id } = req.params
  // @ts-expect-error - Thêm để sử dụng req.decoded_authorization từ middleware
  const { account_id } = req.decoded_authorization

  const result = await ordersService.cancelOrder(order_id, account_id, req.body)

  res.status(HTTP_STATUS.OK).json({
    message: ORDER_MESSAGES.CANCEL_ORDER_SUCCESS,
    result
  })
}

export const stripeWebhookController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Chuyển tiếp yêu cầu đến webhookController
    await webhookController.handleStripeWebhook(req, res)
  } catch (err) {
    console.error('Webhook error:', err)
    return res.status(HTTP_STATUS.BAD_REQUEST).send(PAYMENT_MESSAGES.WEBHOOK_ERROR)
  }
}
