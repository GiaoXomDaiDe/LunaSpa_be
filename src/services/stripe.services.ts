import dotenv from 'dotenv'
import Stripe from 'stripe'
import { envConfig } from '~/constants/config'
import { CurrencyUnit } from '~/models/schema/Transaction.schema'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia'
})

class StripeService {
  // Xác minh webhook signature
  constructWebhookEvent(payload: any, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  }

  async createPaymentIntent(amount: number, customer_email: string, metadata: Record<string, string> = {}) {
    // Xử lý số tiền cho Stripe
    // Nếu là VND, cần chuyển thành số nguyên (Stripe không hỗ trợ tiểu số với VND)
    // Nếu là USD, cần chuyển thành cent (nhân với 100)
    let processedAmount = amount
    const currency = envConfig.stripeCurrency as CurrencyUnit

    if (currency === CurrencyUnit.USD) {
      processedAmount = Math.round(amount * 100)
    } else {
      processedAmount = Math.round(amount)
    }

    // Tìm hoặc tạo customer dựa trên email
    const customers = await stripe.customers.list({
      email: customer_email,
      limit: 1
    })

    let customerId: string
    if (customers.data.length > 0) {
      customerId = customers.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email: customer_email,
        description: `Customer for ${customer_email}`
      })
      customerId = customer.id
    }

    // Tạo payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: processedAmount,
      currency: currency,
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: {
        ...metadata,
        customer_email
      }
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      customer: customerId
    }
  }

  /**
   * Lấy thông tin payment intent
   * @param paymentIntentId ID của payment intent
   */
  async retrievePaymentIntent(paymentIntentId: string) {
    return await stripe.paymentIntents.retrieve(paymentIntentId)
  }

  /**
   * Cập nhật metadata cho payment intent
   * @param paymentIntentId ID của payment intent
   * @param metadata Metadata mới
   */
  async updatePaymentIntentMetadata(paymentIntentId: string, metadata: Record<string, string>) {
    return await stripe.paymentIntents.update(paymentIntentId, {
      metadata
    })
  }

  /**
   * Xử lý hoàn tiền cho payment intent
   * @param paymentIntentId ID của payment intent
   * @param amount Số tiền hoàn lại (nếu không cung cấp sẽ hoàn toàn bộ)
   * @param reason Lý do hoàn tiền
   * @param metadata Metadata bổ sung
   */
  async refund(paymentIntentId: string, amount?: number, reason?: string, metadata?: Record<string, string>) {
    try {
      // Lấy thông tin payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

      // Kiểm tra trạng thái payment intent
      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Không thể hoàn tiền cho payment intent với trạng thái ${paymentIntent.status}`)
      }

      // Kiểm tra số tiền cần hoàn (nếu có)
      const refundAmount = amount || paymentIntent.amount

      // Tạo refund
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: refundAmount,
        reason: (reason as Stripe.RefundCreateParams.Reason) || 'requested_by_customer',
        metadata: {
          ...metadata,
          refunded_by: 'system',
          refunded_at: new Date().toISOString()
        }
      })

      return {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        currency: refund.currency
      }
    } catch (error) {
      console.error('Lỗi khi hoàn tiền qua Stripe:', error)
      throw error
    }
  }
}

const stripeService = new StripeService()
export default stripeService
