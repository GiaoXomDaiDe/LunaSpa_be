import { ObjectId } from 'mongodb'
import { GetAllReviewsOptions } from '~/models/request/Reviews.request'
import { ItemType } from '~/models/schema/Favorite.schema'

export function buildReviewsPipeline(options: GetAllReviewsOptions) {
  const defaultOptions: Partial<Required<GetAllReviewsOptions>> = {
    limit: 10,
    page: 1,
    max_rating: 5,
    min_rating: 0
  }
  const _options = {
    limit: options.limit ?? defaultOptions.limit,
    page: options.page ?? defaultOptions.page,
    sort: options.sort,
    order: options.order,
    max_rating: options.max_rating ?? defaultOptions.max_rating,
    min_rating: options.min_rating ?? defaultOptions.min_rating,
    item_type: options.item_type,
    item_id: options.item_id,
    user_profile_id: options.user_profile_id
  }
  const pipeline: Record<string, any>[] = []
  const match: Record<string, any> = {}
  if (_options.user_profile_id) {
    match.user_profile_id = new ObjectId(_options.user_profile_id)
  }
  if (_options.item_type) {
    match.item_type = _options.item_type
  }
  if (_options.item_id) {
    match.item_id = new ObjectId(_options.item_id)
  }
  pipeline.push({ $match: match })

  if (_options.item_type === ItemType.SERVICE) {
    // Lookup thông tin dịch vụ
    pipeline.push({
      $lookup: {
        from: 'services',
        localField: 'item_id',
        foreignField: '_id',
        as: 'item_info'
      }
    })
    pipeline.push({
      $unwind: { path: '$item_info', preserveNullAndEmptyArrays: true }
    })
    // Lookup các thiết bị của dịch vụ
    pipeline.push({
      $lookup: {
        from: 'devices',
        let: { devIds: '$item_info.device_ids' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $in: ['$_id', '$$devIds'] }, { $eq: ['$status', 1] }]
              }
            }
          }
        ],
        as: 'item_info.devices'
      }
    })
    // Lookup danh mục dịch vụ
    pipeline.push({
      $lookup: {
        from: 'service_categories',
        localField: 'item_info.service_category_id',
        foreignField: '_id',
        as: 'item_info.service_category'
      }
    })
    pipeline.push({
      $unwind: { path: '$item_info.service_category', preserveNullAndEmptyArrays: true }
    })
  } else if (_options.item_type === ItemType.PRODUCT) {
    // Lookup thông tin sản phẩm
    pipeline.push({
      $lookup: {
        from: 'products',
        localField: 'item_id',
        foreignField: '_id',
        as: 'item_info'
      }
    })
    pipeline.push({
      $unwind: { path: '$item_info', preserveNullAndEmptyArrays: true }
    })
    // Lookup danh mục sản phẩm
    pipeline.push({
      $lookup: {
        from: 'product_categories',
        localField: 'item_info.category_id',
        foreignField: '_id',
        as: 'item_info.product_category'
      }
    })
    pipeline.push({
      $unwind: { path: '$item_info.product_category', preserveNullAndEmptyArrays: true }
    })
  } else {
    // Nếu không có item_type, lấy cả thông tin sản phẩm và dịch vụ rồi dùng $switch để chọn
    pipeline.push({
      $lookup: {
        from: 'products',
        let: { pid: '$item_id', type: '$item_type' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$pid'] }, { $eq: ['$$type', ItemType.PRODUCT] }]
              }
            }
          }
        ],
        as: 'product_info'
      }
    })
    pipeline.push({
      $lookup: {
        from: 'services',
        let: { sid: '$item_id', type: '$item_type' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$sid'] }, { $eq: ['$$type', ItemType.SERVICE] }]
              }
            }
          }
        ],
        as: 'service_info'
      }
    })
    pipeline.push({
      $addFields: {
        item_info: {
          $switch: {
            branches: [
              {
                case: { $eq: ['$item_type', ItemType.PRODUCT] },
                then: { $arrayElemAt: ['$product_info', 0] }
              },
              {
                case: { $eq: ['$item_type', ItemType.SERVICE] },
                then: { $arrayElemAt: ['$service_info', 0] }
              }
            ],
            default: null
          }
        }
      }
    })
    pipeline.push({
      $project: { product_info: 0, service_info: 0 }
    })
    // Lookup bổ sung cho trường hợp service
    pipeline.push({
      $lookup: {
        from: 'devices',
        let: { device_ids: '$item_info.device_ids', type: '$item_type' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$$type', ItemType.SERVICE] }, { $in: ['$_id', '$$device_ids'] }]
              }
            }
          }
        ],
        as: 'item_info.devices'
      }
    })
    pipeline.push({
      $lookup: {
        from: 'service_categories',
        let: { service_category_id: '$item_info.service_category_id', type: '$item_type' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$$type', ItemType.SERVICE] }, { $eq: ['$_id', '$$service_category_id'] }]
              }
            }
          }
        ],
        as: 'item_info.service_category'
      }
    })
    pipeline.push({
      $unwind: { path: '$item_info.service_category', preserveNullAndEmptyArrays: true }
    })
    // Lookup bổ sung cho trường hợp product
    pipeline.push({
      $lookup: {
        from: 'product_categories',
        let: { category_id: '$item_info.category_id', type: '$item_type' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$$type', ItemType.PRODUCT] }, { $eq: ['$_id', '$$category_id'] }]
              }
            }
          }
        ],
        as: 'item_info.product_category'
      }
    })
    pipeline.push({
      $unwind: { path: '$item_info.product_category', preserveNullAndEmptyArrays: true }
    })
  }
  pipeline.push({
    $addFields: {
      'item_info.item_type': '$item_type'
    }
  })
  pipeline.push({
    $project: {
      item_type: 0,
      item_id: 0,
      'item_info.device_ids': 0,
      'item_info.service_category_id': 0,
      'item_info.category_id': 0
    }
  })

  // Phân trang & đếm tổng số kết quả
  pipeline.push({
    $facet: {
      data: [{ $skip: ((_options.page as number) - 1) * (_options.limit as number) }, { $limit: _options.limit }],
      total_count: [{ $count: 'count' }]
    }
  })

  return { pipeline, _options }
}
