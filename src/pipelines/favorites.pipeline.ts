import { ObjectId } from 'mongodb'
import { GetFavoritesOfUserOptions } from '~/models/request/Favorites.request'
import { ItemType } from '~/models/schema/Favorite.schema'
import { PaginationOptions } from './roles.pipeline' // Giả sử PaginationOptions có limit, page

export const buildFavoritesPipeline = (options: GetFavoritesOfUserOptions, user_profile_id: string) => {
  const defaultOptions: Partial<Required<PaginationOptions>> = {
    limit: 10,
    page: 1
  }

  const _options = {
    limit: options.limit ?? defaultOptions.limit,
    page: options.page ?? defaultOptions.page,
    // Có thể là "product", "service" hoặc undefined nếu muốn lấy cả hai
    item_type: options.item_type
  }

  const pipeline: Record<string, any>[] = []
  const match: Record<string, any> = {}

  // Lọc theo user_profile_id (chuyển sang ObjectId)
  match.user_profile_id = new ObjectId(user_profile_id)

  // Nếu có truyền item_type, ta thêm vào filter
  if (_options.item_type) {
    match.item_type = _options.item_type
  }
  pipeline.push({ $match: match })

  // Nếu item_type được chỉ định, chỉ thực hiện lookup từ collection tương ứng
  if (_options.item_type === ItemType.SERVICE) {
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
  } else if (_options.item_type === ItemType.PRODUCT) {
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
  } else {
    // Nếu không truyền item_type, ta muốn lấy cả favorites của product và service.
    // Thực hiện lookup từ cả 2 collection rồi dùng $switch để chọn dựa trên trường item_type của favorite.
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
    // Sử dụng $addFields và $switch để gộp kết quả lookup vào 1 trường item_info
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
    // Loại bỏ các trường trung gian
    pipeline.push({
      $project: { product_info: 0, service_info: 0 }
    })
  }

  // Thêm phân trang bằng $facet
  pipeline.push({
    $facet: {
      data: [{ $skip: ((_options.page as number) - 1) * (_options.limit as number) }, { $limit: _options.limit }],
      total_count: [{ $count: 'count' }]
    }
  })

  return { pipeline, _options }
}
