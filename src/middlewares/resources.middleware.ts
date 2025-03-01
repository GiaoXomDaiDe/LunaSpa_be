import { checkSchema } from 'express-validator'
import { RESOURCE_MESSAGE } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const createResourceValidator = validate(
  checkSchema(
    {
      resource_name: {
        notEmpty: {
          errorMessage: RESOURCE_MESSAGE.RESSOURCE_IS_REQUIRE
        },
        isString: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_MUST_BE_A_STRING
        },
        matches: {
          options: [/^[A-Za-z0-9_]+$/],
          errorMessage: RESOURCE_MESSAGE.RESSOURCE_CANNOT_CONTAIN_SPECIAL_CHARACTER
        },
        customSanitizer: {
          // Custom sanitizer
          options: (value: string) => {
            return value.replace(/\b\w/, (char) => char.toUpperCase())
          }
        }
      },
      description: {
        notEmpty: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_DESCRIPTION_IS_REQUIRE
        },
        isString: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_DESCRIPTION_MUST_BE_A_STRING
        },
        isLength: {
          options: { max: 255 },
          errorMessage: RESOURCE_MESSAGE.RESOURCE_DESCRIPTION_CANNOT_LONGER_THAN_255
        }
      }
    },
    ['body']
  )
)

export const updateResourceValidator = validate(
  checkSchema(
    {
      resource_name: {
        notEmpty: {
          errorMessage: RESOURCE_MESSAGE.RESSOURCE_IS_REQUIRE
        },
        isString: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_MUST_BE_A_STRING
        },
        matches: {
          options: [/^[A-Za-z0-9_]+$/],
          errorMessage: RESOURCE_MESSAGE.RESSOURCE_CANNOT_CONTAIN_SPECIAL_CHARACTER
        },
        customSanitizer: {
          options: (value: any) => {
            if (typeof value !== 'string') {
              return value
            }
            return value.replace(/\b\w/, (char) => char.toUpperCase())
          }
        },
        custom: {
          options: async (values: string, { req }) => {
            const resource = await databaseService.resources.findOne({ resource_name: values })
            if (resource) {
              return Promise.reject(RESOURCE_MESSAGE.RESOURCE_IS_EXIST)
            }
          }
        }
      },
      description: {
        notEmpty: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_DESCRIPTION_IS_REQUIRE
        },
        isString: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_DESCRIPTION_MUST_BE_A_STRING
        },
        isLength: {
          options: { max: 255 },
          errorMessage: RESOURCE_MESSAGE.RESOURCE_DESCRIPTION_CANNOT_LONGER_THAN_255
        }
      }
    },
    ['body']
  )
)
