import { ObjectId } from 'mongodb'
import { GetAllServiceProductsOptions, ServiceProductsQuery } from '~/models/request/ServiceProducts.requests'
import ServiceProducts from '~/models/schema/ServiceProducts.schema'
import { buildServiceProductsPipeline } from '~/pipelines/serviceProducts.pipeline'
import databaseService from '~/services/database.services'

export class ServiceProductsService {
  async getAllServiceProducts(options: GetAllServiceProductsOptions) {
    const { pipeline, _options } = buildServiceProductsPipeline(options)

    const [result] = await databaseService.serviceProducts.aggregate(pipeline).toArray()
    return {
      data: result.data,
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
      service_id
    })
    const [result] = await databaseService.serviceProducts.aggregate(pipeline).toArray()
    return {
      data: result.data,
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
      product_id
    })
    const [result] = await databaseService.serviceProducts.aggregate(pipeline).toArray()
    return {
      data: result.data,
      pagination: {
        total: result.total_count[0]?.count || 0,
        page: Number(_options.page),
        limit: Number(_options.limit),
        total_pages: Math.ceil((result.total_count[0]?.count || 0) / Number(_options.limit))
      }
    }
  }

  async getServiceProduct(service_product_id: string) {
    const { pipeline } = buildServiceProductsPipeline({ limit: 1, page: 1 })
    const [result] = await databaseService.serviceProducts
      .aggregate([{ $match: { _id: new ObjectId(service_product_id) } }, ...pipeline])
      .toArray()
    return result.data[0]
  }

  async createServiceProduct(payload: { service_id: string; product_id: string }) {
    const { service_id, product_id } = payload
    const serviceProduct = new ServiceProducts({
      service_id: new ObjectId(service_id),
      product_id: new ObjectId(product_id)
    })
    const result = await databaseService.serviceProducts.insertOne(serviceProduct)
    return {
      ...serviceProduct,
      _id: result.insertedId
    }
  }

  async updateServiceProduct(service_product_id: string, payload: { service_id?: string; product_id?: string }) {
    const { service_id, product_id } = payload
    const updateData: any = { updated_at: new Date() }

    if (service_id) {
      updateData.service_id = new ObjectId(service_id)
    }

    if (product_id) {
      updateData.product_id = new ObjectId(product_id)
    }

    const result = await databaseService.serviceProducts.findOneAndUpdate(
      { _id: new ObjectId(service_product_id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  }

  async deleteServiceProduct(service_product_id: string) {
    const result = await databaseService.serviceProducts.deleteOne({ _id: new ObjectId(service_product_id) })
    return result
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
