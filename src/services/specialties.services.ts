import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { SPECIALTY_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import {
  CreateSpecialtyReqBody,
  GetSpecialtyOptions,
  SpecialtyQuery,
  UpdateSpecialtyReqBody
} from '~/models/request/Specialty.requests'
import Specialty from '~/models/schema/Specialties.schema'
import { buildSpecialtiesPipeline, buildSpecialtyPipeline } from '~/pipelines/specialties.pipeline'
import databaseService from '~/services/database.services'

class SpecialtiesService {
  // Lấy danh sách tất cả chuyên môn với pipeline
  async getAllSpecialties(query: SpecialtyQuery) {
    const options: GetSpecialtyOptions = {
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
      name: query.name,
      isAdmin: false
    }

    const { pipeline, _options } = buildSpecialtiesPipeline(options)
    const [result] = await databaseService.specialties.aggregate(pipeline).toArray()

    return {
      specialties: result.data || [],
      pagination: {
        page: Number(_options.page),
        limit: Number(_options.limit),
        total: result.total_count[0]?.count || 0,
        totalPages: Math.ceil((result.total_count[0]?.count || 0) / Number(_options.limit))
      }
    }
  }

  // Lấy chi tiết một chuyên môn với pipeline
  async getSpecialtyById(specialty_id: string, isAdmin = false) {
    const pipeline = buildSpecialtyPipeline(specialty_id, isAdmin)
    const [result] = await databaseService.specialties.aggregate(pipeline).toArray()

    if (!result.data || result.data.length === 0) {
      throw new ErrorWithStatus({
        message: SPECIALTY_MESSAGES.SPECIALTY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return result.data[0]
  }

  // Tạo chuyên môn mới
  async createSpecialty(payload: CreateSpecialtyReqBody) {
    const { name, description, device_ids, service_ids } = payload

    const specialty = new Specialty({
      name,
      description,
      device_ids: device_ids ? device_ids.map((id) => new ObjectId(id)) : [],
      service_ids: service_ids ? service_ids.map((id) => new ObjectId(id)) : []
    })

    const result = await databaseService.specialties.insertOne(specialty)
    if (!result.insertedId) {
      throw new ErrorWithStatus({
        message: SPECIALTY_MESSAGES.CREATE_SPECIALTY_FAILED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const newSpecialty = await this.getSpecialtyById(result.insertedId.toString())
    return newSpecialty
  }

  // Cập nhật chuyên môn
  async updateSpecialty(specialty_id: string, payload: UpdateSpecialtyReqBody) {
    const { name, description, device_ids, service_ids } = payload

    // Kiểm tra chuyên môn tồn tại
    await this.getSpecialtyById(specialty_id)

    const updateData: any = {}

    if (name !== undefined) {
      updateData.name = name
    }

    if (description !== undefined) {
      updateData.description = description
    }

    if (device_ids !== undefined) {
      updateData.device_ids = device_ids.map((id) => new ObjectId(id))
    }

    if (service_ids !== undefined) {
      updateData.service_ids = service_ids.map((id) => new ObjectId(id))
    }

    const result = await databaseService.specialties.findOneAndUpdate(
      { _id: new ObjectId(specialty_id) },
      {
        $set: updateData,
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    if (!result) {
      throw new ErrorWithStatus({
        message: SPECIALTY_MESSAGES.UPDATE_SPECIALTY_FAILED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const newSpecialty = await this.getSpecialtyById(specialty_id)
    return newSpecialty
  }

  // Xóa chuyên môn
  async deleteSpecialty(specialty_id: string) {
    // Kiểm tra chuyên môn tồn tại
    await this.getSpecialtyById(specialty_id)

    const result = await databaseService.specialties.deleteOne({ _id: new ObjectId(specialty_id) })
    return { deleted: result.deletedCount > 0 }
  }

  // Lấy danh sách dịch vụ thuộc chuyên môn
  async getServicesBySpecialtyId(specialty_id: string) {
    const specialty = await this.getSpecialtyById(specialty_id, true)
    return { services: specialty.services || [] }
  }

  // Lấy danh sách thiết bị thuộc chuyên môn
  async getDevicesBySpecialtyId(specialty_id: string) {
    const specialty = await this.getSpecialtyById(specialty_id, true)
    return { devices: specialty.devices || [] }
  }
}

const specialtiesService = new SpecialtiesService()
export default specialtiesService
