import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { ORDER, SORT_BY } from '~/constants/constants'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ProductParams } from '~/models/request/Products.requests'
import { ProductStatus } from '~/models/schema/Product.schema'
import databaseService from '~/services/database.services'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

export const productsQueryValidator = validate(
  checkSchema(
    {
      sort: {
        optional: true,
        trim: true,
        customSanitizer: {
          options: (value: string) => {
            if (!value) {
              return (value = SORT_BY[1]) //price
            }
            return value
          }
        },
        isString: {
          errorMessage: PRODUCT_MESSAGES.SORT_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!SORT_BY.includes(value)) {
              throw new Error(PRODUCT_MESSAGES.SORT_MUST_BE_A_STRING)
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
            if (!value) {
              return (value = ORDER[0]) //asc
            }
            return value
          }
        },
        isString: {
          errorMessage: PRODUCT_MESSAGES.ORDER_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!ORDER.includes(value)) {
              throw new Error(PRODUCT_MESSAGES.ORDER_MUST_BE_A_STRING)
            }
            return true
          }
        }
      },
      search: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: PRODUCT_MESSAGES.SEARCH_MUST_BE_A_STRING
        }
      },
      max_price: {
        optional: true,
        notEmpty: {
          errorMessage: PRODUCT_MESSAGES.MAX_PRICE_IS_REQUIRED
        },
        isInt: {
          errorMessage: PRODUCT_MESSAGES.MAX_PRICE_MUST_BE_A_NUMBER
        },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(PRODUCT_MESSAGES.MAX_PRICE_CANNOT_BE_NEGATIVE)
            }
            return true
          }
        }
      },
      min_price: {
        optional: true,
        isInt: {
          errorMessage: PRODUCT_MESSAGES.MIN_PRICE_MUST_BE_A_NUMBER
        },
        notEmpty: {
          errorMessage: PRODUCT_MESSAGES.MIN_PRICE_IS_REQUIRED
        },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(PRODUCT_MESSAGES.MIN_PRICE_CANNOT_BE_NEGATIVE)
            }
            return true
          }
        }
      },
      _custom: {
        custom: {
          options: (value, { req }) => {
            const { max_price, min_price } = (req as Request).query
            if (max_price && min_price && max_price <= min_price) {
              throw new Error(PRODUCT_MESSAGES.MAX_PRICE_MUST_BE_GREATER_THAN_MIN_PRICE)
            }
            return true
          }
        }
      },
      category_id: {
        optional: true,
        isMongoId: {
          errorMessage: PRODUCT_MESSAGES.CATEGORY_ID_MUST_BE_A_MONGO_ID
        },
        notEmpty: {
          errorMessage: PRODUCT_MESSAGES.CATEGORY_ID_IS_REQUIRED
        },
        custom: {
          options: async (value: string) => {
            const category = await databaseService.productCategories.findOne({
              _id: new ObjectId(value)
            })
            if (!category) {
              throw new Error(PRODUCT_MESSAGES.CATEGORY_ID_NOT_FOUND)
            }
            return true
          }
        }
      },
      discount_price: {
        optional: true,
        isInt: {
          errorMessage: PRODUCT_MESSAGES.DISCOUNT_PRICE_MUST_BE_A_NUMBER
        },
        notEmpty: {
          errorMessage: PRODUCT_MESSAGES.DISCOUNT_PRICE_IS_REQUIRED
        },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(PRODUCT_MESSAGES.DISCOUNT_PRICE_CANNOT_BE_NEGATIVE)
            }
            return true
          }
        }
      },
      quantity: {
        optional: true,
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
    },
    ['query']
  )
)
export const productIdValidator = validate(
  checkSchema(
    {
      product_id: {
        trim: true,
        notEmpty: {
          errorMessage: PRODUCT_MESSAGES.PRODUCT_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: PRODUCT_MESSAGES.PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        }
      }
    },
    ['params']
  )
)

