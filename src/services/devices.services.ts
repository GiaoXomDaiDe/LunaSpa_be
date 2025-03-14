import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { DEVICE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { DeviceReqBody, GetAllDevicesOptions } from '~/models/request/Devices.request'
import Device, { DeviceStatus } from '~/models/schema/Device.schema'
import databaseService from '~/services/database.services'

class DevicesService {
  async getAllDevices({ limit = 10, page = 1, search = '', isAdmin = false }: GetAllDevicesOptions = {}) {
    const filter: any = {}
    if (!isAdmin) {
      filter.status = { $ne: DeviceStatus.INACTIVE }
    }
    if (search.trim()) {
      filter.name = { $regex: search, $options: 'i' }
    }
    const devices = await databaseService.devices
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const totalDevices = await databaseService.devices.countDocuments(filter)
    const totalPages = Math.ceil(totalDevices / limit)
    return {
      devices,
      totalDevices,
      totalPages,
      limit,
      page
    }
  }
  async getDevice(device_id: string) {
    const device = await databaseService.devices.findOne({ _id: new ObjectId(device_id) })
    if (!device) {
      throw new ErrorWithStatus({
        message: DEVICE_MESSAGES.DEVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return device
  }
  async createDevice(body: DeviceReqBody) {
    const deviceData = new Device({
      ...body
    })
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.devices.insertOne(deviceData, { session })
        if (!result.insertedId) {
          throw new ErrorWithStatus({
            message: DEVICE_MESSAGES.CREATE_DEVICE_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }
        const device = await databaseService.devices.findOne({ _id: result.insertedId }, { session })
        if (!device) {
          throw new ErrorWithStatus({
            message: DEVICE_MESSAGES.DEVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return device
      })
    } finally {
      await session.endSession()
    }
  }
  async updateDevice(body: Partial<DeviceReqBody>, device_id: string) {
    const result = await databaseService.devices.findOneAndUpdate(
      { _id: new ObjectId(device_id) },
      {
        $set: body,
        $currentDate: {
          updated_at: true
        }
      },
      { returnDocument: 'after' }
    )
    if (result === null) {
      throw new ErrorWithStatus({
        message: DEVICE_MESSAGES.DEVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return result
  }

  async deleteDevice(device_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.devices.findOneAndDelete(
          {
            _id: new ObjectId(device_id)
          },
          {
            session
          }
        )
        if (result === null) {
          throw new ErrorWithStatus({
            message: DEVICE_MESSAGES.DEVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        await databaseService.services.updateMany(
          {
            device_ids: new ObjectId(device_id)
          },
          {
            $pull: {
              device_ids: new ObjectId(device_id)
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
      })
    } finally {
      await session.endSession()
    }
  }
  async softDeleteDevice(device_id: ObjectId) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.devices.findOneAndUpdate(
          { _id: device_id },
          {
            $set: { status: DeviceStatus.INACTIVE },
            $currentDate: {
              updated_at: true
            }
          },
          { returnDocument: 'after' }
        )
        if (result === null) {
          throw new ErrorWithStatus({
            message: DEVICE_MESSAGES.DEVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return result
      })
    } finally {
      await session.endSession()
    }
  }
}

const devicesService = new DevicesService()

export default devicesService
