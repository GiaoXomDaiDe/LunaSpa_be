import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { ACCOUNT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/request/Account.requests'
import { AccountVerify } from '~/models/schema/Account.schema'
import accountsParamsSchema from '~/utils/schemaHelper'
import { validate } from '~/utils/validation'

export const registerValidator = validate(
  checkSchema(
    {
      email: accountsParamsSchema.emailSchema,
      password: accountsParamsSchema.registerPasswordSchema,
      confirm_password: accountsParamsSchema.confirmPasswordSchema
    },
    ['body']
  )
)
export const loginValidator = validate(
  checkSchema(
    {
      email: accountsParamsSchema.emailSchema,
      password: accountsParamsSchema.loginPasswordSchema
    },
    ['body']
  )
)
export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: accountsParamsSchema.accessTokenSchema
    },
    ['headers']
  )
)
export const accessTokenValidatorV2 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization) {
      req.role_name = 'Guest'
      return next()
    }
    await accessTokenValidator(req, res, next)
  } catch (error) {
    req.role_name = 'Guest'
    next()
  }
}
export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: accountsParamsSchema.refreshTokenSchema
    },
    ['body']
  )
)
export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: accountsParamsSchema.emailVerifyTokenSchema
    },
    ['body']
  )
)
export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: accountsParamsSchema.forgotPasswordEmailSchema
    },
    ['body']
  )
)
export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: accountsParamsSchema.forgotPasswordTokenSchema
    },
    ['body']
  )
)
export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: accountsParamsSchema.registerPasswordSchema,
      confirm_password: accountsParamsSchema.confirmPasswordSchema,
      forgot_password_token: accountsParamsSchema.forgotPasswordTokenSchema
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
    name: accountsParamsSchema.updateMeNameSchema,
    phone_number: accountsParamsSchema.updateMePhoneNumberSchema,
    address: accountsParamsSchema.updateMeAddressSchema,
    date_of_birth: accountsParamsSchema.updateMeDateOfBirthSchema,
    avatar: accountsParamsSchema.updateMeAvatarSchema
  })
)
export const updateToStaffValidator = validate(
  checkSchema({
    account_id: accountsParamsSchema.accountIdSchema,
    staff_type: accountsParamsSchema.staffTypeSchema,
    specialty_ids: accountsParamsSchema.specialtyIdsSchema,
    bio: accountsParamsSchema.bioSchema
  })
)

export const paginationValidator = validate(
  checkSchema(
    {
      limit: accountsParamsSchema.limitSchema,
      page: accountsParamsSchema.pageSchema,
      _custom: {
        custom: {
          options: async (value: string, { req }) => {
            const { limit, page } = (req as Request).query
            if ((limit && !page) || (!limit && page)) {
              throw new Error(ACCOUNT_MESSAGES.LIMIT_AND_PAGE_MUST_BE_PROVIDED_TOGETHER)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

export const isAdminValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { role } = req
  if (role?.name !== 'Admin') {
    return next(
      new ErrorWithStatus({
        message: ACCOUNT_MESSAGES.ACCOUNT_NOT_ADMIN,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}
