import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { DEVICE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { DeviceParams } from '~/models/request/Devices.request'
import { DeviceStatus } from '~/models/schema/Device.schema'
import databaseService from '~/services/database.services'
import schemaHelper from '~/utils/schemaHelper'
import { validate } from '~/utils/validation'
import { wrapRequestHandler } from './../utils/handlers'

/**
 * Validate các trường trong query khi tìm kiếm devices
 * Kiểm tra trường search và status
 */
export const devicesQueryValidator = validate(
  checkSchema({
    search: schemaHelper.deviceSearchSchema,
    status: schemaHelper.deviceStatusSchema
  })
)

/**
 * Validate device_id trong params
 * Kiểm tra tính hợp lệ của ID
 */
export const deviceIdValidator = validate(
  checkSchema(
    {
      device_id: schemaHelper.deviceIdSchema
    },
    ['params']
  )
)

/**
 * Validate các trường khi cập nhật thiết bị
 * Tất cả các trường đều là optional
 */
export const updateDeviceValidator = validate(
  checkSchema(
    {
      name: schemaHelper.updateDeviceNameSchema,
      description: schemaHelper.updateDeviceDescriptionSchema,
      status: schemaHelper.deviceStatusSchema
    },
    ['body']
  )
)

/**
 * Validate các trường khi tạo mới thiết bị
 * Trường name là bắt buộc
 */
export const deviceValidator = validate(
  checkSchema(
    {
      name: schemaHelper.deviceNameSchema,
      description: schemaHelper.deviceDescriptionSchema,
      status: schemaHelper.deviceStatusSchema
    },
    ['body']
  )
)

/**
 * Kiểm tra thiết bị không ở trạng thái inactive
 * Lưu thông tin thiết bị vào req.device để sử dụng ở middleware tiếp theo
 */
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
