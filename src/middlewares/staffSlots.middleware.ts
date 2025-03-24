import { checkSchema } from 'express-validator'
import { STAFF_SLOTS_MESSAGES } from '~/constants/messages'
import { StaffSlotStatus } from '~/models/schema/StaffSlot.schema'
import { validate } from '~/utils/validation'

export const staffSlotIdValidator = validate(
  checkSchema(
    {
      staff_slot_id: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.STAFF_SLOT_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: STAFF_SLOTS_MESSAGES.STAFF_SLOT_ID_INVALID
        }
      }
    },
    ['params']
  )
)

export const staffSlotQueryValidator = validate(
  checkSchema(
    {
      staff_profile_id: {
        optional: true,
        trim: true,
        isMongoId: {
          errorMessage: STAFF_SLOTS_MESSAGES.STAFF_PROFILE_ID_INVALID
        }
      },
      date: {
        optional: true,
        trim: true,
        isISO8601: {
          options: { strict: true },
          errorMessage: STAFF_SLOTS_MESSAGES.DATE_INVALID
        }
      },
      start_date: {
        optional: true,
        trim: true,
        isISO8601: {
          options: { strict: true },
          errorMessage: STAFF_SLOTS_MESSAGES.START_DATE_INVALID
        }
      },
      end_date: {
        optional: true,
        trim: true,
        isISO8601: {
          options: { strict: true },
          errorMessage: STAFF_SLOTS_MESSAGES.END_DATE_INVALID
        },
        custom: {
          options: (value, { req }) => {
            if (req.query?.start_date && new Date(value) <= new Date(req.query.start_date)) {
              throw new Error(STAFF_SLOTS_MESSAGES.END_DATE_MUST_BE_GREATER_THAN_START_DATE)
            }
            return true
          }
        }
      },
      status: {
        optional: true,
        trim: true,
        isIn: {
          options: [['available', 'booked', 'unavailable']],
          errorMessage: STAFF_SLOTS_MESSAGES.STATUS_INVALID
        }
      },
      page: {
        optional: true,
        isInt: {
          options: { min: 1 },
          errorMessage: STAFF_SLOTS_MESSAGES.PAGE_INVALID
        },
        toInt: true
      },
      limit: {
        optional: true,
        isInt: {
          options: { min: 1, max: 100 },
          errorMessage: STAFF_SLOTS_MESSAGES.LIMIT_INVALID
        },
        toInt: true
      }
    },
    ['query']
  )
)

export const staffProfileIdValidator = validate(
  checkSchema(
    {
      staff_profile_id: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.STAFF_PROFILE_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: STAFF_SLOTS_MESSAGES.STAFF_PROFILE_ID_INVALID
        }
      }
    },
    ['params', 'body']
  )
)

export const staffSlotValidator = validate(
  checkSchema(
    {
      staff_profile_id: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.STAFF_PROFILE_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: STAFF_SLOTS_MESSAGES.STAFF_PROFILE_ID_INVALID
        }
      },
      date: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.DATE_REQUIRED
        },
        isISO8601: {
          errorMessage: STAFF_SLOTS_MESSAGES.DATE_MUST_BE_ISO8601
        }
      },
      start_time: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.START_TIME_REQUIRED
        },
        isISO8601: {
          errorMessage: STAFF_SLOTS_MESSAGES.START_TIME_MUST_BE_ISO8601
        }
      },
      end_time: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.END_TIME_REQUIRED
        },
        isISO8601: {
          errorMessage: STAFF_SLOTS_MESSAGES.END_TIME_MUST_BE_ISO8601
        },
        custom: {
          options: (value, { req }) => {
            if (new Date(value) <= new Date(req.body.start_time)) {
              throw new Error(STAFF_SLOTS_MESSAGES.END_TIME_MUST_BE_GREATER_THAN_START_TIME)
            }
            return true
          }
        }
      },
      status: {
        optional: true,
        isIn: {
          options: [Object.values(StaffSlotStatus)],
          errorMessage: STAFF_SLOTS_MESSAGES.STATUS_INVALID
        }
      },
      order_id: {
        optional: true,
        isMongoId: {
          errorMessage: STAFF_SLOTS_MESSAGES.ORDER_ID_INVALID
        }
      }
    },
    ['body']
  )
)

