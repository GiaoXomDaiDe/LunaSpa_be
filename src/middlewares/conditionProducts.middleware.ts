import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { CONDITION_PRODUCTS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ConditionProductsParams, UpdateConditionProductsReqBody } from '~/models/request/ConditionProducts.requests'
import databaseService from '~/services/database.services'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

// Validate condition_product_id trong params
export const conditionProductIdValidator = validate(
  checkSchema(
    {
      condition_product_id: {
        trim: true,
        notEmpty: {
          errorMessage: CONDITION_PRODUCTS_MESSAGES.CONDITION_PRODUCT_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: CONDITION_PRODUCTS_MESSAGES.CONDITION_PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        }
      }
    },
    ['params']
  )
)

// Validate query params
export const conditionProductQueryValidator = validate(
  checkSchema(
    {
      condition_id: {
        optional: true,
        isMongoId: {
          errorMessage: CONDITION_PRODUCTS_MESSAGES.CONDITION_ID_MUST_BE_A_VALID_MONGO_ID
        }
      },
      product_id: {
        optional: true,
        isMongoId: {
          errorMessage: CONDITION_PRODUCTS_MESSAGES.PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        }
      },
      search: {
        optional: true,
        isString: {
          errorMessage: 'Từ khóa tìm kiếm phải là chuỗi'
        }
      }
    },
    ['query']
  )
)

// Validate request body khi tạo mới
export const conditionProductValidator = validate(
  checkSchema(
    {
      condition_id: {
        notEmpty: {
          errorMessage: CONDITION_PRODUCTS_MESSAGES.CONDITION_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: CONDITION_PRODUCTS_MESSAGES.CONDITION_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value) => {
            const condition = await databaseService.conditions.findOne({ _id: new ObjectId(value) })
            if (!condition) {
              throw new ErrorWithStatus({
                message: CONDITION_PRODUCTS_MESSAGES.CONDITION_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      },
      product_id: {
        notEmpty: {
          errorMessage: CONDITION_PRODUCTS_MESSAGES.PRODUCT_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: CONDITION_PRODUCTS_MESSAGES.PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value) => {
            const product = await databaseService.products.findOne({ _id: new ObjectId(value) })
            if (!product) {
              throw new ErrorWithStatus({
                message: CONDITION_PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      },
      note: {
        optional: true,
        isString: {
          errorMessage: CONDITION_PRODUCTS_MESSAGES.NOTE_MUST_BE_STRING
        }
      }
    },
    ['body']
  )
)

// Validate request body khi cập nhật
export const updateConditionProductValidator = validate(
  checkSchema(
    {
      condition_id: {
        optional: true,
        isMongoId: {
          errorMessage: CONDITION_PRODUCTS_MESSAGES.CONDITION_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value) => {
            if (!value) return true
            const condition = await databaseService.conditions.findOne({ _id: new ObjectId(value) })
            if (!condition) {
              throw new ErrorWithStatus({
                message: CONDITION_PRODUCTS_MESSAGES.CONDITION_NOT_FOUND,
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
          errorMessage: CONDITION_PRODUCTS_MESSAGES.PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value) => {
            if (!value) return true
            const product = await databaseService.products.findOne({ _id: new ObjectId(value) })
            if (!product) {
              throw new ErrorWithStatus({
                message: CONDITION_PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      },
      note: {
        optional: true,
        isString: {
          errorMessage: CONDITION_PRODUCTS_MESSAGES.NOTE_MUST_BE_STRING
        }
      }
    },
    ['body']
  )
)

// Kiểm tra xem condition_product có tồn tại không
export const checkConditionProductExists = wrapRequestHandler(
  async (req: Request<ConditionProductsParams, any, any>, res: Response, next: NextFunction) => {
    const { condition_product_id } = req.params

    if (!ObjectId.isValid(condition_product_id)) {
      throw new ErrorWithStatus({
        message: CONDITION_PRODUCTS_MESSAGES.CONDITION_PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const conditionProduct = await databaseService.conditionProducts.findOne({
      _id: new ObjectId(condition_product_id)
    })

    if (!conditionProduct) {
      throw new ErrorWithStatus({
        message: CONDITION_PRODUCTS_MESSAGES.CONDITION_PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    next()
  }
)

// Kiểm tra xem đã tồn tại liên kết giữa condition và product chưa
export const checkConditionProductDuplicate = wrapRequestHandler(
  async (req: Request<any, any, UpdateConditionProductsReqBody>, res: Response, next: NextFunction) => {
    const { condition_id, product_id } = req.body
    const condition_product_id = req.params.condition_product_id

    // Chỉ kiểm tra nếu cả condition_id và product_id được cung cấp
    if (condition_id && product_id) {
      const query: any = {
        condition_id: new ObjectId(condition_id),
        product_id: new ObjectId(product_id)
      }

      // Nếu đang cập nhật, loại trừ bản ghi hiện tại
      if (condition_product_id) {
        query._id = { $ne: new ObjectId(condition_product_id) }
      }

      const existingLink = await databaseService.conditionProducts.findOne(query)

      if (existingLink) {
        throw new ErrorWithStatus({
          message: CONDITION_PRODUCTS_MESSAGES.CONDITION_PRODUCT_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    next()
  }
)
