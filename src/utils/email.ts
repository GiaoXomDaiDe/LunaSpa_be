import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import fs from 'fs'
import path from 'path'
import { envConfig } from '~/constants/config'

const sesClient = new SESClient({
  region: envConfig.awsRegion,
  credentials: {
    accessKeyId: envConfig.awsAccessKeyId,
    secretAccessKey: envConfig.awsSecretAccessKey
  }
})
const verifyEmailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.html'), 'utf8')
const forgotPasswordTemplate = fs.readFileSync(path.resolve('src/templates/forgot-password.html'), 'utf8')
const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    /* 
    Trong ngữ cảnh của AWS SES (và email nói chung), ReplyToAddresses là danh sách địa chỉ email 
    (thường được gọi là "Reply-To") mà bạn muốn người nhận phản hồi (reply) tới. 
    Nếu người nhận nhấn "Reply" (trả lời email) trong trình duyệt mail, email trả lời sẽ tự động được 
    gửi đến những địa chỉ đã chỉ định trong ReplyToAddresses, thay vì địa chỉ "From" mặc định.
    Ví dụ:
    Bạn gửi email với Source: "no-reply@domain.com", nhưng khi người nhận bấm "Reply", bạn muốn họ gửi 
    phản hồi đến support@domain.com hoặc info@domain.com.
    Lúc này, bạn thiết lập ReplyToAddresses: ["support@domain.com"]. Khi người nhận "Reply", 
    email sẽ đến hộp thư support@domain.com. 
    */
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

const sendVerifyEmail = (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: envConfig.sesFromAddress,
    toAddresses: toAddress,
    body,
    subject
  })
  return sesClient.send(sendEmailCommand)
}

export const sendEmail = async ({
  to,
  subject,
  html,
  from = envConfig.sesFromAddress,
  cc = []
}: {
  to: string | string[]
  subject: string
  html: string
  from?: string
  cc?: string | string[]
}) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: from,
    toAddresses: to,
    ccAddresses: cc,
    body: html,
    subject
  })
  return sesClient.send(sendEmailCommand)
}

export const sendVerifyRegisterEmail = (
  toAddress: string,
  email_verify_token: string,
  template: string = verifyEmailTemplate
) => {
  return sendVerifyEmail(
    toAddress,
    'Verify your email',
    template
      .replace('{{title}}', 'Please verify your email')
      .replace('{{content}}', 'Click the button below to verify your email')
      .replace('{{titleLink}}', 'Verify')
      .replace('{{link}}', `${envConfig.clientUrl}/email-verifications?token=${email_verify_token}`)
  )
}
export const sendForgotPasswordEmail = (
  toAddress: string,
  forgot_password_token: string,
  template: string = forgotPasswordTemplate
) => {
  return sendVerifyEmail(
    toAddress,
    'Forgot Password',
    template
      .replace('{{title}}', 'You are receiving this email because you requested to reset your password')
      .replace('{{content}}', 'Click the button below to reset your password')
      .replace('{{titleLink}}', 'Reset Password')
      .replace('{{link}}', `${envConfig.clientUrl}/reset-password?token=${forgot_password_token}`)
  )
}

/**
 * Gửi email xác nhận đặt lịch kèm mã QR
 * @param email Email người nhận
 * @param name Tên người nhận
 * @param serviceName Tên dịch vụ
 * @param staffName Tên nhân viên
 * @param branchName Tên chi nhánh
 * @param bookingTime Thời gian đặt lịch
 * @param qrCodeDataUrl Mã QR dạng data URL
 */
export const sendBookingConfirmationEmail = async (
  email: string,
  name: string,
  serviceName: string,
  staffName: string,
  branchName: string,
  bookingTime: Date,
  qrCodeDataUrl: string
) => {
  const dateTimeFormatted = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(bookingTime)

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #8e44ad;">Luna Spa</h1>
      </div>
      <div>
        <h2>Xác nhận đặt lịch</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Cảm ơn bạn đã đặt lịch sử dụng dịch vụ tại Luna Spa. Dưới đây là thông tin chi tiết về lịch hẹn của bạn:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Dịch vụ:</strong> ${serviceName}</p>
          <p><strong>Nhân viên:</strong> ${staffName}</p>
          <p><strong>Chi nhánh:</strong> ${branchName}</p>
          <p><strong>Thời gian:</strong> ${dateTimeFormatted}</p>
        </div>
        
        <p>Vui lòng xuất trình mã QR này khi đến Luna Spa:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 200px; height: auto;" />
        </div>
        
        <p>Lưu ý:</p>
        <ul>
          <li>Vui lòng đến trước 5-10 phút để hoàn tất thủ tục.</li>
          <li>Nếu bạn muốn thay đổi hoặc hủy lịch, vui lòng thông báo cho chúng tôi ít nhất 2 giờ trước giờ hẹn.</li>
          <li>Mọi thắc mắc xin liên hệ qua số điện thoại: <strong>0123 456 789</strong>.</li>
        </ul>
        
        <p>Cảm ơn bạn đã chọn Luna Spa. Chúng tôi rất mong được đón tiếp bạn!</p>
      </div>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; font-size: 12px; color: #666;">
        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        <p>&copy; ${new Date().getFullYear()} Luna Spa. Đã đăng ký bản quyền.</p>
      </div>
    </div>
  `

  await sendEmail({
    to: email,
    subject: 'Xác nhận đặt lịch - Luna Spa',
    html: htmlContent
  })

  return { message: 'Email xác nhận đã được gửi thành công' }
}

export const sendPaymentConfirmationEmail = async (
  email: string,
  name: string,
  orderItems: { name: string; quantity: number; price: number }[],
  totalAmount: number,
  paymentMethod: string,
  orderDate: Date
) => {
  const dateFormatted = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'full'
  }).format(orderDate)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const itemsList = orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(
          item.price * item.quantity
        )}</td>
      </tr>
    `
    )
    .join('')

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #8e44ad;">Luna Spa</h1>
      </div>
      <div>
        <h2>Xác nhận thanh toán</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Cảm ơn bạn đã mua sắm tại Luna Spa. Đơn hàng của bạn đã được thanh toán thành công.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Ngày đặt hàng:</strong> ${dateFormatted}</p>
          <p><strong>Phương thức thanh toán:</strong> ${paymentMethod}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; text-align: left;">Sản phẩm</th>
              <th style="padding: 8px; text-align: center;">Số lượng</th>
              <th style="padding: 8px; text-align: right;">Đơn giá</th>
              <th style="padding: 8px; text-align: right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Tổng cộng:</td>
              <td style="padding: 8px; text-align: right; font-weight: bold;">${formatCurrency(totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="margin-top: 30px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại bên dưới.</p>
        
        <p>Cảm ơn bạn đã chọn Luna Spa!</p>
      </div>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; font-size: 12px; color: #666;">
        <p>Email: support@lunaspa.vn | Điện thoại: 0123 456 789</p>
        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        <p>&copy; ${new Date().getFullYear()} Luna Spa. Đã đăng ký bản quyền.</p>
      </div>
    </div>
  `

  await sendEmail({
    to: email,
    subject: 'Xác nhận thanh toán - Luna Spa',
    html: htmlContent
  })

  return { message: 'Email xác nhận thanh toán đã được gửi thành công' }
}
