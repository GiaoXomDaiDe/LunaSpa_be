import fs from 'fs'
import path from 'path'
import { sendEmail } from '~/utils/email'

// Đọc template
const bookingConfirmationTemplate = fs.readFileSync(path.resolve('src/templates/booking-confirmation.html'), 'utf8')
const paymentConfirmationTemplate = fs.readFileSync(path.resolve('src/templates/payment-confirmation.html'), 'utf8')

interface EmailData {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    path?: string
    content?: string | Buffer
    contentType?: string
    encoding?: string
    cid?: string
  }>
}

class EmailService {
  /**
   * Gửi email
   * @param data Dữ liệu email
   */
  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      console.log('Sending email to:', data.to)
      console.log('Subject:', data.subject)

      // Gửi email qua AWS SES
      await sendEmail({
        to: data.to,
        subject: data.subject,
        html: data.html
      })

      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  /**
   * Gửi email xác nhận đặt lịch kèm QR code
   * @param to Email người nhận
   * @param data Dữ liệu đặt lịch
   */
  async sendBookingConfirmation(
    to: string,
    data: {
      orderId: string
      customerName: string
      serviceName: string
      staffName: string
      branchName: string
      bookingTime?: string
      startTime?: string
      endTime?: string
      qrCodeUrl: string
    }
  ): Promise<boolean> {
    const subject = `Xác nhận đặt lịch #${data.orderId} - Luna Spa`

    // Áp dụng dữ liệu vào template
    let htmlContent = bookingConfirmationTemplate

    // Replace các placeholder trong template
    htmlContent = htmlContent
      .replace(/{{customerName}}/g, data.customerName)
      .replace(/{{serviceName}}/g, data.serviceName)
      .replace(/{{staffName}}/g, data.staffName)
      .replace(/{{branchName}}/g, data.branchName)
      .replace(/{{bookingTime}}/g, data.bookingTime || 'Chưa xác định')
      .replace(/{{orderId}}/g, data.orderId)
      .replace(/{{qrCodeUrl}}/g, data.qrCodeUrl)
      .replace(/{{currentYear}}/g, new Date().getFullYear().toString())

    // Thêm thời gian bắt đầu và kết thúc nếu có
    if (data.startTime) {
      htmlContent = htmlContent.replace(/{{#startTime}}(.*?){{\/startTime}}/gs, function (match, p1) {
        return p1.replace(/{{startTime}}/g, data.startTime)
      })
    } else {
      htmlContent = htmlContent.replace(/{{#startTime}}(.*?){{\/startTime}}/gs, '')
    }

    if (data.endTime) {
      htmlContent = htmlContent.replace(/{{#endTime}}(.*?){{\/endTime}}/gs, function (match, p1) {
        return p1.replace(/{{endTime}}/g, data.endTime)
      })
    } else {
      htmlContent = htmlContent.replace(/{{#endTime}}(.*?){{\/endTime}}/gs, '')
    }

    return this.sendEmail({
      to,
      subject,
      html: htmlContent
    })
  }

  /**
   * Gửi email xác nhận thanh toán
   * @param to Email người nhận
   * @param data Dữ liệu thanh toán
   */
  async sendPaymentConfirmation(
    to: string,
    data: {
      orderId: string
      customerName: string
      amount: number
      orderItems: Array<{
        name: string
        quantity: number
        price: number
      }>
    }
  ): Promise<boolean> {
    const subject = `Xác nhận thanh toán #${data.orderId} - Luna Spa`

    // Format số tiền
    const formattedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(data.amount)

    // Tạo bảng sản phẩm/dịch vụ
    const itemsTable = data.orderItems
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(item.price)}</td>
        </tr>
      `
      )
      .join('')

    // Áp dụng dữ liệu vào template
    let htmlContent = paymentConfirmationTemplate

    // Replace các placeholder trong template
    htmlContent = htmlContent
      .replace(/{{customerName}}/g, data.customerName)
      .replace(/{{orderId}}/g, data.orderId)
      .replace(/{{totalAmount}}/g, formattedAmount)
      .replace(/{{itemsTable}}/g, itemsTable)
      .replace(/{{currentYear}}/g, new Date().getFullYear().toString())

    return this.sendEmail({
      to,
      subject,
      html: htmlContent
    })
  }
}

const emailService = new EmailService()
export default emailService
