import { Request } from 'express'
import { ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize, omit } from 'lodash'
import { ObjectId } from 'mongodb'
import { envConfig } from '~/constants/config'
import { ORDER, SORT_BY } from '~/constants/constants'
import HTTP_STATUS from '~/constants/httpStatus'
import {
  ACCOUNT_MESSAGES,
  CONDITION_MESSAGES,
  DEVICE_MESSAGES,
  ERROR_RESPONSE_MESSAGES,
  PRODUCT_CATEGORY_MESSAGES,
  PRODUCT_MESSAGES
} from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { DeviceStatus } from '~/models/schema/Device.schema'
import { ProductStatus } from '~/models/schema/Product.schema'
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
  trim: true,
  customSanitizer: {
    options: (value: string) => {
      return value ? parseInt(value) : 10
    }
  },
  isInt: {
    errorMessage: PRODUCT_MESSAGES.LIMIT_MUST_BE_A_NUMBER
  },
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
  trim: true,
  customSanitizer: {
    options: (value: string) => {
      return value ? parseInt(value) : 1
    }
  },
  isInt: {
    errorMessage: PRODUCT_MESSAGES.PAGE_MUST_BE_A_NUMBER
  },
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
const sortSchema: ParamSchema = {
  optional: true,
  trim: true,
  customSanitizer: {
    options: (value: string) => {
      return value || SORT_BY[1]
    }
  },
  custom: {
    options: async (value: string) => {
      if (!SORT_BY.includes(value)) {
        throw new Error(PRODUCT_MESSAGES.SORT_VALUE_INVALID)
      }
      return true
    }
  }
}
const orderSchema: ParamSchema = {
  optional: true,
  trim: true,
  customSanitizer: {
    options: (value: string) => {
      return value || ORDER[0] // asc
    }
  },
  isString: {
    errorMessage: PRODUCT_MESSAGES.ORDER_VALUE_INVALID
  },
  custom: {
    options: async (value: string) => {
      if (!ORDER.includes(value)) {
        throw new Error(PRODUCT_MESSAGES.ORDER_VALUE_INVALID)
      }
      return true
    }
  }
}
const searchSchema: ParamSchema = {
  optional: true,
  trim: true,
  customSanitizer: {
    options: (value: string) => {
      return value || ''
    }
  },
  isString: {
    errorMessage: PRODUCT_MESSAGES.SEARCH_MUST_BE_A_STRING
  }
}
const maxPriceSchema: ParamSchema = {
  optional: true,
  trim: true,
  customSanitizer: {
    options: (value: string) => {
      if (!value || value === '') return undefined
      // Kiểm tra xem chuỗi có phải là số hợp lệ không
      if (!/^[0-9]+(\.[0-9]+)?$/.test(value)) {
        return NaN
      }
      return parseFloat(value)
    }
  },
  isFloat: {
    errorMessage: PRODUCT_MESSAGES.MAX_PRICE_MUST_BE_A_NUMBER
  },
  custom: {
    options: async (value: number) => {
      if (isNaN(value)) {
        throw new Error(PRODUCT_MESSAGES.MAX_PRICE_MUST_BE_A_NUMBER)
      }
      if (value < 0) {
        throw new Error(PRODUCT_MESSAGES.MAX_PRICE_CANNOT_BE_NEGATIVE)
      }
      return true
    }
  }
}
const minPriceSchema: ParamSchema = {
  optional: true,
  trim: true,
  customSanitizer: {
    options: (value: string) => {
      if (!value || value === '') return undefined
      // Kiểm tra xem chuỗi có phải là số hợp lệ không
      if (!/^[0-9]+(\.[0-9]+)?$/.test(value)) {
        return NaN
      }
      return parseFloat(value)
    }
  },
  isFloat: {
    errorMessage: PRODUCT_MESSAGES.MIN_PRICE_MUST_BE_A_NUMBER
  },
  custom: {
    options: async (value: number) => {
      if (isNaN(value)) {
        throw new Error(PRODUCT_MESSAGES.MIN_PRICE_MUST_BE_A_NUMBER)
      }
      if (value < 0) {
        throw new Error(PRODUCT_MESSAGES.MIN_PRICE_CANNOT_BE_NEGATIVE)
      }
      return true
    }
  }
}
const discountPriceSchema: ParamSchema = {
  optional: true,
  trim: true,
  customSanitizer: {
    options: (value: string) => {
      if (!value || value === '') return undefined
      // Kiểm tra xem chuỗi có phải là số hợp lệ không
      if (!/^[0-9]+(\.[0-9]+)?$/.test(value)) {
        return NaN
      }
      return parseFloat(value)
    }
  },
  isFloat: {
    errorMessage: PRODUCT_MESSAGES.DISCOUNT_PRICE_MUST_BE_A_NUMBER
  },
  custom: {
    options: async (value: number) => {
      if (isNaN(value)) {
        throw new Error(PRODUCT_MESSAGES.DISCOUNT_PRICE_MUST_BE_A_NUMBER)
      }
      if (value < 0) {
        throw new Error(PRODUCT_MESSAGES.DISCOUNT_PRICE_CANNOT_BE_NEGATIVE)
      }
      return true
    }
  }
}
const quantitySchema: ParamSchema = {
  optional: true,
  trim: true,
  customSanitizer: {
    options: (value: string) => {
      if (!value || value === '') return undefined
      // Kiểm tra xem chuỗi có phải là số nguyên hợp lệ không
      if (!/^[0-9]+$/.test(value)) {
        return NaN
      }
      return parseInt(value)
    }
  },
  isInt: {
    errorMessage: PRODUCT_MESSAGES.QUANTITY_MUST_BE_A_NUMBER
  },
  custom: {
    options: async (value: number) => {
      if (isNaN(value)) {
        throw new Error(PRODUCT_MESSAGES.QUANTITY_MUST_BE_A_NUMBER)
      }
      if (value < 0) {
        throw new Error(PRODUCT_MESSAGES.QUANTITY_CANNOT_BE_NEGATIVE)
      }
      return true
    }
  }
}
const includeBranchProductsSchema: ParamSchema = {
  optional: true,
  trim: true,
  customSanitizer: {
    options: (value: string) => {
      return value === 'true'
    }
  }
}

