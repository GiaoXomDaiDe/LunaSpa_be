import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { PRODUCT_CATEGORY_MESSAGES } from '~/constants/messages'
import ProductCategory from '~/models/schema/ProductCategory.schema'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const productCategoryQueryValidator = validate(
  checkSchema(
    {
      product_category_id: {
        trim: true,
        notEmpty: {
          errorMessage: PRODUCT_CATEGORY_MESSAGES.CATEGORY_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: PRODUCT_CATEGORY_MESSAGES.CATEGORY_ID_MUST_BE_A_VALID_MONGO_ID
        }
      }
    },
    ['params']
  )
)

export const productCategoryValidator = validate(
  checkSchema(
    {
      name: {
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
            req.productCategory = productCategory
            return true
          }
        }
      },
      description: {
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
    },
    ['body']
  )
)

export const updateProductCategoryValidator = validate(
  checkSchema(
    {
      name: {
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
            const currentProductCategory = (req as Request).productCategory as ProductCategory
            if (currentProductCategory && currentProductCategory.name === value) {
              return true
            }
            const existingProductCategory = await databaseService.productCategories.findOne({
              name: value,
              _id: { $ne: currentProductCategory._id }
            })
            if (existingProductCategory) {
              throw new Error(PRODUCT_CATEGORY_MESSAGES.CATEGORY_NAME_IS_EXIST)
            }
            return true
          }
        }
      },
      description: {
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
    },
    ['body']
  )
)
