import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { ACCOUNT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/request/Account.requests'
import { AccountVerify } from '~/models/schema/Account.schema'
import schemaHelper from '~/utils/schemaHelper'
import { validate } from '~/utils/validation'

export const registerValidator = validate(
  checkSchema(
    {
      email: schemaHelper.emailSchema,
      password: schemaHelper.registerPasswordSchema,
      confirm_password: schemaHelper.confirmPasswordSchema
    },
    ['body']
  )
)
export const loginValidator = validate(
  checkSchema(
    {
      email: schemaHelper.emailSchema,
      password: schemaHelper.loginPasswordSchema
    },
    ['body']
  )
)
export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: schemaHelper.accessTokenSchema
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
      refresh_token: schemaHelper.refreshTokenSchema
    },
    ['body']
  )
)
export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: schemaHelper.emailVerifyTokenSchema
    },
    ['body']
  )
)
export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: schemaHelper.forgotPasswordEmailSchema
    },
    ['body']
  )
)
export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: schemaHelper.forgotPasswordTokenSchema
    },
    ['body']
  )
)
export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: schemaHelper.registerPasswordSchema,
      confirm_password: schemaHelper.confirmPasswordSchema,
      forgot_password_token: schemaHelper.forgotPasswordTokenSchema
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
    name: schemaHelper.updateMeNameSchema,
    phone_number: schemaHelper.updateMePhoneNumberSchema,
    address: schemaHelper.updateMeAddressSchema,
    date_of_birth: schemaHelper.updateMeDateOfBirthSchema,
    avatar: schemaHelper.updateMeAvatarSchema
  })
)
export const updateToStaffValidator = validate(
  checkSchema({
    account_id: schemaHelper.accountIdSchema,
    staff_type: schemaHelper.staffTypeSchema,
    specialty_ids: schemaHelper.specialtyIdsSchema,
    bio: schemaHelper.bioSchema
  })
)

export const paginationValidator = validate(
  checkSchema(
    {
      limit: schemaHelper.limitSchema,
      page: schemaHelper.pageSchema,
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
