import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { BRANCH_SORT_BY, ORDER } from '~/constants/constants'
import HTTP_STATUS from '~/constants/httpStatus'
import { BRANCHES_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { BranchParams } from '~/models/request/Branches.requests'
import { BranchStatus } from '~/models/schema/Branch.schema'
import databaseService from '~/services/database.services'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

export const branchesQueryValidator = validate(
  checkSchema(
    {
      sort: {
        optional: true,
        trim: true,
        customSanitizer: {
          options: (value: string) => {
            if (!value) {
              return (value = BRANCH_SORT_BY[1]) //rating
            }
            return value
          }
        },
        isString: {
          errorMessage: BRANCHES_MESSAGES.SORT_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!BRANCH_SORT_BY.includes(value)) {
              throw new Error(BRANCHES_MESSAGES.SORT_MUST_INCLUDE_IN_LIST)
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
          errorMessage: BRANCHES_MESSAGES.ORDER_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            if (!ORDER.includes(value)) {
              throw new Error(BRANCHES_MESSAGES.ORDER_MUST_BE_IN_ARRAY)
            }
            return true
          }
        }
      },
      search: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: BRANCHES_MESSAGES.SEARCH_MUST_BE_A_STRING
        }
      },
      max_rating: {
        optional: true,
        isDecimal: {
          errorMessage: BRANCHES_MESSAGES.MAX_RATING_MUST_BE_A_NUMBER
        },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(BRANCHES_MESSAGES.MAX_RATING_CANNOT_BE_NEGATIVE)
            }
            return true
          }
        }
      },
      min_rating: {
        optional: true,
        isDecimal: {
          errorMessage: BRANCHES_MESSAGES.MIN_RATING_MUST_BE_A_NUMBER
        },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(BRANCHES_MESSAGES.MIN_RATING_CANNOT_BE_NEGATIVE)
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
              throw new Error(BRANCHES_MESSAGES.MAX_RATING_MUST_BE_GREATER_THAN_MIN_RATING)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

export const branchIdValidator = validate(
  checkSchema(
    {
      branch_id: {
        trim: true,
        notEmpty: {
          errorMessage: BRANCHES_MESSAGES.BRANCH_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: BRANCHES_MESSAGES.BRANCH_ID_MUST_BE_A_VALID_MONGO_ID
        }
      }
    },
    ['params']
  )
)

export const checkBranchNotInactive = wrapRequestHandler(
  async (req: Request<BranchParams, any, any>, res: Response, next: NextFunction) => {
    const { branch_id } = req.params
    const branch = await databaseService.branches.findOne({ _id: new ObjectId(branch_id) })
    if (!branch) {
      throw new ErrorWithStatus({
        message: BRANCHES_MESSAGES.BRANCH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (branch.status === BranchStatus.INACTIVE) {
      throw new ErrorWithStatus({
        message: BRANCHES_MESSAGES.BRANCH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    req.branch = branch
    next()
  }
)
export const branchValidator = validate(
  checkSchema(
    {
      name: {
        trim: true,
        notEmpty: {
          errorMessage: BRANCHES_MESSAGES.BRANCH_NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: BRANCHES_MESSAGES.BRANCH_NAME_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: BRANCHES_MESSAGES.BRANCH_NAME_MUST_BE_BETWEEN_1_AND_100_CHARACTERS
        }
      },
      description: {
        optional: true,
        trim: true,
        notEmpty: {
          errorMessage: BRANCHES_MESSAGES.DESCRIPTION_IS_REQUIRED
        },
        isString: {
          errorMessage: BRANCHES_MESSAGES.DESCRIPTION_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 1000
          },
          errorMessage: BRANCHES_MESSAGES.DESCRIPTION_MUST_BE_BETWEEN_1_AND_1000_CHARACTERS
        }
      },
      rating: {
        optional: true,
        notEmpty: {
          errorMessage: BRANCHES_MESSAGES.RATING_IS_REQUIRED
        },
        isDecimal: {
          errorMessage: BRANCHES_MESSAGES.RATING_MUST_BE_A_NUMBER
        },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(BRANCHES_MESSAGES.RATING_CANNOT_BE_NEGATIVE)
            }
            return true
          }
        }
      },
      images: {
        optional: true,
        isArray: {
          errorMessage: BRANCHES_MESSAGES.IMAGES_MUST_BE_AN_ARRAY
        },
        custom: {
          options: async (value: string[]) => {
            const images = value.find((item) => typeof item !== 'string')
            if (images) {
              throw new Error(BRANCHES_MESSAGES.IMAGE_MUST_BE_A_STRING)
            }
            return true
          }
        }
      },
      status: {
        optional: true,
        notEmpty: {
          errorMessage: BRANCHES_MESSAGES.STATUS_IS_REQUIRED
        },
        isIn: {
          options: [Object.values(BranchStatus)],
          errorMessage: BRANCHES_MESSAGES.STATUS_MUST_BE_A_VALID_STATUS
        }
      },
      opening_hours: {
        optional: true,
        isArray: {
          errorMessage: BRANCHES_MESSAGES.OPENING_HOURS_MUST_BE_AN_ARRAY
        }
      },
      'opening_hours.day': {
        optional: true,
        isIn: {
          options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          errorMessage: BRANCHES_MESSAGES.OPENING_HOURS_DAY_MUST_BE_A_VALID_DAY
        }
      },
      'opening_hours.open': {
        optional: true,
        isString: {
          errorMessage: BRANCHES_MESSAGES.OPENING_HOURS_OPEN_MUST_BE_A_STRING
        }
      },
      'opening_hours.close': {
        optional: true,
        isString: {
          errorMessage: BRANCHES_MESSAGES.OPENING_HOURS_CLOSE_MUST_BE_A_STRING
        }
      },
      contact: {
        optional: true,
        isObject: {
          errorMessage: BRANCHES_MESSAGES.CONTACT_MUST_BE_AN_OBJECT
        }
      },
      'contact.phone': {
        optional: true,
        isString: {
          errorMessage: BRANCHES_MESSAGES.CONTACT_PHONE_MUST_BE_A_STRING
        }
      },
      'contact.email': {
        optional: true,
        isEmail: {
          errorMessage: BRANCHES_MESSAGES.CONTACT_EMAIL_MUST_BE_A_VALID_EMAIL
        }
      },
      'contact.address': {
        optional: true,
        isString: {
          errorMessage: BRANCHES_MESSAGES.CONTACT_ADDRESS_MUST_BE_A_STRING
        }
      }
    },
    ['body']
  )
)
export const updateBranchValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        trim: true,
        notEmpty: {
          errorMessage: BRANCHES_MESSAGES.BRANCH_NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: BRANCHES_MESSAGES.BRANCH_NAME_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: BRANCHES_MESSAGES.BRANCH_NAME_MUST_BE_BETWEEN_1_AND_100_CHARACTERS
        }
      },
      description: {
        optional: true,
        trim: true,
        notEmpty: {
          errorMessage: BRANCHES_MESSAGES.DESCRIPTION_IS_REQUIRED
        },
        isString: {
          errorMessage: BRANCHES_MESSAGES.DESCRIPTION_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 1000
          },
          errorMessage: BRANCHES_MESSAGES.DESCRIPTION_MUST_BE_BETWEEN_1_AND_1000_CHARACTERS
        }
      },
      rating: {
        optional: true,
        notEmpty: {
          errorMessage: BRANCHES_MESSAGES.RATING_IS_REQUIRED
        },
        isDecimal: {
          errorMessage: BRANCHES_MESSAGES.RATING_MUST_BE_A_NUMBER
        },
        custom: {
          options: async (value: number) => {
            if (value < 0) {
              throw new Error(BRANCHES_MESSAGES.RATING_CANNOT_BE_NEGATIVE)
            }
            return true
          }
        }
      },
      images: {
        optional: true,
        isArray: {
          errorMessage: BRANCHES_MESSAGES.IMAGES_MUST_BE_AN_ARRAY
        },
        custom: {
          options: async (value: string[]) => {
            const images = value.find((item) => typeof item !== 'string')
            if (images) {
              throw new Error(BRANCHES_MESSAGES.IMAGE_MUST_BE_A_STRING)
            }
            return true
          }
        }
      },
      status: {
        optional: true,
        notEmpty: {
          errorMessage: BRANCHES_MESSAGES.STATUS_IS_REQUIRED
        },
        isIn: {
          options: [Object.values(BranchStatus)],
          errorMessage: BRANCHES_MESSAGES.STATUS_MUST_BE_A_VALID_STATUS
        }
      },
      opening_hours: {
        optional: true,
        isArray: {
          errorMessage: BRANCHES_MESSAGES.OPENING_HOURS_MUST_BE_AN_ARRAY
        }
      },
      'opening_hours.day': {
        optional: true,
        isIn: {
          options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          errorMessage: BRANCHES_MESSAGES.OPENING_HOURS_DAY_MUST_BE_A_VALID_DAY
        }
      },
      'opening_hours.open': {
        optional: true,
        isString: {
          errorMessage: BRANCHES_MESSAGES.OPENING_HOURS_OPEN_MUST_BE_A_STRING
        }
      },
      'opening_hours.close': {
        optional: true,
        isString: {
          errorMessage: BRANCHES_MESSAGES.OPENING_HOURS_CLOSE_MUST_BE_A_STRING
        }
      },
      contact: {
        optional: true,
        isObject: {
          errorMessage: BRANCHES_MESSAGES.CONTACT_MUST_BE_AN_OBJECT
        }
      },
      'contact.phone': {
        optional: true,
        isString: {
          errorMessage: BRANCHES_MESSAGES.CONTACT_PHONE_MUST_BE_A_STRING
        }
      },
      'contact.email': {
        optional: true,
        isEmail: {
          errorMessage: BRANCHES_MESSAGES.CONTACT_EMAIL_MUST_BE_A_VALID_EMAIL
        }
      },
      'contact.address': {
        optional: true,
        isString: {
          errorMessage: BRANCHES_MESSAGES.CONTACT_ADDRESS_MUST_BE_A_STRING
        }
      }
    },
    ['body']
  )
)
