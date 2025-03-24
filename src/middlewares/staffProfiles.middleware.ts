import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { STAFF_PROFILES_MESSAGES } from '~/constants/messages'
import { StaffType } from '~/models/schema/StaffProfile.schema'
import { validate } from '~/utils/validation'

export const staffProfileIdValidator = validate(
  checkSchema(
    {
      staff_profile_id: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_PROFILES_MESSAGES.STAFF_PROFILE_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: STAFF_PROFILES_MESSAGES.STAFF_PROFILE_ID_INVALID
        }
      }
    },
    ['params']
  )
)

export const accountIdValidator = validate(
  checkSchema(
    {
      account_id: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_PROFILES_MESSAGES.ACCOUNT_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: STAFF_PROFILES_MESSAGES.ACCOUNT_ID_INVALID
        }
      }
    },
    ['params']
  )
)

export const staffProfileValidator = validate(
  checkSchema(
    {
      account_id: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_PROFILES_MESSAGES.ACCOUNT_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: STAFF_PROFILES_MESSAGES.ACCOUNT_ID_INVALID
        }
      },
      staff_type: {
        notEmpty: {
          errorMessage: STAFF_PROFILES_MESSAGES.STAFF_TYPE_REQUIRED
        },
        isIn: {
          options: [Object.values(StaffType)],
          errorMessage: STAFF_PROFILES_MESSAGES.STAFF_TYPE_INVALID
        }
      },
      specialty_ids: {
        optional: true,
        isArray: {
          errorMessage: STAFF_PROFILES_MESSAGES.SPECIALTY_IDS_REQUIRED
        },
        custom: {
          options: (specialty_ids: string[]) => {
            return specialty_ids.every((specialty_id) => ObjectId.isValid(specialty_id))
          },
          errorMessage: STAFF_PROFILES_MESSAGES.SPECIALTY_IDS_INVALID
        }
      },
      rating: {
        optional: true,
        isNumeric: {
          errorMessage: STAFF_PROFILES_MESSAGES.RATING_INVALID
        },
        custom: {
          options: (rating: number) => {
            return rating >= 0 && rating <= 5
          },
          errorMessage: STAFF_PROFILES_MESSAGES.RATING_INVALID
        }
      },
      year_of_experience: {
        optional: true,
        isNumeric: {
          errorMessage: STAFF_PROFILES_MESSAGES.YEAR_OF_EXPERIENCE_INVALID
        },
        custom: {
          options: (year: number) => {
            return year >= 0
          },
          errorMessage: STAFF_PROFILES_MESSAGES.YEAR_OF_EXPERIENCE_INVALID
        }
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: STAFF_PROFILES_MESSAGES.BIO_INVALID
        }
      }
    },
    ['body']
  )
)

export const updateStaffProfileValidator = validate(
  checkSchema(
    {
      account_id: {
        optional: true,
        trim: true,
        notEmpty: {
          errorMessage: STAFF_PROFILES_MESSAGES.ACCOUNT_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: STAFF_PROFILES_MESSAGES.ACCOUNT_ID_INVALID
        }
      },
      staff_type: {
        optional: true,
        isIn: {
          options: [Object.values(StaffType)],
          errorMessage: STAFF_PROFILES_MESSAGES.STAFF_TYPE_INVALID
        }
      },
      specialty_ids: {
        optional: true,
        isArray: {
          errorMessage: STAFF_PROFILES_MESSAGES.SPECIALTY_IDS_REQUIRED
        },
        custom: {
          options: (specialty_ids: string[]) => {
            return specialty_ids.every((specialty_id) => ObjectId.isValid(specialty_id))
          },
          errorMessage: STAFF_PROFILES_MESSAGES.SPECIALTY_IDS_INVALID
        }
      },
      rating: {
        optional: true,
        isNumeric: {
          errorMessage: STAFF_PROFILES_MESSAGES.RATING_INVALID
        },
        custom: {
          options: (rating: number) => {
            return rating >= 0 && rating <= 5
          },
          errorMessage: STAFF_PROFILES_MESSAGES.RATING_INVALID
        }
      },
      year_of_experience: {
        optional: true,
        isNumeric: {
          errorMessage: STAFF_PROFILES_MESSAGES.YEAR_OF_EXPERIENCE_INVALID
        },
        custom: {
          options: (year: number) => {
            return year >= 0
          },
          errorMessage: STAFF_PROFILES_MESSAGES.YEAR_OF_EXPERIENCE_INVALID
        }
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: STAFF_PROFILES_MESSAGES.BIO_INVALID
        }
      }
    },
    ['body']
  )
)
