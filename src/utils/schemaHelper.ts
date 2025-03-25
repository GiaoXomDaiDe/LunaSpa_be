import { Request } from 'express'
import { ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize, omit } from 'lodash'
import { ObjectId } from 'mongodb'
import { envConfig } from '~/constants/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { ACCOUNT_MESSAGES, ERROR_RESPONSE_MESSAGES, PRODUCT_CATEGORY_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { StaffType } from '~/models/schema/StaffProfile.schema'
import accountsService from '~/services/accounts.services'
import databaseService from '~/services/database.services'
import { verifyAccessToken } from '~/utils/common'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'

const emailSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: ACCOUNT_MESSAGES.EMAIL_IS_REQUIRED
  },
  isEmail: {
    options: { ignore_max_length: false },
    errorMessage: ACCOUNT_MESSAGES.EMAIL_IS_INVALID
  },
  isLength: {
    options: { min: 10, max: 50 },
    errorMessage: ACCOUNT_MESSAGES.EMAIL_LENGTH_MUST_BE_FROM_10_TO_50
  },
  custom: {
    options: async (value: string, { req }) => {
      if (req.body.confirm_password) {
        const isExistMail = await accountsService.checkEmailExist(value)
        if (isExistMail) {
          throw new Error(ACCOUNT_MESSAGES.EMAIL_ALREADY_EXISTS)
        }
        return true
      } else {
        const account = await databaseService.accounts.findOne({ email: value })
        if (!account) {
          throw new Error(ACCOUNT_MESSAGES.EMAIL_IS_INCORRECT)
        }
        req.account = account
        return true
      }
    }
  }
}
const registerPasswordSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: ACCOUNT_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: ACCOUNT_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 5, max: 50 },
    errorMessage: ACCOUNT_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_5_TO_50
  },
  isStrongPassword: {
    options: {
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: ACCOUNT_MESSAGES.PASSWORD_NOT_STRONG
  }
}
const loginPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: ACCOUNT_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: ACCOUNT_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  custom: {
    options: async (value: string, { req }) => {
      const email = req.body.email
      const account = await databaseService.accounts.findOne({ email })
      if (!account) {
        return true
      } else {
        if (account.password !== hashPassword(value)) {
          throw new Error(ACCOUNT_MESSAGES.PASSWORD_IS_INCORRECT)
        }
      }
    }
  }
}
const accessTokenSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      const access_token = (value || '').split(' ')[1]
      return await verifyAccessToken(access_token, req as Request)
    }
  }
}
const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: ACCOUNT_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: ACCOUNT_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
  },
  custom: {
    options: (confirm_password, { req }) => {
      if (confirm_password !== req.body.password) {
        throw new Error(ACCOUNT_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
      }
      return true
    }
  }
}
const refreshTokenSchema: ParamSchema = {
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
const emailVerifyTokenSchema: ParamSchema = {
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
const forgotPasswordTokenSchema: ParamSchema = {
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
const forgotPasswordEmailSchema: ParamSchema = {
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
const updateMeNameSchema: ParamSchema = {
  optional: true,
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
  }
}
const updateMePhoneNumberSchema: ParamSchema = {
  trim: true,
  optional: true,
  matches: {
    options: /^(84|0[3|5|7|8|9])+([0-9]{8})$/,
    errorMessage: ACCOUNT_MESSAGES.PHONE_NUMBER_IS_INVALID
  }
}
const updateMeAddressSchema: ParamSchema = {
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
}
const updateMeDateOfBirthSchema: ParamSchema = {
  trim: true,
  optional: true,
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: ACCOUNT_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
  }
}
const updateMeAvatarSchema: ParamSchema = {
  trim: true,
  optional: true,
  isString: {
    errorMessage: ACCOUNT_MESSAGES.AVATAR_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 1,
      max: 255
    },
    errorMessage: ACCOUNT_MESSAGES.AVATAR_LENGTH_MUST_BE_FROM_1_TO_255
  }
}
const limitSchema: ParamSchema = {
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
}
const pageSchema: ParamSchema = {
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
}

const accountIdSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: ACCOUNT_MESSAGES.ACCOUNT_ID_IS_REQUIRED
  },
  isString: {
    errorMessage: ACCOUNT_MESSAGES.ACCOUNT_ID_MUST_BE_A_STRING
  },
  isMongoId: {
    errorMessage: ACCOUNT_MESSAGES.ACCOUNT_ID_MUST_BE_A_MONGO_ID
  }
}

