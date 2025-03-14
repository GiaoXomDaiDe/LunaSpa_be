import { checkSchema } from 'express-validator'
import { CONDITION_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const conditionsQueryValidator = validate(
  checkSchema({
    search: {
      optional: true,
      isString: {
        errorMessage: CONDITION_MESSAGES.SEARCH_MUST_BE_STRING
      },
      isLength: {
        options: {
          max: 100
        },
        errorMessage: CONDITION_MESSAGES.SEARCH_MUST_BE_LESS_THAN_100_CHARACTERS
      }
    }
  })
)
export const conditionIdValidator = validate(
  checkSchema(
    {
      condition_id: {
        trim: true,
        notEmpty: {
          errorMessage: CONDITION_MESSAGES.CONDITION_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: CONDITION_MESSAGES.CONDITION_ID_MUST_BE_A_VALID_MONGO_ID
        }
      }
    },
    ['params']
  )
)
export const updateConditionValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: CONDITION_MESSAGES.NAME_MUST_BE_STRING
        },
        isLength: {
          options: {
            max: 100
          },
          errorMessage: CONDITION_MESSAGES.NAME_MUST_BE_LESS_THAN_100_CHARACTERS
        },
        custom: {
          options: async (value: string, { req }) => {
            const condition = await databaseService.conditions.findOne({ name: value })
            if (condition) {
              throw new Error(CONDITION_MESSAGES.NAME_IS_EXIST)
            }
          }
        }
      },
      description: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: CONDITION_MESSAGES.DESCRIPTION_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            max: 255
          },
          errorMessage: CONDITION_MESSAGES.DESCRIPTION_CANNOT_LONGER_THAN_255
        }
      },
      instructions: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: CONDITION_MESSAGES.INSTRUCTIONS_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            max: 255
          },
          errorMessage: CONDITION_MESSAGES.INSTRUCTIONS_CANNOT_LONGER_THAN_255
        }
      }
    },
    ['body']
  )
)
export const conditionValidator = validate(
  checkSchema(
    {
      name: {
        trim: true,
        isString: {
          errorMessage: CONDITION_MESSAGES.NAME_MUST_BE_STRING
        },
        isLength: {
          options: {
            max: 100
          },
          errorMessage: CONDITION_MESSAGES.NAME_MUST_BE_LESS_THAN_100_CHARACTERS
        },
        custom: {
          options: async (value: string, { req }) => {
            const condition = await databaseService.conditions.findOne({ name: value })
            if (condition) {
              throw new Error(CONDITION_MESSAGES.NAME_IS_EXIST)
            }
          }
        }
      },
      description: {
        trim: true,
        isString: {
          errorMessage: CONDITION_MESSAGES.DESCRIPTION_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            max: 255
          },
          errorMessage: CONDITION_MESSAGES.DESCRIPTION_CANNOT_LONGER_THAN_255
        }
      },
      instructions: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: CONDITION_MESSAGES.INSTRUCTIONS_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            max: 255
          },
          errorMessage: CONDITION_MESSAGES.INSTRUCTIONS_CANNOT_LONGER_THAN_255
        }
      }
    },
    ['body']
  )
)
