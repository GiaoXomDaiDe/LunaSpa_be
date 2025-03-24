import { ObjectId } from 'mongodb'
import { ORDER, SORT_BY } from '~/constants/constants'
import { GetAllConditionServicesOptions } from '~/models/request/ConditionServices.requests'
import { ServiceStatus } from '~/models/schema/Service.schema'

export function buildServicesByConditionPipeline(condition_id: string, options: any) {
  const defaultOptions = {
    limit: 10,
    page: 1,
    search: ''
  }

  const _options = {
    limit: options.limit ?? defaultOptions.limit,
    page: options.page ?? defaultOptions.page,
    search: options.search ?? defaultOptions.search,
    sort: options.sort || SORT_BY[0],
    order: options.order || ORDER[0],
    isAdmin: options.isAdmin
  }

  const pipeline: Record<string, any>[] = []

  // Match condition_id
  pipeline.push({
    $match: {
      condition_id: new ObjectId(condition_id)
    }
  })

  // Join với bảng services
  pipeline.push({
    $lookup: {
      from: 'services',
      let: { sid: '$service_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$_id', '$$sid'] },
                // Nếu không phải admin, chỉ lấy dịch vụ đang hoạt động
                ...(!_options.isAdmin ? [{ $eq: ['$status', ServiceStatus.ACTIVE] }] : [])
              ]
            }
          }
        },
        // Thêm các điều kiện lọc dịch vụ
        ...(_options.search
          ? [
              {
                $match: {
                  $or: [
                    { name: { $regex: _options.search, $options: 'i' } },
                    { description: { $regex: _options.search, $options: 'i' } }
                  ]
                }
              }
            ]
          : []),
        // Join với service_categories
        {
          $lookup: {
            from: 'service_categories',
            localField: 'service_category_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        },
        // Join với devices
        {
          $lookup: {
            from: 'devices',
            let: { deviceIds: '$device_ids' },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ['$_id', '$$deviceIds'] }
                }
              }
            ],
            as: 'devices'
          }
        }
      ],
      as: 'service_info'
    }
  })

  // Unwind để lấy chỉ một dịch vụ
  pipeline.push({
    $unwind: {
      path: '$service_info',
      preserveNullAndEmptyArrays: false
    }
  })
  pipeline.push({
    $lookup: {
      from: 'devices',
      localField: 'service_info.device_ids',
      foreignField: '_id',
      as: 'service_info.devices'
    }
  })

  pipeline.push({
    $lookup: {
      from: 'service_categories',
      localField: 'service_info.service_category_id',
      foreignField: '_id',
      as: 'service_info.service_category'
    }
  })

  pipeline.push({
    $unwind: {
      path: '$service_info.service_category',
      preserveNullAndEmptyArrays: true
    }
  })

  pipeline.push({
    $project: {
      condition_id: 0,
      service_id: 0,
      'service_info.device_ids': 0,
      'service_info.service_category_id': 0
    }
  })

  // Sắp xếp theo trường được chỉ định
  const sortOrder = _options.order === ORDER[0] ? 1 : -1
  pipeline.push({
    $sort: {
      [`service_info.${_options.sort}`]: sortOrder
    }
  })

  // Phân trang và đếm tổng số
  pipeline.push({
    $facet: {
      data: [{ $skip: (_options.page - 1) * _options.limit }, { $limit: _options.limit }],
      total_count: [{ $count: 'count' }]
    }
  })

  return { pipeline, _options }
}