const staffTypeSchema: ParamSchema = {
  notEmpty: {
    errorMessage: ACCOUNT_MESSAGES.STAFF_TYPE_REQUIRED
  },
  isIn: {
    options: [Object.values(StaffType)],
    errorMessage: ACCOUNT_MESSAGES.STAFF_TYPE_INVALID
  }
}

const specialtyIdsSchema: ParamSchema = {
  optional: true,
  isArray: {
    errorMessage: ACCOUNT_MESSAGES.SPECIALTY_IDS_REQUIRED
  },
  custom: {
    options: (specialty_ids: string[]) => {
      return specialty_ids.every((specialty_id) => ObjectId.isValid(specialty_id))
    },
    errorMessage: ACCOUNT_MESSAGES.SPECIALTY_IDS_INVALID
  }
}

const bioSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: ACCOUNT_MESSAGES.BIO_INVALID
  }
}

const categoryIdSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: PRODUCT_CATEGORY_MESSAGES.CATEGORY_ID_IS_REQUIRED
  },
  isMongoId: {
    errorMessage: PRODUCT_CATEGORY_MESSAGES.CATEGORY_ID_MUST_BE_A_VALID_MONGO_ID
  }
}

const productCategoryNameSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: PRODUCT_CATEGORY_MESSAGES.CATEGORY_NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: PRODUCT_CATEGORY_MESSAGES.CATEGORY_NAME_MUST_BE_A_STRING
  },
  matches: {
    options: [/^[A-Za-z0-9_ ]+$/],
    errorMessage: PRODUCT_CATEGORY_MESSAGES.CATEGORY_NAME_CANNOT_CONTAIN_SPECIAL_CHARACTER
  },
  custom: {
    options: async (value: string, { req }) => {
      const productCategory = await databaseService.productCategories.findOne({ name: value })
      if (productCategory) {
        throw new Error(PRODUCT_CATEGORY_MESSAGES.CATEGORY_NAME_IS_EXIST)
      }
      return true
    }
  }
}

const productCategoryDescriptionSchema: ParamSchema = {
  trim: true,
  isString: {
    errorMessage: PRODUCT_CATEGORY_MESSAGES.CATEGORY_DESCRIPTION_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      max: 255
    },
    errorMessage: PRODUCT_CATEGORY_MESSAGES.CATEGORY_DESCRIPTION_CANNOT_LONGER_THAN_255
  }
}

const updateProductCategoryNameSchema: ParamSchema = omit(productCategoryNameSchema, ['custom'])

const accountsParamsSchema = {
  emailSchema,
  registerPasswordSchema,
  loginPasswordSchema,
  accessTokenSchema,
  confirmPasswordSchema,
  forgotPasswordTokenSchema,
  refreshTokenSchema,
  emailVerifyTokenSchema,
  forgotPasswordEmailSchema,
  updateMeNameSchema,
  updateMePhoneNumberSchema,
  updateMeAddressSchema,
  updateMeDateOfBirthSchema,
  updateMeAvatarSchema,
  limitSchema,
  pageSchema,
  accountIdSchema,
  staffTypeSchema,
  specialtyIdsSchema,
  bioSchema,
  categoryIdSchema,
  productCategoryNameSchema,
  productCategoryDescriptionSchema,
  updateProductCategoryNameSchema
}
export default accountsParamsSchema
