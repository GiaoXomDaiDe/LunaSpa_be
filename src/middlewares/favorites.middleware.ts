import { checkSchema } from 'express-validator'
import { FAVORITES_MESSAGES, USER_PROFILES_MESSAGES } from '~/constants/messages'
import { ItemType } from '~/models/schema/Favorite.schema'
import { validate } from '~/utils/validation'

export const ItemValidator = validate(
  checkSchema({
    user_profile_id: {
      trim: true,
      notEmpty: {
        errorMessage: USER_PROFILES_MESSAGES.USER_PROFILE_ID_REQUIRED
      },
      isMongoId: {
        errorMessage: USER_PROFILES_MESSAGES.USER_PROFILE_ID_INVALID
      }
    },
    item_id: {
      trim: true,
      notEmpty: {
        errorMessage: FAVORITES_MESSAGES.ITEM_ID_REQUIRED
      },
      isMongoId: {
        errorMessage: FAVORITES_MESSAGES.ITEM_ID_INVALID
      }
    },
    item_type: {
      trim: true,
      notEmpty: {
        errorMessage: FAVORITES_MESSAGES.ITEM_TYPE_REQUIRED
      },
      isIn: {
        options: [Object.values(ItemType)],
        errorMessage: FAVORITES_MESSAGES.ITEM_TYPE_INVALID
      }
    }
  })
)

export const DeleteItemValidator = validate(
  checkSchema({
    user_profile_id: {
      trim: true,
      notEmpty: {
        errorMessage: USER_PROFILES_MESSAGES.USER_PROFILE_ID_REQUIRED
      },
      isMongoId: {
        errorMessage: USER_PROFILES_MESSAGES.USER_PROFILE_ID_INVALID
      }
    },
    item_id: {
      trim: true,
      notEmpty: {
        errorMessage: FAVORITES_MESSAGES.ITEM_ID_REQUIRED
      },
      isMongoId: {
        errorMessage: FAVORITES_MESSAGES.ITEM_ID_INVALID
      }
    }
  })
)
