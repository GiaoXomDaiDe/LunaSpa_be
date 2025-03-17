import { ClientSession, ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { USER_PROFILES_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { GetAllUserProfilesOptions, UserProfileReqBody } from '~/models/request/UserProfiles.requests'
import UserProfile from '~/models/schema/UserProfile.schema'
import { buildUserProfileByAccountIdPipeline, buildUserProfilePipeline } from '~/pipelines/userProfile.pipeline'
import { buildUserProfilesPipeline } from '~/pipelines/userProfiles.pipeline'
import databaseService from '~/services/database.services'

class UserProfilesService {
  async getAllUserProfiles(options: GetAllUserProfilesOptions) {
    const { pipeline, _options } = buildUserProfilesPipeline(options)
    console.log(pipeline[0].$lookup.pipeline)
    const userProfiles = await databaseService.userProfiles.aggregate(pipeline).toArray()

    const { data, total_count } = userProfiles[0]
    const count = total_count?.[0]?.count || 0

    return {
      data,
      total_count: count,
      page: _options.page,
      limit: _options.limit,
      total_pages: Math.ceil(count / (_options.limit as number))
    }
  }
  async getUserProfile(user_profile_id: string, session?: ClientSession) {
    const pipeline = buildUserProfilePipeline(user_profile_id)
    const [userProfile] = await databaseService.userProfiles.aggregate(pipeline, { session }).toArray()
    if (!userProfile) {
      throw new Error(USER_PROFILES_MESSAGES.USER_PROFILE_NOT_FOUND)
    }
    return userProfile
  }
  async createUserProfile(body: UserProfileReqBody) {
    const userProfileData = new UserProfile({
      ...body,
      account_id: new ObjectId(body.account_id),
      condition_ids: body.condition_ids.map((condition_id) => new ObjectId(condition_id))
    })
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.userProfiles.insertOne(userProfileData, { session })
        console.log(result)
        if (!result.insertedId) {
          throw new ErrorWithStatus({
            message: USER_PROFILES_MESSAGES.CREATE_USER_PROFILE_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }
        const addedUserProfile = await this.getUserProfile(result.insertedId.toString(), session)
        if (!addedUserProfile) {
          throw new ErrorWithStatus({
            message: USER_PROFILES_MESSAGES.CREATE_USER_PROFILE_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }
        return addedUserProfile
      })
    } finally {
      await session.endSession()
    }
  }
  async updateUserProfile(body: Partial<UserProfileReqBody>, user_profile_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.userProfiles.updateOne(
          { _id: new ObjectId(user_profile_id) },
          {
            $set: {
              ...body,
              account_id: new ObjectId(body.account_id),
              condition_ids: body.condition_ids?.map((condition_id) => new ObjectId(condition_id))
            },
            $currentDate: { updated_at: true }
          },
          { session }
        )
        if (!result.modifiedCount) {
          throw new ErrorWithStatus({
            message: USER_PROFILES_MESSAGES.USER_PROFILE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        const updatedUserProfile = await this.getUserProfile(user_profile_id, session)
        return updatedUserProfile
      })
    } finally {
      await session.endSession()
    }
  }
  async deleteUserProfile(user_profile_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const userProfile = await this.getUserProfile(user_profile_id, session)
        const result = await databaseService.userProfiles.deleteOne({ _id: new ObjectId(user_profile_id) }, { session })
        if (!result.deletedCount) {
          throw new ErrorWithStatus({
            message: USER_PROFILES_MESSAGES.USER_PROFILE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return userProfile
      })
    } finally {
      await session.endSession()
    }
  }
  async addConditionsToUserProfile(user_profile_id: string, condition_ids: string[]) {
    const conditionsData = condition_ids.map((condition_id) => new ObjectId(condition_id))

    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const updatedUserProfile = await databaseService.userProfiles.findOneAndUpdate(
          { _id: new ObjectId(user_profile_id) },
          {
            $addToSet: {
              condition_ids: { $each: conditionsData }
            },
            $currentDate: {
              updated_at: true
            }
          },
          { session, returnDocument: 'after' }
        )
        if (!updatedUserProfile) {
          throw new ErrorWithStatus({
            message: USER_PROFILES_MESSAGES.USER_PROFILE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        const userProfile = await this.getUserProfile(user_profile_id, session)
        return userProfile
      })
    } finally {
      await session.endSession()
    }
  }
  async addConditionToUserProfile(user_profile_id: string, condition_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const updatedUserProfile = await databaseService.userProfiles.findOneAndUpdate(
          { _id: new ObjectId(user_profile_id) },
          {
            $addToSet: {
              condition_ids: new ObjectId(condition_id)
            },
            $currentDate: {
              updated_at: true
            }
          },
          { session, returnDocument: 'after' }
        )
        if (!updatedUserProfile) {
          throw new ErrorWithStatus({
            message: USER_PROFILES_MESSAGES.USER_PROFILE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        const userProfile = await this.getUserProfile(user_profile_id, session)
        return userProfile
      })
    } finally {
      await session.endSession()
    }
  }
  async removeCondition(condition_id: string, user_profile_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.userProfiles.findOneAndUpdate(
          { _id: new ObjectId(user_profile_id) },
          {
            $pull: {
              condition_ids: new ObjectId(condition_id)
            }
          },
          { session, returnDocument: 'after' }
        )
        if (!result) {
          throw new ErrorWithStatus({
            message: USER_PROFILES_MESSAGES.USER_PROFILE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        const userProfile = await this.getUserProfile(user_profile_id, session)
        return userProfile
      })
    } finally {
      await session.endSession()
    }
  }
  async getConditionsOfUserProfile(user_profile_id: string) {
    const pipeline = [
      {
        $match: {
          _id: new ObjectId(user_profile_id)
        }
      },
      {
        $lookup: {
          from: 'conditions',
          localField: 'condition_ids',
          foreignField: '_id',
          as: 'conditions'
        }
      },
      {
        $project: {
          condition_ids: 0,
          account_id: 0
        }
      }
    ]
    const userProfile = await databaseService.userProfiles.aggregate(pipeline).toArray()
    return userProfile[0].conditions
  }
  async getUserProfileByAccountId(account_id: string) {
    const pipeline = buildUserProfileByAccountIdPipeline(account_id)
    const userProfile = await databaseService.userProfiles.aggregate(pipeline).toArray()
    if (!userProfile) {
      throw new Error(USER_PROFILES_MESSAGES.USER_PROFILE_NOT_FOUND)
    }
    return userProfile[0]
  }
}
const userProfilesService = new UserProfilesService()

export default userProfilesService
