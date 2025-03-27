import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ProductParams } from '~/models/request/Products.requests'
import { ProductStatus } from '~/models/schema/Product.schema'
import databaseService from '~/services/database.services'
import { wrapRequestHandler } from '~/utils/handlers'
import schemaHelper from '~/utils/schemaHelper'
import { validate } from '~/utils/validation'

export const productsQueryValidator = validate(
  checkSchema(
    {
      sort: schemaHelper.sortSchema,
      order: schemaHelper.orderSchema,
      search: schemaHelper.searchSchema,
      max_price: schemaHelper.maxPriceSchema,
      min_price: schemaHelper.minPriceSchema,
      _custom: {
        custom: {
          options: (value, { req }) => {
            const { max_price, min_price } = (req as Request).query
            if (max_price && min_price && Number(max_price) <= Number(min_price)) {
              throw new Error(PRODUCT_MESSAGES.MAX_PRICE_MUST_BE_GREATER_THAN_MIN_PRICE)
            }
            return true
          }
        }
      },
      category_id: schemaHelper.categoryQueryIdSchema,
      discount_price: schemaHelper.discountPriceSchema,
      quantity: schemaHelper.quantitySchema,
      include_branch_products: schemaHelper.includeBranchProductsSchema
    },
    ['query']
  )
)
export const productIdParamValidator = validate(
  checkSchema(
    {
      product_id: schemaHelper.productIdSchema
    },
    ['params']
  )
)

export const ProductIdBodyValidator = validate(
  checkSchema(
    {
      product_id: schemaHelper.productIdBodySchema
    },
    ['body']
  )
)

export const checkProductNotInactive = wrapRequestHandler(
  async (req: Request<ProductParams, any, any>, res: Response, next: NextFunction) => {
    const { product_id } = req.params

    const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) })
    if (!product) {
      throw new ErrorWithStatus({
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (product.status === ProductStatus.INACTIVE) {
      throw new ErrorWithStatus({
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    req.product = product
    next()
  }
)

export const createProductValidator = validate(
  checkSchema({
    name: schemaHelper.productNameSchema,
    description: schemaHelper.productDescriptionSchema,
    category_id: schemaHelper.categoryIdSchema,
    price: schemaHelper.priceSchema,
    discount_price: schemaHelper.discountProductPriceSchema,
    quantity: schemaHelper.productQuantitySchema,
    images: schemaHelper.imagesSchema,
    status: schemaHelper.statusSchema
  })
)

export const updateProductValidator = validate(
  checkSchema({
    name: schemaHelper.updateNameSchema,
    description: schemaHelper.updateDescriptionSchema,
    category_id: schemaHelper.updateCategoryIdSchema,
    price: schemaHelper.updatePriceSchema,
    discount_price: schemaHelper.updateDiscountPriceSchema,
    quantity: schemaHelper.updateQuantitySchema,
    images: schemaHelper.updateImagesSchema,
    status: schemaHelper.updateStatusSchema
  })
)

export const ProductSearchValidator = validate(
  checkSchema(
    {
      search: schemaHelper.productSearchSchema
    },
    ['body']
  )
)
