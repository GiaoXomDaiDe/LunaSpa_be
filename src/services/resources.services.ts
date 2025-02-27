import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { ERROR_RESPONSE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ResourceReqBody } from '~/models/request/Resource.requests'
import Resource from '~/models/schema/Resource.schema'
import databaseService from '~/services/database.services'

class ResourcesService {
  async getAllResources({ limit, page }: { limit: number; page: number }) {
    const result = await databaseService.resources
      .find()
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    console.log(result)
    return result
  }
  async getResource(resource_id: string) {
    const resource = await databaseService.resources.findOne({
      _id: new ObjectId(resource_id)
    })
    console.log(resource)
    if (!resource) {
      throw new ErrorWithStatus({
        message: ERROR_RESPONSE_MESSAGES.RESOURCE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return resource
  }
  async createResource(body: ResourceReqBody) {
    const resourceData = new Resource({
      ...body
    })
    const result = await databaseService.resources.insertOne(resourceData)
    if (!result.insertedId) {
      throw new ErrorWithStatus({
        message: ERROR_RESPONSE_MESSAGES.RESOURCE_CREATION_FAILED,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }
    const resource = await databaseService.resources.findOne({
      _id: result.insertedId
    })
    if (!resource) {
      throw new ErrorWithStatus({
        message: ERROR_RESPONSE_MESSAGES.RESOURCE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    await databaseService.roles.updateMany(
      {},
      {
        $push: {
          resources: {
            resource_id: result.insertedId,
            create: false,
            read: false,
            update: false,
            delete: false
          }
        }
      }
    )
    return resource
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
    console.log(result)
    if (result === null) {
      throw new ErrorWithStatus({
        message: ERROR_RESPONSE_MESSAGES.RESOURCE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return result
  }
  async deleteResource(resource_id: string) {
    const resource_o_id = new ObjectId(resource_id)
    const result = await databaseService.resources.findOneAndDelete({
      _id: new ObjectId(resource_o_id)
    })
    if (result === null) {
      throw new ErrorWithStatus({
        message: ERROR_RESPONSE_MESSAGES.RESOURCE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const a = await databaseService.roles.updateMany(
      { 'resources.resource_id': resource_o_id },
      {
        $pull: {
          resources: { resource_id: resource_o_id }
        }
      }
    )
    console.log(a)
  }
}

const resourcesService = new ResourcesService()
export default resourcesService
