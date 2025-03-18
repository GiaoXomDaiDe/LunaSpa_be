import { ClientSession, ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { SERVICE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { GetAllServicesOptions, ServiceReqBody } from '~/models/request/Services.request'
import Service, { ServiceStatus } from '~/models/schema/Service.schema'
import { buildServicePipeline } from '~/pipelines/service.pipeline'
import { buildServicesPipeline } from '~/pipelines/services.pipeline'
import databaseService from '~/services/database.services'

class ServicesService {
  async getAllServices(options: GetAllServicesOptions) {
    const { pipeline, _options } = buildServicesPipeline(options)

    const services = await databaseService.services.aggregate(pipeline).toArray()
    const { data, total_count } = services[0]
    const count = total_count?.[0]?.count || 0
    // if (data.length > 0) {
    //   const bulkOperations = data.map((doc: any) => ({
    //     updateOne: {
    //       filter: {
    //         _id: doc._id
    //       },
    //       update: {
    //         $inc: {
    //           view_count: 1
    //         }
    //       }
    //     }
    //   }))
    //   await databaseService.services.bulkWrite(bulkOperations)
    //   data.forEach((doc: any) => {
    //     if (typeof doc.view_count === 'number') {
    //       doc.view_count += 1
    //     } else {
    //       doc.view_count = 1
    //     }
    //   })
    // }
    return {
      data,
      total_count: count,
      page: _options.page,
      limit: _options.limit,
      total_pages: Math.ceil(count / (_options.limit as number))
    }
  }
  async getService(service_id: string, session?: ClientSession) {
    const pipeline = buildServicePipeline(service_id)
    const [service] = await databaseService.services.aggregate(pipeline, { session }).toArray()
    console.log(service)
    await databaseService.services.updateOne(
      {
        _id: new ObjectId(service_id)
      },
      {
        $inc: {
          view_count: 1
        },
        $set: {
          updated_at: new Date()
        }
      },
      { session }
    )
    if (!service) {
      throw new ErrorWithStatus({
        message: SERVICE_MESSAGES.SERVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    console.log(service)
    service.view_count = service.view_count + 1
    return service
  }
  async createService(body: ServiceReqBody) {
    const serviceData = new Service({
      ...body,
      service_category_id: new ObjectId(body.service_category_id),
      device_ids: body.device_ids?.map((device_id) => new ObjectId(device_id))
    })
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.services.insertOne(serviceData)
        console.log(result)
        if (!result.insertedId) {
          throw new ErrorWithStatus({
            message: SERVICE_MESSAGES.CREATE_SERVICE_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }
        const service = await this.getService(result.insertedId.toString())
        if (!service) {
          throw new ErrorWithStatus({
            message: SERVICE_MESSAGES.SERVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return service
      })
    } finally {
      await session.endSession()
    }
  }
  async updateService(body: Partial<ServiceReqBody>, service_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.services.updateOne(
          { _id: new ObjectId(service_id) },
          {
            $set: {
              ...body,
              service_category_id: new ObjectId(body.service_category_id),
              device_ids: body.device_ids?.map((device_id) => new ObjectId(device_id))
            },
            $currentDate: { updated_at: true }
          },
          { session }
        )
        if (!result.modifiedCount) {
          throw new ErrorWithStatus({
            message: SERVICE_MESSAGES.SERVICE_NOT_UPDATED,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }
        const service = await this.getService(service_id, session)
        return service
      })
    } finally {
      await session.endSession()
    }
  }
  async deleteService(service_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const service = await this.getService(service_id, session)
        const result = await databaseService.services.deleteOne({ _id: new ObjectId(service_id) }, { session })
        if (!result.deletedCount) {
          throw new ErrorWithStatus({
            message: SERVICE_MESSAGES.SERVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return service
      })
    } finally {
      await session.endSession()
    }
  }
  async softDeleteService(service_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.services.findOneAndUpdate(
          { _id: new ObjectId(service_id) },
          { $set: { status: ServiceStatus.INACTIVE }, $currentDate: { updated_at: true } },
          { returnDocument: 'after', session }
        )
        if (result === null) {
          throw new ErrorWithStatus({
            message: SERVICE_MESSAGES.SERVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        const service = await this.getService(result._id.toString(), session)
        return service
      })
    } finally {
      await session.endSession()
    }
  }
}

const servicesService = new ServicesService()

export default servicesService
