import { ClientSession, ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { BRANCH_SERVICES_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { BranchServicesReqBody, GetBranchServicesOptions } from '~/models/request/BranchServices.request'
import BranchServices, { BranchServicesStatus } from '~/models/schema/BranchServices.schema'
import databaseService from '~/services/database.services'

class BranchServicesService {
  async getAllBranchServices(options: GetBranchServicesOptions) {
    const { limit = 10, page = 1, branch_id, service_id, status } = options

    const filter: any = {}
    if (branch_id) {
      filter.branch_id = new ObjectId(branch_id)
    }
    if (service_id) {
      filter.service_id = new ObjectId(service_id)
    }
    if (status !== undefined) {
      filter.status = status
    }

    const [branchServices, total] = await Promise.all([
      databaseService.branchServices
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      databaseService.branchServices.countDocuments(filter)
    ])

    return {
      data: branchServices,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit)
      }
    }
  }

  async getBranchServicesByBranchId(branch_id: string, status?: BranchServicesStatus) {
    const filter: any = { branch_id: new ObjectId(branch_id) }
    if (status !== undefined) {
      filter.status = status
    }

    return databaseService.branchServices.find(filter).toArray()
  }

  async getBranchServicesByServiceId(service_id: string, status?: BranchServicesStatus) {
    const filter: any = { service_id: new ObjectId(service_id) }
    if (status !== undefined) {
      filter.status = status
    }

    return databaseService.branchServices.find(filter).toArray()
  }

  async getBranchService(branch_service_id: string, session?: ClientSession) {
    const branchService = await databaseService.branchServices.findOne(
      { _id: new ObjectId(branch_service_id) },
      { session }
    )

    if (!branchService) {
      throw new ErrorWithStatus({
        message: BRANCH_SERVICES_MESSAGES.BRANCH_SERVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return branchService
  }

  async createBranchService(body: BranchServicesReqBody) {
    const { branch_id, service_id, status, override_price } = body

    // Kiểm tra liên kết đã tồn tại chưa
    const existingBranchService = await databaseService.branchServices.findOne({
      branch_id: new ObjectId(branch_id),
      service_id: new ObjectId(service_id)
    })

    if (existingBranchService) {
      throw new ErrorWithStatus({
        message: BRANCH_SERVICES_MESSAGES.BRANCH_SERVICE_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra branch tồn tại
    const branch = await databaseService.branches.findOne({ _id: new ObjectId(branch_id) })
    if (!branch) {
      throw new ErrorWithStatus({
        message: BRANCH_SERVICES_MESSAGES.BRANCH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Kiểm tra service tồn tại
    const service = await databaseService.services.findOne({ _id: new ObjectId(service_id) })
    if (!service) {
      throw new ErrorWithStatus({
        message: BRANCH_SERVICES_MESSAGES.SERVICE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const branchServiceData = new BranchServices({
      branch_id: new ObjectId(branch_id),
      service_id: new ObjectId(service_id),
      status: status || BranchServicesStatus.ACTIVE,
      override_price
    })

    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.branchServices.insertOne(branchServiceData, { session })
        if (!result.insertedId) {
          throw new ErrorWithStatus({
            message: BRANCH_SERVICES_MESSAGES.CREATE_BRANCH_SERVICE_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }

        return this.getBranchService(result.insertedId.toString(), session)
      })
    } finally {
      await session.endSession()
    }
  }

  async updateBranchService(branch_service_id: string, body: Partial<BranchServicesReqBody>) {
    const updateData: Record<string, any> = {}

    if (body.status !== undefined) {
      updateData.status = body.status
    }

    if (body.override_price !== undefined) {
      updateData.override_price = body.override_price
    }

    if (Object.keys(updateData).length === 0) {
      throw new ErrorWithStatus({
        message: BRANCH_SERVICES_MESSAGES.NO_DATA_TO_UPDATE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.branchServices.findOneAndUpdate(
          { _id: new ObjectId(branch_service_id) },
          { $set: updateData, $currentDate: { updated_at: true } },
          { returnDocument: 'after', session }
        )

        if (!result) {
          throw new ErrorWithStatus({
            message: BRANCH_SERVICES_MESSAGES.BRANCH_SERVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        return result
      })
    } finally {
      await session.endSession()
    }
  }

  async deleteBranchService(branch_service_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const branchService = await this.getBranchService(branch_service_id, session)

        const result = await databaseService.branchServices.deleteOne(
          { _id: new ObjectId(branch_service_id) },
          { session }
        )

        if (!result.deletedCount) {
          throw new ErrorWithStatus({
            message: BRANCH_SERVICES_MESSAGES.BRANCH_SERVICE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        return branchService
      })
    } finally {
      await session.endSession()
    }
  }
}

const branchServicesService = new BranchServicesService()
export default branchServicesService
