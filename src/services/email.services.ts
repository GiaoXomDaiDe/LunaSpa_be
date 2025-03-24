// Có thể sử dụng nodemailer trong tương lai
// import nodemailer from 'nodemailer'

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
      // Giả lập gửi email - sẽ được thay thế bằng nodemailer hoặc SendGrid
      console.log('Sending email to:', data.to)
      console.log('Subject:', data.subject)
      console.log('Content length:', data.html.length)
      if (data.attachments && data.attachments.length > 0) {
        console.log('Attachments:', data.attachments.length)
      }

      // Trong môi trường thực tế, sẽ thay thế đoạn code này bằng tích hợp với dịch vụ email
      /*
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: envConfig.emailUser,
          pass: envConfig.emailPassword
        }
      })

      const result = await transporter.sendMail({
        from: `Luna Spa <${envConfig.emailUser}>`,
        ...data
      })

      return Boolean(result.messageId)
      */

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
      qrCode: string
    }
  ): Promise<boolean> {
    const subject = `Xác nhận đặt lịch #${data.orderId} - Luna Spa`

    // Tạo nội dung email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
          <h1 style="color: #8a2be2;">Luna Spa</h1>
          <p style="font-size: 18px; color: #333;">Xác nhận đặt lịch</p>
        </div>
        
        <div style="padding: 20px 0;">
          <p>Xin chào <strong>${data.customerName}</strong>,</p>
          <p>Cảm ơn bạn đã đặt lịch dịch vụ tại Luna Spa. Đây là thông tin chi tiết về lịch hẹn của bạn:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Dịch vụ:</strong> ${data.serviceName}</p>
            <p><strong>Chuyên viên:</strong> ${data.staffName}</p>
            <p><strong>Chi nhánh:</strong> ${data.branchName}</p>
            <p><strong>Thời gian:</strong> ${data.bookingTime || 'Chưa xác định'}</p>
            <p><strong>Mã đơn hàng:</strong> #${data.orderId}</p>
          </div>
          
          <p>Vui lòng lưu lại mã QR bên dưới và xuất trình khi đến spa:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <img src="${data.qrCode}" alt="QR Code" style="max-width: 200px; height: auto;" />
          </div>
          
          <p>Lưu ý: Vui lòng đến trước 15 phút so với thời gian đặt lịch để hoàn tất thủ tục.</p>
        </div>
        
        <div style="padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center; color: #666; font-size: 14px;">
          <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email hoặc hotline.</p>
          <p>© 2023 Luna Spa. All rights reserved.</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to,
      subject,
      html,
      attachments: [
        {
          filename: 'booking-qr.png',
          content: data.qrCode.split('base64,')[1],
          encoding: 'base64',
          contentType: 'image/png'
        }
      ]
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

    // Tạo nội dung email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
          <h1 style="color: #8a2be2;">Luna Spa</h1>
          <p style="font-size: 18px; color: #333;">Xác nhận thanh toán</p>
        </div>
        
        <div style="padding: 20px 0;">
          <p>Xin chào <strong>${data.customerName}</strong>,</p>
          <p>Cảm ơn bạn đã thực hiện thanh toán tại Luna Spa. Đây là thông tin chi tiết về đơn hàng của bạn:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Mã đơn hàng:</strong> #${data.orderId}</p>
            <p><strong>Tổng thanh toán:</strong> ${formattedAmount}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="padding: 10px; text-align: left;">Sản phẩm/Dịch vụ</th>
                <th style="padding: 10px; text-align: center;">Số lượng</th>
                <th style="padding: 10px; text-align: right;">Giá</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTable}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Tổng cộng:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">${formattedAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center; color: #666; font-size: 14px;">
          <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
          <p>© 2023 Luna Spa. All rights reserved.</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to,
      subject,
      html
    })
  }
}

const emailService = new EmailService()
export default emailService
