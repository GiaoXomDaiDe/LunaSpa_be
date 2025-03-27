import { checkSchema } from 'express-validator'
import schemaHelper from '~/utils/schemaHelper'
import { validate } from '~/utils/validation'

export const productCategoryIdParamValidator = validate(
  checkSchema(
    {
      product_category_id: schemaHelper.categoryIdSchema
    },
    ['params']
  )
)

export const createProductCategoryValidator = validate(
  checkSchema(
    {
      name: schemaHelper.productCategoryNameSchema,
      description: schemaHelper.productCategoryDescriptionSchema
    },
    ['body']
  )
)

export const updateProductCategoryValidator = validate(
  checkSchema(
    {
      name: schemaHelper.updateProductCategoryNameSchema,
      description: schemaHelper.productCategoryDescriptionSchema
    },
    ['body']
  )
)
