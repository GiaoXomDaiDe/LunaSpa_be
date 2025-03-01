import { Router } from 'express'
import {
  forgotPasswordController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/accounts.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/accounts.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const accountsRouter = Router()
/**
 * Description. Register user
 * Path: /register
 * Method: GET
 * Headers: <none>
 * Body: { email: string, password: string, confirm_password: string }
 */
accountsRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
/**
 * Description. Register user
 * Path: /register
 * Method: GET
 * Headers: <none>
 * Body: { email: string, password: string, confirm_password: string }
 */
accountsRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description. Logout user
 * Path: /logout
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 * accessTokenValidator: check access token
 * refreshTokenValidator: check refresh token
 */
accountsRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
/**
 * Description. Refresh Token
 * Path: /refresh-token
 * Method: POST
 * Body: { refresh_token: string }
 */
accountsRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))
/**
 * Description. Verify email when user client click on the link in email
 * Path: /verify-email
 * Method: POST
 * Body: { email_verfy_token: string }
 */

/* 
Luồng hoạt động verify token
1. Khi register, server sẽ tạo ra 1 mail gửi đến email của user
2. Trong mail sẽ có 1 link button chứa token
3. Khi user click vào link, client sẽ chuyển sang trang có đường dẫn /email-verifications?token=${email_verify_token}
4. Client sẽ gọi api /verify-email với body {email_verify_token: string}
5. Còn nếu user quên mất mail thì sẽ có 1 cái nút resend mail
6. Khi user click vào nút resend mail, client sẽ gọi api /resend-verify-email
7. Server sẽ gửi lại mail cho user
*/
accountsRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 * Description. Resend verify email
 * Path: /resend-verify-email
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: {}
 * */

accountsRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * Description. Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: {email: string}
 * */

/* 
Luồng hoạt động forgot password
1. Khi gọi api này, server sẽ set forgot-password-token vào db account đó
2. Sau đó gửi email đến cho account đó
3. Trong mail sẽ có 1 link button chứa token
4. Khi user click vào link, client sẽ chuyển sang trang có đường dẫn /forgot-password
5. trong trang client có dường dẫn /forgot-password, client sẽ gọi api /verify-forgot-password với body {forgot_password_token: string}
6. Nếu đúng thì chuyển sang trang reset password có dường dẫn bên client là /reset-password và truyền forgot_password_token theo
Cách 1: Tại đây ta lưu cái forgot_password_token này vào localStorage
Và bên trang ResetPassword này chỉ cần get ra mà dùng là được

Cách 2: ta dùng state của React Router để truyền cái forgot_password_token này qua trang ResetPassword
7. Sau đó client sẽ gọi api /reset-password với body {forgot_password_token: string, password: string, confirm_password: string}
*/

accountsRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
/**
 * Description. Verify link in email to reset password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: {forgot_password_token: string}
 * */

accountsRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description. Reset password
 * Path: /reset-password
 * Method: POST
 * Body: {forgot_password_token: string, password: string, confirm_password: string}
 * */

accountsRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

accountsRouter.get('/me')
export default accountsRouter
