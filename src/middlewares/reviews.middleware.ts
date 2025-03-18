import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { ORDER, REVIEW_SORT_BY } from '~/constants/constants'
import { REVIEW_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const reviewsQueryValidator = validate(
  checkSchema(
    {
      sort: {
        optional: true,
        trim: true,
        customSanitizer: {
          options: (value: string) => {
            if (!value) {
              return (value = REVIEW_SORT_BY[1]) //rating
            }
            return value
          }
        },
        isString: {
          errorMessage: REVIEW_MESSAGES.SORT_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!REVIEW_SORT_BY.includes(value)) {
              throw new Error(REVIEW_MESSAGES.SORT_MUST_INCLUDE_IN_LIST)
            }
            return true
          }
        }
      },
      order: {
        optional: true,
        trim: true,
        customSanitizer: {
          options: (value: string) => {
            if (!value) {
              return (value = ORDER[0]) //asc
            }
            return value
          }
        },
        isString: {
          errorMessage: REVIEW_MESSAGES.ORDER_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!ORDER.includes(value)) {
              throw new Error(REVIEW_MESSAGES.ORDER_MUST_BE_IN_ARRAY)
            }
            return true
          }
        }
      },
      max_rating: {
        optional: true,
        isDecimal: {
          errorMessage: REVIEW_MESSAGES.MAX_RATING_MUST_BE_A_NUMBER
        },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(REVIEW_MESSAGES.MAX_RATING_CANNOT_BE_NEGATIVE)
            }
            return true
          }
        }
      },
      min_rating: {
        optional: true,
        isDecimal: {
          errorMessage: REVIEW_MESSAGES.MIN_RATING_MUST_BE_A_NUMBER
        },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(REVIEW_MESSAGES.MIN_RATING_CANNOT_BE_NEGATIVE)
            }
            return true
          }
        }
      },
      _custom: {
        custom: {
          options: (value, { req }) => {
            const { max_rating, min_rating } = (req as Request).query
            if (max_rating && min_rating && max_rating <= min_rating) {
              throw new Error(REVIEW_MESSAGES.MAX_RATING_MUST_BE_GREATER_THAN_MIN_RATING)
            }
            return true
          }
        }
      },
      item_type: {
        optional: true,
        isIn: {
          options: [['service', 'product']],
          errorMessage: REVIEW_MESSAGES.ITEM_TYPE_MUST_BE_SERVICE_OR_PRODUCT
        }
      },
      item_id: {
        optional: true,
        isMongoId: {
          errorMessage: REVIEW_MESSAGES.ITEM_ID_MUST_BE_A_VALID_MONGO_ID
        },
        notEmpty: {
          errorMessage: REVIEW_MESSAGES.ITEM_ID_IS_REQUIRED
        }
      },
      user_profile_id: {
        optional: true,
        isMongoId: {
          errorMessage: REVIEW_MESSAGES.USER_PROFILE_ID_MUST_BE_A_VALID_MONGO_ID
        }
      }
    },
    ['query']
  )
)

export const reviewIdValidator = validate(
  checkSchema(
    {
      review_id: {
        trim: true,
        notEmpty: { errorMessage: REVIEW_MESSAGES.REVIEW_ID_IS_REQUIRED },
        isMongoId: { errorMessage: REVIEW_MESSAGES.REVIEW_ID_MUST_BE_A_VALID_MONGO_ID },
        custom: {
          options: async (value: string, { req }) => {
            const review = await databaseService.reviews.findOne({ _id: new ObjectId(value) })
            if (!review) {
              throw new Error(REVIEW_MESSAGES.REVIEW_NOT_FOUND)
            }
            req.item_type = review.item_type
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const reviewsValidator = validate(
  checkSchema(
    {
      user_profile_id: {
        trim: true,
        notEmpty: { errorMessage: REVIEW_MESSAGES.USER_PROFILE_ID_IS_REQUIRED },
        isMongoId: { errorMessage: REVIEW_MESSAGES.USER_PROFILE_ID_MUST_BE_A_VALID_MONGO_ID }
      },
      item_type: {
        trim: true,
        notEmpty: { errorMessage: REVIEW_MESSAGES.ITEM_TYPE_IS_REQUIRED },
        isIn: { options: [['service', 'product']], errorMessage: REVIEW_MESSAGES.ITEM_TYPE_MUST_BE_SERVICE_OR_PRODUCT }
      },
      item_id: {
        trim: true,
        notEmpty: { errorMessage: REVIEW_MESSAGES.ITEM_ID_IS_REQUIRED },
        isMongoId: { errorMessage: REVIEW_MESSAGES.ITEM_ID_MUST_BE_A_VALID_MONGO_ID }
      },
      rating: {
        optional: true,
        isDecimal: { errorMessage: REVIEW_MESSAGES.RATING_MUST_BE_A_NUMBER },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(REVIEW_MESSAGES.RATING_CANNOT_BE_NEGATIVE)
            }
            return true
          }
        }
      },
      comment: {
        optional: true,
        isString: { errorMessage: REVIEW_MESSAGES.COMMENT_MUST_BE_A_STRING },
        isLength: {
          options: {
            min: 1,
            max: 1000
          },
          errorMessage: REVIEW_MESSAGES.COMMENT_MUST_BE_BETWEEN_1_AND_1000_CHARACTERS
        }
      }
    },
    ['body']
  )
)

export const itemReviewsValidator = validate(
  checkSchema(
    {
      itemType: {
        trim: true,
        notEmpty: { errorMessage: REVIEW_MESSAGES.ITEM_TYPE_IS_REQUIRED },
        isIn: { options: [['service', 'product']], errorMessage: REVIEW_MESSAGES.ITEM_TYPE_MUST_BE_SERVICE_OR_PRODUCT },
        customSanitizer: {
          options: (value: string) => {
            return value.toLowerCase()
          }
        }
      },
      itemId: {
        trim: true,
        notEmpty: { errorMessage: REVIEW_MESSAGES.ITEM_ID_IS_REQUIRED },
        isMongoId: { errorMessage: REVIEW_MESSAGES.ITEM_ID_MUST_BE_A_VALID_MONGO_ID }
      }
    },
    ['params']
  )
)
