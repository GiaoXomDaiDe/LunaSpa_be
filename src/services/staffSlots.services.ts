import ExcelJS from 'exceljs'
import { ClientSession, ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { STAFF_SLOTS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import {
  CreateMultipleStaffSlotsReqBody,
  GenerateStaffSlotsReqBody,
  GetStaffSlotsOptions,
  StaffSlotReqBody,
  UpdateStaffSlotReqBody,
  UpdateStaffSlotStatusReqBody
} from '~/models/request/StaffSlots.requests'
import { StaffType } from '~/models/schema/StaffProfile.schema'
import StaffSlot, { StaffSlotStatus } from '~/models/schema/StaffSlot.schema'
import { buildStaffSlotPipeline, buildStaffSlotsPipeline } from '~/pipelines/staffSlots.pipeline'
import databaseService from '~/services/database.services'
import { createStaffSlotTemplate, parseStaffSlotExcel } from '~/utils/excel'

class StaffSlotsService {
  // Lấy danh sách tất cả các slot làm việc
  async getAllStaffSlots(options: GetStaffSlotsOptions) {
    const { pipeline, _options } = buildStaffSlotsPipeline(options)
    const staffSlots = await databaseService.staffSlots.aggregate(pipeline).toArray()

    const { data, total_count } = staffSlots[0] || { data: [], total_count: [] }
    const count = total_count?.[0]?.count || 0

    return {
      data,
      total_count: count,
      page: _options.page,
      limit: _options.limit,
      total_pages: Math.ceil(count / _options.limit)
    }
  }

  // Lấy chi tiết một slot làm việc
  async getStaffSlot(staff_slot_id: string, session?: ClientSession) {
    const pipeline = buildStaffSlotPipeline(staff_slot_id)
    const [staffSlot] = await databaseService.staffSlots.aggregate(pipeline, { session }).toArray()

    if (!staffSlot) {
      throw new ErrorWithStatus({
        message: STAFF_SLOTS_MESSAGES.STAFF_SLOT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return staffSlot
  }

  // Tạo mới một slot làm việc
  async createStaffSlot(body: StaffSlotReqBody) {
    const { staff_profile_id, date, start_time, end_time, status = StaffSlotStatus.AVAILABLE, order_id } = body

    // Kiểm tra xem slot có trùng lặp không
    const existingSlot = await this.checkOverlappingSlot(staff_profile_id, new Date(start_time), new Date(end_time))

    if (existingSlot) {
      throw new ErrorWithStatus({
        message: STAFF_SLOTS_MESSAGES.STAFF_SLOT_ALREADY_EXISTS,
        status: HTTP_STATUS.CONFLICT
      })
    }

    const staffSlotData = new StaffSlot({
      staff_profile_id: new ObjectId(staff_profile_id),
      date: new Date(date),
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      status,
      order_id: order_id ? new ObjectId(order_id) : undefined
    })

    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.staffSlots.insertOne(staffSlotData, { session })

        if (!result.insertedId) {
          throw new ErrorWithStatus({
            message: 'Không thể tạo slot làm việc',
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }

        const staffSlot = await this.getStaffSlot(result.insertedId.toString(), session)
        return staffSlot
      })
    } finally {
      await session.endSession()
    }
  }

  // Tạo nhiều slot làm việc cùng lúc
  async createMultipleStaffSlots(body: CreateMultipleStaffSlotsReqBody) {
    const { staff_profile_id, slots } = body

    const staffSlotsData = slots.map(
      (slot) =>
        new StaffSlot({
          staff_profile_id: new ObjectId(staff_profile_id),
          date: new Date(slot.date),
          start_time: new Date(slot.start_time),
          end_time: new Date(slot.end_time),
          status: StaffSlotStatus.AVAILABLE
        })
    )

    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        // Kiểm tra các slot có trùng lặp không
        for (const slot of slots) {
          const existingSlot = await this.checkOverlappingSlot(
            staff_profile_id,
            new Date(slot.start_time),
            new Date(slot.end_time),
            session
          )

          if (existingSlot) {
            throw new ErrorWithStatus({
              message: `Slot từ ${new Date(slot.start_time).toLocaleString()} đến ${new Date(slot.end_time).toLocaleString()} bị trùng lặp`,
              status: HTTP_STATUS.CONFLICT
            })
          }
        }

        const result = await databaseService.staffSlots.insertMany(staffSlotsData, { session })

        const createdSlots = await databaseService.staffSlots
          .find({ _id: { $in: Object.values(result.insertedIds) } }, { session })
          .toArray()

        return createdSlots
      })
    } finally {
      await session.endSession()
    }
  }

  // Tạo tự động các slot làm việc dựa trên khoảng thời gian và ngày làm việc
  async generateStaffSlots(body: GenerateStaffSlotsReqBody) {
    const { staff_profile_id, start_date, end_date, working_days, working_hours } = body
    const { start_time, end_time, slot_duration } = working_hours

    // Parse các ngày bắt đầu và kết thúc
    const startDate = new Date(start_date)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(end_date)
    endDate.setHours(23, 59, 59, 999)

    // Parse thời gian làm việc
    const [startHour, startMinute] = start_time.split(':').map(Number)

    const [endHour, endMinute] = end_time.split(':').map(Number)

    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute

    if (endTotalMinutes <= startTotalMinutes) {
      throw new ErrorWithStatus({
        message: STAFF_SLOTS_MESSAGES.END_TIME_MUST_BE_GREATER_THAN_START_TIME,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Tính số ngày giữa start_date và end_date
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const slots: StaffSlot[] = []

    // Lặp qua từng ngày
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(currentDate.getDate() + i)

      // Kiểm tra xem ngày hiện tại có phải là ngày làm việc không
      if (!working_days.includes(currentDate.getDay())) {
        continue
      }

      // Tạo các slot theo khoảng thời gian
      for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += slot_duration) {
        const slotStartTime = new Date(currentDate)
        slotStartTime.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)

        const slotEndTime = new Date(currentDate)
        const endMinutes = minutes + slot_duration
        slotEndTime.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0)

        // Không tạo slot nếu thời gian kết thúc vượt quá thời gian làm việc
        if (endMinutes > endTotalMinutes) {
          continue
        }

        const staffSlot = new StaffSlot({
          staff_profile_id: new ObjectId(staff_profile_id),
          date: new Date(currentDate),
          start_time: slotStartTime,
          end_time: slotEndTime,
          status: StaffSlotStatus.AVAILABLE
        })

        slots.push(staffSlot)
      }
    }

    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        // Kiểm tra các slot có trùng lặp không
        for (const slot of slots) {
          const existingSlot = await this.checkOverlappingSlot(
            staff_profile_id,
            slot.start_time,
            slot.end_time,
            session
          )

          if (existingSlot) {
            throw new ErrorWithStatus({
              message: `Slot từ ${slot.start_time.toLocaleString()} đến ${slot.end_time.toLocaleString()} bị trùng lặp`,
              status: HTTP_STATUS.CONFLICT
            })
          }
        }

        const result = await databaseService.staffSlots.insertMany(slots, { session })

        return {
          message: STAFF_SLOTS_MESSAGES.GENERATE_STAFF_SLOTS_SUCCESS,
          count: result.insertedCount,
          start_date: startDate,
          end_date: endDate
        }
      })
    } finally {
      await session.endSession()
    }
  }

  // Cập nhật thông tin slot làm việc
  async updateStaffSlot(staff_slot_id: string, body: UpdateStaffSlotReqBody) {
    const updateData: Record<string, any> = {}

    if (body.date) {
      updateData.date = new Date(body.date)
    }

    if (body.start_time) {
      updateData.start_time = new Date(body.start_time)
    }

    if (body.end_time) {
      updateData.end_time = new Date(body.end_time)
    }

    if (body.status) {
      updateData.status = body.status
    }

    if (body.order_id) {
      updateData.order_id = new ObjectId(body.order_id)
    }

    if (Object.keys(updateData).length === 0) {
      throw new ErrorWithStatus({
        message: STAFF_SLOTS_MESSAGES.STAFF_SLOT_NOT_UPDATED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra slot hiện tại
    const staffSlot = await this.getStaffSlot(staff_slot_id)

    // Nếu thay đổi thời gian, kiểm tra xung đột
    if (body.start_time || body.end_time) {
      const start = body.start_time ? new Date(body.start_time) : staffSlot.start_time
      const end = body.end_time ? new Date(body.end_time) : staffSlot.end_time

      // Kiểm tra thời gian hợp lệ
      if (end <= start) {
        throw new ErrorWithStatus({
          message: STAFF_SLOTS_MESSAGES.END_TIME_MUST_BE_GREATER_THAN_START_TIME,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      // Kiểm tra trùng lặp với slot khác
      const existingSlot = await this.checkOverlappingSlot(
        staffSlot.staff_profile_id.toString(),
        start,
        end,
        undefined,
        staff_slot_id
      )

      if (existingSlot) {
        throw new ErrorWithStatus({
          message: STAFF_SLOTS_MESSAGES.STAFF_SLOT_ALREADY_EXISTS,
          status: HTTP_STATUS.CONFLICT
        })
      }
    }

    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.staffSlots.findOneAndUpdate(
          { _id: new ObjectId(staff_slot_id) },
          {
            $set: updateData,
            $currentDate: { updated_at: true }
          },
          { session, returnDocument: 'after' }
        )

        if (!result) {
          throw new ErrorWithStatus({
            message: STAFF_SLOTS_MESSAGES.STAFF_SLOT_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        return result
      })
    } finally {
      await session.endSession()
    }
  }

  // Cập nhật trạng thái của slot làm việc
  async updateStaffSlotStatus(staff_slot_id: string, body: UpdateStaffSlotStatusReqBody) {
    const { status, order_id } = body

    const updateData: Record<string, any> = {
      status
    }

    if (order_id) {
      updateData.order_id = new ObjectId(order_id)
    }

    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        // Kiểm tra slot hiện tại
        const staffSlot = await this.getStaffSlot(staff_slot_id, session)

        // Kiểm tra trạng thái hiện tại
        if (staffSlot.status !== StaffSlotStatus.AVAILABLE && status === StaffSlotStatus.RESERVED) {
          throw new ErrorWithStatus({
            message: STAFF_SLOTS_MESSAGES.STAFF_SLOT_NOT_AVAILABLE,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }

        const result = await databaseService.staffSlots.findOneAndUpdate(
          { _id: new ObjectId(staff_slot_id) },
          {
            $set: updateData,
            $currentDate: {
              updated_at: true,
              ...(status === StaffSlotStatus.RESERVED ? { pending_at: true } : {})
            }
          },
          { session, returnDocument: 'after' }
        )

        if (!result) {
          throw new ErrorWithStatus({
            message: STAFF_SLOTS_MESSAGES.STAFF_SLOT_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        return result
      })
    } finally {
      await session.endSession()
    }
  }

  // Xóa slot làm việc
  async deleteStaffSlot(staff_slot_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        // Kiểm tra slot hiện tại
        const staffSlot = await this.getStaffSlot(staff_slot_id, session)

        // Không cho phép xóa slot đã được đặt
        if (staffSlot.status !== StaffSlotStatus.AVAILABLE) {
          throw new ErrorWithStatus({
            message: STAFF_SLOTS_MESSAGES.STAFF_SLOT_ALREADY_BOOKED,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }

        const result = await databaseService.staffSlots.deleteOne({ _id: new ObjectId(staff_slot_id) }, { session })

        if (!result.deletedCount) {
          throw new ErrorWithStatus({
            message: STAFF_SLOTS_MESSAGES.STAFF_SLOT_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        return {
          message: STAFF_SLOTS_MESSAGES.DELETE_STAFF_SLOT_SUCCESS
        }
      })
    } finally {
      await session.endSession()
    }
  }

  // Import Excel
  async importExcel(buffer: Buffer, staff_profile_id: string) {
    const slots = await parseStaffSlotExcel(buffer)

    const staffSlotsData = slots.map(
      (slot) =>
        new StaffSlot({
          staff_profile_id: new ObjectId(staff_profile_id),
          date: new Date(slot.date),
          start_time: new Date(slot.start_time),
          end_time: new Date(slot.end_time),
          status: slot.status || StaffSlotStatus.AVAILABLE
        })
    )

    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        // Kiểm tra các slot có trùng lặp không
        for (const slot of slots) {
          const existingSlot = await this.checkOverlappingSlot(
            staff_profile_id,
            new Date(slot.start_time),
            new Date(slot.end_time),
            session
          )

          if (existingSlot) {
            throw new ErrorWithStatus({
              message: `Slot từ ${new Date(slot.start_time).toLocaleString()} đến ${new Date(slot.end_time).toLocaleString()} bị trùng lặp`,
              status: HTTP_STATUS.CONFLICT
            })
          }
        }

        const result = await databaseService.staffSlots.insertMany(staffSlotsData, { session })

        return {
          message: STAFF_SLOTS_MESSAGES.IMPORT_EXCEL_SUCCESS,
          count: result.insertedCount
        }
      })
    } finally {
      await session.endSession()
    }
  }

  // Tạo template Excel
  async getExcelTemplate() {
    return await createStaffSlotTemplate()
  }

  // Export Excel
  async exportExcel(staff_profile_id: string, start_date?: Date, end_date?: Date) {
    const options: GetStaffSlotsOptions = {
      limit: 1000, // Lấy tối đa 1000 slot
      page: 1,
      staff_profile_id
    }

    if (start_date) {
      options.start_date = start_date
    }

    if (end_date) {
      options.end_date = end_date
    }

    const { data } = await this.getAllStaffSlots(options)

    // Tạo workbook và worksheet
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Staff Slots')

    // Thiết lập header
    worksheet.columns = [
      { header: 'ID', key: '_id', width: 25 },
      { header: 'Ngày', key: 'date', width: 15 },
      { header: 'Thời gian bắt đầu', key: 'start_time', width: 20 },
      { header: 'Thời gian kết thúc', key: 'end_time', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Nhân viên', key: 'staff_name', width: 25 }
    ]

    // Style cho header
    worksheet.getRow(1).eachCell((cell: any) => {
      cell.font = { bold: true }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    // Thêm dữ liệu
    data.forEach((slot: any) => {
      worksheet.addRow({
        _id: slot._id.toString(),
        date: new Date(slot.date).toISOString().split('T')[0],
        start_time: new Date(slot.start_time).toISOString().split('T')[1].slice(0, 5),
        end_time: new Date(slot.end_time).toISOString().split('T')[1].slice(0, 5),
        status: slot.status,
        staff_name: slot.staff_profile?.account?.name || 'Không có tên'
      })
    })

    // Tạo buffer
    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
  }

  // Kiểm tra xem có slot trùng lặp không
  private async checkOverlappingSlot(
    staff_profile_id: string,
    start_time: Date,
    end_time: Date,
    session?: ClientSession,
    excludeSlotId?: string
  ) {
    const query: Record<string, any> = {
      staff_profile_id: new ObjectId(staff_profile_id),
      $or: [
        // Trường hợp 1: start_time trong khoảng thời gian của slot khác
        {
          start_time: { $lt: end_time },
          end_time: { $gt: start_time }
        }
      ]
    }

    // Nếu có excludeSlotId, không kiểm tra slot này
    if (excludeSlotId) {
      query._id = { $ne: new ObjectId(excludeSlotId) }
    }

    const overlap = await databaseService.staffSlots.findOne(query, { session })
    return overlap
  }

  // Lấy slots có sẵn theo service_id
  async getAvailableSlotsByServiceId(service_id: string, date?: string, isHours: boolean = false) {
    // Lấy danh sách specialties có chứa service_id
    const specialties = await databaseService.specialties
      .find({
        service_ids: new ObjectId(service_id)
      })
      .toArray()

    if (!specialties || specialties.length === 0) {
      return { data: [], total_count: 0 }
    }

    const specialtyIds = specialties.map((specialty) => specialty._id)

    // Lấy danh sách staff_profiles có ít nhất một specialty phù hợp
    const staffProfiles = await databaseService.staffProfiles
      .find({
        specialty_ids: { $in: specialtyIds },
        staff_type: StaffType.PRACTITIONER
      })
      .toArray()

    if (!staffProfiles || staffProfiles.length === 0) {
      return { data: [], total_count: 0 }
    }

    const staffProfileIds = staffProfiles.map((profile) => profile._id)

    // Tạo query để lấy slots
    const query: any = {
      staff_profile_id: { $in: staffProfileIds },
      status: StaffSlotStatus.AVAILABLE
    }

    // Thêm điều kiện ngày nếu có
    if (date) {
      const selectedDate = new Date(date)
      // Đặt giờ, phút, giây và mili giây về 0 để so sánh ngày
      selectedDate.setHours(0, 0, 0, 0)

      const nextDay = new Date(selectedDate)
      nextDay.setDate(selectedDate.getDate() + 1)

      query.date = {
        $gte: selectedDate,
        $lt: nextDay
      }
    }

    // Lấy slots phù hợp và join với thông tin staff_profile
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'staffProfiles',
          localField: 'staff_profile_id',
          foreignField: '_id',
          as: 'staff_profile'
        }
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'staff_profile.account_id',
          foreignField: '_id',
          as: 'account'
        }
      },
      {
        $project: {
          _id: 1,
          staff_profile_id: 1,
          date: 1,
          start_time: 1,
          end_time: 1,
          status: 1,
          staff_name: { $arrayElemAt: ['$account.name', 0] },
          staff_avatar: { $arrayElemAt: ['$account.avatar', 0] }
        }
      },
      { $sort: { date: 1, start_time: 1 } }
    ]

    const slots = await databaseService.staffSlots.aggregate(pipeline).toArray()

    return {
      data: slots.map((slot) => ({
        ...slot,
        start_time: isHours ? slot.start_time.toISOString().split('T')[1].slice(0, 5) : slot.start_time,
        end_time: isHours ? slot.end_time.toISOString().split('T')[1].slice(0, 5) : slot.end_time
      })),
      total_count: slots.length
    }
  }
}

const staffSlotsService = new StaffSlotsService()
export default staffSlotsService