/**
 * Tạo một schema validator chung cho các loại MongoID
 * @param options Các tùy chọn cho schema
 * @returns ParamSchema để sử dụng trong express-validator
 */
const createMongoIdSchema = (options: {
  fieldName: string // Tên trường (để hiển thị lỗi phù hợp)
  collection?: string // Tên collection trong MongoDB (nếu cần kiểm tra tồn tại)
  optional?: boolean // Có cho phép trường không tồn tại không
  notEmpty?: boolean // Có yêu cầu trường không được rỗng không
  requiredMsg?: string // Thông báo lỗi khi trường bắt buộc
  invalidIdMsg?: string // Thông báo lỗi khi ID không hợp lệ
  notFoundMsg?: string // Thông báo lỗi khi không tìm thấy ID trong DB
  sanitize?: (value: string) => any // Hàm xử lý giá trị trước khi validate
  customValidation?: (value: string, req?: any) => Promise<boolean> | boolean // Hàm validate tùy chỉnh
}): ParamSchema => {
  const schema: ParamSchema = {
    trim: true
  }

  // Thêm optional nếu được chỉ định
  if (options.optional) {
    schema.optional = true
  }

  // Thêm notEmpty nếu không được chỉ định là false
  if (options.notEmpty !== false) {
    schema.notEmpty = {
      errorMessage: options.requiredMsg || `${options.fieldName} is required`
    }
  }

  // Thêm kiểm tra MongoId
  schema.isMongoId = {
    errorMessage: options.invalidIdMsg || `${options.fieldName} must be a valid MongoDB ID`
  }

  // Thêm sanitize nếu được cung cấp
  if (options.sanitize) {
    schema.customSanitizer = {
      options: options.sanitize
    }
  }

  // Tạo một hàm custom validation duy nhất kết hợp các kiểm tra
  if (options.collection || options.customValidation) {
    schema.custom = {
      options: async (value: string, { req }) => {
        // Nếu là trường tùy chọn và giá trị không tồn tại, bỏ qua validation
        if (options.optional && (!value || value === '')) {
          return true
        }
        // Hợp nhất việc kiểm tra collection và custom validation
        // Nếu cần kiểm tra trong collection
        if (options.collection) {
          const item = await (databaseService as any)[options.collection].findOne({
            _id: new ObjectId(value)
          })

          if (!item) {
            throw new Error(options.notFoundMsg || `${options.fieldName} not found`)
          }

          // Nếu tìm thấy item và cần thêm validation tùy chỉnh
          if (options.customValidation) {
            const result = await options.customValidation(value, req)
            if (!result) {
              throw new Error(options.notFoundMsg || `${options.fieldName} not found (custom validation failed)`)
            }
          }
        }
        // Nếu chỉ có custom validation mà không cần kiểm tra collection
        else if (options.customValidation) {
          const result = await options.customValidation(value, req)
          if (!result) {
            throw new Error(options.notFoundMsg || `${options.fieldName} not found`)
          }
        }

        return true
      }
    }
  }

  return schema
}

