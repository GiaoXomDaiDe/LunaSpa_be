import { ObjectId } from 'mongodb'
import { GetSpecialtyOptions } from '~/models/request/Specialty.requests'
import { ServiceStatus } from '~/models/schema/Service.schema'

export function buildSpecialtiesPipeline(options: GetSpecialtyOptions) {
  const defaultOptions: Partial<Required<GetSpecialtyOptions>> = {
    limit: 10,
    page: 1
  }
  const _options = {
    limit: options.limit ?? defaultOptions.limit,
    page: options.page ?? defaultOptions.page,
    name: options.name,
    specialty_id: options.specialty_id,
    isAdmin: options.isAdmin
  }

  const pipeline: Record<string, any>[] = []
  const match: Record<string, any> = {}

  // Thêm điều kiện tìm kiếm nếu có
  if (_options.specialty_id) {
    match._id = new ObjectId(_options.specialty_id)
  }

  if (_options.name) {
    match.name = { $regex: _options.name, $options: 'i' }
  }

  // Thêm stage match vào pipeline nếu có điều kiện
  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match })
  }

  // Lookup devices - lấy thông tin của các thiết bị liên quan
  pipeline.push({
    $lookup: {
      from: 'devices',
      let: { device_ids: '$device_ids' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $in: ['$_id', { $ifNull: ['$$device_ids', []] }] },
                _options.isAdmin ? {} : { $ne: ['$status', 0] } // Inactive status
              ]
            }
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            status: 1,
            created_at: 1,
            updated_at: 1
          }
        }
      ],
      as: 'devices'
    }
  })

  // Lookup services - lấy thông tin của các dịch vụ liên quan
  pipeline.push({
    $lookup: {
      from: 'services',
      let: { service_ids: '$service_ids' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $in: ['$_id', { $ifNull: ['$$service_ids', []] }] },
                _options.isAdmin ? {} : { $ne: ['$status', ServiceStatus.INACTIVE] }
              ]
            }
          }
        },
        // Join với service_categories
        {
          $lookup: {
            from: 'service_categories',
            localField: 'service_category_id',
            foreignField: '_id',
            as: 'service_category'
          }
        },
        // Unwind service_category
        {
          $unwind: {
            path: '$service_category',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            status: 1,
            images: 1,
            booking_count: 1,
            view_count: 1,
            durations: 1,
            created_at: 1,
            updated_at: 1,
            service_category: 1
          }
        }
      ],
      as: 'services'
    }
  })

  // Project để chọn các trường cần thiết
  pipeline.push({
    $project: {
      _id: 1,
      name: 1,
      description: 1,
      devices: 1,
      services: 1,
      created_at: 1,
      updated_at: 1
    }
  })

  // Add pagination
  pipeline.push({
    $facet: {
      data: [
        {
          $skip: ((_options.page as number) - 1) * (_options.limit as number)
        },
        {
          $limit: _options.limit
        }
      ],
      total_count: [{ $count: 'count' }]
    }
  })

  return { pipeline, _options }
}

// Pipeline để lấy chi tiết một specialty
export function buildSpecialtyPipeline(specialty_id: string, isAdmin = false) {
  return buildSpecialtiesPipeline({
    specialty_id,
    limit: 1,
    page: 1,
    isAdmin
  }).pipeline
}
