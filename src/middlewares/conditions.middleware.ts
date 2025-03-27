import { checkSchema } from 'express-validator'
import schemaHelper from '~/utils/schemaHelper'
import { validate } from '~/utils/validation'

/**
 * Validate các trường trong query khi tìm kiếm conditions
 * Kiểm tra trường search
 */
export const conditionsQueryValidator = validate(
  checkSchema({
    search: schemaHelper.conditionSearchSchema
  })
)

/**
 * Validate condition_id trong params
 * Kiểm tra tính hợp lệ của ID
 */
export const conditionIdValidator = validate(
  checkSchema(
    {
      condition_id: schemaHelper.conditionIdSchema
    },
    ['params']
  )
)

/**
 * Validate các trường khi cập nhật condition
 * Tất cả các trường đều là optional
 */
export const updateConditionValidator = validate(
  checkSchema(
    {
      name: schemaHelper.updateConditionNameSchema,
      description: schemaHelper.updateConditionDescriptionSchema,
      instructions: schemaHelper.conditionInstructionsSchema
    },
    ['body']
  )
)

/**
 * Validate các trường khi tạo mới condition
 * Trường name là bắt buộc
 */
export const conditionValidator = validate(
  checkSchema(
    {
      name: schemaHelper.conditionNameSchema,
      description: schemaHelper.conditionDescriptionSchema,
      instructions: schemaHelper.conditionInstructionsSchema
    },
    ['body']
  )
)
