import axios from 'axios'
import crypto from 'crypto'
import { ObjectId } from 'mongodb'
import { PaymentMethod } from '~/models/schema/Order.schema'
import { CurrencyUnit, TransactionMethod, TransactionStatus } from '~/models/schema/Transaction.schema'
import databaseService from './database.services'

// Lấy thông tin cấu hình MoMo từ biến môi trường
const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE || ''
const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY || ''
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY || ''
const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create'
const MOMO_REDIRECT_URL = process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/payment-result'
const MOMO_IPN_URL = process.env.MOMO_IPN_URL || 'http://localhost:4000/webhook/momo'

class MomoService {
  /**
   * Tạo yêu cầu thanh toán qua MoMo
   * @param amount Số tiền thanh toán (VND)
   * @param orderId ID đơn hàng
   * @param orderInfo Thông tin đơn hàng
   * @param customerEmail Email khách hàng
   * @param metadata Dữ liệu bổ sung
   */
  async createPaymentRequest(
    amount: number,
    orderId: string,
    orderInfo: string,
    customerEmail: string,
    metadata: Record<string, any> = {}
  ) {
    try {
      // Lấy thông tin khách hàng từ metadata
      const customer_account_id = metadata.customer_id ? new ObjectId(metadata.customer_id) : undefined

      // Tạo thông tin request
      const requestId = `REQ-${Date.now()}`
      const redirectUrl = MOMO_REDIRECT_URL
      const ipnUrl = MOMO_IPN_URL
      const requestType = 'captureWallet'
      const extraData = Buffer.from(JSON.stringify(metadata)).toString('base64')

      // Chuẩn bị dữ liệu cho request
      const rawData = {
        partnerCode: MOMO_PARTNER_CODE,
        accessKey: MOMO_ACCESS_KEY,
        requestId: requestId,
        amount: amount,
        orderId: `MOMO-${orderId}-${Date.now()}`,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType
      }

      // Tạo chữ ký
      const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${rawData.orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_PARTNER_CODE}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`
      const signature = crypto.createHmac('sha256', MOMO_SECRET_KEY).update(rawSignature).digest('hex')

      // Gửi request đến MoMo
      const response = await axios.post(
        MOMO_ENDPOINT,
        {
          ...rawData,
          signature: signature
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      // Lưu thông tin giao dịch
      await databaseService.transactions.insertOne({
        order_id: new ObjectId(orderId),
        customer_account_id,
        payment_method: PaymentMethod.MOMO,
        payment_provider: 'momo',
        amount: amount,
        currency: CurrencyUnit.VND,
        status: TransactionStatus.PENDING,
        type: TransactionMethod.PAYMENT,
        payment_intent_id: requestId,
        momo_order_id: rawData.orderId,
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {
          ...metadata,
          momo_pay_url: response.data.payUrl
        }
      })

      // Trả về kết quả
      return {
        success: response.data.resultCode === 0,
        message: response.data.message,
        payUrl: response.data.payUrl, // URL thanh toán MoMo
        requestId: requestId,
        orderId: rawData.orderId
      }
    } catch (error) {
      console.error('MoMo payment request error:', error)
      throw error
    }
  }

  /**
   * Xác thực IPN callback từ MoMo
   * @param requestBody Dữ liệu callback
   */
  validateIpnCallback(requestBody: any) {
    try {
      // Tạo chuỗi raw signature từ dữ liệu callback
      const {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature
      } = requestBody

      // Tạo chữ ký để xác thực
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`
      const expectedSignature = crypto.createHmac('sha256', MOMO_SECRET_KEY).update(rawSignature).digest('hex')

      // So sánh chữ ký
      return {
        isValid: expectedSignature === signature,
        resultCode: resultCode,
        orderId: orderId,
        transId: transId,
        amount: amount,
        extraData: extraData ? JSON.parse(Buffer.from(extraData, 'base64').toString()) : {}
      }
    } catch (error) {
      console.error('MoMo IPN validation error:', error)
      return { isValid: false }
    }
  }

  /**
   * Xác minh kết quả thanh toán từ MoMo
   * @param requestBody Dữ liệu từ request
   */
  validatePaymentResult(requestBody: any) {
    try {
      // Tạo chuỗi raw signature từ dữ liệu callback
      const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature
      } = requestBody

      // Tạo chữ ký để xác thực
      const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`
      const expectedSignature = crypto.createHmac('sha256', MOMO_SECRET_KEY).update(rawSignature).digest('hex')

      // So sánh chữ ký và trả về kết quả
      return {
        isValid: expectedSignature === signature,
        resultCode: resultCode,
        message: message,
        orderId: orderId,
        transId: transId,
        amount: amount,
        extraData: extraData ? JSON.parse(Buffer.from(extraData, 'base64').toString()) : {}
      }
    } catch (error) {
      console.error('MoMo payment result validation error:', error)
      return { isValid: false }
    }
  }

  /**
   * Trích xuất ID đơn hàng thực từ MoMo orderId
   * @param momoOrderId MoMo order ID (format: MOMO-{realOrderId}-{timestamp})
   */
  extractRealOrderId(momoOrderId: string) {
    try {
      const parts = momoOrderId.split('-')
      if (parts.length >= 3) {
        return parts[1] // Lấy phần orderId thực
      }
      return null
    } catch (error) {
      return null
    }
  }
}

const momoService = new MomoService()
export default momoService
