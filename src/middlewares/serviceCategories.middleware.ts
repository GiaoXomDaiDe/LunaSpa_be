import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { SERVICE_CATEGORY_MESSAGES } from '~/constants/messages'
import ServiceCategoy from '~/models/schema/ServiceCategory.schema'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const serviceCategoryValidator = validate(
  checkSchema(
    {
      name: {
        trim: true,
        notEmpty: {
          errorMessage: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_IS_REQUIRED
        },
        isString: {
          errorMessage: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_MUST_BE_A_STRING
        },
        matches: {
          options: [/^[A-Za-z0-9_ ]+$/],
          errorMessage: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_CANNOT_CONTAIN_SPECIAL_CHARACTERS
        },
        custom: {
          options: async (value: string, { req }) => {
            const serviceCategory = await databaseService.serviceCategories.findOne({ name: value })
            if (serviceCategory) {
              throw new Error(SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_ALREADY_EXISTS)
            }
            req.serviceCategory = serviceCategory
            return true
          }
        }
      },
      description: {
        trim: true,
        isString: {
          errorMessage: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_DESCRIPTION_MUST_BE_A_STRING
        },
        isLength: {
          options: { max: 255 },
          errorMessage: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_DESCRIPTION_CANNOT_BE_LONGER_THAN_255
        }
      }
    },
    ['body']
  )
)

export const updateServiceCategoryValidator = validate(
  checkSchema(
    {
      name: {
        trim: true,
        notEmpty: {
          errorMessage: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_IS_REQUIRED
        },
        isString: {
          errorMessage: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_MUST_BE_A_STRING
        },
        matches: {
          options: [/^[A-Za-z0-9_ ]+$/],
          errorMessage: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_CANNOT_CONTAIN_SPECIAL_CHARACTERS
        },
        custom: {
          options: async (value: string, { req }) => {
            const currentServiceCategory = (req as Request).serviceCategory as ServiceCategoy
            if (currentServiceCategory && currentServiceCategory.name === value) {
              return true
            }
            const existingServiceCategory = await databaseService.serviceCategories.findOne({
              name: value,
              _id: { $ne: currentServiceCategory._id }
            })
            if (existingServiceCategory) {
              throw new Error(SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      description: {
        trim: true,
        isString: {
          errorMessage: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_DESCRIPTION_MUST_BE_A_STRING
        },
        isLength: {
          options: { max: 255 },
          errorMessage: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_DESCRIPTION_CANNOT_BE_LONGER_THAN_255
        }
      }
    },
    ['body']
  )
)

export const serviceCategoryQueryValidator = validate(
  checkSchema(
    {
      service_category_id: {
        trim: true,
        notEmpty: {
          errorMessage: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_ID_MUST_BE_A_VALID_MONGO_ID
        }
      }
    },
    ['params']
  )
)
