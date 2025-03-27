import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { ORDER, SERVICE_SORT_BY } from '~/constants/constants'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES, SERVICE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ServiceParams } from '~/models/request/Services.request'
import { ServiceStatus } from '~/models/schema/Service.schema'
import databaseService from '~/services/database.services'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

export const servicesQueryValidator = validate(
  checkSchema(
    {
      sort: {
        optional: true,
        trim: true,
        customSanitizer: {
          options: (value: string) => {
            return value || SERVICE_SORT_BY[1] //booking_count
          }
        },
        isString: {
          errorMessage: SERVICE_MESSAGES.SORT_VALUE_INVALID
        },
        custom: {
          options: async (value: string) => {
            if (!SERVICE_SORT_BY.includes(value)) {
              throw new Error(SERVICE_MESSAGES.SORT_MUST_INCLUDE_IN_LIST)
            }
            return true
          }
        }
      },
      order: {
        optional: true,
        trim: true,
        customSanitizer: {
          options: (value: string) => {
            return value || ORDER[0] //asc
          }
        },
        isString: {
          errorMessage: SERVICE_MESSAGES.ORDER_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!ORDER.includes(value)) {
              throw new Error(SERVICE_MESSAGES.ORDER_MUST_BE_IN_ARRAY)
            }
            return true
          }
        }
      },
      search: {
        optional: true,
        trim: true,
        customSanitizer: {
          options: (value: string) => {
            return value || ''
          }
        },
        isString: {
          errorMessage: SERVICE_MESSAGES.SEARCH_MUST_BE_A_STRING
        }
      },
      limit: {
        optional: true,
        trim: true,
        customSanitizer: {
          options: (value: string) => {
            return value ? parseInt(value) : 10
          }
        },
        isInt: {
          errorMessage: PRODUCT_MESSAGES.LIMIT_MUST_BE_A_NUMBER
        }
      },
      page: {
        optional: true,
        trim: true,
        customSanitizer: {
          options: (value: string) => {
            return value ? parseInt(value) : 1
          }
        },
        isInt: {
          errorMessage: PRODUCT_MESSAGES.PAGE_MUST_BE_A_NUMBER
        }
      },
      max_booking_count: {
        optional: true,
        customSanitizer: {
          options: (value: string) => {
            return value && value !== '' ? parseInt(value) : undefined
          }
        },
        isInt: {
          errorMessage: SERVICE_MESSAGES.MAX_BOOKING_COUNT_MUST_BE_A_NUMBER
        },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(SERVICE_MESSAGES.MAX_BOOKING_COUNT_CANNOT_BE_NEGATIVE)
            }
            return true
          }
        }
      },
      min_booking_count: {
        optional: true,
        customSanitizer: {
          options: (value: string) => {
            return value && value !== '' ? parseInt(value) : undefined
          }
        },
        isInt: {
          errorMessage: SERVICE_MESSAGES.MIN_BOOKING_COUNT_MUST_BE_A_NUMBER
        },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(SERVICE_MESSAGES.MIN_BOOKING_COUNT_CANNOT_BE_NEGATIVE)
            }
            return true
          }
        }
      },
      _custom_booking_count: {
        custom: {
          options: (value, { req }) => {
            const { max_booking_count, min_booking_count } = (req as Request).query
            if (max_booking_count && min_booking_count && Number(max_booking_count) <= Number(min_booking_count)) {
              throw new Error(SERVICE_MESSAGES.MAX_BOOKING_COUNT_MUST_BE_GREATER_THAN_MIN_BOOKING_COUNT)
            }
            return true
          }
        }
      },
      max_view_count: {
        optional: true,
        customSanitizer: {
          options: (value: string) => {
            return value && value !== '' ? parseInt(value) : undefined
          }
        },
        isInt: {
          errorMessage: SERVICE_MESSAGES.MAX_VIEW_COUNT_MUST_BE_A_NUMBER
        },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(SERVICE_MESSAGES.MAX_VIEW_COUNT_CANNOT_BE_NEGATIVE)
            }
            return true
          }
        }
      },
      min_view_count: {
        optional: true,
        customSanitizer: {
          options: (value: string) => {
            return value && value !== '' ? parseInt(value) : undefined
          }
        },
        isInt: {
          errorMessage: SERVICE_MESSAGES.MIN_VIEW_COUNT_MUST_BE_A_NUMBER
        },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(SERVICE_MESSAGES.MIN_VIEW_COUNT_CANNOT_BE_NEGATIVE)
            }
            return true
          }
        }
      },
      _custom_view_count: {
        custom: {
          options: (value, { req }) => {
            const { max_view_count, min_view_count } = (req as Request).query
            if (max_view_count && min_view_count && Number(max_view_count) <= Number(min_view_count)) {
              throw new Error(SERVICE_MESSAGES.MAX_VIEW_COUNT_MUST_BE_GREATER_THAN_MIN_VIEW_COUNT)
            }
            return true
          }
        }
      },
      service_category_id: {
        optional: true,
        customSanitizer: {
          options: (value: string) => {
            return value && value !== '' ? value : undefined
          }
        },
        notEmpty: {
          errorMessage: SERVICE_MESSAGES.SERVICE_CATEGORY_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: SERVICE_MESSAGES.SERVICE_CATEGORY_ID_MUST_BE_A_MONGO_ID
        },
        custom: {
          options: async (value: string) => {
            if (!value) return true
            const category = await databaseService.serviceCategories.findOne({
              _id: new ObjectId(value)
            })
            if (!category) {
              throw new Error(SERVICE_MESSAGES.CATEGORY_ID_NOT_FOUND)
            }
            return true
          }
        }
      },
      device_ids: {
        optional: true,
        customSanitizer: {
          options: (value: string[] | string) => {
            if (!value) return undefined
            if (typeof value === 'string') {
              return [value]
            }
            return value
          }
        },
        isArray: {
          errorMessage: SERVICE_MESSAGES.DEVICE_ID_MUST_BE_AN_ARRAY
        },
        custom: {
          options: async (value: string[]) => {
            if (!value || value.length === 0) return true
            const devices = await databaseService.devices
              .find({ _id: { $in: value.map((item) => new ObjectId(item)) } })
              .toArray()
            if (devices.length !== value.length) {
              throw new Error(SERVICE_MESSAGES.DEVICE_ID_NOT_FOUND)
            }
            return true
          }
        }
      },
      include_branch_services: {
        optional: true,
        trim: true,
        customSanitizer: {
          options: (value: string) => {
            return value === 'true'
          }
        }
      }
    },
    ['query']
  )
)
export const serviceIdValidator = validate(
  checkSchema(
    {
      service_id: {
        trim: true,
        notEmpty: {
          errorMessage: SERVICE_MESSAGES.SERVICE_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: SERVICE_MESSAGES.SERVICE_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value: string, { req }) => {
            const service = await databaseService.services.findOne({ _id: new ObjectId(value) })
            if (!service) {
              throw new Error(SERVICE_MESSAGES.SERVICE_NOT_FOUND)
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)
export const availableSlotsServiceIdValidator = validate(
  checkSchema(
    {
      service_id: {
        trim: true,
        notEmpty: {
          errorMessage: SERVICE_MESSAGES.SERVICE_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: SERVICE_MESSAGES.SERVICE_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value: string, { req }) => {
            const service = await databaseService.services.findOne({ _id: new ObjectId(value) })
            if (!service) {
              throw new Error(SERVICE_MESSAGES.SERVICE_NOT_FOUND)
            }
            return true
          }
        }
      },
      date: {
        optional: true,
        isISO8601: {
          errorMessage: SERVICE_MESSAGES.DATE_MUST_BE_ISO8601
        }
      }
    },
    ['params', 'query']
  )
)
export const checkServiceNotInactive = wrapRequestHandler(
  async (req: Request<ServiceParams, any, any>, res: Response, next: NextFunction) => {
    const { service_id } = req.params
    const service = await databaseService.services.findOne({ _id: new ObjectId(service_id) })
    if (!service) {
      throw new ErrorWithStatus({
        message: SERVICE_MESSAGES.SERVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (service.status === ServiceStatus.INACTIVE) {
      throw new ErrorWithStatus({
        message: SERVICE_MESSAGES.SERVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    req.service = service
    next()
  }
)
export const serviceValidator = validate(
  checkSchema({
    name: {
      trim: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.SERVICE_NAME_IS_REQUIRED
      },
      isString: {
        errorMessage: SERVICE_MESSAGES.SERVICE_NAME_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: SERVICE_MESSAGES.SERVICE_NAME_MUST_BE_BETWEEN_1_AND_100_CHARACTERS
      }
    },
    description: {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.DESCRIPTION_IS_REQUIRED
      },
      isString: {
        errorMessage: SERVICE_MESSAGES.DESCRIPTION_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          min: 1,
          max: 1000
        },
        errorMessage: SERVICE_MESSAGES.DESCRIPTION_MUST_BE_BETWEEN_1_AND_1000_CHARACTERS
      }
    },
    images: {
      optional: true,
      isArray: {
        errorMessage: SERVICE_MESSAGES.IMAGES_MUST_BE_AN_ARRAY
      },
      custom: {
        options: async (value: string[]) => {
          const images = value.find((item) => typeof item !== 'string')
          if (images) {
            throw new Error(SERVICE_MESSAGES.IMAGE_MUST_BE_A_STRING)
          }
          return true
        }
      }
    },
    status: {
      optional: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.STATUS_IS_REQUIRED
      },
      isIn: {
        options: [Object.values(ServiceStatus)],
        errorMessage: SERVICE_MESSAGES.STATUS_MUST_BE_A_VALID_STATUS
      }
    },
    booking_count: {
      optional: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.BOOKING_COUNT_IS_REQUIRED
      },
      isInt: {
        errorMessage: SERVICE_MESSAGES.BOOKING_COUNT_MUST_BE_A_NUMBER
      },
      custom: {
        options: async (value: number) => {
          if (value < 0) {
            throw new Error(SERVICE_MESSAGES.BOOKING_COUNT_CANNOT_BE_NEGATIVE)
          }
          return true
        }
      }
    },
    view_count: {
      optional: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.VIEW_COUNT_IS_REQUIRED
      },
      isInt: {
        errorMessage: SERVICE_MESSAGES.VIEW_COUNT_MUST_BE_A_NUMBER
      },
      custom: {
        options: async (value: number) => {
          if (value < 0) {
            throw new Error(SERVICE_MESSAGES.VIEW_COUNT_CANNOT_BE_NEGATIVE)
          }
          return true
        }
      }
    },
    service_category_id: {
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.SERVICE_CATEGORY_ID_IS_REQUIRED
      },
      isMongoId: {
        errorMessage: SERVICE_MESSAGES.SERVICE_CATEGORY_ID_MUST_BE_A_MONGO_ID
      },
      custom: {
        options: async (value: string) => {
          const category = await databaseService.serviceCategories.findOne({ _id: new ObjectId(value) })
          if (!category) {
            throw new Error(SERVICE_MESSAGES.CATEGORY_ID_NOT_FOUND)
          }
          return true
        }
      }
    },
    durations: {
      optional: true,
      isArray: {
        errorMessage: SERVICE_MESSAGES.DURATIONS_MUST_BE_AN_ARRAY
      }
    },
    'durations.duration_name': {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.DURATION_NAME_IS_REQUIRED
      }
    },
    'durations.price': {
      optional: true,
      isInt: {
        errorMessage: SERVICE_MESSAGES.PRICE_MUST_BE_A_NUMBER
      },
      custom: {
        options: async (value: number) => {
          if (value < 0) {
            throw new Error(SERVICE_MESSAGES.PRICE_CANNOT_BE_NEGATIVE)
          }
          return true
        }
      }
    },
    'durations.discount_price': {
      optional: true,
      isInt: {
        errorMessage: SERVICE_MESSAGES.DISCOUNT_PRICE_MUST_BE_A_NUMBER
      },
      custom: {
        options: async (value: number) => {
          if (value < 0) {
            throw new Error(SERVICE_MESSAGES.DISCOUNT_PRICE_CANNOT_BE_NEGATIVE)
          }
          return true
        }
      }
    },
    'durations.sub_description': {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.SUB_DESCRIPTION_IS_REQUIRED
      },
      isString: {
        errorMessage: SERVICE_MESSAGES.SUB_DESCRIPTION_MUST_BE_A_STRING
      }
    },
    'durations.duration_in_minutes': {
      optional: true,
      isInt: {
        errorMessage: SERVICE_MESSAGES.DURATION_IN_MINUTES_MUST_BE_A_NUMBER
      },
      custom: {
        options: async (value: number) => {
          if (value < 0) {
            throw new Error(SERVICE_MESSAGES.DURATION_IN_MINUTES_CANNOT_BE_NEGATIVE)
          }
          return true
        }
      }
    },
    device_ids: {
      optional: true,
      isArray: {
        errorMessage: SERVICE_MESSAGES.DEVICE_IDS_MUST_BE_AN_ARRAY
      },
      custom: {
        options: async (value: string[]) => {
          const devices = await databaseService.devices
            .find({ _id: { $in: value.map((item) => new ObjectId(item)) } })
            .toArray()
          if (devices.length !== value.length) {
            throw new Error(SERVICE_MESSAGES.DEVICE_ID_NOT_FOUND)
          }
          return true
        }
      }
    }
  })
)

export const updateServiceValidator = validate(
  checkSchema({
    name: {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.SERVICE_NAME_IS_REQUIRED
      },
      isString: {
        errorMessage: SERVICE_MESSAGES.SERVICE_NAME_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: SERVICE_MESSAGES.SERVICE_NAME_MUST_BE_BETWEEN_1_AND_100_CHARACTERS
      }
    },
    description: {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.DESCRIPTION_IS_REQUIRED
      },
      isString: {
        errorMessage: SERVICE_MESSAGES.DESCRIPTION_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          min: 1,
          max: 1000
        },
        errorMessage: SERVICE_MESSAGES.DESCRIPTION_MUST_BE_BETWEEN_1_AND_1000_CHARACTERS
      }
    },
    images: {
      optional: true,
      isArray: {
        errorMessage: SERVICE_MESSAGES.IMAGES_MUST_BE_AN_ARRAY
      },
      custom: {
        options: async (value: string[]) => {
          const images = value.find((item) => typeof item !== 'string')
          if (images) {
            throw new Error(SERVICE_MESSAGES.IMAGE_MUST_BE_A_STRING)
          }
          return true
        }
      }
    },
    status: {
      optional: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.STATUS_IS_REQUIRED
      },
      isIn: {
        options: [Object.values(ServiceStatus)],
        errorMessage: SERVICE_MESSAGES.STATUS_MUST_BE_A_VALID_STATUS
      }
    },
    booking_count: {
      optional: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.BOOKING_COUNT_IS_REQUIRED
      },
      isInt: {
        errorMessage: SERVICE_MESSAGES.BOOKING_COUNT_MUST_BE_A_NUMBER
      },
      custom: {
        options: async (value: number) => {
          if (value < 0) {
            throw new Error(SERVICE_MESSAGES.BOOKING_COUNT_CANNOT_BE_NEGATIVE)
          }
          return true
        }
      }
    },
    view_count: {
      optional: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.VIEW_COUNT_IS_REQUIRED
      },
      isInt: {
        errorMessage: SERVICE_MESSAGES.VIEW_COUNT_MUST_BE_A_NUMBER
      },
      custom: {
        options: async (value: number) => {
          if (value < 0) {
            throw new Error(SERVICE_MESSAGES.VIEW_COUNT_CANNOT_BE_NEGATIVE)
          }
          return true
        }
      }
    },
    service_category_id: {
      optional: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.SERVICE_CATEGORY_ID_IS_REQUIRED
      },
      isMongoId: {
        errorMessage: SERVICE_MESSAGES.SERVICE_CATEGORY_ID_MUST_BE_A_MONGO_ID
      },
      custom: {
        options: async (value: string) => {
          const category = await databaseService.serviceCategories.findOne({ _id: new ObjectId(value) })
          if (!category) {
            throw new Error(SERVICE_MESSAGES.CATEGORY_ID_NOT_FOUND)
          }
          return true
        }
      }
    },
    durations: {
      optional: true,
      isArray: {
        errorMessage: SERVICE_MESSAGES.DURATIONS_MUST_BE_AN_ARRAY
      }
    },
    'durations.duration_name': {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.DURATION_NAME_IS_REQUIRED
      }
    },
    'durations.price': {
      optional: true,
      isInt: {
        errorMessage: SERVICE_MESSAGES.PRICE_MUST_BE_A_NUMBER
      },
      custom: {
        options: async (value: number) => {
          if (value < 0) {
            throw new Error(SERVICE_MESSAGES.PRICE_CANNOT_BE_NEGATIVE)
          }
          return true
        }
      }
    },
    'durations.discount_price': {
      optional: true,
      isInt: {
        errorMessage: SERVICE_MESSAGES.DISCOUNT_PRICE_MUST_BE_A_NUMBER
      },
      custom: {
        options: async (value: number) => {
          if (value < 0) {
            throw new Error(SERVICE_MESSAGES.DISCOUNT_PRICE_CANNOT_BE_NEGATIVE)
          }
          return true
        }
      }
    },
    'durations.sub_description': {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.SUB_DESCRIPTION_IS_REQUIRED
      },
      isString: {
        errorMessage: SERVICE_MESSAGES.SUB_DESCRIPTION_MUST_BE_A_STRING
      }
    },
    'durations.duration_in_minutes': {
      optional: true,
      isInt: {
        errorMessage: SERVICE_MESSAGES.DURATION_IN_MINUTES_MUST_BE_A_NUMBER
      },
      custom: {
        options: async (value: number) => {
          if (value < 0) {
            throw new Error(SERVICE_MESSAGES.DURATION_IN_MINUTES_CANNOT_BE_NEGATIVE)
          }
          return true
        }
      }
    },
    device_ids: {
      optional: true,
      isArray: {
        errorMessage: SERVICE_MESSAGES.DEVICE_IDS_MUST_BE_AN_ARRAY
      },
      custom: {
        options: async (value: string[]) => {
          const devices = await databaseService.devices
            .find({ _id: { $in: value.map((item) => new ObjectId(item)) } })
            .toArray()
          if (devices.length !== value.length) {
            throw new Error(SERVICE_MESSAGES.DEVICE_ID_NOT_FOUND)
          }
          return true
        }
      }
    }
  })
)
export const serviceIdBodyValidator = validate(
  checkSchema({
    service_id: {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: SERVICE_MESSAGES.SERVICE_ID_IS_REQUIRED
      },
      isMongoId: {
        errorMessage: SERVICE_MESSAGES.SERVICE_ID_MUST_BE_A_VALID_MONGO_ID
      },
      custom: {
        options: async (value: string) => {
          const service = await databaseService.services.findOne({ _id: new ObjectId(value) })
          if (!service) {
            throw new Error(SERVICE_MESSAGES.SERVICE_NOT_FOUND)
          }
          return true
        }
      }
    }
  })
)
export const serviceProductIdValidator = validate(
  checkSchema(
    {
      service_product_id: {
        optional: true,
        trim: true,
        notEmpty: {
          errorMessage: SERVICE_MESSAGES.SERVICE_PRODUCT_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: SERVICE_MESSAGES.SERVICE_PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value: string) => {
            const serviceProduct = await databaseService.servicesProducts.findOne({ _id: new ObjectId(value) })
            if (!serviceProduct) {
              throw new Error(SERVICE_MESSAGES.SERVICE_PRODUCT_NOT_FOUND)
            }
          }
        }
      }
    },
    ['params']
  )
)
