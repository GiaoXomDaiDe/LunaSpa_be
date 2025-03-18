import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { BRANCH_PRODUCTS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { BranchProductsParams } from '~/models/request/BranchProducts.request'
import { BranchProductsStatus } from '~/models/schema/BranchProducts.schema'
import databaseService from '~/services/database.services'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

export const branchProductQueryValidator = validate(
  checkSchema(
    {
      branch_id: {
        optional: true,
        trim: true,
        isMongoId: {
          errorMessage: BRANCH_PRODUCTS_MESSAGES.BRANCH_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value: string) => {
            const branch = await databaseService.branches.findOne({ _id: new ObjectId(value) })
            if (!branch) {
              throw new Error(BRANCH_PRODUCTS_MESSAGES.BRANCH_NOT_FOUND)
            }
            return true
          }
        }
      },
      product_id: {
        optional: true,
        trim: true,
        isMongoId: {
          errorMessage: BRANCH_PRODUCTS_MESSAGES.PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value: string) => {
            const product = await databaseService.products.findOne({ _id: new ObjectId(value) })
            if (!product) {
              throw new Error(BRANCH_PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND)
            }
            return true
          }
        }
      },
      status: {
        optional: true,
        trim: true,
        isIn: {
          options: [['0', '1', '2']],
          errorMessage: BRANCH_PRODUCTS_MESSAGES.STATUS_MUST_BE_A_VALID_STATUS
        }
      }
    },
    ['query']
  )
)

export const branchProductValidator = validate(
  checkSchema(
    {
      branch_id: {
        trim: true,
        notEmpty: {
          errorMessage: BRANCH_PRODUCTS_MESSAGES.BRANCH_ID_MUST_BE_A_VALID_MONGO_ID
        },
        isMongoId: {
          errorMessage: BRANCH_PRODUCTS_MESSAGES.BRANCH_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value: string) => {
            const branch = await databaseService.branches.findOne({ _id: new ObjectId(value) })
            if (!branch) {
              throw new Error(BRANCH_PRODUCTS_MESSAGES.BRANCH_NOT_FOUND)
            }
            return true
          }
        }
      },
      product_id: {
        trim: true,
        notEmpty: {
          errorMessage: BRANCH_PRODUCTS_MESSAGES.PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        },
        isMongoId: {
          errorMessage: BRANCH_PRODUCTS_MESSAGES.PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value: string, { req }) => {
            const product = await databaseService.products.findOne({ _id: new ObjectId(value) })
            if (!product) {
              throw new Error(BRANCH_PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND)
            }

            const { branch_id } = req.body
            const branchProduct = await databaseService.branchProducts.findOne({
              branch_id: new ObjectId(branch_id),
              product_id: new ObjectId(value)
            })

            if (branchProduct) {
              throw new Error(BRANCH_PRODUCTS_MESSAGES.BRANCH_PRODUCT_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      status: {
        optional: true,
        isIn: {
          options: [[BranchProductsStatus.ACTIVE, BranchProductsStatus.INACTIVE, BranchProductsStatus.PENDING]],
          errorMessage: BRANCH_PRODUCTS_MESSAGES.STATUS_MUST_BE_A_VALID_STATUS
        }
      },
      override_price: {
        optional: true,
        isDecimal: {
          errorMessage: BRANCH_PRODUCTS_MESSAGES.OVERRIDE_PRICE_MUST_BE_A_NUMBER
        },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(BRANCH_PRODUCTS_MESSAGES.OVERRIDE_PRICE_CANNOT_BE_NEGATIVE)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const branchProductIdValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { branch_product_id } = req.params as BranchProductsParams
  if (!ObjectId.isValid(branch_product_id)) {
    return next(
      new ErrorWithStatus({
        message: BRANCH_PRODUCTS_MESSAGES.BRANCH_PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.BAD_REQUEST
      })
    )
  }

  const branchProduct = await databaseService.branchProducts.findOne({
    _id: new ObjectId(branch_product_id)
  })

  if (!branchProduct) {
    return next(
      new ErrorWithStatus({
        message: BRANCH_PRODUCTS_MESSAGES.BRANCH_PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    )
  }

  next()
})

export const updateBranchProductValidator = validate(
  checkSchema({
    status: {
      optional: true,
      isIn: {
        options: [[BranchProductsStatus.ACTIVE, BranchProductsStatus.INACTIVE, BranchProductsStatus.PENDING]],
        errorMessage: BRANCH_PRODUCTS_MESSAGES.STATUS_MUST_BE_A_VALID_STATUS
      }
    },
    override_price: {
      optional: true,
      isDecimal: {
        errorMessage: BRANCH_PRODUCTS_MESSAGES.OVERRIDE_PRICE_MUST_BE_A_NUMBER
      },
      custom: {
        options: async (value: number) => {
          if (value < 0) {
            throw new Error(BRANCH_PRODUCTS_MESSAGES.OVERRIDE_PRICE_CANNOT_BE_NEGATIVE)
          }
          return true
        }
      }
    }
  })
)
