import { ClientSession, ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { GetAllProductsOptions, ProductReqBody } from '~/models/request/Products.requests'
import Product, { ProductStatus } from '~/models/schema/Product.schema'
import { buildProductPipeline } from '~/pipelines/product.pipeline'
import { buildProductsPipeline } from '~/pipelines/products.pipeline'
import databaseService from '~/services/database.services'

class ProductsService {
  async getAllProducts(options: GetAllProductsOptions = {}) {
    const { pipeline, _options } = buildProductsPipeline(options)

    const products = await databaseService.products.aggregate(pipeline).toArray()

    const { data, total_count } = products[0]
    const count = total_count?.[0]?.count || 0

    return {
      data,
      total_count: count,
      page: _options.page,
      limit: _options.limit,
      total_pages: Math.ceil(count / (_options.limit as number))
    }
  }
  async getProduct(product_id: string, session?: ClientSession) {
    const pipeline = buildProductPipeline(product_id)
    const [product] = await databaseService.products.aggregate(pipeline, { session }).toArray()
    if (!product) {
      throw new ErrorWithStatus({
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return product
  }
  async createProduct(body: ProductReqBody) {
    const productData = new Product({
      ...body,
      category_id: new ObjectId(body.category_id)
    })
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.products.insertOne(productData)
        if (!result.insertedId) {
          throw new ErrorWithStatus({
            message: PRODUCT_MESSAGES.CREATE_PRODUCT_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }
        const product = await this.getProduct(result.insertedId.toString())
        if (!product) {
          throw new ErrorWithStatus({
            message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return product
      })
    } finally {
      await session.endSession()
    }
  }
  async updateProduct(body: Partial<ProductReqBody>, product_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.products.updateOne(
          { _id: new ObjectId(product_id) },
          {
            $set: { ...body, category_id: new ObjectId(body.category_id as string) },
            $currentDate: { updated_at: true }
          },
          { session }
        )
        if (!result.modifiedCount) {
          throw new ErrorWithStatus({
            message: PRODUCT_MESSAGES.PRODUCT_NOT_UPDATED,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }
        const product = await this.getProduct(product_id, session)

        return product
      })
    } finally {
      await session.endSession()
    }
  }
  async deleteProduct(product_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const product = await this.getProduct(product_id, session)
        const result = await databaseService.products.findOneAndDelete({ _id: new ObjectId(product_id) }, { session })
        if (result === null) {
          throw new ErrorWithStatus({
            message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return product
      })
    } finally {
      await session.endSession()
    }
  }
  async softDeleteProduct(product_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.products.findOneAndUpdate(
          { _id: new ObjectId(product_id) },
          { $set: { status: ProductStatus.INACTIVE }, $currentDate: { updated_at: true } },
          { returnDocument: 'after', session }
        )
        if (result === null) {
          throw new ErrorWithStatus({
            message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        const product = await this.getProduct(result._id.toString(), session)
        return product
      })
    } finally {
      await session.endSession()
    }
  }
}

const productsService = new ProductsService()

export default productsService
