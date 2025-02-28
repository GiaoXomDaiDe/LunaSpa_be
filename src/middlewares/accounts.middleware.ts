import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { envConfig } from '~/constants/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { ERROR_RESPONSE_MESSAGES } from '~/constants/messages'
import accountsParamsSchema from '~/constants/paramSchema'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'
import { verifyAccessToken } from '~/utils/common'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

export const registerValidator = validate(
  checkSchema(
    {
      email: accountsParamsSchema.emailRegisterSchema,
      password: accountsParamsSchema.passwordSchema,
      confirm_password: accountsParamsSchema.confirmPasswordSchema
    },
    ['body']
  )
)

export const loginValidator = validate(
  checkSchema(
    {
      email: accountsParamsSchema.emailLoginSchema,
      password: accountsParamsSchema.passwordLoginSchema
    },
    ['body']
  )
)
/* 
Kiểm tra xem có access token không truyền vào header ko
Nếu có thì kiểm tra xem access token có hợp lệ không
Nếu hợp lệ thì trả về decoded_authorization và add nó vào trong request
 */
export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            return await verifyAccessToken(access_token, req as Request)
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema({
    refresh_token: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: ERROR_RESPONSE_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          try {
            const [decoded_refresh_token, refresh_token] = await Promise.all([
              verifyToken({ token: value, secretOrPublicKey: envConfig.jwtSecretRefreshToken }),
              databaseService.refreshTokens.findOne({ token: value })
            ])
            if (refresh_token === null) {
              throw new ErrorWithStatus({
                message: ERROR_RESPONSE_MESSAGES.REFRESH_TOKEN_IS_USED_OR_NOT_EXIST,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            ;(req as Request).decoded_refresh_token = decoded_refresh_token
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: capitalize(error.message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            throw error
          }
          return true
        }
      }
    }
  })
)