// Tạo lại các schema liên quan đến ID sử dụng hàm tiện ích
const categoryIdSchema = createMongoIdSchema({
  fieldName: 'category_id',
  notEmpty: true,
  requiredMsg: PRODUCT_CATEGORY_MESSAGES.CATEGORY_ID_IS_REQUIRED,
  invalidIdMsg: PRODUCT_CATEGORY_MESSAGES.CATEGORY_ID_MUST_BE_A_VALID_MONGO_ID,
  collection: 'productCategories'
})

const categoryQueryIdSchema = createMongoIdSchema({
  fieldName: 'category_id',
  optional: true,
  invalidIdMsg: PRODUCT_MESSAGES.CATEGORY_ID_MUST_BE_A_MONGO_ID,
  notFoundMsg: PRODUCT_MESSAGES.CATEGORY_ID_NOT_FOUND,
  sanitize: (value: string) => {
    return value && value !== '' ? value : undefined
  },
  customValidation: async (value: string) => {
    if (!value) return true
    const category = await databaseService.productCategories.findOne({
      _id: new ObjectId(value)
    })
    return !!category
  }
})

const productIdSchema = createMongoIdSchema({
  fieldName: 'product_id',
  requiredMsg: PRODUCT_MESSAGES.PRODUCT_ID_IS_REQUIRED,
  invalidIdMsg: PRODUCT_MESSAGES.PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID,
  notFoundMsg: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
  collection: 'products'
})

const productIdBodySchema = createMongoIdSchema({
  fieldName: 'product_id',
  optional: true,
  requiredMsg: PRODUCT_MESSAGES.PRODUCT_ID_IS_REQUIRED,
  invalidIdMsg: PRODUCT_MESSAGES.PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID,
  notFoundMsg: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
  collection: 'products'
})

const accountIdSchema = createMongoIdSchema({
  fieldName: 'account_id',
  requiredMsg: ACCOUNT_MESSAGES.ACCOUNT_ID_IS_REQUIRED,
  invalidIdMsg: ACCOUNT_MESSAGES.ACCOUNT_ID_MUST_BE_A_MONGO_ID
})
const productNameSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: PRODUCT_MESSAGES.PRODUCT_NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: PRODUCT_MESSAGES.PRODUCT_NAME_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 1,
      max: 255
    },
    errorMessage: PRODUCT_MESSAGES.PRODUCT_NAME_LENGTH_MUST_BE_FROM_1_TO_255
  }
}

const productDescriptionSchema: ParamSchema = {
  optional: true,
  trim: true,
  isString: {
    errorMessage: PRODUCT_MESSAGES.PRODUCT_DESCRIPTION_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      max: 255
    },
    errorMessage: PRODUCT_MESSAGES.PRODUCT_DESCRIPTION_CANNOT_LONGER_THAN_255
  }
}
const priceSchema: ParamSchema = {
  isFloat: {
    errorMessage: PRODUCT_MESSAGES.PRICE_MUST_BE_A_NUMBER
  },
  notEmpty: {
    errorMessage: PRODUCT_MESSAGES.PRICE_IS_REQUIRED
  },
  custom: {
    options: async (value: number) => {
      if (value < 0) {
        throw new Error(PRODUCT_MESSAGES.PRICE_CANNOT_BE_NEGATIVE)
      }
      return true
    }
  }
}
const discountProductPriceSchema: ParamSchema = {
  optional: true,
  isFloat: {
    errorMessage: PRODUCT_MESSAGES.DISCOUNT_PRICE_MUST_BE_A_NUMBER
  },
  notEmpty: {
    errorMessage: PRODUCT_MESSAGES.DISCOUNT_PRICE_IS_REQUIRED
  },
  custom: {
    options: async (value: number, { req }) => {
      if (value < 0) {
        throw new Error(PRODUCT_MESSAGES.DISCOUNT_PRICE_CANNOT_BE_NEGATIVE)
      }
      if (value > req.body.price) {
        throw new Error(PRODUCT_MESSAGES.DISCOUNT_PRICE_MUST_BE_LESS_THAN_OR_EQUAL_TO_PRICE)
      }
      return true
    }
  }
}
const productQuantitySchema: ParamSchema = {
  isInt: {
    errorMessage: PRODUCT_MESSAGES.QUANTITY_MUST_BE_A_NUMBER
  },
  notEmpty: {
    errorMessage: PRODUCT_MESSAGES.QUANTITY_IS_REQUIRED
  },
  custom: {
    options: async (value: number) => {
      if (value < 0) {
        throw new Error(PRODUCT_MESSAGES.QUANTITY_CANNOT_BE_NEGATIVE)
      }
      return true
    }
  }
}

