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
      items: {
        isArray: {
          options: { min: 1 },
          errorMessage: ORDER_MESSAGES.ORDER_ITEMS_REQUIRED
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
          errorMessage: 'service_item phải là một đối tượng'
        },
        custom: {
          options: (value) => {
            if (!value) return false

            return (
              value.item_id &&
              /^[0-9a-fA-F]{24}$/.test(value.item_id) &&
              value.quantity &&
              Number.isInteger(value.quantity) &&
              value.quantity > 0 &&
              value.item_type === ItemType.SERVICE
            )
          },
          errorMessage: 'service_item không hợp lệ'
        }
      },
      booking_time: {
        trim: true,
        notEmpty: {
          errorMessage: ORDER_MESSAGES.BOOKING_TIME_REQUIRED
        },
        custom: {
          options: (value) => {
            // Chấp nhận cả định dạng ISO8601 và YYYY-MM-DD HH:MM
            const isISO8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z?$/.test(value)
            const isCustomFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value)

            // Kiểm tra ngày phải là trong tương lai
            const bookingDate = new Date(value)
            const currentDate = new Date()

            if (!isISO8601 && !isCustomFormat) {
              return false
            }

            if (bookingDate <= currentDate) {
              throw new Error('Thời gian đặt lịch phải là thời gian trong tương lai')
            }

            return true
          },
          errorMessage: ORDER_MESSAGES.BOOKING_TIME_INVALID
        }
      },
      slot_id: {
        notEmpty: {
          errorMessage: 'Vui lòng chọn một slot'
        },
        isMongoId: {
          errorMessage: 'Slot ID không hợp lệ'
        }
      },
      duration_index: {
        notEmpty: {
          errorMessage: 'Vui lòng chọn thời lượng dịch vụ'
        },
        isInt: {
          options: { min: 0 },
          errorMessage: 'Thời lượng dịch vụ không hợp lệ'
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
          errorMessage: 'Lý do hủy đơn hàng không được để trống'
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
          errorMessage: 'Đánh giá phải là số nguyên từ 1 đến 5'
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
          errorMessage: 'Phải có ít nhất một ID'
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
