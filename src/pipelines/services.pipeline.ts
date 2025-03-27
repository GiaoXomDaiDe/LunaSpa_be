import { GetAllServicesOptions } from '~/models/request/Services.request'
import { BranchServicesStatus } from '~/models/schema/BranchServices.schema'
import { ServiceStatus } from '~/models/schema/Service.schema'

export function buildServicesPipeline(options: GetAllServicesOptions) {
  const defaultOptions: Partial<Required<GetAllServicesOptions>> = {
    limit: 10,
    page: 1,
    search: ''
  }
  const _options = {
    limit: options.limit ?? defaultOptions.limit,
    page: options.page ?? defaultOptions.page,
    search: options.search ?? defaultOptions.search,
    sort: options.sort,
    order: options.order,
    service_category_id: options.service_category_id,
    device_ids: options.device_ids,
    min_booking_count: options.min_booking_count,
    max_booking_count: options.max_booking_count,
    min_view_count: options.min_view_count,
    max_view_count: options.max_view_count,
    isAdmin: options.isAdmin,
    include_branch_services: options.include_branch_services || false
  }
  const pipeline: Record<string, any>[] = []
  const match: Record<string, any> = {}

  if (!_options.isAdmin) {
    match.status = ServiceStatus.ACTIVE
  }

  if (_options.search) {
    match.$or = [
      { name: { $regex: _options.search, $options: 'i' } },
      { description: { $regex: _options.search, $options: 'i' } }
    ]
  }

  if (_options.service_category_id) {
    match.service_category_id = _options.service_category_id
  }

  if (_options.device_ids) {
    match.device_ids = { $all: _options.device_ids }
  }

  if (_options.min_booking_count) {
    match.booking_count = { ...(match.booking_count || {}), $gte: _options.min_booking_count }
  }
  if (_options.max_booking_count) {
    match.booking_count = { ...(match.booking_count || {}), $lte: _options.max_booking_count }
  }

  if (_options.min_view_count) {
    match.view_count = { ...(match.view_count || {}), $gte: _options.min_view_count }
  }
  if (_options.max_view_count) {
    match.view_count = { ...(match.view_count || {}), $lte: _options.max_view_count }
  }

  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match })
  }

  if (_options.include_branch_services) {
    pipeline.push({
      $lookup: {
        from: 'branch_services',
        let: { service_id: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$service_id', '$$service_id'] }, { $eq: ['$status', BranchServicesStatus.ACTIVE] }]
              }
            }
          }
        ],
        as: 'temp_branch_services'
      }
    })

    pipeline.push({
      $addFields: {
        branch_ids: {
          $map: {
            input: '$temp_branch_services',
            as: 'bs',
            in: '$$bs.branch_id'
          }
        }
      }
    })

    pipeline.push({
      $lookup: {
        from: 'branches',
        localField: 'branch_ids',
        foreignField: '_id',
        as: 'branches'
      }
    })

    pipeline.push({
      $addFields: {
        service_status: '$status',
        branch_services_details: {
          $map: {
            input: '$temp_branch_services',
            as: 'bs',
            in: {
              branch_services_id: '$$bs._id',
              branch_services_status: '$$bs.status'
            }
          }
        }
      }
    })
  }

  pipeline.push({
    $lookup: {
      from: 'devices',
      let: { devIds: { $ifNull: ['$device_ids', []] } },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $in: ['$_id', '$$devIds'] }, { $eq: ['$status', 1] }]
            }
          }
        }
      ],
      as: 'devices'
    }
  })

  pipeline.push({
    $lookup: {
      from: 'service_categories',
      localField: 'service_category_id',
      foreignField: '_id',
      as: 'service_category'
    }
  })

  pipeline.push({
    $project: {
      _id: 1,
      name: 1,
      description: 1,
      images: 1,
      service_status: 1,
      booking_count: 1,
      view_count: 1,
      durations: 1,
      devices: 1,
      service_category: 1,
      created_at: 1,
      updated_at: 1,
      branches: {
        $cond: {
          if: { $eq: [_options.include_branch_services, true] },
          then: {
            $map: {
              input: '$branches',
              as: 'branch',
              in: {
                _id: '$$branch._id',
                name: '$$branch.name',
                description: '$$branch.description',
                rating: '$$branch.rating',
                images: '$$branch.images',
                opening_hours: '$$branch.opening_hours',
                contact: '$$branch.contact'
              }
            }
          },
          else: '$$REMOVE'
        }
      },
      branch_services_details: {
        $cond: {
          if: { $eq: [_options.include_branch_services, true] },
          then: 1,
          else: '$$REMOVE'
        }
      }
    }
  })

  pipeline.push({
    $unwind: {
      path: '$service_category',
      preserveNullAndEmptyArrays: true
    }
  })

  pipeline.push({
    $facet: {
      data: [
        {
          $sort: {
            [_options.sort as string]: _options.order === 'asc' ? 1 : -1
          }
        },
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
