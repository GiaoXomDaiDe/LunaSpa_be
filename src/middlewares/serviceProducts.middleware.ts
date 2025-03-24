import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { SERVICE_PRODUCTS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ServiceProductsParams, UpdateServiceProductsReqBody } from '~/models/request/ServiceProducts.requests'
import { ServiceProductStatus } from '~/models/schema/ServiceProducts.schema'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'
import { wrapRequestHandler } from './../utils/handlers'

export const serviceProductIdValidator = validate(
  checkSchema(
    {
      service_product_id: {
        trim: true,
        notEmpty: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        }
      }
    },
    ['params']
  )
)

export const serviceProductQueryValidator = validate(
  checkSchema(
    {
      service_id: {
        optional: true,
        isMongoId: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        }
      },
      product_id: {
        optional: true,
        isMongoId: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        }
      },
      status: {
        optional: true,
        isIn: {
          options: [[ServiceProductStatus.ACTIVE, ServiceProductStatus.INACTIVE]],
          errorMessage: SERVICE_PRODUCTS_MESSAGES.STATUS_INVALID
        }
      }
    },
    ['query']
  )
)

export const serviceProductValidator = validate(
  checkSchema(
    {
      service_id: {
        isMongoId: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        }
      },
      product_id: {
        isMongoId: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        }
      },
      status: {
        optional: true,
        isInt: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.STATUS_MUST_BE_NUMBER
        },
        isIn: {
          options: [[ServiceProductStatus.ACTIVE, ServiceProductStatus.INACTIVE]],
          errorMessage: SERVICE_PRODUCTS_MESSAGES.STATUS_INVALID
        }
      },
      recommended: {
        optional: true,
        isBoolean: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.RECOMMENDED_MUST_BE_BOOLEAN
        }
      },
      discount_percent: {
        optional: true,
        isNumeric: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.DISCOUNT_PERCENT_MUST_BE_NUMBER
        },
        custom: {
          options: (value) => {
            if (Number(value) < 0 || Number(value) > 100) {
              throw new Error(SERVICE_PRODUCTS_MESSAGES.DISCOUNT_PERCENT_INVALID)
            }
            return true
          }
        }
      },
      usage_instruction: {
        optional: true,
        isString: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.USAGE_INSTRUCTION_MUST_BE_STRING
        }
      }
    },
    ['body']
  )
)

export const updateServiceProductValidator = validate(
  checkSchema(
    {
      service_id: {
        optional: true,
        isMongoId: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value) => {
            if (!value) return true
            const service = await databaseService.services.findOne({
              _id: new ObjectId(value)
            })
            if (!service) {
              throw new ErrorWithStatus({
                message: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      },
      product_id: {
        optional: true,
        isMongoId: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value) => {
            if (!value) return true
            const product = await databaseService.products.findOne({
              _id: new ObjectId(value)
            })
            if (!product) {
              throw new ErrorWithStatus({
                message: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      },
      status: {
        optional: true,
        isInt: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.STATUS_MUST_BE_NUMBER
        },
        isIn: {
          options: [[ServiceProductStatus.ACTIVE, ServiceProductStatus.INACTIVE]],
          errorMessage: SERVICE_PRODUCTS_MESSAGES.STATUS_INVALID
        }
      },
      recommended: {
        optional: true,
        isBoolean: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.RECOMMENDED_MUST_BE_BOOLEAN
        }
      },
      discount_percent: {
        optional: true,
        isNumeric: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.DISCOUNT_PERCENT_MUST_BE_NUMBER
        },
        custom: {
          options: (value) => {
            if (Number(value) < 0 || Number(value) > 100) {
              throw new Error(SERVICE_PRODUCTS_MESSAGES.DISCOUNT_PERCENT_INVALID)
            }
            return true
          }
        }
      },
      usage_instruction: {
        optional: true,
        isString: {
          errorMessage: SERVICE_PRODUCTS_MESSAGES.USAGE_INSTRUCTION_MUST_BE_STRING
        }
      }
    },
    ['body']
  )
)

// Middleware bổ sung để kiểm tra xem đã tồn tại liên kết service_product nào chưa
export const checkServiceProductDuplicate = wrapRequestHandler(
  async (req: Request<ServiceProductsParams, any, UpdateServiceProductsReqBody>, res: Response, next: NextFunction) => {
    const { service_product_id } = req.params
    const { service_id, product_id } = req.body

    // Chỉ kiểm tra nếu cả service_id và product_id được cung cấp
    if (service_id && product_id) {
      const existingServiceProduct = await databaseService.serviceProducts.findOne({
        _id: { $ne: new ObjectId(service_product_id) },
        service_id: new ObjectId(service_id),
        product_id: new ObjectId(product_id)
      })

      if (existingServiceProduct) {
        throw new ErrorWithStatus({
          message: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    next()
  }
)

// Middleware kiểm tra service_product_id có tồn tại không
export const checkServiceProductExists = wrapRequestHandler(
  async (req: Request<ServiceProductsParams, any, any>, res: Response, next: NextFunction) => {
    const { service_product_id } = req.params

    if (!ObjectId.isValid(service_product_id)) {
      throw new ErrorWithStatus({
        message: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const serviceProduct = await databaseService.serviceProducts.findOne({ _id: new ObjectId(service_product_id) })
    if (!serviceProduct) {
      throw new ErrorWithStatus({
        message: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Lưu thông tin service product vào request để có thể sử dụng ở các middleware tiếp theo
    req.serviceProduct = serviceProduct
    next()
  }
)