const imagesSchema: ParamSchema = {
  optional: true,
  isArray: {
    errorMessage: PRODUCT_MESSAGES.IMAGES_MUST_BE_AN_ARRAY
  },
  custom: {
    options: async (value: string[]) => {
      const images = value.find((item) => typeof item !== 'string')
      if (images) {
        throw new Error(PRODUCT_MESSAGES.IMAGE_MUST_BE_A_STRING)
      }
      return true
    }
  }
}

const statusSchema: ParamSchema = {
  optional: true,
  isIn: {
    options: [Object.values(ProductStatus)],
    errorMessage: PRODUCT_MESSAGES.STATUS_MUST_BE_A_VALID_STATUS
  }
}

/**
 * Tạo phiên bản optional của schema cho các trường hợp update
 * @param schema Schema gốc
 * @returns Schema mới với thuộc tính optional=true
 */
const createOptionalSchema = (schema: ParamSchema): ParamSchema => {
  // Tạo một schema mới với optional = true
  const optionalSchema: ParamSchema = { ...schema, optional: true }

  // Sao chép các thuộc tính quan trọng khác
  if (schema.custom) {
    optionalSchema.custom = schema.custom
  }

  if (schema.customSanitizer) {
    optionalSchema.customSanitizer = schema.customSanitizer
  }

  return optionalSchema
}

// Tạo các schema cho update từ schema gốc
const updateNameSchema = createOptionalSchema(productNameSchema)
const updateDescriptionSchema = createOptionalSchema(productDescriptionSchema)
const updateCategoryIdSchema = createOptionalSchema(categoryIdSchema)
const updatePriceSchema = createOptionalSchema(priceSchema)
const updateDiscountPriceSchema = createOptionalSchema(discountProductPriceSchema)
const updateQuantitySchema = createOptionalSchema(quantitySchema)
const updateImagesSchema = createOptionalSchema(imagesSchema)
const updateStatusSchema = createOptionalSchema(statusSchema)

const productSearchSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: PRODUCT_MESSAGES.SEARCH_MUST_BE_A_STRING
  },
  isString: {
    errorMessage: PRODUCT_MESSAGES.SEARCH_MUST_BE_A_STRING
  }
}

// Định nghĩa các schema cho conditions
const conditionNameSchema: ParamSchema = {
  trim: true,
  isString: {
    errorMessage: CONDITION_MESSAGES.NAME_MUST_BE_STRING
  },
  isLength: {
    options: {
      max: 100
    },
    errorMessage: CONDITION_MESSAGES.NAME_MUST_BE_LESS_THAN_100_CHARACTERS
  },
  custom: {
    options: async (value: string, { req }) => {
      const condition = await databaseService.conditions.findOne({ name: value })
      if (condition) {
        throw new Error(CONDITION_MESSAGES.NAME_IS_EXIST)
      }
      return true
    }
  }
}

const conditionDescriptionSchema: ParamSchema = {
  trim: true,
  isString: {
    errorMessage: CONDITION_MESSAGES.DESCRIPTION_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      max: 255
    },
    errorMessage: CONDITION_MESSAGES.DESCRIPTION_CANNOT_LONGER_THAN_255
  }
}

const conditionInstructionsSchema: ParamSchema = {
  optional: true,
  trim: true,
  isString: {
    errorMessage: CONDITION_MESSAGES.INSTRUCTIONS_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      max: 255
    },
    errorMessage: CONDITION_MESSAGES.INSTRUCTIONS_CANNOT_LONGER_THAN_255
  }
}

const conditionSearchSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: CONDITION_MESSAGES.SEARCH_MUST_BE_STRING
  },
  isLength: {
    options: {
      max: 100
    },
    errorMessage: CONDITION_MESSAGES.SEARCH_MUST_BE_LESS_THAN_100_CHARACTERS
  }
}

