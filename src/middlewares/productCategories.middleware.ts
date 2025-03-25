import { checkSchema } from 'express-validator'
import accountsParamsSchema from '~/utils/schemaHelper'
import { validate } from '~/utils/validation'

export const productCategoryQueryValidator = validate(
  checkSchema(
    {
      product_category_id: accountsParamsSchema.categoryIdSchema
    },
    ['params']
  )
)

export const productCategoryValidator = validate(
  checkSchema(
    {
      name: accountsParamsSchema.productCategoryNameSchema,
      description: accountsParamsSchema.productCategoryDescriptionSchema
    },
    ['body']
  )
)

export const updateProductCategoryValidator = validate(
  checkSchema(
    {
      name: accountsParamsSchema.updateProductCategoryNameSchema,
      description: accountsParamsSchema.productCategoryDescriptionSchema
    },
    ['body']
  )
)
