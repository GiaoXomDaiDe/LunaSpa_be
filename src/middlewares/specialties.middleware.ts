import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { SPECIALTY_MESSAGES } from '~/constants/specialty-messages'
import { STAFF_PROFILES_MESSAGES } from '~/constants/staff-profiles-messages'

import { validate } from '~/utils/validation'

export const specialtyValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: SPECIALTY_MESSAGES.NAME_REQUIRED
        },
        isString: {
          errorMessage: SPECIALTY_MESSAGES.NAME_MUST_BE_STRING
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: SPECIALTY_MESSAGES.NAME_LENGTH
        },
        trim: true
      },
      description: {
        notEmpty: {
          errorMessage: SPECIALTY_MESSAGES.DESCRIPTION_REQUIRED
        },
        isString: {
          errorMessage: SPECIALTY_MESSAGES.DESCRIPTION_MUST_BE_STRING
        },
        trim: true
      },
      device_ids: {
        optional: true,
        isArray: {
          errorMessage: SPECIALTY_MESSAGES.DEVICE_IDS_MUST_BE_ARRAY
        },
        custom: {
          options: (value) => {
            if (value && value.length > 0) {
              const isAllMongoId = value.every((id: string) => ObjectId.isValid(id))
              if (!isAllMongoId) {
                throw new Error(SPECIALTY_MESSAGES.DEVICE_ID_MUST_BE_MONGO_ID)
              }
            }
            return true
          }
        }
      },
      service_ids: {
        optional: true,
        isArray: {
          errorMessage: SPECIALTY_MESSAGES.SERVICE_IDS_MUST_BE_ARRAY
        },
        custom: {
          options: (value) => {
            if (value && value.length > 0) {
              const isAllMongoId = value.every((id: string) => ObjectId.isValid(id))
              if (!isAllMongoId) {
                throw new Error(SPECIALTY_MESSAGES.SERVICE_ID_MUST_BE_MONGO_ID)
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const updateSpecialtyValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        isString: {
          errorMessage: SPECIALTY_MESSAGES.NAME_MUST_BE_STRING
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: SPECIALTY_MESSAGES.NAME_LENGTH
        },
        trim: true
      },
      description: {
        optional: true,
        isString: {
          errorMessage: SPECIALTY_MESSAGES.DESCRIPTION_MUST_BE_STRING
        },
        trim: true
      },
      device_ids: {
        optional: true,
        isArray: {
          errorMessage: SPECIALTY_MESSAGES.DEVICE_IDS_MUST_BE_ARRAY
        },
        custom: {
          options: (value) => {
            if (value && value.length > 0) {
              const isAllMongoId = value.every((id: string) => ObjectId.isValid(id))
              if (!isAllMongoId) {
                throw new Error(SPECIALTY_MESSAGES.DEVICE_ID_MUST_BE_MONGO_ID)
              }
            }
            return true
          }
        }
      },
      service_ids: {
        optional: true,
        isArray: {
          errorMessage: SPECIALTY_MESSAGES.SERVICE_IDS_MUST_BE_ARRAY
        },
        custom: {
          options: (value) => {
            if (value && value.length > 0) {
              const isAllMongoId = value.every((id: string) => ObjectId.isValid(id))
              if (!isAllMongoId) {
                throw new Error(SPECIALTY_MESSAGES.SERVICE_ID_MUST_BE_MONGO_ID)
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const specialtyIdValidator = validate(
  checkSchema(
    {
      specialty_id: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_PROFILES_MESSAGES.SPECIALTY_IDS_REQUIRED
        },
        isMongoId: {
          errorMessage: STAFF_PROFILES_MESSAGES.SPECIALTY_IDS_INVALID
        }
      }
    },
    ['params']
  )
)

export const paginationValidator = validate(
  checkSchema(
    {
      page: {
        optional: true,
        isNumeric: {
          errorMessage: 'Trang phải là số'
        },
        custom: {
          options: (value) => {
            if (Number(value) < 1) {
              throw new Error('Trang phải lớn hơn 0')
            }
            return true
          }
        }
      },
      limit: {
        optional: true,
        isNumeric: {
          errorMessage: 'Số lượng mỗi trang phải là số'
        },
        custom: {
          options: (value) => {
            if (Number(value) < 1) {
              throw new Error('Số lượng mỗi trang phải lớn hơn 0')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
