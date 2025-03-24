import QRCode from 'qrcode'
import { envConfig } from '~/constants/config'

class QRCodeService {
  /**
   * Tạo QR code dạng base64 string
   * @param data Dữ liệu để tạo QR code
   */
  async generateQRCodeAsDataURL(data: string): Promise<string> {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 1
    })
  }

  /**
   * Tạo QR code chứa thông tin đặt lịch
   * @param booking_id ID đơn đặt lịch
   * @param staff_name Tên nhân viên
   * @param service_name Tên dịch vụ
   * @param booking_time Thời gian đặt lịch
   * @param branch_name Tên chi nhánh
   */
  async generateBookingQRCode(
    booking_id: string,
    staff_name: string,
    service_name: string,
    booking_time: Date,
    branch_name: string
  ): Promise<string> {
    const bookingData = JSON.stringify({
      id: booking_id,
      staff: staff_name,
      service: service_name,
      time: booking_time.toISOString(),
      branch: branch_name,
      verifyUrl: `${envConfig.clientUrl}/booking/verify/${booking_id}`
    })

    return this.generateQRCodeAsDataURL(bookingData)
  }

  /**
   * Tạo QR code để thanh toán
   * @param order_id ID đơn hàng
   * @param amount Số tiền
   * @param description Mô tả
   */
  async generatePaymentQRCode(order_id: string, amount: number, description: string): Promise<string> {
    const paymentData = JSON.stringify({
      id: order_id,
      amount,
      description,
      paymentUrl: `${envConfig.clientUrl}/payment/${order_id}`
    })

    return this.generateQRCodeAsDataURL(paymentData)
  }
}

const qrCodeService = new QRCodeService()
export default qrCodeService
