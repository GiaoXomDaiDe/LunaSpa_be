import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { CONDITION_SERVICES_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import {
  ConditionServicesReqBody,
  GetAllConditionServicesOptions,
  UpdateConditionServicesReqBody
} from '~/models/request/ConditionServices.requests'
import { GetAllServiceProductsOptions } from '~/models/request/ServiceProducts.requests'
import ConditionService from '~/models/schema/ConditionService.schema'
import {
  buildConditionsByServicePipeline,
  buildConditionServicesPipeline,
  buildServicesByConditionPipeline
} from '~/pipelines/conditionServices.pipeline'
import databaseService from '~/services/database.services'

class ConditionServiceService {
  // Lấy tất cả liên kết condition-service
  async getAllConditionServices(options: GetAllConditionServicesOptions) {
    const { pipeline, _options } = buildConditionServicesPipeline(options)
    const [result] = await databaseService.conditionServices.aggregate(pipeline).toArray()

    return {
      data: result.data || [],
      pagination: {
        total: result.total_count[0]?.count || 0,
        page: Number(_options.page),
        limit: Number(_options.limit),
        total_pages: Math.ceil((result.total_count[0]?.count || 0) / Number(_options.limit))
      }
    }
  }

  // Lấy một liên kết condition-service theo ID
  async getConditionService(condition_service_id: string) {
    if (!ObjectId.isValid(condition_service_id)) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.CONDITION_SERVICE_ID_MUST_BE_A_VALID_MONGO_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const conditionService = await databaseService.conditionServices.findOne({
      _id: new ObjectId(condition_service_id)
    })

    if (!conditionService) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.CONDITION_SERVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Join với conditions và services để lấy thông tin đầy đủ
    const pipeline = [
      {
        $match: {
          _id: new ObjectId(condition_service_id)
        }
      },
      {
        $lookup: {
          from: 'conditions',
          localField: 'condition_id',
          foreignField: '_id',
          as: 'condition'
        }
      },
      {
        $unwind: {
          path: '$condition',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: 'service_id',
          foreignField: '_id',
          as: 'service'
        }
      },
      {
        $unwind: {
          path: '$service',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'service.device_ids',
          foreignField: '_id',
          as: 'service.devices'
        }
      },
      {
        $lookup: {
          from: 'service_categories',
          localField: 'service.service_category_id',
          foreignField: '_id',
          as: 'service.service_category'
        }
      },
      {
        $unwind: {
          path: '$service.service_category',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          condition_id: 0,
          service_id: 0,
          'service.device_ids': 0,
          'service.service_category_id': 0
        }
      }
    ]

    const [result] = await databaseService.conditionServices.aggregate(pipeline).toArray()
    return result
  }

  // Lấy danh sách services theo condition_id
  async getServicesByConditionId(condition_id: string, options: GetAllServiceProductsOptions) {
    if (!ObjectId.isValid(condition_id)) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.CONDITION_ID_MUST_BE_A_VALID_MONGO_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra condition có tồn tại không
    const condition = await databaseService.conditions.findOne({ _id: new ObjectId(condition_id) })
    if (!condition) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.CONDITION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const { pipeline, _options } = buildServicesByConditionPipeline(condition_id, options)
    const [result] = await databaseService.conditionServices.aggregate(pipeline).toArray()

    return {
      data: result.data || [],
      pagination: {
        total: result.total_count[0]?.count || 0,
        page: Number(_options.page),
        limit: Number(_options.limit),
        total_pages: Math.ceil((result.total_count[0]?.count || 0) / Number(_options.limit))
      }
    }
  }

  // Lấy danh sách conditions theo service_id
  async getConditionsByServiceId(service_id: string, options: any) {
    if (!ObjectId.isValid(service_id)) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.SERVICE_ID_MUST_BE_A_VALID_MONGO_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra service có tồn tại không
    const service = await databaseService.services.findOne({ _id: new ObjectId(service_id) })
    if (!service) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.SERVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const { pipeline, _options } = buildConditionsByServicePipeline(service_id, options)
    const [result] = await databaseService.conditionServices.aggregate(pipeline).toArray()

    return {
      data: result.data || [],
      pagination: {
        total: result.total_count[0]?.count || 0,
        page: Number(_options.page),
        limit: Number(_options.limit),
        total_pages: Math.ceil((result.total_count[0]?.count || 0) / Number(_options.limit))
      }
    }
  }

  // Tạo liên kết mới giữa condition và service
  async createConditionService(payload: ConditionServicesReqBody) {
    const { condition_id, service_id, note } = payload

    // Kiểm tra điều kiện và dịch vụ có tồn tại không
    if (!ObjectId.isValid(condition_id)) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.CONDITION_ID_MUST_BE_A_VALID_MONGO_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    if (!ObjectId.isValid(service_id)) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.SERVICE_ID_MUST_BE_A_VALID_MONGO_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const condition = await databaseService.conditions.findOne({ _id: new ObjectId(condition_id) })
    if (!condition) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.CONDITION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const service = await databaseService.services.findOne({ _id: new ObjectId(service_id) })
    if (!service) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.SERVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Kiểm tra liên kết đã tồn tại chưa
    const existingLink = await databaseService.conditionServices.findOne({
      condition_id: new ObjectId(condition_id),
      service_id: new ObjectId(service_id)
    })

    if (existingLink) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.CONDITION_SERVICE_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Tạo liên kết mới
    const conditionService = new ConditionService({
      condition_id: new ObjectId(condition_id),
      service_id: new ObjectId(service_id),
      note: note || ''
    })

    const result = await databaseService.conditionServices.insertOne(conditionService)

    // Trả về thông tin đầy đủ
    return await this.getConditionService(result.insertedId.toString())
  }

  // Cập nhật thông tin liên kết
  async updateConditionService(condition_service_id: string, payload: UpdateConditionServicesReqBody) {
    const { condition_id, service_id, note } = payload

    if (!ObjectId.isValid(condition_service_id)) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.CONDITION_SERVICE_ID_MUST_BE_A_VALID_MONGO_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra liên kết có tồn tại không
    const conditionService = await databaseService.conditionServices.findOne({
      _id: new ObjectId(condition_service_id)
    })

    if (!conditionService) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.CONDITION_SERVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Tạo object cập nhật
    const updateData: any = { updated_at: new Date() }

    if (condition_id !== undefined) {
      // Kiểm tra condition mới có tồn tại không
      if (!ObjectId.isValid(condition_id)) {
        throw new ErrorWithStatus({
          message: CONDITION_SERVICES_MESSAGES.CONDITION_ID_MUST_BE_A_VALID_MONGO_ID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      const condition = await databaseService.conditions.findOne({ _id: new ObjectId(condition_id) })
      if (!condition) {
        throw new ErrorWithStatus({
          message: CONDITION_SERVICES_MESSAGES.CONDITION_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      updateData.condition_id = new ObjectId(condition_id)
    }

    if (service_id !== undefined) {
      // Kiểm tra service mới có tồn tại không
      if (!ObjectId.isValid(service_id)) {
        throw new ErrorWithStatus({
          message: CONDITION_SERVICES_MESSAGES.SERVICE_ID_MUST_BE_A_VALID_MONGO_ID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      const service = await databaseService.services.findOne({ _id: new ObjectId(service_id) })
      if (!service) {
        throw new ErrorWithStatus({
          message: CONDITION_SERVICES_MESSAGES.SERVICE_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      updateData.service_id = new ObjectId(service_id)
    }

    if (note !== undefined) {
      updateData.note = note
    }

    // Kiểm tra xem liên kết mới đã tồn tại chưa (nếu thay đổi cả condition_id và service_id)
    if (condition_id && service_id) {
      const existingLink = await databaseService.conditionServices.findOne({
        _id: { $ne: new ObjectId(condition_service_id) },
        condition_id: new ObjectId(condition_id),
        service_id: new ObjectId(service_id)
      })

      if (existingLink) {
        throw new ErrorWithStatus({
          message: CONDITION_SERVICES_MESSAGES.CONDITION_SERVICE_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Kiểm tra có dữ liệu cập nhật không
    if (Object.keys(updateData).length <= 1) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.NO_DATA_TO_UPDATE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Cập nhật
    await databaseService.conditionServices.updateOne({ _id: new ObjectId(condition_service_id) }, { $set: updateData })

    // Trả về thông tin đầy đủ sau khi cập nhật
    return await this.getConditionService(condition_service_id)
  }

  // Xóa liên kết
  async deleteConditionService(condition_service_id: string) {
    if (!ObjectId.isValid(condition_service_id)) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.CONDITION_SERVICE_ID_MUST_BE_A_VALID_MONGO_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra liên kết có tồn tại không
    const conditionService = await databaseService.conditionServices.findOne({
      _id: new ObjectId(condition_service_id)
    })

    if (!conditionService) {
      throw new ErrorWithStatus({
        message: CONDITION_SERVICES_MESSAGES.CONDITION_SERVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const result = await databaseService.conditionServices.deleteOne({
      _id: new ObjectId(condition_service_id)
    })

    return { deleted: result.deletedCount > 0 }
  }
}

const conditionServiceService = new ConditionServiceService()
export default conditionServiceService
