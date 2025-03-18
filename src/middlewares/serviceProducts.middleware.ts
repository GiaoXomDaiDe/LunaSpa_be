import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { SERVICE_PRODUCTS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ServiceProductsParams, ServiceProductsReqBody } from '~/models/request/ServiceProducts.requests'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

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
      }
    },
    ['body']
  )
)

export const updateServiceProductValidator = async (
  req: Request<ServiceProductsParams, any, ServiceProductsReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { service_product_id } = req.params
  const { service_id, product_id } = req.body

  if (service_id && !ObjectId.isValid(service_id)) {
    throw new ErrorWithStatus({
      message: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }

  if (product_id && !ObjectId.isValid(product_id)) {
    throw new ErrorWithStatus({
      message: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }

  if (service_id) {
    const service = await databaseService.services.findOne({
      _id: new ObjectId(service_id)
    })

    if (!service) {
      throw new ErrorWithStatus({
        message: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
  }

  if (product_id) {
    const product = await databaseService.products.findOne({
      _id: new ObjectId(product_id)
    })

    if (!product) {
      throw new ErrorWithStatus({
        message: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
  }

  // Kiểm tra xem đã tồn tại liên kết này chưa (trừ chính nó)
  if (service_id || product_id) {
    const existingServiceProduct = await databaseService.serviceProducts.findOne({
      _id: { $ne: new ObjectId(service_product_id) },
      service_id: service_id ? new ObjectId(service_id) : undefined,
      product_id: product_id ? new ObjectId(product_id) : undefined
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
