import { checkSchema } from 'express-validator'
import { REWARD_POINT_MESSAGES, VOUCHER_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const addPointsValidator = validate(
  checkSchema(
    {
      order_id: {
        notEmpty: {
          errorMessage: REWARD_POINT_MESSAGES.ORDER_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: REWARD_POINT_MESSAGES.ORDER_ID_INVALID
        }
      },
      points_change: {
        notEmpty: {
          errorMessage: REWARD_POINT_MESSAGES.POINTS_CHANGE_REQUIRED
        },
        isNumeric: {
          errorMessage: REWARD_POINT_MESSAGES.POINTS_CHANGE_MUST_BE_NUMBER
        }
      },
      reason: {
        notEmpty: {
          errorMessage: REWARD_POINT_MESSAGES.REASON_REQUIRED
        },
        isString: {
          errorMessage: REWARD_POINT_MESSAGES.REASON_MUST_BE_STRING
        }
      }
    },
    ['body']
  )
)

export const redeemPointsValidator = validate(
  checkSchema(
    {
      points_to_redeem: {
        notEmpty: {
          errorMessage: REWARD_POINT_MESSAGES.POINTS_CHANGE_REQUIRED
        },
        isNumeric: {
          errorMessage: REWARD_POINT_MESSAGES.POINTS_CHANGE_MUST_BE_NUMBER
        },
        custom: {
          options: (value) => {
            if (Number(value) <= 0) {
              throw new Error(VOUCHER_MESSAGES.POINTS_SPENT_INVALID)
            }
            return true
          }
        }
      },
      discount_percent: {
        notEmpty: {
          errorMessage: VOUCHER_MESSAGES.DISCOUNT_PERCENT_REQUIRED
        },
        isNumeric: {
          errorMessage: VOUCHER_MESSAGES.DISCOUNT_PERCENT_MUST_BE_NUMBER
        },
        custom: {
          options: (value) => {
            const discountPercent = Number(value)
            if (discountPercent < 1 || discountPercent > 100) {
              throw new Error(VOUCHER_MESSAGES.DISCOUNT_PERCENT_INVALID)
            }
            return true
          }
        }
      },
      expired_days: {
        notEmpty: {
          errorMessage: VOUCHER_MESSAGES.EXPIRED_AT_REQUIRED
        },
        isNumeric: {
          errorMessage: VOUCHER_MESSAGES.EXPIRED_AT_MUST_BE_NUMBER
        },
        custom: {
          options: (value) => {
            if (Number(value) <= 0) {
              throw new Error(VOUCHER_MESSAGES.EXPIRED_AT_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const applyVoucherValidator = validate(
  checkSchema(
    {
      voucher_code: {
        notEmpty: {
          errorMessage: VOUCHER_MESSAGES.VOUCHER_CODE_REQUIRED
        },
        isString: {
          errorMessage: VOUCHER_MESSAGES.VOUCHER_CODE_MUST_BE_STRING
        }
      },
      order_id: {
        notEmpty: {
          errorMessage: REWARD_POINT_MESSAGES.ORDER_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: REWARD_POINT_MESSAGES.ORDER_ID_INVALID
        }
      }
    },
    ['body']
  )
)
