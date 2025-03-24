import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { SERVICE_PRODUCTS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import {
  GetAllServiceProductsOptions,
  ServiceProductsQuery,
  ServiceProductsReqBody,
  UpdateServiceProductsReqBody
} from '~/models/request/ServiceProducts.requests'
import ServiceProducts, { ServiceProductStatus } from '~/models/schema/ServiceProducts.schema'
import { buildServiceProductsPipeline } from '~/pipelines/serviceProducts.pipeline'
import databaseService from '~/services/database.services'

export class ServiceProductsService {
  async getAllServiceProducts(options: GetAllServiceProductsOptions) {
    const { pipeline, _options } = buildServiceProductsPipeline(options)

    const [result] = await databaseService.serviceProducts.aggregate(pipeline).toArray()
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

  async getServiceProductsByServiceId(service_id: string, options?: ServiceProductsQuery) {
    const query = options || { limit: '10', page: '1' }
    const { pipeline, _options } = buildServiceProductsPipeline({
      limit: Number(query.limit),
      page: Number(query.page),
      service_id,
      status: query.status ? Number(query.status) : undefined
    })
    const [result] = await databaseService.serviceProducts.aggregate(pipeline).toArray()
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

  async getServiceProductsByProductId(product_id: string, options?: ServiceProductsQuery) {
    const query = options || { limit: '10', page: '1' }
    const { pipeline, _options } = buildServiceProductsPipeline({
      limit: Number(query.limit),
      page: Number(query.page),
      product_id,
      status: query.status ? Number(query.status) : undefined
    })
    const [result] = await databaseService.serviceProducts.aggregate(pipeline).toArray()
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

  async getRecommendedProducts(service_id: string, options?: GetAllServiceProductsOptions) {
    const { pipeline, _options } = buildServiceProductsPipeline({
      ...options,
      service_id,
      recommended: true,
      status: ServiceProductStatus.ACTIVE
    })
    const [result] = await databaseService.serviceProducts.aggregate(pipeline).toArray()
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

  async getServiceProduct(service_product_id: string) {
    const service_product = await databaseService.serviceProducts.findOne({ _id: new ObjectId(service_product_id) })
    if (!service_product) {
      throw new ErrorWithStatus({
        message: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Sử dụng pipeline để lấy thông tin chi tiết
    const { pipeline } = buildServiceProductsPipeline({
      limit: 1,
      page: 1,
      service_id: service_product.service_id.toString(),
      product_id: service_product.product_id.toString()
    })

    const [result] = await databaseService.serviceProducts
      .aggregate([{ $match: { _id: new ObjectId(service_product_id) } }, ...pipeline])
      .toArray()
    console.log(result)
    if (!result.data || result.data.length === 0) {
      throw new ErrorWithStatus({
        message: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return result.data[0]
  }

  async createServiceProduct(payload: ServiceProductsReqBody) {
    const { service_id, product_id, status, recommended, discount_percent, usage_instruction } = payload

    // Kiểm tra xem đã tồn tại chưa
    const existingServiceProduct = await databaseService.serviceProducts.findOne({
      service_id: new ObjectId(service_id),
      product_id: new ObjectId(product_id)
    })

    if (existingServiceProduct) {
      throw new ErrorWithStatus({
        message: SERVICE_PRODUCTS_MESSAGES.SERVICE_PRODUCT_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const serviceProduct = new ServiceProducts({
      service_id: new ObjectId(service_id),
      product_id: new ObjectId(product_id),
      status: status !== undefined ? status : ServiceProductStatus.ACTIVE,
      recommended: recommended !== undefined ? recommended : false,
      discount_percent: discount_percent !== undefined ? discount_percent : 0,
      usage_instruction: usage_instruction !== undefined ? usage_instruction : ''
    })

    const result = await databaseService.serviceProducts.insertOne(serviceProduct)
    console.log(result)
    // Lấy thông tin chi tiết của service product vừa tạo
    return await this.getServiceProduct(result.insertedId.toString())
  }

  async updateServiceProduct(service_product_id: string, payload: UpdateServiceProductsReqBody) {
    const { service_id, product_id, status, recommended, discount_percent, usage_instruction } = payload

    // Tạo đối tượng cập nhật với dữ liệu từ payload
    const updateData: any = { updated_at: new Date() }

    if (service_id) {
      updateData.service_id = new ObjectId(service_id)
    }

    if (product_id) {
      updateData.product_id = new ObjectId(product_id)
    }

    if (status !== undefined) {
      updateData.status = status
    }

    if (recommended !== undefined) {
      updateData.recommended = recommended
    }

    if (discount_percent !== undefined) {
      updateData.discount_percent = discount_percent
    }

    if (usage_instruction !== undefined) {
      updateData.usage_instruction = usage_instruction
    }

    // Kiểm tra xem có dữ liệu cập nhật hay không
    if (Object.keys(updateData).length <= 1) {
      throw new ErrorWithStatus({
        message: SERVICE_PRODUCTS_MESSAGES.NO_DATA_TO_UPDATE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Thực hiện cập nhật
    await databaseService.serviceProducts.updateOne({ _id: new ObjectId(service_product_id) }, { $set: updateData })

    // Trả về thông tin chi tiết sau khi cập nhật
    return await this.getServiceProduct(service_product_id)
  }

  async updateServiceProductStatus(service_product_id: string, status: number) {
    // Kiểm tra service product tồn tại
    await this.getServiceProduct(service_product_id)

    const result = await databaseService.serviceProducts.updateOne(
      { _id: new ObjectId(service_product_id) },
      {
        $set: {
          status,
          updated_at: new Date()
        }
      }
    )

    if (result.modifiedCount === 0) {
      throw new ErrorWithStatus({
        message: SERVICE_PRODUCTS_MESSAGES.NO_DATA_TO_UPDATE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    return { success: true }
  }

  async deleteServiceProduct(service_product_id: string) {
    // Kiểm tra service product tồn tại
    await this.getServiceProduct(service_product_id)

    const result = await databaseService.serviceProducts.deleteOne({ _id: new ObjectId(service_product_id) })

    return { deleted: result.deletedCount > 0 }
  }

  // Các hàm mới cho API mới
  async getProductsByServiceId(service_id: string) {
    const pipeline = [
      {
        $match: {
          service_id: new ObjectId(service_id)
        }
      },
      {
        $lookup: {
          from: 'products',
          let: { product_id: '$product_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$_id', '$$product_id'] }]
                }
              }
            }
          ],
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          service_id: 1,
          product_id: 1,
          status: 1,
          created_at: 1,
          updated_at: 1,
          product: 1
        }
      }
    ]

    const result = await databaseService.serviceProducts.aggregate(pipeline).toArray()
    return result
  }

  async getServicesByProductId(product_id: string) {
    const pipeline = [
      {
        $match: {
          product_id: new ObjectId(product_id)
        }
      },
      {
        $lookup: {
          from: 'services',
          let: { service_id: '$service_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$_id', '$$service_id'] }]
                }
              }
            }
          ],
          as: 'service'
        }
      },
      { $unwind: '$service' },
      {
        $project: {
          _id: 1,
          service_id: 1,
          product_id: 1,
          status: 1,
          created_at: 1,
          updated_at: 1,
          service: 1
        }
      }
    ]

    const result = await databaseService.serviceProducts.aggregate(pipeline).toArray()
    return result
  }
}

const serviceProductsService = new ServiceProductsService()
export default serviceProductsService
