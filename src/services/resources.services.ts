import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { ERROR_RESPONSE_MESSAGES, RESOURCE_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ResourceReqBody } from '~/models/request/Resource.requests'
import Resource from '~/models/schema/Resource.schema'
import { PaginationOptions } from '~/pipelines/roles.pipeline'
import databaseService from '~/services/database.services'

class ResourcesService {
  async getAllResources({ limit = 10, page = 1 }: PaginationOptions) {
    const result = await databaseService.resources
      .find()
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    return result
  }
  async getResource(resource_id: string) {
    const resource = await databaseService.resources.findOne({
      _id: new ObjectId(resource_id)
    })
    console.log(resource)
    if (!resource) {
      throw new ErrorWithStatus({
        message: RESOURCE_MESSAGE.RESOURCE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return resource
  }
  async createResource(body: ResourceReqBody) {
    const resourceData = new Resource({
      ...body
    })
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.resources.insertOne(resourceData, { session })
        if (!result.insertedId) {
          throw new ErrorWithStatus({
            message: ERROR_RESPONSE_MESSAGES.RESOURCE_CREATION_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }
        const resource = await databaseService.resources.findOne(
          {
            _id: result.insertedId
          },
          { session }
        )
        if (!resource) {
          throw new ErrorWithStatus({
            message: RESOURCE_MESSAGE.RESOURCE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        await databaseService.roles.updateMany(
          {},
          {
            $push: {
              resources: {
                resource_id: result.insertedId,
                create: true,
                read: true,
                update: true,
                delete: true
              }
            }
          },
          {
            session
          }
        )
        return resource
      })
    } finally {
      await session.endSession()
    }
  }
  async updateResource(body: Partial<ResourceReqBody>, resource_id: string) {
    const result = await databaseService.resources.findOneAndUpdate(
      {
        _id: new ObjectId(resource_id)
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
        message: RESOURCE_MESSAGE.RESOURCE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return result
  }
  async deleteResource(resource_id: string) {
    const resource_o_id = new ObjectId(resource_id)

    // Bắt đầu session
    const session = databaseService.getClient().startSession()

    try {
      // Bắt đầu transaction
      return await session.withTransaction(async () => {
        // Xóa resource
        const result = await databaseService.resources.findOneAndDelete({ _id: resource_o_id }, { session })

        if (result === null) {
          throw new ErrorWithStatus({
            message: RESOURCE_MESSAGE.RESOURCE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        // Xóa tất cả references trong roles
        await databaseService.roles.updateMany(
          { 'resources.resource_id': resource_o_id },
          {
            $pull: {
              resources: { resource_id: resource_o_id }
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

const resourcesService = new ResourcesService()
export default resourcesService