const conditionIdSchema = createMongoIdSchema({
  fieldName: 'condition_id',
  requiredMsg: CONDITION_MESSAGES.CONDITION_ID_IS_REQUIRED,
  invalidIdMsg: CONDITION_MESSAGES.CONDITION_ID_MUST_BE_A_VALID_MONGO_ID,
  collection: 'conditions'
})

// Tạo các schema cho update từ schema gốc
const updateConditionNameSchema = createOptionalSchema(conditionNameSchema)
const updateConditionDescriptionSchema = createOptionalSchema(conditionDescriptionSchema)
// Không cần tạo schema cho instructions vì đã có optional: true

// Định nghĩa các schema cho devices
const deviceNameSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: DEVICE_MESSAGES.DEVICE_NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: DEVICE_MESSAGES.DEVICE_NAME_MUST_BE_A_STRING
  },
  custom: {
    options: async (value: string, { req }) => {
      const device = await databaseService.devices.findOne({ name: value })
      if (device) {
        throw new Error(DEVICE_MESSAGES.DEVICE_NAME_IS_EXIST)
      }
      req.device = device
      return true
    }
  }
}

const deviceDescriptionSchema: ParamSchema = {
  optional: true,
  trim: true,
  isString: {
    errorMessage: DEVICE_MESSAGES.DEVICE_DESCRIPTION_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      max: 255
    },
    errorMessage: DEVICE_MESSAGES.DEVICE_DESCRIPTION_CANNOT_LONGER_THAN_255
  }
}

const deviceStatusSchema: ParamSchema = {
  optional: true,
  isInt: {
    errorMessage: DEVICE_MESSAGES.STATUS_MUST_BE_NUMBER
  },
  custom: {
    options: (value) => {
      const allowedValues = [DeviceStatus.ACTIVE, DeviceStatus.INACTIVE, DeviceStatus.BROKEN, DeviceStatus.MAINTENANCE]
      if (!allowedValues.includes(value)) {
        throw new Error(`Status must be one of the following values: ${allowedValues.join(', ')}`)
      }
      return true
    }
  }
}

const deviceSearchSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: DEVICE_MESSAGES.SEARCH_MUST_BE_STRING
  },
  isLength: {
    options: {
      max: 100
    },
    errorMessage: DEVICE_MESSAGES.SEARCH_MUST_BE_LESS_THAN_100_CHARACTERS
  }
}

const deviceIdSchema = createMongoIdSchema({
  fieldName: 'device_id',
  requiredMsg: DEVICE_MESSAGES.DEVICE_ID_IS_REQUIRED,
  invalidIdMsg: DEVICE_MESSAGES.DEVICE_ID_MUST_BE_A_VALID_MONGO_ID,
  collection: 'devices'
})

// Tạo các schema cho update từ schema gốc
const updateDeviceNameSchema = createOptionalSchema(deviceNameSchema)
const updateDeviceDescriptionSchema = createOptionalSchema(deviceDescriptionSchema)

// Thêm device schemas vào schemaHelper
const schemaHelper = {
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
  updateProductCategoryNameSchema,
  sortSchema,
  orderSchema,
  searchSchema,
  maxPriceSchema,
  minPriceSchema,
  discountPriceSchema,
  discountProductPriceSchema,
  quantitySchema,
  productQuantitySchema,
  includeBranchProductsSchema,
  categoryQueryIdSchema,
  productIdSchema,
  productIdBodySchema,
  createMongoIdSchema,
  productNameSchema,
  productDescriptionSchema,
  priceSchema,
  imagesSchema,
  statusSchema,
  // Thêm các schema cho update
  createOptionalSchema,
  updateNameSchema,
  updateDescriptionSchema,
  updateCategoryIdSchema,
  updatePriceSchema,
  updateDiscountPriceSchema,
  updateQuantitySchema,
  updateImagesSchema,
  updateStatusSchema,
  productSearchSchema,
  // Condition schemas
  conditionNameSchema,
  conditionDescriptionSchema,
  conditionInstructionsSchema,
  conditionSearchSchema,
  conditionIdSchema,
  updateConditionNameSchema,
  updateConditionDescriptionSchema,
  // Device schemas
  deviceNameSchema,
  deviceDescriptionSchema,
  deviceStatusSchema,
  deviceSearchSchema,
  deviceIdSchema,
  updateDeviceNameSchema,
  updateDeviceDescriptionSchema
}
export default schemaHelper
