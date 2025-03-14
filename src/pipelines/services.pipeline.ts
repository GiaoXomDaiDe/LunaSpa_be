import { GetAllServicesOptions } from '~/models/request/Services.request'
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
    isAdmin: options.isAdmin
  }
  const pipeline: Record<string, any>[] = []
  const match: Record<string, any> = {}
  if (!_options.isAdmin) {
    match.status = ServiceStatus.ACTIVE
  }

  if (_options.search) {
    match.$or = [
      { name: { $regex: options.search, $options: 'i' } },
      { description: { $regex: options.search, $options: 'i' } }
    ]
  }

  if (_options.service_category_id) {
    match.service_category_id = _options.service_category_id
  }
  console.log(_options.device_ids, 'device_ids')
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

  pipeline.push({
    $lookup: {
      from: 'service_categories',
      localField: 'service_category_id',
      foreignField: '_id',
      as: 'service_category'
    }
  })
  pipeline.push({
    $unwind: {
      path: '$service_category',
      preserveNullAndEmptyArrays: true
    }
  })

  pipeline.push({
    $lookup: {
      from: 'devices',
      let: { devIds: '$device_ids' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $in: ['$_id', '$$devIds'] }, { $eq: ['$status', 1] }]
            }
          }
        }
      ],
      as: 'device'
    }
  })

  pipeline.push({
    $project: {
      device_ids: 0,
      service_category_id: 0
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
