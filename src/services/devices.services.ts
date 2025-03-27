import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { DEVICE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { DeviceReqBody, GetAllDevicesOptions } from '~/models/request/Devices.request'
import Device, { DeviceStatus } from '~/models/schema/Device.schema'
import databaseService from '~/services/database.services'

class DevicesService {
  /**
   * Lấy danh sách tất cả thiết bị với phân trang và tìm kiếm
   * @param options Options cho việc filter và phân trang
   * @returns Danh sách thiết bị và thông tin phân trang
   */
  async getAllDevices({ limit = 10, page = 1, search = '', status, isAdmin = false }: GetAllDevicesOptions = {}) {
    const filter: Record<string, any> = {}

    // Nếu có tham số status, ưu tiên lọc theo status đó
    if (status !== undefined) {
      filter.status = Number(status)
    }
    // Nếu không có tham số status và không phải admin thì chỉ lấy thiết bị active
    else if (!isAdmin) {
      filter.status = { $ne: DeviceStatus.INACTIVE }
    }

    // Thêm điều kiện tìm kiếm nếu có
    if (search && search.trim()) {
      filter.name = { $regex: search, $options: 'i' }
    }

    // Thực hiện truy vấn với phân trang
    const [devices, totalDevices] = await Promise.all([
      databaseService.devices
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      databaseService.devices.countDocuments(filter)
    ])

    // Tính tổng số trang
    const totalPages = Math.ceil(totalDevices / limit)

    return {
      devices,
      totalDevices,
      totalPages,
      limit,
      page
    }
  }

  /**
   * Lấy thông tin một thiết bị theo ID
   * @param device_id ID của thiết bị cần lấy
   * @returns Thông tin của thiết bị
   */
  async getDevice(device_id: string) {
    if (!ObjectId.isValid(device_id)) {
      throw new ErrorWithStatus({
        message: DEVICE_MESSAGES.DEVICE_ID_MUST_BE_A_VALID_MONGO_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const device = await databaseService.devices.findOne({ _id: new ObjectId(device_id) })

    if (!device) {
      throw new ErrorWithStatus({
        message: DEVICE_MESSAGES.DEVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return device
  }

  /**
   * Tạo mới một thiết bị
   * @param body Dữ liệu của thiết bị cần tạo
   * @returns Thiết bị đã được tạo
   */
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

  /**
   * Cập nhật thông tin một thiết bị
   * @param body Dữ liệu cần cập nhật
   * @param device_id ID của thiết bị cần cập nhật
   * @returns Thiết bị sau khi cập nhật
   */
  async updateDevice(body: Partial<DeviceReqBody>, device_id: string) {
    if (!ObjectId.isValid(device_id)) {
      throw new ErrorWithStatus({
        message: DEVICE_MESSAGES.DEVICE_ID_MUST_BE_A_VALID_MONGO_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra thiết bị tồn tại trước khi cập nhật
    const existingDevice = await databaseService.devices.findOne({ _id: new ObjectId(device_id) })

    if (!existingDevice) {
      throw new ErrorWithStatus({
        message: DEVICE_MESSAGES.DEVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

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

    if (!result) {
      throw new ErrorWithStatus({
        message: DEVICE_MESSAGES.UPDATE_DEVICE_FAILED,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }

    return result
  }

  /**
   * Xóa một thiết bị
   * @param device_id ID của thiết bị cần xóa
   * @returns Thiết bị đã được xóa
   */
  async deleteDevice(device_id: string) {
    if (!ObjectId.isValid(device_id)) {
      throw new ErrorWithStatus({
        message: DEVICE_MESSAGES.DEVICE_ID_MUST_BE_A_VALID_MONGO_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const session = databaseService.getClient().startSession()

    try {
      return await session.withTransaction(async () => {
        // Kiểm tra thiết bị tồn tại trước khi xóa
        const existingDevice = await databaseService.devices.findOne({ _id: new ObjectId(device_id) }, { session })

        if (!existingDevice) {
          throw new ErrorWithStatus({
            message: DEVICE_MESSAGES.DEVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        const result = await databaseService.devices.findOneAndDelete(
          {
            _id: new ObjectId(device_id)
          },
          {
            session
          }
        )

        if (!result) {
          throw new ErrorWithStatus({
            message: DEVICE_MESSAGES.DELETE_DEVICE_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }

        // Cập nhật các service sử dụng thiết bị này
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

        return result
      })
    } finally {
      await session.endSession()
    }
  }

  /**
   * Xóa mềm một thiết bị (chỉ đổi trạng thái)
   * @param device_id ID của thiết bị cần xóa mềm
   * @returns Thiết bị sau khi xóa mềm
   */
  async softDeleteDevice(device_id: ObjectId) {
    if (!ObjectId.isValid(device_id.toString())) {
      throw new ErrorWithStatus({
        message: DEVICE_MESSAGES.DEVICE_ID_MUST_BE_A_VALID_MONGO_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const session = databaseService.getClient().startSession()

    try {
      return await session.withTransaction(async () => {
        // Kiểm tra thiết bị tồn tại trước khi xóa mềm
        const existingDevice = await databaseService.devices.findOne({ _id: device_id }, { session })

        if (!existingDevice) {
          throw new ErrorWithStatus({
            message: DEVICE_MESSAGES.DEVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        const result = await databaseService.devices.findOneAndUpdate(
          { _id: device_id },
          {
            $set: { status: DeviceStatus.INACTIVE },
            $currentDate: {
              updated_at: true
            }
          },
          { returnDocument: 'after', session }
        )

        if (!result) {
          throw new ErrorWithStatus({
            message: DEVICE_MESSAGES.DELETE_DEVICE_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
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
