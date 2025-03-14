import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { RESOURCE_MESSAGE } from '~/constants/messages'
import Resource from '~/models/schema/Resource.schema'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const resourceQueryValidator = validate(
  checkSchema(
    {
      resource_id: {
        trim: true,
        notEmpty: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_IS_REQUIRE
        },
        isMongoId: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_MUST_BE_A_MONGO_ID
        },
        custom: {
          options: async (value: string, { req }) => {
            const resource = await databaseService.resources.findOne({ _id: new ObjectId(value) })
            if (!resource) {
              throw new Error(RESOURCE_MESSAGE.RESOURCE_IS_NOT_EXISTED)
            }
            req.resource = resource
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const createResourceValidator = validate(
  checkSchema(
    {
      resource_name: {
        customSanitizer: {
          options: (value: string) => {
            const upperCase = value.split(' ').map((word) => word.toLowerCase().charAt(0).toUpperCase() + word.slice(1))
            return upperCase.join(' ')
          }
        },
        notEmpty: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_IS_REQUIRE
        },
        isString: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_MUST_BE_A_STRING
        },
        matches: {
          options: [/^[A-Za-z0-9_ ]+$/],
          errorMessage: RESOURCE_MESSAGE.RESSOURCE_CANNOT_CONTAIN_SPECIAL_CHARACTER
        },
        custom: {
          options: async (value: string, { req }) => {
            const resource = await databaseService.resources.findOne({ resource_name: value })
            if (resource) {
              throw new Error(RESOURCE_MESSAGE.RESOURCE_IS_EXISTED)
            }
            req.resource = resource
            return true
          }
        }
      },
      description: {
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
        customSanitizer: {
          options: (value: string) => {
            return value
              .split(' ')
              .map((word) => word.toLowerCase().charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
          }
        },
        notEmpty: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_IS_REQUIRE
        },
        isString: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_MUST_BE_A_STRING
        },
        matches: {
          options: [/^[A-Za-z0-9_ ]+$/],
          errorMessage: RESOURCE_MESSAGE.RESSOURCE_CANNOT_CONTAIN_SPECIAL_CHARACTER
        },
        custom: {
          options: async (value: string, { req }) => {
            const currentResource = (req as Request).resource as Resource
            if (currentResource && currentResource.resource_name === value) {
              return true
            }
            const existingResource = await databaseService.resources.findOne({
              resource_name: value,
              _id: { $ne: currentResource._id }
            })
            if (existingResource) {
              throw new Error(RESOURCE_MESSAGE.RESOURCE_IS_EXISTED)
            }
            return true
          }
        }
      },
      description: {
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
