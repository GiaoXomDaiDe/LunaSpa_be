import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { CONDITION_SERVICES_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'
export const conditionServiceQueryValidator = validate(
  checkSchema(
    {
      condition_id: {
        optional: true,
        isMongoId: {
          errorMessage: CONDITION_SERVICES_MESSAGES.CONDITION_ID_MUST_BE_A_VALID_MONGO_ID
        }
      },
      service_id: {
        optional: true,
        isMongoId: {
          errorMessage: CONDITION_SERVICES_MESSAGES.SERVICE_ID_MUST_BE_A_VALID_MONGO_ID
        }
      },
      search: {
        optional: true,
        isString: {
          errorMessage: 'Từ khóa tìm kiếm phải là chuỗi'
        }
      }
    },
    ['query']
  )
)
export const createConditionServiceValidator = validate(
  checkSchema(
    {
      condition_id: {
        notEmpty: {
          errorMessage: CONDITION_SERVICES_MESSAGES.CONDITION_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: CONDITION_SERVICES_MESSAGES.CONDITION_ID_MUST_BE_A_STRING
        },
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(CONDITION_SERVICES_MESSAGES.CONDITION_ID_MUST_BE_A_VALID_MONGO_ID)
            }
            return true
          }
        }
      },
      service_id: {
        notEmpty: {
          errorMessage: CONDITION_SERVICES_MESSAGES.SERVICE_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: CONDITION_SERVICES_MESSAGES.SERVICE_ID_MUST_BE_A_STRING
        },
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(CONDITION_SERVICES_MESSAGES.SERVICE_ID_MUST_BE_A_VALID_MONGO_ID)
            }
            return true
          }
        }
      },
      note: {
        optional: true,
        isString: {
          errorMessage: CONDITION_SERVICES_MESSAGES.NOTE_MUST_BE_A_STRING
        }
      }
    },
    ['body']
  )
)

export const updateConditionServiceValidator = validate(
  checkSchema(
    {
      condition_id: {
        optional: true,
        isString: {
          errorMessage: CONDITION_SERVICES_MESSAGES.CONDITION_ID_MUST_BE_A_STRING
        },
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(CONDITION_SERVICES_MESSAGES.CONDITION_ID_MUST_BE_A_VALID_MONGO_ID)
            }
            return true
          }
        }
      },
      service_id: {
        optional: true,
        isString: {
          errorMessage: CONDITION_SERVICES_MESSAGES.SERVICE_ID_MUST_BE_A_STRING
        },
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(CONDITION_SERVICES_MESSAGES.SERVICE_ID_MUST_BE_A_VALID_MONGO_ID)
            }
            return true
          }
        }
      },
      note: {
        optional: true,
        isString: {
          errorMessage: CONDITION_SERVICES_MESSAGES.NOTE_MUST_BE_A_STRING
        }
      }
    },
    ['body']
  )
)
