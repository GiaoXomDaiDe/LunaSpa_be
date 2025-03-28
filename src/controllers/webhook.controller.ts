import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { OrderStatus } from '~/models/schema/Order.schema'
import { StaffSlotStatus } from '~/models/schema/StaffSlot.schema'
import { TransactionStatus } from '~/models/schema/Transaction.schema'
import accountsService from '~/services/accounts.services'
import databaseService from '~/services/database.services'
import ordersService from '~/services/orders.services'
import staffSlotsService from '~/services/staffSlots.services'
import stripeService from '~/services/stripe.services'

class WebhookController {
  async handleStripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'] as string

    if (!sig) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Không có stripe-signature' })
      return
    }

    let event

    try {
      event = stripeService.constructWebhookEvent(req.rawBody, sig)
    } catch (err) {
      console.error('Lỗi xác thực webhook:', err)
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Lỗi xác thực webhook' })
      return
    }

    try {
      // Xử lý các sự kiện khác nhau từ Stripe
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object
          console.log('Payment intent succeeded:', paymentIntent.id)

          // Tìm giao dịch dựa trên payment_intent_id
          const transaction = await databaseService.transactions.findOne({
            payment_intent_id: paymentIntent.id
          })

          if (!transaction) {
            console.error('Không tìm thấy giao dịch với payment_intent_id:', paymentIntent.id)
            res.status(HTTP_STATUS.OK).send()
            return
          }

          // Cập nhật trạng thái giao dịch
          await databaseService.transactions.updateOne(
            { _id: transaction._id },
            {
              $set: {
                status: TransactionStatus.COMPLETED,
                payment_method_id: paymentIntent.payment_method as string,
                updated_at: new Date()
              }
            }
          )

          // Cập nhật trạng thái đơn hàng
          await databaseService.orders.updateOne(
            { _id: transaction.order_id },
            {
              $set: {
                status: OrderStatus.CONFIRMED,
                transaction_id: transaction._id,
                updated_at: new Date()
              }
            }
          )

          // Nếu có slot_id, cập nhật trạng thái slot
          if (transaction.metadata?.slot_id) {
            const slot_id = transaction.metadata.slot_id
            await staffSlotsService.updateStaffSlotStatus(slot_id, { status: StaffSlotStatus.RESERVED })
          }

          // Gửi email xác nhận nếu cần
          const order = await ordersService.getOrderById(transaction.order_id.toString())
          const customer = transaction.customer_account_id
            ? await accountsService.getAccount(transaction.customer_account_id.toString())
            : null

          if (customer && order) {
            // Xử lý gửi email xác nhận đơn hàng/đặt lịch dựa vào order_type
            // Code gửi email
          }

          break
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object
          // Xử lý thanh toán thất bại
          console.log('Payment failed:', paymentIntent.id)

          // Tìm giao dịch dựa trên payment_intent_id
          const transaction = await databaseService.transactions.findOne({
            payment_intent_id: paymentIntent.id
          })

          if (transaction) {
            // Cập nhật trạng thái giao dịch
            await databaseService.transactions.updateOne(
              { _id: transaction._id },
              {
                $set: {
                  status: TransactionStatus.FAILED,
                  updated_at: new Date()
                }
              }
            )
          }

          break
        }
      }

      // Phản hồi để Stripe biết webhook đã được xử lý
      res.status(HTTP_STATUS.OK).send()
    } catch (error) {
      console.error('Lỗi xử lý webhook:', error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send()
    }
  }
}

const webhookController = new WebhookController()
export default webhookController
