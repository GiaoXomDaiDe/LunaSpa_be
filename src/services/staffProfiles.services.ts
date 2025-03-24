import { ClientSession, ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { STAFF_PROFILES_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { GetAllStaffProfilesOptions, StaffProfileReqBody } from '~/models/request/StaffProfiles.requests'
import StaffProfile from '~/models/schema/StaffProfile.schema'
import { buildStaffProfileByAccountIdPipeline, buildStaffProfilePipeline } from '~/pipelines/staffProfile.pipeline'
import { buildStaffProfilesPipeline } from '~/pipelines/staffProfiles.pipeline'
import databaseService from '~/services/database.services'

class StaffProfilesService {
  async getAllStaffProfiles(options: GetAllStaffProfilesOptions) {
    const { pipeline, _options } = buildStaffProfilesPipeline(options)
    const staffProfiles = await databaseService.staffProfiles.aggregate(pipeline).toArray()

    const { data, total_count } = staffProfiles[0]
    const count = total_count?.[0]?.count || 0

    return {
      data,
      total_count: count,
      page: _options.page,
      limit: _options.limit,
      total_pages: Math.ceil(count / (_options.limit as number))
    }
  }
  async getStaffProfile(staff_profile_id: string, session?: ClientSession) {
    const pipeline = buildStaffProfilePipeline(staff_profile_id)
    const [staffProfile] = await databaseService.staffProfiles.aggregate(pipeline, { session }).toArray()
    if (!staffProfile) {
      throw new Error(STAFF_PROFILES_MESSAGES.STAFF_PROFILE_NOT_FOUND)
    }
    return staffProfile
  }
  async createStaffProfile(body: StaffProfileReqBody) {
    const staffProfileData = new StaffProfile({
      ...body,
      account_id: new ObjectId(body.account_id),
      specialty_ids: body.specialty_ids?.map((specialty_id) => new ObjectId(specialty_id)) || []
    })
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.staffProfiles.insertOne(staffProfileData, { session })
        if (!result.insertedId) {
          throw new ErrorWithStatus({
            message: STAFF_PROFILES_MESSAGES.CREATE_STAFF_PROFILE_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }
        const addedStaffProfile = await this.getStaffProfile(result.insertedId.toString(), session)
        if (!addedStaffProfile) {
          throw new ErrorWithStatus({
            message: STAFF_PROFILES_MESSAGES.CREATE_STAFF_PROFILE_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }
        return addedStaffProfile
      })
    } finally {
      await session.endSession()
    }
  }
  async updateStaffProfile(body: Partial<StaffProfileReqBody>, staff_profile_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const updateData: any = { ...body }
        if (body.account_id) {
          updateData.account_id = new ObjectId(body.account_id)
        }
        if (body.specialty_ids) {
          updateData.specialty_ids = body.specialty_ids.map((specialty_id) => new ObjectId(specialty_id))
        }

        const result = await databaseService.staffProfiles.updateOne(
          { _id: new ObjectId(staff_profile_id) },
          {
            $set: updateData,
            $currentDate: { updated_at: true }
          },
          { session }
        )
        if (!result.modifiedCount) {
          throw new ErrorWithStatus({
            message: STAFF_PROFILES_MESSAGES.STAFF_PROFILE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        const updatedStaffProfile = await this.getStaffProfile(staff_profile_id, session)
        return updatedStaffProfile
      })
    } finally {
      await session.endSession()
    }
  }
  async deleteStaffProfile(staff_profile_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const staffProfile = await this.getStaffProfile(staff_profile_id, session)
        const result = await databaseService.staffProfiles.deleteOne(
          { _id: new ObjectId(staff_profile_id) },
          { session }
        )
        if (!result.deletedCount) {
          throw new ErrorWithStatus({
            message: STAFF_PROFILES_MESSAGES.STAFF_PROFILE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return staffProfile
      })
    } finally {
      await session.endSession()
    }
  }
  async addSpecialtiesToStaffProfile(staff_profile_id: string, specialty_ids: string[]) {
    const specialtiesData = specialty_ids.map((specialty_id) => new ObjectId(specialty_id))

    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const updatedStaffProfile = await databaseService.staffProfiles.findOneAndUpdate(
          { _id: new ObjectId(staff_profile_id) },
          {
            $addToSet: {
              specialty_ids: { $each: specialtiesData }
            },
            $currentDate: {
              updated_at: true
            }
          },
          { session, returnDocument: 'after' }
        )
        if (!updatedStaffProfile) {
          throw new ErrorWithStatus({
            message: STAFF_PROFILES_MESSAGES.STAFF_PROFILE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        const staffProfile = await this.getStaffProfile(staff_profile_id, session)
        return staffProfile
      })
    } finally {
      await session.endSession()
    }
  }
  async addSpecialtyToStaffProfile(staff_profile_id: string, specialty_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const updatedStaffProfile = await databaseService.staffProfiles.findOneAndUpdate(
          { _id: new ObjectId(staff_profile_id) },
          {
            $addToSet: {
              specialty_ids: new ObjectId(specialty_id)
            },
            $currentDate: {
              updated_at: true
            }
          },
          { session, returnDocument: 'after' }
        )
        if (!updatedStaffProfile) {
          throw new ErrorWithStatus({
            message: STAFF_PROFILES_MESSAGES.STAFF_PROFILE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        const staffProfile = await this.getStaffProfile(staff_profile_id, session)
        return staffProfile
      })
    } finally {
      await session.endSession()
    }
  }
  async removeSpecialty(specialty_id: string, staff_profile_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.staffProfiles.updateOne(
          { _id: new ObjectId(staff_profile_id) },
          {
            $pull: {
              specialty_ids: new ObjectId(specialty_id)
            },
            $currentDate: {
              updated_at: true
            }
          },
          { session }
        )
        if (!result.modifiedCount) {
          throw new ErrorWithStatus({
            message: STAFF_PROFILES_MESSAGES.STAFF_PROFILE_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        const staffProfile = await this.getStaffProfile(staff_profile_id, session)
        return staffProfile
      })
    } finally {
      await session.endSession()
    }
  }
  async getSpecialtiesOfStaffProfile(staff_profile_id: string) {
    const staffProfile = await this.getStaffProfile(staff_profile_id)
    return staffProfile.specialties
  }
  async getStaffProfileByAccountId(account_id: string) {
    const pipeline = buildStaffProfileByAccountIdPipeline(account_id)
    const [staffProfile] = await databaseService.staffProfiles.aggregate(pipeline).toArray()
    return staffProfile
  }
}

const staffProfilesService = new StaffProfilesService()
export default staffProfilesService
