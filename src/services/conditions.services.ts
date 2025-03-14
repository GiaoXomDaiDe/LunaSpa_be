import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { CONDITION_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ConditionReqBody, GetAllConditionsOptions } from '~/models/request/Conditons.request'
import Condition from '~/models/schema/Condition.schema'
import databaseService from '~/services/database.services'

class ConditionsService {
  async getAllConditions({ limit = 10, page = 1, search = '', isAdmin = false }: GetAllConditionsOptions = {}) {
    const filter: any = {}
    if (search.trim()) {
      filter.name = { $regex: search, $options: 'i' }
    }
    console.log(filter)
    const conditions = await databaseService.conditions
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()
    const totalConditions = await databaseService.conditions.countDocuments(filter)
    const totalPages = Math.ceil(totalConditions / limit)
    return {
      conditions,
      totalConditions,
      totalPages,
      limit,
      page
    }
  }
  async getCondition(condition_id: string) {
    const condition = await databaseService.conditions.findOne({ _id: new ObjectId(condition_id) })
    if (!condition) {
      throw new ErrorWithStatus({
        message: CONDITION_MESSAGES.CONDITION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return condition
  }
  async createCondition(body: ConditionReqBody) {
    const conditionData = new Condition({
      ...body
    })
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.conditions.insertOne(conditionData, { session })
        if (!result.insertedId) {
          throw new ErrorWithStatus({
            message: CONDITION_MESSAGES.CREATE_CONDITION_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }
        const condition = await databaseService.conditions.findOne({ _id: result.insertedId }, { session })
        if (!condition) {
          throw new ErrorWithStatus({
            message: CONDITION_MESSAGES.CONDITION_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return condition
      })
    } finally {
      await session.endSession()
    }
  }
  async updateCondition(body: Partial<ConditionReqBody>, condition_id: string) {
    const result = await databaseService.conditions.findOneAndUpdate(
      { _id: new ObjectId(condition_id) },
      {
        $set: body,
        $currentDate: {
          updated_at: true
        }
      },
      { returnDocument: 'after' }
    )
    if (!result) {
      throw new ErrorWithStatus({
        message: CONDITION_MESSAGES.UPDATE_CONDITION_FAILED,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }
    return result
  }
  async deleteCondition(condition_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.conditions.findOneAndDelete(
          { _id: new ObjectId(condition_id) },
          { session }
        )
        if (!result) {
          throw new ErrorWithStatus({
            message: CONDITION_MESSAGES.CONDITION_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return result
      })
    } finally {
      await session.endSession()
    }
  }
}

const conditionsService = new ConditionsService()
export default conditionsService
