import { Router } from 'express'
import {
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  oauthController,
  oauthFacebookController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updateMeController,
  updateToStaffController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/accounts.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  updateToStaffValidator,
  verifiedAccountValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/accounts.middleware'
import { filterMiddleware } from '~/middlewares/common.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { UpdateMeReqBody, UpdateToStaffReqBody } from '~/models/request/Account.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const accountsRouter = Router()

accountsRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

accountsRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

accountsRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

accountsRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

accountsRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

accountsRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

accountsRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

accountsRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

accountsRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

accountsRouter.get('/oauth/google', wrapRequestHandler(oauthController))

accountsRouter.get('/oauth/facebook', wrapRequestHandler(oauthFacebookController))

accountsRouter.get(
  '/me',
  accessTokenValidatorV2,
  checkPermission('read', 'Accounts'),
  verifiedAccountValidator,
  wrapRequestHandler(getMeController)
)

accountsRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedAccountValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>(['name', 'phone_number', 'address', 'date_of_birth', 'avatar']),
  wrapRequestHandler(updateMeController)
)

accountsRouter.patch(
  '/update-to-staff',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'Accounts'),
  updateToStaffValidator,
  filterMiddleware<UpdateToStaffReqBody>(['staff_type', 'specialty_ids', 'bio', 'account_id']),
  wrapRequestHandler(updateToStaffController)
)

export default accountsRouter
