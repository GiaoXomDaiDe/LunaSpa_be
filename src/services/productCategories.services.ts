import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { ERROR_RESPONSE_MESSAGES, PRODUCT_CATEGORY_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ProductCategoryReqBody } from '~/models/request/ProductCategory.requests'
import { ProductStatus } from '~/models/schema/Product.schema'
import ProductCategory from '~/models/schema/ProductCategory.schema'
import databaseService from '~/services/database.services'

class ProductCategoriesService {
  async getAllProductCategories() {
    const result = await databaseService.productCategories.find({}).toArray()
    console.log(result)
    return result
  }

  async getProductCategory(product_category_id: string) {
    const productCategory = await databaseService.productCategories.findOne({
      _id: new ObjectId(product_category_id)
    })
    if (!productCategory) {
      throw new ErrorWithStatus({
        message: PRODUCT_CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return productCategory
  }

  async createProductCategory(body: ProductCategoryReqBody) {
    const productCategoryData = new ProductCategory({
      ...body
    })
    const result = await databaseService.productCategories.insertOne(productCategoryData)
    if (!result.insertedId) {
      throw new ErrorWithStatus({
        message: ERROR_RESPONSE_MESSAGES.RESOURCE_CREATION_FAILED,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }
    const productCategory = await databaseService.productCategories.findOne({
      _id: result.insertedId
    })
    if (!productCategory) {
      throw new ErrorWithStatus({
        message: PRODUCT_CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return productCategory
  }

  async updateProductCategory(body: Partial<ProductCategoryReqBody>, productCategory_id: string) {
    const result = await databaseService.productCategories.findOneAndUpdate(
      {
        _id: new ObjectId(productCategory_id)
      },
      {
        $set: body,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    if (result === null) {
      throw new ErrorWithStatus({
        message: PRODUCT_CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return result
  }

  async deleteProductCategory(product_category_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.productCategories.findOneAndDelete(
          {
            _id: new ObjectId(product_category_id)
          },
          { session }
        )
        if (result === null) {
          throw new ErrorWithStatus({
            message: PRODUCT_CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        await databaseService.products.updateMany(
          {
            category_id: new ObjectId(product_category_id)
          },
          {
            $set: {
              category_id: new ObjectId(''),
              status: ProductStatus.INACTIVE
            },
            $currentDate: {
              updated_at: true
            }
          },
          { session }
        )
        return result
      })
    } finally {
      await session.endSession()
    }

    // Có thể thêm logic để xóa tham chiếu ở các bảng liên quan
    // Ví dụ: Cập nhật sản phẩm có danh mục này thành null hoặc danh mục mặc định
  }
}

const productCategoriesService = new ProductCategoriesService()
export default productCategoriesService