export const updateStaffSlotValidator = validate(
  checkSchema(
    {
      date: {
        optional: true,
        trim: true,
        isISO8601: {
          errorMessage: STAFF_SLOTS_MESSAGES.DATE_MUST_BE_ISO8601
        }
      },
      start_time: {
        optional: true,
        trim: true,
        isISO8601: {
          errorMessage: STAFF_SLOTS_MESSAGES.START_TIME_MUST_BE_ISO8601
        }
      },
      end_time: {
        optional: true,
        trim: true,
        isISO8601: {
          errorMessage: STAFF_SLOTS_MESSAGES.END_TIME_MUST_BE_ISO8601
        },
        custom: {
          options: (value, { req }) => {
            if (req.body.start_time && new Date(value) <= new Date(req.body.start_time)) {
              throw new Error(STAFF_SLOTS_MESSAGES.END_TIME_MUST_BE_GREATER_THAN_START_TIME)
            }
            return true
          }
        }
      },
      status: {
        optional: true,
        isIn: {
          options: [Object.values(StaffSlotStatus)],
          errorMessage: STAFF_SLOTS_MESSAGES.STATUS_INVALID
        }
      },
      order_id: {
        optional: true,
        isMongoId: {
          errorMessage: STAFF_SLOTS_MESSAGES.ORDER_ID_INVALID
        }
      }
    },
    ['body']
  )
)

export const updateStaffSlotStatusValidator = validate(
  checkSchema(
    {
      status: {
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.STATUS_INVALID
        },
        isIn: {
          options: [Object.values(StaffSlotStatus)],
          errorMessage: STAFF_SLOTS_MESSAGES.STATUS_INVALID
        }
      },
      order_id: {
        optional: true,
        isMongoId: {
          errorMessage: STAFF_SLOTS_MESSAGES.ORDER_ID_INVALID
        }
      }
    },
    ['body']
  )
)

export const generateStaffSlotsValidator = validate(
  checkSchema(
    {
      staff_profile_id: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.STAFF_PROFILE_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: STAFF_SLOTS_MESSAGES.STAFF_PROFILE_ID_INVALID
        }
      },
      start_date: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.START_DATE_REQUIRED
        },
        isISO8601: {
          errorMessage: STAFF_SLOTS_MESSAGES.START_DATE_MUST_BE_ISO8601
        }
      },
      end_date: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.END_DATE_REQUIRED
        },
        isISO8601: {
          errorMessage: STAFF_SLOTS_MESSAGES.END_DATE_MUST_BE_ISO8601
        },
        custom: {
          options: (value, { req }) => {
            if (new Date(value) <= new Date(req.body.start_date)) {
              throw new Error(STAFF_SLOTS_MESSAGES.END_DATE_MUST_BE_GREATER_THAN_START_DATE)
            }
            return true
          }
        }
      },
      working_days: {
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.WORKING_DAYS_REQUIRED
        },
        isArray: {
          errorMessage: STAFF_SLOTS_MESSAGES.WORKING_DAYS_INVALID
        },
        custom: {
          options: (value) => {
            return value.every((day: number) => day >= 0 && day <= 6)
          },
          errorMessage: STAFF_SLOTS_MESSAGES.WORKING_DAYS_INVALID
        }
      },
      'working_hours.start_time': {
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.WORKING_HOURS_REQUIRED
        },
        matches: {
          options: /^([01]\d|2[0-3]):([0-5]\d)$/,
          errorMessage: STAFF_SLOTS_MESSAGES.WORKING_HOURS_INVALID
        }
      },
      'working_hours.end_time': {
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.WORKING_HOURS_REQUIRED
        },
        matches: {
          options: /^([01]\d|2[0-3]):([0-5]\d)$/,
          errorMessage: STAFF_SLOTS_MESSAGES.WORKING_HOURS_INVALID
        },
        custom: {
          options: (value, { req }) => {
            const startTime = req.body.working_hours.start_time
            if (!startTime) return true

            const [startHour, startMinute] = startTime.split(':').map(Number)
            const [endHour, endMinute] = value.split(':').map(Number)

            const startTotalMinutes = startHour * 60 + startMinute
            const endTotalMinutes = endHour * 60 + endMinute

            if (endTotalMinutes <= startTotalMinutes) {
              throw new Error(STAFF_SLOTS_MESSAGES.END_TIME_MUST_BE_GREATER_THAN_START_TIME)
            }
            return true
          }
        }
      },
      'working_hours.slot_duration': {
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.SLOT_DURATION_REQUIRED
        },
        isInt: {
          options: { min: 15 },
          errorMessage: STAFF_SLOTS_MESSAGES.SLOT_DURATION_INVALID
        }
      }
    },
    ['body']
  )
)

