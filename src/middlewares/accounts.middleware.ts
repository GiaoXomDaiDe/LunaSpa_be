import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { envConfig } from '~/constants/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { ACCOUNT_MESSAGES, ERROR_RESPONSE_MESSAGES } from '~/constants/messages'
import accountsParamsSchema from '~/constants/paramSchema'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/request/Account.requests'
import { AccountVerify } from '~/models/schema/Account.schema'
import databaseService from '~/services/database.services'
import { verifyAccessToken } from '~/utils/common'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

export const registerValidator = validate(
  checkSchema(
    {
      email: accountsParamsSchema.emailSchema,
      password: accountsParamsSchema.passwordSchema,
      confirm_password: accountsParamsSchema.confirmPasswordSchema
    },
    ['body']
  )
)

export const loginValidator = validate(
  checkSchema(
    {
      email: accountsParamsSchema.emailSchema,
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
export const accessTokenValidatorV2 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization) {
      req.role_name = 'guest'
      return next()
    }
    await accessTokenValidator(req, res, next)
  } catch (error) {
    next(error)
  }
}
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
      forgot_password_token: accountsParamsSchema.forgotPasswordSchema
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: accountsParamsSchema.passwordSchema,
      confirm_password: accountsParamsSchema.confirmPasswordSchema,
      forgot_password_token: accountsParamsSchema.forgotPasswordSchema
    },
    ['body']
  )
)

export const verifiedAccountValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== AccountVerify.VERIFIED) {
    return next(
      new ErrorWithStatus({
        message: ACCOUNT_MESSAGES.ACCOUNT_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema({
    name: {
      trim: true,
      isString: {
        errorMessage: ACCOUNT_MESSAGES.NAME_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: ACCOUNT_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
      },
      optional: true
    },
    phone_number: {
      trim: true,
      matches: {
        options: /^(84|0[3|5|7|8|9])+([0-9]{8})$/,
        errorMessage: ACCOUNT_MESSAGES.PHONE_NUMBER_IS_INVALID
      },
      optional: true
    },
    address: {
      trim: true,
      isString: {
        errorMessage: ACCOUNT_MESSAGES.ADDRESS_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          min: 1,
          max: 255
        },
        errorMessage: ACCOUNT_MESSAGES.ADDRESS_LENGTH_MUST_BE_FROM_1_TO_255
      },
      optional: true
    },
    date_of_birth: {
      trim: true,
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        },
        errorMessage: ACCOUNT_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
      },
      optional: true
    },
    avatar: {
      trim: true,
      isString: {
        errorMessage: ACCOUNT_MESSAGES.AVATAR_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          min: 1,
          max: 255
        },
        errorMessage: ACCOUNT_MESSAGES.AVATAR_LENGTH_MUST_BE_FROM_1_TO_255
      },
      optional: true
    }
  })
)

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        optional: true,
        isNumeric: true,
        custom: {
          options: async (value: string) => {
            const num = Number(value)
            if (num > 100 || num < 1) {
              throw new Error('1 <= limit <= 100')
            }
            return true
          }
        }
      },
      page: {
        optional: true,
        isNumeric: true,
        custom: {
          options: async (value: string) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error('page >= 1')
            }
            return true
          }
        }
      },
      _custom: {
        custom: {
          options: async (value: string, { req }) => {
            const { limit, page } = (req as Request).query
            if ((limit && !page) || (!limit && page)) {
              throw new Error('limit và page phải được cung cấp cùng nhau')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
