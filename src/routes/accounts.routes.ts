import { Router } from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController
} from '~/controllers/accounts.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
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
/* 

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
export default accountsRouter