export const createMultipleStaffSlotsValidator = validate(
  checkSchema(
    {
      staff_profile_id: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.STAFF_PROFILE_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: STAFF_SLOTS_MESSAGES.STAFF_PROFILE_ID_INVALID
        }
      },
      slots: {
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.SLOTS_REQUIRED
        },
        isArray: {
          errorMessage: STAFF_SLOTS_MESSAGES.SLOTS_MUST_BE_ARRAY
        }
      },
      'slots.*.date': {
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.DATE_REQUIRED
        },
        isISO8601: {
          errorMessage: STAFF_SLOTS_MESSAGES.DATE_MUST_BE_ISO8601
        }
      },
      'slots.*.start_time': {
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.START_TIME_REQUIRED
        },
        isISO8601: {
          errorMessage: STAFF_SLOTS_MESSAGES.START_TIME_MUST_BE_ISO8601
        }
      },
      'slots.*.end_time': {
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.END_TIME_REQUIRED
        },
        isISO8601: {
          errorMessage: STAFF_SLOTS_MESSAGES.END_TIME_MUST_BE_ISO8601
        },
        custom: {
          options: (value, { req, path }) => {
            const index = Number(path.split('[')[1].split(']')[0])
            const slot = req.body.slots[index]
            if (new Date(value) <= new Date(slot.start_time)) {
              throw new Error(STAFF_SLOTS_MESSAGES.END_TIME_MUST_BE_GREATER_THAN_START_TIME)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const fileUploadValidator = validate(
  checkSchema(
    {
      file: {
        custom: {
          options: (value, { req }) => {
            if (!req.file) {
              throw new Error(STAFF_SLOTS_MESSAGES.FILE_REQUIRED)
            }

            const allowedMimes = [
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-excel'
            ]
            if (!allowedMimes.includes(req.file.mimetype)) {
              throw new Error(STAFF_SLOTS_MESSAGES.FILE_FORMAT_INVALID)
            }

            const maxSize = 5 * 1024 * 1024 // 5MB
            if (req.file.size > maxSize) {
              throw new Error(STAFF_SLOTS_MESSAGES.FILE_TOO_LARGE)
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)
export const staffSlotCalendarQueryValidator = validate(
  checkSchema(
    {
      staff_name: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: STAFF_SLOTS_MESSAGES.STAFF_NAME_INVALID
        }
      },
      account_id: {
        optional: true,
        trim: true,
        isMongoId: {
          errorMessage: STAFF_SLOTS_MESSAGES.ACCOUNT_ID_INVALID
        }
      },
      branch_id: {
        optional: true,
        trim: true,
        isMongoId: {
          errorMessage: STAFF_SLOTS_MESSAGES.BRANCH_ID_INVALID
        }
      },
      start_date: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.START_DATE_REQUIRED
        },
        isISO8601: {
          options: { strict: true },
          errorMessage: STAFF_SLOTS_MESSAGES.START_DATE_INVALID
        }
      },
      end_date: {
        trim: true,
        notEmpty: {
          errorMessage: STAFF_SLOTS_MESSAGES.END_DATE_REQUIRED
        },
        isISO8601: {
          options: { strict: true },
          errorMessage: STAFF_SLOTS_MESSAGES.END_DATE_INVALID
        },
        custom: {
          options: (value, { req }) => {
            if (req.query?.start_date && new Date(value) <= new Date(req.query.start_date)) {
              throw new Error(STAFF_SLOTS_MESSAGES.END_DATE_MUST_BE_GREATER_THAN_START_DATE)
            }
            return true
          }
        }
      },
      view_type: {
        optional: true,
        isIn: {
          options: [['day', 'week', 'month']],
          errorMessage: STAFF_SLOTS_MESSAGES.VIEW_TYPE_INVALID
        },
        default: { options: 'week' }
      }
    },
    ['query']
  )
)