export function buildConditionsByServicePipeline(service_id: string, options: any) {
  const defaultOptions = {
    limit: 10,
    page: 1,
    search: ''
  }

  const _options = {
    limit: options.limit ?? defaultOptions.limit,
    page: options.page ?? defaultOptions.page,
    search: options.search ?? defaultOptions.search
  }

  const pipeline: Record<string, any>[] = []

  // Match service_id
  pipeline.push({
    $match: {
      service_id: new ObjectId(service_id)
    }
  })

  // Join với bảng conditions
  pipeline.push({
    $lookup: {
      from: 'conditions',
      let: { cid: '$condition_id' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$cid'] }
          }
        },
        // Thêm điều kiện tìm kiếm nếu có
        ...(_options.search
          ? [
              {
                $match: {
                  $or: [
                    { name: { $regex: _options.search, $options: 'i' } },
                    { description: { $regex: _options.search, $options: 'i' } },
                    { instructions: { $regex: _options.search, $options: 'i' } }
                  ]
                }
              }
            ]
          : [])
      ],
      as: 'condition_info'
    }
  })

  // Unwind để lấy chỉ một condition
  pipeline.push({
    $unwind: {
      path: '$condition_info',
      preserveNullAndEmptyArrays: false
    }
  })

  pipeline.push({
    $lookup: {
      from: 'devices',
      localField: 'condition_info.device_ids',
      foreignField: '_id',
      as: 'condition_info.devices'
    }
  })

  pipeline.push({
    $lookup: {
      from: 'service_categories',
      localField: 'condition_info.service_category_id',
      foreignField: '_id',
      as: 'condition_info.service_category'
    }
  })

  pipeline.push({
    $unwind: {
      path: '$condition_info.service_category',
      preserveNullAndEmptyArrays: true
    }
  })

  pipeline.push({
    $project: {
      condition_id: 0,
      service_id: 0
    }
  })
  // Phân trang và đếm tổng số
  const page = Number(_options.page || defaultOptions.page)
  const limit = Number(_options.limit || defaultOptions.limit)

  pipeline.push({
    $facet: {
      data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      total_count: [{ $count: 'count' }]
    }
  })

  return { pipeline, _options }
}

export function buildConditionServicesPipeline(options: GetAllConditionServicesOptions) {
  const defaultOptions = {
    limit: 10,
    page: 1,
    search: ''
  }

  const _options = {
    limit: options.limit ?? defaultOptions.limit,
    page: options.page ?? defaultOptions.page,
    search: options.search ?? defaultOptions.search,
    condition_id: options.condition_id,
    service_id: options.service_id,
    isAdmin: options.isAdmin
  }

  const pipeline: Record<string, any>[] = []
  const match: Record<string, any> = {}

  if (_options.condition_id) {
    match.condition_id = new ObjectId(_options.condition_id)
  }

  if (_options.service_id) {
    match.service_id = new ObjectId(_options.service_id)
  }

  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match })
  }

  // Join với conditions
  pipeline.push({
    $lookup: {
      from: 'conditions',
      localField: 'condition_id',
      foreignField: '_id',
      as: 'condition'
    }
  })

  pipeline.push({
    $unwind: {
      path: '$condition',
      preserveNullAndEmptyArrays: true
    }
  })

  // Join với services
  pipeline.push({
    $lookup: {
      from: 'services',
      localField: 'service_id',
      foreignField: '_id',
      as: 'service'
    }
  })

  pipeline.push({
    $unwind: {
      path: '$service',
      preserveNullAndEmptyArrays: true
    }
  })

  pipeline.push({
    $lookup: {
      from: 'devices',
      localField: 'service.device_ids',
      foreignField: '_id',
      as: 'service.devices'
    }
  })

  pipeline.push({
    $lookup: {
      from: 'service_categories',
      localField: 'service.service_category_id',
      foreignField: '_id',
      as: 'service.service_category'
    }
  })

  pipeline.push({
    $unwind: {
      path: '$service.service_category',
      preserveNullAndEmptyArrays: true
    }
  })

  // Tìm kiếm theo tên điều kiện hoặc dịch vụ
  if (_options.search) {
    pipeline.push({
      $match: {
        $or: [
          { 'condition.name': { $regex: _options.search, $options: 'i' } },
          { 'service.name': { $regex: _options.search, $options: 'i' } },
          { note: { $regex: _options.search, $options: 'i' } }
        ]
      }
    })
  }

  pipeline.push({
    $project: {
      condition_id: 0,
      service_id: 0,
      'service.device_ids': 0,
      'service.service_category_id': 0
    }
  })

  // Đếm tổng số và phân trang
  pipeline.push({
    $facet: {
      data: [{ $skip: (_options.page - 1) * _options.limit }, { $limit: _options.limit }],
      total_count: [{ $count: 'count' }]
    }
  })

  return { pipeline, _options }
}
