import { ObjectId } from 'mongodb'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import { GetAllProductsOptions } from '~/models/request/Products.requests'
import ServiceProducts from '~/models/schema/ServiceProducts.schema'
import {
  buildOneProductOfServicePipeline,
  buildProductsByServiceIdPipeline
} from '~/pipelines/servicesProducts.pipeline'
import databaseService from '~/services/database.services'

class ServicesProductService {
  async getAllProductsByServiceId(service_id: string, options: GetAllProductsOptions) {
    const pipeline = buildProductsByServiceIdPipeline(service_id, options)
    const result = await databaseService.servicesProducts.aggregate(pipeline).toArray()
    const { data, total_count } = result[0]
    const count = total_count?.[0]?.count || 0
    return {
      data,
      total_count: count,
      page: options.page,
      limit: options.limit,
      total_pages: Math.ceil(count / (Number(options.limit) || 10))
    }
  }
  async addProductToService(service_id: string, product_id: string) {
    const productInService = new ServiceProducts({
      product_id: new ObjectId(product_id),
      service_id: new ObjectId(service_id)
    })
    await databaseService.servicesProducts.insertOne(productInService)
    const productsInService = await this.getOneProductOfService(service_id, product_id)
    return productsInService
  }
  async getOneProductOfService(service_id: string, product_id: string) {
    const pipeline = buildOneProductOfServicePipeline(service_id, product_id)

    const result = await databaseService.servicesProducts.aggregate(pipeline).toArray()
    // result: mảng doc
    // Nếu rỗng => not found
    return result[0] || null
  }
  async updateProductOfService(
    service_product_id: string,
    { product_id, service_id }: { product_id?: string; service_id?: string }
  ) {
    // 1) Tạo updateDoc rỗng
    const updateDoc: Record<string, any> = {}

    // 2) Nếu user truyền product_id => cập nhật
    if (product_id && product_id.trim() !== '') {
      updateDoc.product_id = new ObjectId(product_id)
    }

    // 3) Nếu user truyền service_id => cập nhật
    if (service_id && service_id.trim() !== '') {
      updateDoc.service_id = new ObjectId(service_id)
    }

    // 4) Nếu cả updateDoc rỗng => nghĩa là user không truyền gì để update
    if (Object.keys(updateDoc).length === 0) {
      throw new Error('No fields to update')
    }
    const result = await databaseService.servicesProducts.findOneAndUpdate(
      {
        _id: new ObjectId(service_product_id)
      },
      {
        $set: updateDoc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    if (!result) {
      throw new Error(PRODUCT_MESSAGES.UPDATE_PRODUCT_OF_SERVICE_FAILED)
    }
    return result
  }
  async deleteProductOfService(service_id: string, product_id: string) {
    const result = await databaseService.servicesProducts.findOneAndDelete({
      service_id: new ObjectId(service_id),
      product_id: new ObjectId(product_id)
    })
    if (!result) {
      throw new Error(PRODUCT_MESSAGES.DELETE_PRODUCT_OF_SERVICE_FAILED)
    }
    return result
  }
}

export default new ServicesProductService()
