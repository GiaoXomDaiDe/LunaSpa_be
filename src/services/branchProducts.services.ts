import { ClientSession, ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { BRANCH_PRODUCTS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { BranchProductsReqBody, GetBranchProductsOptions } from '~/models/request/BranchProducts.request'
import BranchProducts, { BranchProductsStatus } from '~/models/schema/BranchProducts.schema'
import databaseService from '~/services/database.services'

class BranchProductsService {
  async getAllBranchProducts(options: GetBranchProductsOptions) {
    const { limit = 10, page = 1, branch_id, product_id, status } = options

    const filter: any = {}
    if (branch_id) {
      filter.branch_id = new ObjectId(branch_id)
    }
    if (product_id) {
      filter.product_id = new ObjectId(product_id)
    }
    if (status !== undefined) {
      filter.status = status
    }

    const [branchProducts, total] = await Promise.all([
      databaseService.branchProducts
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      databaseService.branchProducts.countDocuments(filter)
    ])

    return {
      data: branchProducts,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit)
      }
    }
  }

  async getBranchProductsByBranchId(branch_id: string, status?: BranchProductsStatus) {
    const filter: any = { branch_id: new ObjectId(branch_id) }
    if (status !== undefined) {
      filter.status = status
    }

    return databaseService.branchProducts.find(filter).toArray()
  }

  async getBranchProductsByProductId(product_id: string, status?: BranchProductsStatus) {
    const filter: any = { product_id: new ObjectId(product_id) }
    if (status !== undefined) {
      filter.status = status
    }

    return databaseService.branchProducts.find(filter).toArray()
  }

  async getBranchProduct(branch_product_id: string, session?: ClientSession) {
    const branchProduct = await databaseService.branchProducts.findOne(
      { _id: new ObjectId(branch_product_id) },
      { session }
    )

    if (!branchProduct) {
      throw new ErrorWithStatus({
        message: BRANCH_PRODUCTS_MESSAGES.BRANCH_PRODUCT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return branchProduct
  }

  async createBranchProduct(payload: BranchProductsReqBody) {
    const { branch_id, product_id, status, override_price } = payload

    const branchProduct = new BranchProducts({
      branch_id: new ObjectId(branch_id),
      product_id: new ObjectId(product_id),
      status: status ?? BranchProductsStatus.ACTIVE,
      override_price
    })

    const result = await databaseService.branchProducts.insertOne(branchProduct)
    return {
      ...branchProduct,
      _id: result.insertedId
    }
  }

  async updateBranchProduct(branch_product_id: string, payload: Partial<BranchProductsReqBody>) {
    const { status, override_price } = payload

    if (!status && override_price === undefined) {
      throw new ErrorWithStatus({
        message: BRANCH_PRODUCTS_MESSAGES.NO_DATA_TO_UPDATE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const updateData: any = {}
    if (status !== undefined) {
      updateData.status = status
    }
    if (override_price !== undefined) {
      updateData.override_price = override_price
    }
    updateData.updated_at = new Date()

    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.branchProducts.findOneAndUpdate(
          { _id: new ObjectId(branch_product_id) },
          { $set: updateData },
          { returnDocument: 'after', session }
        )

        if (!result) {
          throw new ErrorWithStatus({
            message: BRANCH_PRODUCTS_MESSAGES.BRANCH_PRODUCT_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        return result
      })
    } finally {
      await session.endSession()
    }
  }

  async deleteBranchProduct(branch_product_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const branchProduct = await this.getBranchProduct(branch_product_id, session)

        const result = await databaseService.branchProducts.deleteOne(
          { _id: new ObjectId(branch_product_id) },
          { session }
        )

        if (!result.deletedCount) {
          throw new ErrorWithStatus({
            message: BRANCH_PRODUCTS_MESSAGES.BRANCH_PRODUCT_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        return branchProduct
      })
    } finally {
      await session.endSession()
    }
  }
}

const branchProductsService = new BranchProductsService()
export default branchProductsService
