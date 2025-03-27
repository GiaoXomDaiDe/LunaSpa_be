import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { ERROR_RESPONSE_MESSAGES, SERVICE_CATEGORY_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ServiceCategoryReqBody } from '~/models/request/ServiceCategory.requests'
import { ServiceStatus } from '~/models/schema/Service.schema'
import ServiceCategoy from '~/models/schema/ServiceCategory.schema'
import { PaginationOptions } from '~/pipelines/roles.pipeline'
import databaseService from '~/services/database.services'

class ServiceCategoriesService {
  async getAllServiceCategories({ limit = 10, page = 1 }: PaginationOptions) {
    const result = await databaseService.serviceCategories
      .find()
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    return result
  }

  async getServiceCategory(serviceCategory_id: string) {
    const serviceCategory = await databaseService.serviceCategories.findOne({
      _id: new ObjectId(serviceCategory_id)
    })
    if (!serviceCategory) {
      throw new ErrorWithStatus({
        message: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return serviceCategory
  }

  async createServiceCategory(body: ServiceCategoryReqBody) {
    const serviceCategoryData = new ServiceCategoy({
      ...body
    })

    // Bắt đầu session
    const session = databaseService.getClient().startSession()

    try {
      // Bắt đầu transaction
      return await session.withTransaction(async () => {
        const result = await databaseService.serviceCategories.insertOne(serviceCategoryData, { session })
        if (!result.insertedId) {
          throw new ErrorWithStatus({
            message: ERROR_RESPONSE_MESSAGES.RESOURCE_CREATION_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }
        const serviceCategory = await databaseService.serviceCategories.findOne(
          {
            _id: result.insertedId
          },
          { session }
        )
        if (!serviceCategory) {
          throw new ErrorWithStatus({
            message: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return serviceCategory
      })
    } finally {
      // Kết thúc session
      await session.endSession()
    }
  }

  async updateServiceCategory(body: Partial<ServiceCategoryReqBody>, serviceCategory_id: string) {
    const result = await databaseService.serviceCategories.findOneAndUpdate(
      {
        _id: new ObjectId(serviceCategory_id)
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
        message: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return result
  }

  async deleteServiceCategory(service_category_id: string) {
    // Bắt đầu session
    const session = databaseService.getClient().startSession()

    try {
      // Bắt đầu transaction
      return await session.withTransaction(async () => {
        // Xóa danh mục
        const result = await databaseService.serviceCategories.findOneAndDelete(
          { _id: new ObjectId(service_category_id) },
          { session }
        )

        if (result === null) {
          throw new ErrorWithStatus({
            message: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        await databaseService.services.updateMany(
          {
            service_category_id: new ObjectId(service_category_id)
          },
          {
            $set: {
              status: ServiceStatus.INACTIVE
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
      // Kết thúc session
      await session.endSession()
    }
  }
}

const serviceCategoriesService = new ServiceCategoriesService()
export default serviceCategoriesService
