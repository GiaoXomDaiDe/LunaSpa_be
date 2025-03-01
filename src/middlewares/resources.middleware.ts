import { checkSchema } from 'express-validator'
import { RESOURCE_MESSAGE } from '~/constants/messages'
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
