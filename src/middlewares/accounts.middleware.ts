import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { envConfig } from '~/constants/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { ACCOUNT_MESSAGES, ERROR_RESPONSE_MESSAGES } from '~/constants/messages'
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
/* 
refreshTokenValidator
- Kiểm tra refresh_token đã gửi vào body chưa
- Kiểm traxem refresh_token có tồn tại trong db không
- Add refresh_token đã decoded vào req
*/
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
export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: ACCOUNT_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: envConfig.jwtSecretEmailVerifyToken
              })
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)
export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: ACCOUNT_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const account = await databaseService.accounts.findOne({
              email: value
            })
            if (account === null) {
              throw new Error(ERROR_RESPONSE_MESSAGES.ACCOUNT_NOT_FOUND)
            }
            ;(req as Request).account = account
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: ACCOUNT_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: envConfig.jwtSecretForgotPasswordToken
              })
              const { account_id } = decoded_forgot_password_token
              const account = await databaseService.accounts.findOne({ _id: new ObjectId(account_id) })
              if (account === null) {
                throw new ErrorWithStatus({
                  message: ERROR_RESPONSE_MESSAGES.ACCOUNT_NOT_FOUND,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              if (account.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  message: ACCOUNT_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              req.decoded_forgot_password_token = decoded_forgot_password_token
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
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: accountsParamsSchema.passwordLoginSchema,
      confirm_password: accountsParamsSchema.confirmPasswordSchema,
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: ACCOUNT_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: envConfig.jwtSecretForgotPasswordToken
              })
              const { account_id } = decoded_forgot_password_token
              const account = await databaseService.accounts.findOne({ _id: new ObjectId(account_id) })
              if (account === null) {
                throw new ErrorWithStatus({
                  message: ERROR_RESPONSE_MESSAGES.ACCOUNT_NOT_FOUND,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              if (account.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  message: ACCOUNT_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              req.decoded_forgot_password_token = decoded_forgot_password_token
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
    },
    ['body']
  )
)
