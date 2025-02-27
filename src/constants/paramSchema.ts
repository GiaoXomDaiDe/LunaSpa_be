import { ParamSchema } from 'express-validator'
import { ACCOUNT_MESSAGES } from '~/constants/messages'
import accountsService from '~/services/accounts.services'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'

const emailRegisterSchema: ParamSchema = {
  isEmail: {
    options: {
      ignore_max_length: false
    },
    errorMessage: ACCOUNT_MESSAGES.EMAIL_IS_INVALID
  },
  trim: true,
  isLength: {
    options: {
      min: 10,
      max: 50
    },
    errorMessage: ACCOUNT_MESSAGES.EMAIL_LENGTH_MUST_BE_FROM_10_TO_50
  },
  custom: {
    options: async (email: string) => {
      const isExistMail = await accountsService.checkEmailExist(email)
      if (isExistMail) {
        throw new Error(ACCOUNT_MESSAGES.EMAIL_ALREADY_EXISTS)
      }
      return true
    }
  }
}
const emailLoginSchema: ParamSchema = {
  isEmail: {
    options: {
      ignore_max_length: false
    },
    errorMessage: ACCOUNT_MESSAGES.EMAIL_IS_INVALID
  },
  trim: true,
  isLength: {
    options: {
      min: 10,
      max: 50
    },
    errorMessage: ACCOUNT_MESSAGES.EMAIL_LENGTH_MUST_BE_FROM_10_TO_50
  },
  custom: {
    options: async (value: string, { req }) => {
      const account = await databaseService.accounts.findOne({
        email: value,
        password: hashPassword(req.body.password)
      })
      if (account === null) {
        throw new Error(ACCOUNT_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
      }
      req.account = account
      return true
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
    options: {
      min: 6,
      max: 50
    },
    errorMessage: ACCOUNT_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_5_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: ACCOUNT_MESSAGES.PASSWORD_NOT_STRONG
  }
}
const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: ACCOUNT_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: ACCOUNT_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 5,
      max: 50
    },
    errorMessage: ACCOUNT_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_5_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 5,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: ACCOUNT_MESSAGES.CONFIRM_PASSWORD_NOT_STRONG
  },
  custom: {
    options: (confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error(ACCOUNT_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
      }
      return true
    }
  }
}
const accountsParamsSchema = {
  emailRegisterSchema,
  emailLoginSchema,
  passwordSchema,
  confirmPasswordSchema
}
export default accountsParamsSchema
