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
    (thường được gọi là “Reply-To”) mà bạn muốn người nhận phản hồi (reply) tới. 
    Nếu người nhận nhấn “Reply” (trả lời email) trong trình duyệt mail, email trả lời sẽ tự động được 
    gửi đến những địa chỉ đã chỉ định trong ReplyToAddresses, thay vì địa chỉ “From” mặc định.
    Ví dụ:
    Bạn gửi email với Source: "no-reply@domain.com", nhưng khi người nhận bấm “Reply”, bạn muốn họ gửi 
    phản hồi đến support@domain.com hoặc info@domain.com.
    Lúc này, bạn thiết lập ReplyToAddresses: ["support@domain.com"]. Khi người nhận “Reply”, 
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
      .replace('{{link}}', `${envConfig.clientUrl}/forgot-password?token=${forgot_password_token}`)
  )
}
