import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { DEVICE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { DeviceParams } from '~/models/request/Devices.request'
import { DeviceStatus } from '~/models/schema/Device.schema'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'
import { wrapRequestHandler } from './../utils/handlers'

export const devicesQueryValidator = validate(
  checkSchema({
    search: {
      optional: true,
      isString: {
        errorMessage: DEVICE_MESSAGES.SEARCH_MUST_BE_STRING
      },
      isLength: {
        options: {
          max: 100
        },
        errorMessage: DEVICE_MESSAGES.SEARCH_MUST_BE_LESS_THAN_100_CHARACTERS
      }
    },
    status: {
      optional: true,
      isInt: {
        errorMessage: DEVICE_MESSAGES.STATUS_MUST_BE_NUMBER
      },
      custom: {
        options: (value) => {
          const allowedValues = [
            DeviceStatus.ACTIVE,
            DeviceStatus.INACTIVE,
            DeviceStatus.BROKEN,
            DeviceStatus.MAINTENANCE
          ]
          if (!allowedValues.includes(Number(value))) {
            throw new Error(`Status phải là một trong các giá trị: ${allowedValues.join(', ')}`)
          }
          return true
        }
      }
    }
  })
)
export const deviceIdValidator = validate(
  checkSchema(
    {
      device_id: {
        trim: true,
        notEmpty: {
          errorMessage: DEVICE_MESSAGES.DEVICE_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: DEVICE_MESSAGES.DEVICE_ID_MUST_BE_A_VALID_MONGO_ID
        }
      }
    },
    ['params']
  )
)
export const updateDeviceValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        trim: true,
        notEmpty: {
          errorMessage: DEVICE_MESSAGES.DEVICE_NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: DEVICE_MESSAGES.DEVICE_NAME_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string, { req }) => {
            const device = await databaseService.devices.findOne({ name: value })
            if (device) {
              throw new Error(DEVICE_MESSAGES.DEVICE_NAME_IS_EXIST)
            }
            req.device = device
            return true
          }
        }
      },
      description: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: DEVICE_MESSAGES.DEVICE_DESCRIPTION_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            max: 255
          },
          errorMessage: DEVICE_MESSAGES.DEVICE_DESCRIPTION_CANNOT_LONGER_THAN_255
        }
      },
      status: {
        optional: true,
        isInt: {
          errorMessage: DEVICE_MESSAGES.STATUS_MUST_BE_NUMBER
        },
        custom: {
          options: (value) => {
            const allowedValues = [
              DeviceStatus.ACTIVE,
              DeviceStatus.INACTIVE,
              DeviceStatus.BROKEN,
              DeviceStatus.MAINTENANCE
            ]
            if (!allowedValues.includes(Number(value))) {
              throw new Error(`Status phải là một trong các giá trị: ${allowedValues.join(', ')}`)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
export const deviceValidator = validate(
  checkSchema(
    {
      name: {
        trim: true,
        notEmpty: {
          errorMessage: DEVICE_MESSAGES.DEVICE_NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: DEVICE_MESSAGES.DEVICE_NAME_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string, { req }) => {
            const device = await databaseService.devices.findOne({ name: value })
            if (device) {
              throw new Error(DEVICE_MESSAGES.DEVICE_NAME_IS_EXIST)
            }
            req.device = device
            return true
          }
        }
      },
      description: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: DEVICE_MESSAGES.DEVICE_DESCRIPTION_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            max: 255
          },
          errorMessage: DEVICE_MESSAGES.DEVICE_DESCRIPTION_CANNOT_LONGER_THAN_255
        }
      },
      status: {
        optional: true,
        isInt: {
          errorMessage: DEVICE_MESSAGES.STATUS_MUST_BE_NUMBER
        },
        custom: {
          options: (value) => {
            const allowedValues = [
              DeviceStatus.ACTIVE,
              DeviceStatus.INACTIVE,
              DeviceStatus.BROKEN,
              DeviceStatus.MAINTENANCE
            ]
            if (!allowedValues.includes(Number(value))) {
              throw new Error(`Status phải là một trong các giá trị: ${allowedValues.join(', ')}`)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const checkDeviceNotInactive = wrapRequestHandler(
  async (req: Request<DeviceParams, any, any>, res: Response, next: NextFunction) => {
    const { device_id } = req.params

    const device = await databaseService.devices.findOne({ _id: new ObjectId(device_id) })
    if (!device) {
      throw new ErrorWithStatus({
        message: DEVICE_MESSAGES.DEVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    console.log(device)
    if (device.status === DeviceStatus.INACTIVE) {
      throw new ErrorWithStatus({
        message: DEVICE_MESSAGES.DEVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    req.device = device
    next()
  }
)
