import { ClientSession, ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { ORDER_MESSAGES, PAYMENT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import {
  BookServiceReqBody,
  CancelOrderReqBody,
  CreateProductOrderReqBody,
  GetAllOrdersOptions
} from '~/models/request/Orders.request'
import Order, { OrderStatus, PaymentMethod } from '~/models/schema/Order.schema'
import OrderDetail, { ItemType } from '~/models/schema/OrderDetail.schema'
import { StaffSlotStatus } from '~/models/schema/StaffSlot.schema'
import { CurrencyUnit, TransactionMethod, TransactionStatus } from '~/models/schema/Transaction.schema'
import { buildOrderPipeline, buildOrdersPipeline } from '~/pipelines/order.pipeline'
import accountsService from '~/services/accounts.services'
import branchesService from '~/services/branches.services'
import databaseService from '~/services/database.services'
import momoService from '~/services/momo.services'
import productsService from '~/services/products.services'
import qrCodeService from '~/services/qrcode.services'
import servicesService from '~/services/services.services'
import staffProfilesService from '~/services/staffProfiles.services'
import staffSlotsService from '~/services/staffSlots.services'
import stripeService from '~/services/stripe.services'
import { sendBookingConfirmationEmail, sendPaymentConfirmationEmail } from '~/utils/email'

class OrdersService {
  async getAllOrders(options: GetAllOrdersOptions) {
    const { pipeline, _options } = buildOrdersPipeline(options)
    const orders = await databaseService.orders.aggregate(pipeline).toArray()

    const { data, total_count } = orders[0] || { data: [], total_count: [] }
    const count = total_count?.[0]?.count || 0

    return {
      data,
      total_count: count,
      page: _options.page,
      limit: _options.limit,
      total_pages: Math.ceil(count / _options.limit)
    }
  }

  async getOrderById(order_id: string, session?: ClientSession) {
    const pipeline = buildOrderPipeline(order_id)
    const [order] = await databaseService.orders.aggregate(pipeline, { session }).toArray()

    if (!order) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return order
  }

  async createProductOrder(customer_id: string, body: CreateProductOrderReqBody) {
    const { branch_id, items, payment_method, note } = body

    if (!items || items.length === 0) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_ITEMS_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra branch có tồn tại không
    const branch = await branchesService.getBranch(branch_id)
    if (!branch) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.BRANCH_ID_INVALID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    // Kiểm tra và tính toán thông tin đơn hàng
    let total_price = 0
    let discount_amount = 0
    const order_items: OrderDetail[] = []

    for (const item of items) {
      // Kiểm tra loại item
      if (item.item_type !== ItemType.PRODUCT) {
        throw new ErrorWithStatus({
          message: ORDER_MESSAGES.ITEM_TYPE_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      // Kiểm tra sản phẩm có tồn tại không
      const product = await productsService.getProduct(item.item_id)
      if (!product) {
        throw new ErrorWithStatus({
          message: ORDER_MESSAGES.ITEM_ID_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      const product_price = product.price
      const product_discount = product.discount_price || 0
      const final_price = product_discount > 0 ? product_discount : product_price

      // Tính toán giá
      total_price += product_price * item.quantity
      discount_amount += (product_price - final_price) * item.quantity

      order_items.push(
        new OrderDetail({
          order_id: new ObjectId(), // Tạm thời, sẽ cập nhật sau
          item_type: ItemType.PRODUCT,
          item_id: new ObjectId(item.item_id),
          item_name: product.name,
          price: product_price,
          discount_price: product_discount,
          quantity: item.quantity,
          note: note
        })
      )
    }

    // Tạo đơn hàng
    const final_price = total_price - discount_amount
    const order = new Order({
      customer_account_id: new ObjectId(customer_id),
      branch_id: new ObjectId(branch_id),
      total_price,
      discount_amount,
      final_price,
      payment_method,
      status: OrderStatus.PENDING,
      note
    })

    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        // Lưu đơn hàng
        const result = await databaseService.orders.insertOne(order, { session })
        if (!result.insertedId) {
          throw new ErrorWithStatus({
            message: 'Không thể tạo đơn hàng',
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }

        const order_id = result.insertedId

        // Cập nhật order_id cho các order items
        for (const item of order_items) {
          item.order_id = order_id
        }

        // Lưu chi tiết đơn hàng
        await databaseService.orderDetails.insertMany(order_items, { session })
        // Tạo payment intent nếu thanh toán bằng Stripe
        let payment_intent = null
        if (payment_method === PaymentMethod.STRIPE) {
          // Lấy thông tin khách hàng
          const account = await accountsService.getAccount(customer_id)
          if (!account) {
            throw new ErrorWithStatus({
              message: ORDER_MESSAGES.CUSTOMER_ID_INVALID,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }

          // Tạo payment intent
          try {
            payment_intent = await stripeService.createPaymentIntent(final_price, account.email, {
              order_id: order_id.toString(),
              customer_id,
              order_type: 'product',
              items: order_items.map((item) => item.item_name).join(', ')
            })
            // Lưu transaction
            await databaseService.transactions.insertOne(
              {
                order_id,
                customer_account_id: new ObjectId(customer_id),
                payment_method: payment_method,
                payment_provider: 'stripe',
                amount: final_price,
                currency: CurrencyUnit.VND,
                status: TransactionStatus.PENDING,
                type: TransactionMethod.PAYMENT,
                payment_intent_id: payment_intent.paymentIntentId,
                created_at: new Date(),
                updated_at: new Date(),
                metadata: {
                  order_type: 'product',
                  items: order_items.map((item) => item.item_name).join(', '),
                  client_secret: payment_intent.clientSecret
                }
              },
              { session }
            )
          } catch (error) {
            throw new ErrorWithStatus({
              message: PAYMENT_MESSAGES.STRIPE_PAYMENT_INTENT_CREATE_FAILED,
              status: HTTP_STATUS.INTERNAL_SERVER_ERROR
            })
          }
        }
        // Lấy đơn hàng đã tạo với thông tin đầy đủ
        const order_data = await this.getOrderById(order_id.toString(), session)

        return {
          order: order_data,
          payment_intent: payment_intent
            ? {
                clientSecret: payment_intent.clientSecret,
                paymentIntentId: payment_intent.paymentIntentId
              }
            : null
        }
      })
    } finally {
      await session.endSession()
    }
  }

  async bookService(customer_id: string, body: BookServiceReqBody) {
    const { branch_id, service_item, booking_time, payment_method, note, voucher_code, slot_id, duration_index } = body

    if (!service_item || !service_item.item_id) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_ITEMS_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra branch có tồn tại không
    const branch = await branchesService.getBranch(branch_id)
    if (!branch) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.BRANCH_ID_INVALID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra dịch vụ có tồn tại không
    const service = await servicesService.getService(service_item.item_id)
    if (!service) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ITEM_ID_INVALID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra duration_index hợp lệ
    if (duration_index === undefined || !service.durations || duration_index >= service.durations.length) {
      throw new ErrorWithStatus({
        message: 'Duration không hợp lệ',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const selectedDuration = service.durations[duration_index]

    // Xử lý thời gian
    const bookingDate = new Date(booking_time)

    // Kiểm tra slot nếu đã được chỉ định
    let staffSlot
    let staffProfile

    if (slot_id) {
      // Lấy thông tin slot
      staffSlot = await staffSlotsService.getStaffSlot(slot_id)

      if (!staffSlot) {
        throw new ErrorWithStatus({
          message: ORDER_MESSAGES.SLOT_NOT_AVAILABLE,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      // Kiểm tra slot có đủ thời gian cho dịch vụ không
      const serviceDuration = selectedDuration.duration_in_minutes || 60
      if (staffSlot.available_minutes < serviceDuration) {
        throw new ErrorWithStatus({
          message: 'Slot không đủ thời gian cho dịch vụ này',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      // Lấy thông tin staff profile từ slot
      staffProfile = await staffProfilesService.getStaffProfile(staffSlot.staff_profile_id.toString())
    } else {
      throw new ErrorWithStatus({
        message: 'Cần chỉ định slot_id để đặt lịch',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Tính toán thời gian bắt đầu và kết thúc dịch vụ
    const startTime = new Date(staffSlot.start_time)
    const serviceDuration = selectedDuration.duration_in_minutes || 60
    const endTime = new Date(startTime.getTime() + serviceDuration * 60000)

    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        // Cập nhật slot trước
        const originalAvailableMinutes = staffSlot.available_minutes
        const updatedAvailableMinutes = originalAvailableMinutes - serviceDuration

        // Nếu slot vẫn còn thời gian trống sau khi đặt
        if (updatedAvailableMinutes > 0) {
          await databaseService.staffSlots.updateOne(
            { _id: staffSlot._id },
            {
              $set: {
                available_minutes: updatedAvailableMinutes,
                used_minutes: staffSlot.used_minutes + serviceDuration,
                status: StaffSlotStatus.PENDING
              },
              $push: { orders: new ObjectId() } // Placeholder, sẽ cập nhật order_id sau
            },
            { session }
          )
        } else {
          // Nếu slot sẽ đầy sau khi đặt
          await databaseService.staffSlots.updateOne(
            { _id: staffSlot._id },
            {
              $set: {
                available_minutes: 0,
                used_minutes: staffSlot.used_minutes + serviceDuration,
                status: StaffSlotStatus.PENDING
              },
              $push: { orders: new ObjectId() } // Placeholder, sẽ cập nhật order_id sau
            },
            { session }
          )
        }

        // Tính toán giá
        const servicePrice = selectedDuration.price || service.price || 0
        const serviceDiscount = selectedDuration.discount_price || service.discount_price || 0
        const finalPrice = serviceDiscount > 0 ? serviceDiscount : servicePrice
        const totalPrice = servicePrice
        const discountAmount = servicePrice - finalPrice

        // Tạo đơn hàng
        const order = new Order({
          customer_account_id: new ObjectId(customer_id),
          branch_id: new ObjectId(branch_id),
          booking_time: bookingDate,
          start_time: startTime,
          end_time: endTime,
          total_price: totalPrice,
          discount_amount: discountAmount,
          final_price: finalPrice,
          payment_method,
          status: OrderStatus.PENDING,
          note
        })

        // Lưu đơn hàng
        const result = await databaseService.orders.insertOne(order, { session })
        const orderId = result.insertedId

        // Cập nhật orders array trong staffSlot với orderId thật
        await databaseService.staffSlots.updateOne(
          { _id: staffSlot._id, orders: { $elemMatch: { $eq: new ObjectId() } } },
          { $set: { 'orders.$': orderId } },
          { session }
        )

        // Tạo chi tiết đơn hàng
        const orderDetail = new OrderDetail({
          order_id: orderId,
          item_type: ItemType.SERVICE,
          item_id: new ObjectId(service_item.item_id),
          item_name: service.name,
          price: servicePrice,
          discount_price: serviceDiscount,
          quantity: service_item.quantity || 1,
          slot_id: staffSlot._id,
          staff_profile_id: staffSlot.staff_profile_id,
          start_time: startTime,
          end_time: endTime,
          note: service_item.note || note,
          duration_info: {
            duration_name: selectedDuration.duration_name || `${serviceDuration} phút`,
            duration_in_minutes: serviceDuration,
            price: servicePrice,
            discount_price: serviceDiscount,
            sub_description: selectedDuration.sub_description
          }
        })

        // Lưu chi tiết đơn hàng
        await databaseService.orderDetails.insertOne(orderDetail, { session })

        // Tạo payment intent nếu thanh toán bằng Stripe
        let payment_intent = null
        if (payment_method === PaymentMethod.STRIPE) {
          // Lấy thông tin khách hàng
          const account = await accountsService.getAccount(customer_id)
          if (!account) {
            throw new ErrorWithStatus({
              message: ORDER_MESSAGES.CUSTOMER_ID_INVALID,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }

          // Tạo payment intent
          try {
            payment_intent = await stripeService.createPaymentIntent(finalPrice, account.email, {
              order_id: orderId.toString(),
              customer_id,
              order_type: 'service',
              service_id: service_item.item_id,
              service_name: service.name,
              duration_name: selectedDuration.duration_name,
              booking_time: booking_time,
              slot_id: staffSlot._id.toString(),
              staff_profile_id: staffSlot.staff_profile_id.toString()
            })

            // Lưu transaction
            await databaseService.transactions.insertOne(
              {
                order_id: orderId,
                customer_account_id: new ObjectId(customer_id),
                payment_method: payment_method,
                payment_provider: 'stripe',
                amount: finalPrice,
                currency: CurrencyUnit.VND,
                status: TransactionStatus.PENDING,
                type: TransactionMethod.PAYMENT,
                payment_intent_id: payment_intent.paymentIntentId,
                created_at: new Date(),
                updated_at: new Date(),
                metadata: {
                  order_type: 'service',
                  service_name: service.name,
                  duration_name: selectedDuration.duration_name,
                  booking_time: booking_time,
                  slot_id: staffSlot._id.toString(),
                  staff_profile_id: staffSlot.staff_profile_id.toString(),
                  client_secret: payment_intent.clientSecret
                }
              },
              { session }
            )
          } catch (error) {
            // Nếu có lỗi, khôi phục trạng thái slot
            await databaseService.staffSlots.updateOne(
              { _id: staffSlot._id },
              {
                $set: {
                  available_minutes: originalAvailableMinutes,
                  used_minutes: staffSlot.used_minutes,
                  status: StaffSlotStatus.AVAILABLE
                },
                $pull: { orders: orderId }
              }
            )

            throw new ErrorWithStatus({
              message: PAYMENT_MESSAGES.STRIPE_PAYMENT_INTENT_CREATE_FAILED,
              status: HTTP_STATUS.INTERNAL_SERVER_ERROR
            })
          }
        }

        // Lấy đơn hàng đã tạo với thông tin đầy đủ
        const order_data = await this.getOrderById(orderId.toString(), session)

        return {
          order: order_data,
          payment_intent: payment_intent
            ? {
                clientSecret: payment_intent.clientSecret,
                paymentIntentId: payment_intent.paymentIntentId
              }
            : null
        }
      })
    } catch (error) {
      // Nếu có lỗi không được xử lý trong transaction, đảm bảo slot được khôi phục
      if (staffSlot && staffSlot._id) {
        await staffSlotsService
          .updateStaffSlotStatus(staffSlot._id.toString(), {
            status: StaffSlotStatus.AVAILABLE
          })
          .catch((err) => console.error('Error resetting slot status:', err))
      }
      throw error
    } finally {
      await session.endSession()
    }
  }

  async handlePaymentSuccess(
    order_id: string,
    payment_intent_id: string,
    payment_method_id: string,
    customer_id: string
  ) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        // Find transaction by both order_id and payment_intent_id to ensure accuracy
        const transaction = await databaseService.transactions.findOne({
          order_id: new ObjectId(order_id),
          payment_intent_id: payment_intent_id
        })
        console.log(transaction, 'Transaction')

        if (!transaction) {
          throw new ErrorWithStatus({
            message: 'Payment transaction not found',
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        // Update transaction by _id to ensure accuracy
        await databaseService.transactions.updateOne(
          { _id: transaction._id },
          {
            $set: {
              status: TransactionStatus.COMPLETED,
              payment_method_id,
              updated_at: new Date()
            }
          },
          { session }
        )

        // Cập nhật order
        await databaseService.orders.updateOne(
          { _id: transaction.order_id },
          {
            $set: {
              status: OrderStatus.CONFIRMED,
              transaction_id: transaction._id,
              updated_at: new Date()
            }
          },
          { session }
        )

        // Nếu là đặt dịch vụ, cập nhật trạng thái slot từ PENDING thành RESERVED
        if (transaction.metadata?.order_type === 'service' && transaction.metadata?.slot_id) {
          const slot_id = transaction.metadata.slot_id
          if (slot_id) {
            // Chuyển trạng thái slot từ PENDING sang RESERVED cho các đơn hàng đã thanh toán
            await databaseService.staffSlots.updateOne(
              { _id: new ObjectId(slot_id), orders: { $elemMatch: { $eq: new ObjectId(order_id) } } },
              { $set: { status: StaffSlotStatus.RESERVED } },
              { session }
            )
          }
        }

        // Lấy thông tin order và customer
        const order = await this.getOrderById(transaction.order_id.toString())
        const customer = await accountsService.getAccount(customer_id)

        if (!customer) {
          throw new ErrorWithStatus({
            message: ORDER_MESSAGES.CUSTOMER_ID_INVALID,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }

        // Nếu là đặt dịch vụ, gửi email xác nhận với QR code
        if (transaction.metadata?.order_type === 'service') {
          // Tìm thông tin chi tiết đơn hàng
          const orderDetail = order.items[0]

          if (orderDetail && orderDetail.staff_profile_id) {
            // Lấy thông tin chi nhánh và nhân viên
            const staffProfile = await staffProfilesService.getStaffProfile(orderDetail.staff_profile_id.toString())
            const staffName = staffProfile?.account?.name || 'Nhân viên Luna Spa'

            // Tạo QR code
            const qrCodeDataUrl = await qrCodeService.generateBookingQRCode(
              order._id.toString(),
              staffName,
              orderDetail.item_name,
              new Date(order.booking_time),
              order.branch.name
            )

            // Gửi email xác nhận đặt lịch với QR code
            await sendBookingConfirmationEmail(
              customer.email,
              customer.name || 'Quý khách',
              orderDetail.item_name,
              staffName,
              order.branch.name,
              new Date(order.booking_time),
              qrCodeDataUrl
            )
          }
        }
        // Nếu là đặt mua sản phẩm, gửi email xác nhận thanh toán
        else if (transaction.metadata?.order_type === 'product') {
          const orderItems = order.items.map((item: any) => ({
            name: item.item_name,
            quantity: item.quantity,
            price: item.price
          }))

          // Gửi email xác nhận thanh toán
          await sendPaymentConfirmationEmail(
            customer.email,
            customer.name || 'Quý khách',
            orderItems,
            order.final_price,
            order.payment_method,
            new Date(order.created_at)
          )
        }

        return {
          message: PAYMENT_MESSAGES.PAYMENT_SUCCESS,
          order
        }
      })
    } finally {
      await session.endSession()
    }
  }

  async cancelOrder(order_id: string, customer_id: string, body: CancelOrderReqBody) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        // Kiểm tra đơn hàng
        const order = await this.getOrderById(order_id)

        // Kiểm tra quyền hủy đơn hàng
        if (order.customer_account_id.toString() !== customer_id) {
          throw new ErrorWithStatus({
            message: 'Bạn không có quyền hủy đơn hàng này',
            status: HTTP_STATUS.FORBIDDEN
          })
        }

        // Kiểm tra trạng thái đơn hàng
        if (order.status === OrderStatus.COMPLETED) {
          throw new ErrorWithStatus({
            message: ORDER_MESSAGES.CANNOT_CANCEL_COMPLETED_ORDER,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }

        // Xử lý hủy đơn hàng dịch vụ
        if (order.items.some((item: any) => item.item_type === ItemType.SERVICE)) {
          // Lấy thông tin chi tiết đơn hàng
          const serviceItems = order.items.filter((item: any) => item.item_type === ItemType.SERVICE)

          // Cập nhật lại trạng thái các slot
          for (const item of serviceItems) {
            if (item.slot_id) {
              // Lấy thông tin slot hiện tại
              const slot = await staffSlotsService.getStaffSlot(item.slot_id.toString())

              if (slot) {
                // Lấy thời lượng dịch vụ từ item để hoàn trả thời gian cho slot
                const serviceDuration = item.duration_info?.duration_in_minutes || 0

                // Cập nhật lại số phút trống và trạng thái của slot
                await databaseService.staffSlots.updateOne(
                  { _id: slot._id },
                  {
                    $set: {
                      available_minutes: slot.available_minutes + serviceDuration,
                      used_minutes: Math.max(0, slot.used_minutes - serviceDuration),
                      status: StaffSlotStatus.AVAILABLE,
                      updated_at: new Date()
                    },
                    $pull: { orders: new ObjectId(order_id) }
                  },
                  { session }
                )
              }
            }
          }
        }

        // Cập nhật trạng thái đơn hàng
        await databaseService.orders.updateOne(
          { _id: new ObjectId(order_id) },
          {
            $set: {
              status: OrderStatus.CANCELLED,
              note: body.cancel_reason ? `${order.note || ''} | Lý do hủy: ${body.cancel_reason}` : order.note,
              updated_at: new Date()
            }
          },
          { session }
        )

        // Nếu đã có transaction, cập nhật trạng thái transaction
        if (order.transaction) {
          await databaseService.transactions.updateOne(
            { _id: order.transaction._id },
            {
              $set: {
                status: TransactionStatus.REFUNDED,
                updated_at: new Date()
              }
            },
            { session }
          )

          // Nếu đã thanh toán bằng Stripe, xử lý hoàn tiền
          if (order.payment_method === PaymentMethod.STRIPE && order.transaction.payment_intent_id) {
            try {
              // Gọi API hoàn tiền của Stripe
              const refundResult = await stripeService.refund(
                order.transaction.payment_intent_id,
                undefined, // Hoàn toàn bộ số tiền
                'requested_by_customer', // Lý do hoàn tiền
                {
                  order_id: order_id,
                  customer_id: customer_id,
                  cancel_reason: body.cancel_reason || 'Khách hàng yêu cầu hủy'
                }
              )

              // Lưu thông tin refund vào transaction
              await databaseService.transactions.updateOne(
                { _id: new ObjectId(order.transaction._id) },
                {
                  $set: {
                    refund_id: refundResult.refundId,
                    transaction_note: `Hoàn tiền thành công: ${refundResult.refundId}`,
                    updated_at: new Date()
                  }
                },
                { session }
              )

              console.log(
                `Hoàn tiền thành công cho đơn hàng ${order_id} với payment intent ${order.transaction.payment_intent_id}`
              )
            } catch (error: any) {
              console.error('Lỗi khi hoàn tiền qua Stripe:', error)

              // Cập nhật transaction với thông tin lỗi
              await databaseService.transactions.updateOne(
                { _id: new ObjectId(order.transaction._id) },
                {
                  $set: {
                    transaction_note: `Hoàn tiền thất bại: ${error.message || 'Lỗi không xác định'}`,
                    updated_at: new Date()
                  }
                },
                { session }
              )

              // Vẫn tiếp tục hủy đơn hàng ngay cả khi hoàn tiền không thành công
            }
          }
        }

        return {
          message: ORDER_MESSAGES.CANCEL_ORDER_SUCCESS
        }
      })
    } finally {
      await session.endSession()
    }
  }

  async processPayment(order_id: string, customer_id: string, body: any) {
    const { payment_method } = body

    // Kiểm tra đơn hàng tồn tại
    const order = await this.getOrderById(order_id)

    // Kiểm tra quyền thanh toán
    if (order.customer_account_id.toString() !== customer_id) {
      throw new ErrorWithStatus({
        message: 'Bạn không có quyền thanh toán đơn hàng này',
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status !== OrderStatus.PENDING) {
      throw new ErrorWithStatus({
        message: 'Đơn hàng này không trong trạng thái chờ thanh toán',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Lấy thông tin khách hàng
    const account = await accountsService.getAccount(customer_id)
    if (!account) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.CUSTOMER_ID_INVALID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    let result

    if (payment_method === PaymentMethod.STRIPE) {
      // Xử lý thanh toán qua Stripe
      // Kiểm tra xem đã có payment intent chưa
      const existingTransaction = await databaseService.transactions.findOne({
        order_id: new ObjectId(order_id),
        payment_method: PaymentMethod.STRIPE,
        status: TransactionStatus.PENDING
      })

      if (existingTransaction) {
        // Trả về client secret của payment intent đã tạo
        result = {
          client_secret: existingTransaction.metadata?.client_secret || '',
          payment_intent_id: existingTransaction.payment_intent_id || '',
          payment_method: PaymentMethod.STRIPE
        }
      } else {
        // Tạo payment intent mới
        try {
          const orderType = order.booking_time ? 'service' : 'product'
          const metadata: Record<string, any> = {
            order_id: order_id,
            customer_id,
            order_type: orderType
          }

          // Thêm metadata dựa trên loại đơn hàng
          const orderDetail = await databaseService.orderDetails.findOne({
            order_id: new ObjectId(order_id)
          })

          if (orderType === 'service' && orderDetail) {
            if (orderDetail.slot_id) {
              metadata.slot_id = orderDetail.slot_id.toString()
            }
            if (orderDetail.staff_profile_id) {
              metadata.staff_profile_id = orderDetail.staff_profile_id.toString()
            }
            metadata.service_name = orderDetail.item_name
            metadata.booking_time = order.booking_time ? order.booking_time.toString() : ''
          } else if (orderType === 'product') {
            const orderDetails = await databaseService.orderDetails.find({ order_id: new ObjectId(order_id) }).toArray()

            metadata.items = orderDetails.map((item) => item.item_name).join(', ')
          }

          const payment_intent = await stripeService.createPaymentIntent(order.final_price, account.email, metadata)

          // Lưu client secret vào metadata
          metadata.client_secret = payment_intent.clientSecret

          // Lưu transaction
          await databaseService.transactions.insertOne({
            order_id: new ObjectId(order_id),
            customer_account_id: new ObjectId(customer_id),
            payment_method,
            payment_provider: 'stripe',
            amount: order.final_price,
            currency: CurrencyUnit.VND,
            status: TransactionStatus.PENDING,
            type: TransactionMethod.PAYMENT,
            payment_intent_id: payment_intent.paymentIntentId,
            created_at: new Date(),
            updated_at: new Date(),
            metadata
          })

          result = {
            client_secret: payment_intent.clientSecret,
            payment_intent_id: payment_intent.paymentIntentId,
            payment_method: PaymentMethod.STRIPE
          }
        } catch (error) {
          throw new ErrorWithStatus({
            message: PAYMENT_MESSAGES.STRIPE_PAYMENT_INTENT_CREATE_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }
      }
    } else if (payment_method === PaymentMethod.MOMO) {
      // Xử lý thanh toán qua MoMo
      // Kiểm tra xem đã có yêu cầu thanh toán MoMo chưa
      const existingTransaction = await databaseService.transactions.findOne({
        order_id: new ObjectId(order_id),
        payment_method: PaymentMethod.MOMO,
        status: TransactionStatus.PENDING
      })

      if (existingTransaction && existingTransaction.metadata?.momo_pay_url) {
        // Trả về payUrl của yêu cầu thanh toán đã tạo
        result = {
          pay_url: existingTransaction.metadata.momo_pay_url,
          request_id: existingTransaction.payment_intent_id,
          momo_order_id: existingTransaction.momo_order_id,
          payment_method: PaymentMethod.MOMO
        }
      } else {
        try {
          // Tạo thông tin đơn hàng
          const orderType = order.booking_time ? 'service' : 'product'
          let orderInfo = ''

          if (orderType === 'service') {
            const orderDetail = await databaseService.orderDetails.findOne({
              order_id: new ObjectId(order_id)
            })
            orderInfo = `Thanh toán dịch vụ: ${orderDetail?.item_name}`
          } else {
            orderInfo = `Thanh toán đơn hàng: #${order_id}`
          }

          // Chuẩn bị metadata
          const metadata: Record<string, any> = {
            order_id: order_id,
            customer_id,
            order_type: orderType
          }

          // Tạo yêu cầu thanh toán MoMo
          const paymentRequest = await momoService.createPaymentRequest(
            order.final_price,
            order_id,
            orderInfo,
            account.email,
            metadata
          )

          if (paymentRequest.success) {
            result = {
              pay_url: paymentRequest.payUrl,
              request_id: paymentRequest.requestId,
              momo_order_id: paymentRequest.orderId,
              payment_method: PaymentMethod.MOMO
            }
          } else {
            throw new ErrorWithStatus({
              message: `Khởi tạo thanh toán MoMo thất bại: ${paymentRequest.message}`,
              status: HTTP_STATUS.INTERNAL_SERVER_ERROR
            })
          }
        } catch (error) {
          throw new ErrorWithStatus({
            message: 'Không thể khởi tạo thanh toán qua MoMo',
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }
      }
    } else {
      throw new ErrorWithStatus({
        message: 'Phương thức thanh toán không được hỗ trợ',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    return result
  }

  async confirmPayment(order_id: string, payment_intent_id: string, payment_method_id: string, customer_id: string) {
    return this.handlePaymentSuccess(order_id, payment_intent_id, payment_method_id, customer_id)
  }
}

const ordersService = new OrdersService()
export default ordersService
