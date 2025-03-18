import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { BRANCH_SERVICES_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { BranchServicesParams } from '~/models/request/BranchServices.request'
import { BranchServicesStatus } from '~/models/schema/BranchServices.schema'
import databaseService from '~/services/database.services'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

export const branchServiceQueryValidator = validate(
  checkSchema(
    {
      branch_id: {
        optional: true,
        trim: true,
        isMongoId: {
          errorMessage: BRANCH_SERVICES_MESSAGES.BRANCH_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value: string) => {
            const branch = await databaseService.branches.findOne({ _id: new ObjectId(value) })
            if (!branch) {
              throw new Error(BRANCH_SERVICES_MESSAGES.BRANCH_NOT_FOUND)
            }
            return true
          }
        }
      },
      service_id: {
        optional: true,
        trim: true,
        isMongoId: {
          errorMessage: BRANCH_SERVICES_MESSAGES.SERVICE_ID_MUST_BE_A_VALID_MONGO_ID
        },
        custom: {
          options: async (value: string) => {
            const service = await databaseService.services.findOne({ _id: new ObjectId(value) })
            if (!service) {
              throw new Error(BRANCH_SERVICES_MESSAGES.SERVICE_NOT_FOUND)
            }
            return true
          }
        }
      },
      status: {
        optional: true,
        trim: true,
        isIn: {
          options: [['0', '1', '2']],
          errorMessage: BRANCH_SERVICES_MESSAGES.STATUS_MUST_BE_A_VALID_STATUS
        }
      },
      limit: {
        optional: true,
        isInt: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: 'Limit phải là số nguyên từ 1 đến 100'
        }
      },
      page: {
        optional: true,
        isInt: {
          options: {
            min: 1
          },
          errorMessage: 'Page phải là số nguyên lớn hơn hoặc bằng 1'
        }
      }
    },
    ['query']
  )
)

export const branchServiceIdValidator = validate(
  checkSchema(
    {
      branch_service_id: {
        trim: true,
        notEmpty: {
          errorMessage: BRANCH_SERVICES_MESSAGES.BRANCH_SERVICE_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: BRANCH_SERVICES_MESSAGES.BRANCH_SERVICE_ID_MUST_BE_A_VALID_MONGO_ID
        }
      }
    },
    ['params']
  )
)

export const checkBranchServiceExists = wrapRequestHandler(
  async (req: Request<BranchServicesParams, any, any>, res: Response, next: NextFunction) => {
    const { branch_service_id } = req.params
    const branchService = await databaseService.branchServices.findOne({ _id: new ObjectId(branch_service_id) })
    if (!branchService) {
      throw new ErrorWithStatus({
        message: BRANCH_SERVICES_MESSAGES.BRANCH_SERVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    req.branch_service = branchService
    next()
  }
)

export const branchServiceValidator = validate(
  checkSchema({
    branch_id: {
      trim: true,
      notEmpty: {
        errorMessage: BRANCH_SERVICES_MESSAGES.BRANCH_ID_IS_REQUIRED
      },
      isMongoId: {
        errorMessage: BRANCH_SERVICES_MESSAGES.BRANCH_ID_MUST_BE_A_VALID_MONGO_ID
      },
      custom: {
        options: async (value: string) => {
          const branch = await databaseService.branches.findOne({ _id: new ObjectId(value) })
          if (!branch) {
            throw new Error(BRANCH_SERVICES_MESSAGES.BRANCH_NOT_FOUND)
          }
          return true
        }
      }
    },
    service_id: {
      trim: true,
      notEmpty: {
        errorMessage: BRANCH_SERVICES_MESSAGES.SERVICE_ID_IS_REQUIRED
      },
      isMongoId: {
        errorMessage: BRANCH_SERVICES_MESSAGES.SERVICE_ID_MUST_BE_A_VALID_MONGO_ID
      },
      custom: {
        options: async (value: string, { req }) => {
          const service = await databaseService.services.findOne({ _id: new ObjectId(value) })
          if (!service) {
            throw new Error(BRANCH_SERVICES_MESSAGES.SERVICE_NOT_FOUND)
          }

          // Kiểm tra liên kết đã tồn tại chưa
          const existingBranchService = await databaseService.branchServices.findOne({
            branch_id: new ObjectId(req.body.branch_id),
            service_id: new ObjectId(value),
            status: { $ne: BranchServicesStatus.INACTIVE }
          })

          if (existingBranchService) {
            throw new Error(BRANCH_SERVICES_MESSAGES.BRANCH_SERVICE_ALREADY_EXISTS)
          }

          return true
        }
      }
    },
    status: {
      optional: true,
      isIn: {
        options: [[BranchServicesStatus.ACTIVE, BranchServicesStatus.INACTIVE, BranchServicesStatus.PENDING]],
        errorMessage: BRANCH_SERVICES_MESSAGES.STATUS_MUST_BE_A_VALID_STATUS
      }
    },
    override_price: {
      optional: true,
      isDecimal: {
        errorMessage: BRANCH_SERVICES_MESSAGES.OVERRIDE_PRICE_MUST_BE_A_NUMBER
      },
      custom: {
        options: async (value: number) => {
          if (value < 0) {
            throw new Error(BRANCH_SERVICES_MESSAGES.OVERRIDE_PRICE_CANNOT_BE_NEGATIVE)
          }
          return true
        }
      }
    }
  })
)

export const updateBranchServiceValidator = validate(
  checkSchema({
    status: {
      optional: true,
      isIn: {
        options: [[BranchServicesStatus.ACTIVE, BranchServicesStatus.INACTIVE, BranchServicesStatus.PENDING]],
        errorMessage: BRANCH_SERVICES_MESSAGES.STATUS_MUST_BE_A_VALID_STATUS
      }
    },
    override_price: {
      optional: true,
      isDecimal: {
        errorMessage: BRANCH_SERVICES_MESSAGES.OVERRIDE_PRICE_MUST_BE_A_NUMBER
      },
      custom: {
        options: async (value: number) => {
          if (value < 0) {
            throw new Error(BRANCH_SERVICES_MESSAGES.OVERRIDE_PRICE_CANNOT_BE_NEGATIVE)
          }
          return true
        }
      }
    }
  })
)
