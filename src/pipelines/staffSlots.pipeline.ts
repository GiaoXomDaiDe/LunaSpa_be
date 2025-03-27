import { ObjectId } from 'mongodb'
import { GetStaffSlotsOptions } from '~/models/request/StaffSlots.requests'
import { StaffSlotStatus } from '~/models/schema/StaffSlot.schema'

export function buildStaffSlotsPipeline(options: GetStaffSlotsOptions) {
  const defaultOptions = {
    limit: 10,
    page: 1,
    staff_profile_id: '',
    date: undefined as Date | undefined,
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    status: undefined as StaffSlotStatus | undefined
  }

  const _options = {
    ...defaultOptions,
    ...options
  }

  // Đảm bảo page và limit luôn là số
  const page = Number(_options.page) || 1
  const limit = Number(_options.limit) || 10
  const { staff_profile_id, date, start_date, end_date, status } = _options
  const skip = (page - 1) * limit

  const pipeline: Record<string, any>[] = []
  const match: Record<string, any> = {}

  // Nếu có staff_profile_id thì thêm điều kiện
  if (staff_profile_id) {
    match.staff_profile_id = new ObjectId(staff_profile_id)
  }

  // Nếu có date thì thêm điều kiện
  if (date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    match.date = {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }
  // Nếu có start_date và end_date thì thêm điều kiện
  else if (start_date && end_date) {
    const startOfStartDate = new Date(start_date)
    startOfStartDate.setHours(0, 0, 0, 0)

    const endOfEndDate = new Date(end_date)
    endOfEndDate.setHours(23, 59, 59, 999)

    match.date = {
      $gte: startOfStartDate,
      $lte: endOfEndDate
    }
  }
  // Nếu chỉ có start_date thì lọc từ start_date đến hiện tại
  else if (start_date) {
    const startOfStartDate = new Date(start_date)
    startOfStartDate.setHours(0, 0, 0, 0)

    match.date = {
      $gte: startOfStartDate
    }
  }
  // Nếu chỉ có end_date thì lọc từ đầu đến end_date
  else if (end_date) {
    const endOfEndDate = new Date(end_date)
    endOfEndDate.setHours(23, 59, 59, 999)

    match.date = {
      $lte: endOfEndDate
    }
  }

  // Nếu có status thì thêm điều kiện
  if (status) {
    match.status = status
  }

  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match })
  }

  // Lookup staff_profile và order
  pipeline.push(
    {
      $lookup: {
        from: 'staff_profiles',
        localField: 'staff_profile_id',
        foreignField: '_id',
        as: 'staff_profile'
      }
    },
    {
      $unwind: {
        path: '$staff_profile',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'accounts',
        localField: 'staff_profile.account_id',
        foreignField: '_id',
        as: 'staff_profile.account'
      }
    },
    {
      $unwind: {
        path: '$staff_profile.account',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'orders',
        localField: 'order_id',
        foreignField: '_id',
        as: 'order'
      }
    },
    {
      $unwind: {
        path: '$order',
        preserveNullAndEmptyArrays: true
      }
    }
  )

  // Project để loại bỏ các field không cần thiết
  pipeline.push({
    $project: {
      'staff_profile.account.password': 0,
      'staff_profile.account.email_verify_token': 0,
      'staff_profile.account.forgot_password_token': 0
    }
  })

  // Facet để phân trang
  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      total_count: [{ $count: 'count' }]
    }
  })

  return { pipeline, _options: { ..._options, page, limit } }
}

export function buildStaffSlotPipeline(staff_slot_id: string) {
  const pipeline: Record<string, any>[] = []

  pipeline.push({
    $match: {
      _id: new ObjectId(staff_slot_id)
    }
  })

  // Lookup staff_profile và order
  pipeline.push(
    {
      $lookup: {
        from: 'staff_profiles',
        localField: 'staff_profile_id',
        foreignField: '_id',
        as: 'staff_profile'
      }
    },
    {
      $unwind: {
        path: '$staff_profile',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'accounts',
        localField: 'staff_profile.account_id',
        foreignField: '_id',
        as: 'staff_profile.account'
      }
    },
    {
      $unwind: {
        path: '$staff_profile.account',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'orders',
        localField: 'order_id',
        foreignField: '_id',
        as: 'order'
      }
    },
    {
      $unwind: {
        path: '$order',
        preserveNullAndEmptyArrays: true
      }
    }
  )

  // Project để loại bỏ các field không cần thiết
  pipeline.push({
    $project: {
      'staff_profile.account.password': 0,
      'staff_profile.account.email_verify_token': 0,
      'staff_profile.account.forgot_password_token': 0
    }
  })

  return pipeline
}
