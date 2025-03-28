import { checkSchema } from 'express-validator'
import { ORDER_MESSAGES, PAYMENT_MESSAGES } from '~/constants/messages'
import { OrderStatus, PaymentMethod } from '~/models/schema/Order.schema'
import { ItemType } from '~/models/schema/OrderDetail.schema'
import { validate } from '~/utils/validation'

export const orderIdValidator = validate(
  checkSchema(
    {
      order_id: {
        trim: true,
        notEmpty: {
          errorMessage: ORDER_MESSAGES.ORDER_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: ORDER_MESSAGES.ORDER_ID_INVALID
        }
      }
    },
    ['params']
  )
)

export const OrdersQueryValidator = validate(
  checkSchema(
    {
      limit: {
        optional: true,
        isInt: {
          options: { min: 1, max: 100 },
          errorMessage: ORDER_MESSAGES.LIMIT_INVALID
        }
      },
      page: {
        optional: true,
        isInt: {
          options: { min: 1 },
          errorMessage: ORDER_MESSAGES.PAGE_INVALID
        }
      },
      customer_id: {
        optional: true,
        isMongoId: {
          errorMessage: ORDER_MESSAGES.CUSTOMER_ID_INVALID
        }
      },
      branch_id: {
        optional: true,
        isMongoId: {
          errorMessage: ORDER_MESSAGES.BRANCH_ID_INVALID
        }
      },
      status: {
        optional: true,
        isIn: {
          options: [Object.values(OrderStatus)],
          errorMessage: ORDER_MESSAGES.STATUS_INVALID
        }
      },
      start_date: {
        optional: true,
        isDate: true,
        errorMessage: ORDER_MESSAGES.START_DATE_INVALID
      },
      end_date: {
        optional: true,
        isDate: true,
        errorMessage: ORDER_MESSAGES.END_DATE_INVALID
      },
      order_id: {
        optional: true,
        isMongoId: {
          errorMessage: ORDER_MESSAGES.ORDER_ID_INVALID
        }
      }
    },
    ['query']
  )
)

export const purchaseProductValidator = validate(
  checkSchema(
    {
      branch_id: {
        trim: true,
        notEmpty: {
          errorMessage: ORDER_MESSAGES.BRANCH_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: ORDER_MESSAGES.BRANCH_ID_INVALID
        }
      },
      product_items: {
        isArray: {
          options: { min: 1 },
          errorMessage: ORDER_MESSAGES.ORDER_ITEMS_REQUIRED
        },
        custom: {
          options: (value) => {
            console.log(value)
            return true
          }
        }
      },
      payment_method: {
        optional: true,
        isIn: {
          options: [Object.values(PaymentMethod)],
          errorMessage: ORDER_MESSAGES.PAYMENT_METHOD_INVALID
        }
      },
      note: {
        optional: true,
        isString: true
      },
      voucher_code: {
        optional: true,
        isString: true
      }
    },
    ['body']
  )
)

export const bookServiceValidator = validate(
  checkSchema(
    {
      branch_id: {
        trim: true,
        notEmpty: {
          errorMessage: ORDER_MESSAGES.BRANCH_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: ORDER_MESSAGES.BRANCH_ID_INVALID
        }
      },
      service_item: {
        notEmpty: {
          errorMessage: ORDER_MESSAGES.ORDER_ITEMS_REQUIRED
        },
        isObject: {
          errorMessage: 'service_item must be an object'
        },
        custom: {
          options: (value) => {
            if (!value) return false

            // Check required fields
            const hasRequiredFields =
              value.item_id &&
              /^[0-9a-fA-F]{24}$/.test(value.item_id) &&
              value.item_type === ItemType.SERVICE &&
              value.booking_time &&
              typeof value.duration_index === 'number' &&
              value.duration_index >= 0

            if (!hasRequiredFields) return false

            // Check slot_id if provided
            if (value.slot_id && !/^[0-9a-fA-F]{24}$/.test(value.slot_id)) {
              return false
            }

            return true
          },
          errorMessage: 'Invalid service_item, must have item_id, item_type, booking_time and duration_index'
        }
      },
      'service_item.slot_id': {
        optional: false,
        notEmpty: {
          errorMessage: 'Please select a slot'
        },
        isMongoId: {
          errorMessage: 'Invalid Slot ID'
        }
      },
      payment_method: {
        optional: true,
        isIn: {
          options: [Object.values(PaymentMethod)],
          errorMessage: ORDER_MESSAGES.PAYMENT_METHOD_INVALID
        }
      },
      note: {
        optional: true,
        isString: true
      },
      voucher_code: {
        optional: true,
        isString: true
      }
    },
    ['body']
  )
)

export const paymentValidator = validate(
  checkSchema(
    {
      payment_method: {
        notEmpty: {
          errorMessage: PAYMENT_MESSAGES.PAYMENT_METHOD_REQUIRED
        },
        isIn: {
          options: [Object.values(PaymentMethod)],
          errorMessage: ORDER_MESSAGES.PAYMENT_METHOD_INVALID
        }
      },
      payment_data: {
        optional: true,
        isObject: true
      }
    },
    ['body']
  )
)

export const cancelOrderValidator = validate(
  checkSchema(
    {
      cancel_reason: {
        trim: true,
        notEmpty: {
          errorMessage: 'Cancel reason cannot be empty'
        }
      }
    },
    ['body']
  )
)

export const ratingValidator = validate(
  checkSchema(
    {
      rating: {
        isInt: {
          options: { min: 1, max: 5 },
          errorMessage: 'Rating must be an integer between 1 and 5'
        }
      },
      comment: {
        optional: true,
        isString: true
      },
      item_type: {
        isIn: {
          options: [Object.values(ItemType)],
          errorMessage: ORDER_MESSAGES.ITEM_TYPE_INVALID
        }
      },
      item_ids: {
        isArray: {
          options: { min: 1 },
          errorMessage: 'Must have at least one ID'
        },
        custom: {
          options: (value) => {
            if (!Array.isArray(value) || value.length === 0) {
              return false
            }
            return value.every((id) => /^[0-9a-fA-F]{24}$/.test(id))
          },
          errorMessage: ORDER_MESSAGES.ITEM_ID_INVALID
        }
      }
    },
    ['body']
  )
)
