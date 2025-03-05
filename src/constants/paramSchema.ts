import { ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { envConfig } from '~/constants/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { ACCOUNT_MESSAGES, ERROR_RESPONSE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import accountsService from '~/services/accounts.services'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'

const emailSchema: ParamSchema = {
  notEmpty: {
    errorMessage: ACCOUNT_MESSAGES.EMAIL_IS_REQUIRED
  },
  isEmail: {
    options: { ignore_max_length: false },
    errorMessage: ACCOUNT_MESSAGES.EMAIL_IS_INVALID
  },
  trim: true,
  isLength: {
    options: { min: 10, max: 50 },
    errorMessage: ACCOUNT_MESSAGES.EMAIL_LENGTH_MUST_BE_FROM_10_TO_50
  },
  custom: {
    options: async (value: string, { req }) => {
      // Nếu có confirm_password => Đăng ký => Check email chưa tồn tại
      if (req.body.confirm_password) {
        const isExistMail = await accountsService.checkEmailExist(value)
        if (isExistMail) {
          throw new Error(ACCOUNT_MESSAGES.EMAIL_ALREADY_EXISTS)
        }
        return true
      } else {
        // Không có confirm_password => Đăng nhập => Check email phải tồn tại
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

const passwordSchema: ParamSchema = {
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
    bail: true,
    errorMessage: ACCOUNT_MESSAGES.PASSWORD_NOT_STRONG
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
const passwordLoginSchema: ParamSchema = {
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

const forgotPasswordSchema: ParamSchema = {
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

const accountsParamsSchema = {
  emailSchema,
  passwordSchema,
  passwordLoginSchema,
  confirmPasswordSchema,
  forgotPasswordSchema
}
export default accountsParamsSchema
