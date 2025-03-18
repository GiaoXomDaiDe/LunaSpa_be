import { ClientSession, ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { BRANCHES_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { BranchReqBody, GetAllBranchesOptions } from '~/models/request/Branches.requests'
import Branch, { BranchStatus } from '~/models/schema/Branch.schema'
import { buildBranchPipeline } from '~/pipelines/branch.pipeline'
import { buildBranchesPipeline } from '~/pipelines/branches.pipeline'
import databaseService from '~/services/database.services'

class BranchesService {
  async getAllBranches(options: GetAllBranchesOptions) {
    const { pipeline, _options } = buildBranchesPipeline(options)

    const branches = await databaseService.branches.aggregate(pipeline).toArray()

    const { data, total_count } = branches[0]
    const count = total_count?.[0]?.count || 0
    return {
      data,
      total_count: count,
      page: _options.page,
      limit: _options.limit,
      total_pages: Math.ceil(count / (_options.limit as number))
    }
  }
  async getBranch(branch_id: string, session?: ClientSession) {
    const pipeline = buildBranchPipeline(branch_id)
    const [branch] = await databaseService.branches.aggregate(pipeline, { session }).toArray()
    if (!branch) {
      throw new ErrorWithStatus({
        message: BRANCHES_MESSAGES.BRANCH_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return branch
  }
  async createBranch(body: BranchReqBody) {
    const branchData = new Branch({
      ...body
    })
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.branches.insertOne(branchData)
        console.log(result)
        if (!result.insertedId) {
          throw new ErrorWithStatus({
            message: BRANCHES_MESSAGES.CREATED_BRANCH_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }
        const branch = await this.getBranch(result.insertedId.toString())
        if (!branch) {
          throw new ErrorWithStatus({
            message: BRANCHES_MESSAGES.BRANCH_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return branch
      })
    } finally {
      await session.endSession()
    }
  }
  async updateBranch(body: Partial<BranchReqBody>, branch_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.branches.updateOne(
          { _id: new ObjectId(branch_id) },
          {
            $set: {
              ...body
            },
            $currentDate: { updated_at: true }
          },
          { session }
        )
        if (!result.modifiedCount) {
          throw new ErrorWithStatus({
            message: BRANCHES_MESSAGES.BRANCH_NOT_UPDATED,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }
        const branch = await this.getBranch(branch_id, session)
        return branch
      })
    } finally {
      await session.endSession()
    }
  }
  async deleteBranch(branch_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const branch = await this.getBranch(branch_id, session)
        const result = await databaseService.branches.deleteOne({ _id: new ObjectId(branch_id) }, { session })
        if (!result.deletedCount) {
          throw new ErrorWithStatus({
            message: BRANCHES_MESSAGES.BRANCH_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return branch
      })
    } finally {
      await session.endSession()
    }
  }
  async softDeleteBranch(branch_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.branches.findOneAndUpdate(
          { _id: new ObjectId(branch_id) },
          { $set: { status: BranchStatus.INACTIVE }, $currentDate: { updated_at: true } },
          { returnDocument: 'after', session }
        )
        if (result === null) {
          throw new ErrorWithStatus({
            message: BRANCHES_MESSAGES.BRANCH_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        const branch = await this.getBranch(result._id.toString(), session)
        return branch
      })
    } finally {
      await session.endSession()
    }
  }
}

const branchesService = new BranchesService()

export default branchesService