export const ProductIdBodyValidator = validate(
  checkSchema(
    {
      product_id: {
        optional: true,
        trim: true,
        notEmpty: {
          errorMessage: PRODUCT_MESSAGES.PRODUCT_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: PRODUCT_MESSAGES.PRODUCT_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value: string) => {
            const product = await databaseService.products.findOne({ _id: new ObjectId(value) })
            if (!product) {
              throw new Error(PRODUCT_MESSAGES.PRODUCT_NOT_FOUND)
            }
          }
        }
      }
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
export const productValidator = validate(
  checkSchema({
    name: {
      trim: true,
      notEmpty: {
        errorMessage: PRODUCT_MESSAGES.PRODUCT_NAME_IS_REQUIRED
      },
      isString: {
        errorMessage: PRODUCT_MESSAGES.PRODUCT_NAME_MUST_BE_A_STRING
      }
    },
    description: {
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
    },
    category_id: {
      trim: true,
      notEmpty: {
        errorMessage: PRODUCT_MESSAGES.CATEGORY_ID_IS_REQUIRED
      },
      isMongoId: {
        errorMessage: PRODUCT_MESSAGES.CATEGORY_ID_MUST_BE_A_MONGO_ID
      },
      custom: {
        options: async (value: string, { req }) => {
          const category = await databaseService.productCategories.findOne({
            _id: new ObjectId(value)
          })
          console.log(category)
          if (!category) {
            throw new Error(PRODUCT_MESSAGES.CATEGORY_ID_NOT_FOUND)
          }
          return true
        }
      }
    },
    price: {
      isInt: {
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
    },
    discount_price: {
      optional: true,
      isInt: {
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
    },
    quantity: {
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
    },
    images: {
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
    },
    status: {
      optional: true,
      isIn: {
        options: [Object.values(ProductStatus)],
        errorMessage: PRODUCT_MESSAGES.STATUS_MUST_BE_A_VALID_STATUS
      }
    }
  })
)
export const updateProductValidator = validate(
  checkSchema({
    name: {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: PRODUCT_MESSAGES.PRODUCT_NAME_IS_REQUIRED
      },
      isString: {
        errorMessage: PRODUCT_MESSAGES.PRODUCT_NAME_MUST_BE_A_STRING
      }
    },
    description: {
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
    },
    category_id: {
      optional: true,
      trim: true,
      notEmpty: {
        errorMessage: PRODUCT_MESSAGES.CATEGORY_ID_IS_REQUIRED
      },
      isMongoId: {
        errorMessage: PRODUCT_MESSAGES.CATEGORY_ID_MUST_BE_A_MONGO_ID
      },
      custom: {
        options: async (value: string, { req }) => {
          const category = await databaseService.productCategories.findOne({
            _id: new ObjectId(value)
          })
          if (!category) {
            throw new Error(PRODUCT_MESSAGES.CATEGORY_ID_NOT_FOUND)
          }
          return true
        }
      }
    },
    price: {
      optional: true,
      isInt: {
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
    },
    discount_price: {
      optional: true,
      isInt: {
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
    },
    quantity: {
      optional: true,
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
    },
    images: {
      optional: true,
      isArray: {
        errorMessage: PRODUCT_MESSAGES.IMAGES_MUST_BE_AN_ARRAY
      }
    },
    status: {
      optional: true,
      isIn: {
        options: [Object.values(ProductStatus)],
        errorMessage: PRODUCT_MESSAGES.STATUS_MUST_BE_A_VALID_STATUS
      },
      custom: {
        options: (value: number) => {
          console.log([Object.values(ProductStatus)])
          return true
        }
      }
    }
  })
)

export const ProductSearchValidator = validate(
  checkSchema(
    {
      search: {
        trim: true,
        notEmpty: {
          errorMessage: PRODUCT_MESSAGES.SEARCH_MUST_BE_A_STRING
        },
        isString: {
          errorMessage: PRODUCT_MESSAGES.SEARCH_MUST_BE_A_STRING
        }
      }
    },
    ['body']
  )
)
