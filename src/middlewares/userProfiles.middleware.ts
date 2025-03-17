import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { USER_PROFILES_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const userProfileIdValidator = validate(
  checkSchema(
    {
      user_profile_id: {
        trim: true,
        notEmpty: {
          errorMessage: USER_PROFILES_MESSAGES.USER_PROFILE_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: USER_PROFILES_MESSAGES.USER_PROFILE_ID_INVALID
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
          errorMessage: USER_PROFILES_MESSAGES.ACCOUNT_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: USER_PROFILES_MESSAGES.ACCOUNT_ID_INVALID
        }
      }
    },
    ['params']
  )
)

export const userProfileValidator = validate(
  checkSchema(
    {
      account_id: {
        trim: true,
        notEmpty: {
          errorMessage: USER_PROFILES_MESSAGES.ACCOUNT_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: USER_PROFILES_MESSAGES.ACCOUNT_ID_INVALID
        }
      },
      condition_ids: {
        isArray: {
          errorMessage: USER_PROFILES_MESSAGES.CONDITION_IDS_REQUIRED
        },
        custom: {
          options: (conditon_ids: string[]) => {
            return conditon_ids.every((conditon_ids) => ObjectId.isValid(conditon_ids))
          },
          errorMessage: USER_PROFILES_MESSAGES.CONDITION_IDS_INVALID
        }
      }
    },
    ['body']
  )
)
export const updateUserProfileValidator = validate(
  checkSchema(
    {
      account_id: {
        trim: true,
        optional: true,
        notEmpty: {
          errorMessage: USER_PROFILES_MESSAGES.ACCOUNT_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: USER_PROFILES_MESSAGES.ACCOUNT_ID_INVALID
        }
      },
      condition_ids: {
        optional: true,
        isArray: {
          errorMessage: USER_PROFILES_MESSAGES.CONDITION_IDS_REQUIRED
        },
        custom: {
          options: (conditon_ids: string[]) => {
            return conditon_ids.every((conditon_ids) => ObjectId.isValid(conditon_ids))
          },
          errorMessage: USER_PROFILES_MESSAGES.CONDITION_IDS_INVALID
        }
      }
    },
    ['body']
  )
)
