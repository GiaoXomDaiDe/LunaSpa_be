import { ClientSession, ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { SERVICE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { GetAllServicesOptions, ServiceReqBody } from '~/models/request/Services.request'
import Service, { ServiceStatus } from '~/models/schema/Service.schema'
import { buildServicePipeline } from '~/pipelines/service.pipeline'
import { buildServicesPipeline } from '~/pipelines/services.pipeline'
import databaseService from '~/services/database.services'

class ServicesService {
  /**
   * Lấy danh sách tất cả dịch vụ với phân trang và filter
   * @param options Options cho việc filter và phân trang
   * @returns Danh sách dịch vụ và thông tin phân trang
   */
  async getAllServices(options: GetAllServicesOptions) {
    const { pipeline, _options } = buildServicesPipeline(options)

    const services = await databaseService.services.aggregate(pipeline).toArray()
    const { data, total_count } = services[0]
    const count = total_count?.[0]?.count || 0
    const totalPages = Math.ceil(count / (_options.limit as number))

    return {
      data,
      totalServices: count,
      totalPages,
      page: _options.page,
      limit: _options.limit
    }
  }

  /**
   * Lấy thông tin chi tiết của một dịch vụ
   * @param service_id ID của dịch vụ
   * @param session Session MongoDB (tùy chọn)
   * @returns Thông tin chi tiết của dịch vụ
   */
  async getService(service_id: string, session?: ClientSession) {
    const pipeline = buildServicePipeline(service_id)
    const [service] = await databaseService.services.aggregate(pipeline, { session }).toArray()

    if (!service) {
      throw new ErrorWithStatus({
        message: SERVICE_MESSAGES.SERVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Tăng lượt xem cho dịch vụ
    await databaseService.services.updateOne(
      {
        _id: new ObjectId(service_id)
      },
      {
        $inc: {
          view_count: 1
        },
        $set: {
          updated_at: new Date()
        }
      },
      { session }
    )

    // Cập nhật view_count trong kết quả trả về
    service.view_count = service.view_count + 1

    return service
  }

  /**
   * Tạo mới một dịch vụ
   * @param body Thông tin dịch vụ cần tạo
   * @returns Dịch vụ đã được tạo
   */
  async createService(body: ServiceReqBody) {
    const serviceData = new Service({
      ...body,
      service_category_id: new ObjectId(body.service_category_id),
      device_ids: body.device_ids?.map((device_id) => new ObjectId(device_id))
    })

    const session = databaseService.getClient().startSession()

    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.services.insertOne(serviceData)

        if (!result.insertedId) {
          throw new ErrorWithStatus({
            message: SERVICE_MESSAGES.CREATE_SERVICE_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }

        const service = await this.getService(result.insertedId.toString())

        if (!service) {
          throw new ErrorWithStatus({
            message: SERVICE_MESSAGES.SERVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        return service
      })
    } finally {
      await session.endSession()
    }
  }

  /**
   * Cập nhật thông tin dịch vụ
   * @param body Dữ liệu cần cập nhật
   * @param service_id ID của dịch vụ cần cập nhật
   * @returns Dịch vụ sau khi cập nhật
   */
  async updateService(body: Partial<ServiceReqBody>, service_id: string) {
    const session = databaseService.getClient().startSession()

    try {
      return await session.withTransaction(async () => {
        // Kiểm tra dịch vụ tồn tại trước khi cập nhật
        const existingService = await databaseService.services.findOne({ _id: new ObjectId(service_id) })

        if (!existingService) {
          throw new ErrorWithStatus({
            message: SERVICE_MESSAGES.SERVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        // Chuẩn bị dữ liệu cập nhật
        const updateFields: any = { ...body }

        if (body.service_category_id) {
          updateFields.service_category_id = new ObjectId(body.service_category_id)
        }

        if (body.device_ids) {
          updateFields.device_ids = body.device_ids.map((device_id) => new ObjectId(device_id))
        }

        const result = await databaseService.services.updateOne(
          { _id: new ObjectId(service_id) },
          {
            $set: updateFields,
            $currentDate: { updated_at: true }
          },
          { session }
        )

        if (!result.modifiedCount) {
          throw new ErrorWithStatus({
            message: SERVICE_MESSAGES.SERVICE_NOT_UPDATED,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }

        const service = await this.getService(service_id, session)
        return service
      })
    } finally {
      await session.endSession()
    }
  }

  /**
   * Xóa vĩnh viễn một dịch vụ
   * @param service_id ID của dịch vụ cần xóa
   * @returns Dịch vụ đã xóa
   */
  async deleteService(service_id: string) {
    const session = databaseService.getClient().startSession()

    try {
      return await session.withTransaction(async () => {
        // Kiểm tra dịch vụ tồn tại trước khi xóa
        const service = await this.getService(service_id, session)

        const result = await databaseService.services.deleteOne({ _id: new ObjectId(service_id) }, { session })

        if (!result.deletedCount) {
          throw new ErrorWithStatus({
            message: SERVICE_MESSAGES.SERVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        // Xóa các liên kết dịch vụ-sản phẩm
        await databaseService.serviceProducts.deleteMany({ service_id: new ObjectId(service_id) }, { session })

        return service
      })
    } finally {
      await session.endSession()
    }
  }

  /**
   * Xóa mềm một dịch vụ (đổi trạng thái thành inactive)
   * @param service_id ID của dịch vụ cần xóa mềm
   * @returns Dịch vụ sau khi xóa mềm
   */
  async softDeleteService(service_id: string) {
    const session = databaseService.getClient().startSession()

    try {
      return await session.withTransaction(async () => {
        // Kiểm tra dịch vụ tồn tại trước khi xóa mềm
        const existingService = await databaseService.services.findOne({ _id: new ObjectId(service_id) })

        if (!existingService) {
          throw new ErrorWithStatus({
            message: SERVICE_MESSAGES.SERVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        const result = await databaseService.services.findOneAndUpdate(
          { _id: new ObjectId(service_id) },
          {
            $set: { status: ServiceStatus.INACTIVE },
            $currentDate: { updated_at: true }
          },
          { returnDocument: 'after', session }
        )

        if (!result) {
          throw new ErrorWithStatus({
            message: SERVICE_MESSAGES.SERVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        const service = await this.getService(result._id.toString(), session)
        return service
      })
    } finally {
      await session.endSession()
    }
  }
}

const servicesService = new ServicesService()

export default servicesService
