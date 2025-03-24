import { ObjectId } from 'mongodb'
import { ORDER, SORT_BY } from '~/constants/constants'
import { GetAllProductsOptions } from '~/models/request/Products.requests'
import { ProductStatus } from '~/models/schema/Product.schema'

export function buildProductsOfConditionPipeline(condition_id: string, options: GetAllProductsOptions) {
  const defaultOptions: Partial<Required<GetAllProductsOptions>> = {
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
    isAdmin: options.isAdmin,
    category_id: options.category_id,
    min_price: options.min_price,
    max_price: options.max_price
  }

  const pipeline: Record<string, any>[] = []

  // Match condition_id
  pipeline.push({
    $match: {
      condition_id: new ObjectId(condition_id)
    }
  })

  // Join với bảng products
  pipeline.push({
    $lookup: {
      from: 'products',
      let: { pid: '$product_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$_id', '$$pid'] },
                // Nếu không phải admin, chỉ lấy sản phẩm đang hoạt động
                ...(!_options.isAdmin ? [{ $eq: ['$status', ProductStatus.ACTIVE] }] : [])
              ]
            }
          }
        },
        // Thêm các điều kiện lọc sản phẩm
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
        ...(_options.category_id
          ? [
              {
                $match: {
                  category_id: new ObjectId(_options.category_id)
                }
              }
            ]
          : []),
        ...(_options.min_price || _options.max_price
          ? [
              {
                $match: {
                  ...(_options.min_price && { price: { $gte: _options.min_price } }),
                  ...(_options.max_price && { price: { $lte: _options.max_price } })
                }
              }
            ]
          : []),
        // Join với product_categories
        {
          $lookup: {
            from: 'product_categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        }
      ],
      as: 'product_info'
    }
  })
  pipeline.push({
    $lookup: {
      from: 'product_categories',
      localField: 'product_info.category_id',
      foreignField: '_id',
      as: 'product_info.product_category'
    }
  })
  pipeline.push({
    $unwind: {
      path: '$product_info.product_category',
      preserveNullAndEmptyArrays: true
    }
  })
  // Unwind để lấy chỉ một sản phẩm
  pipeline.push({
    $unwind: {
      path: '$product_info',
      preserveNullAndEmptyArrays: false
    }
  })
  pipeline.push({
    $project: {
      product_id: 0,
      'product_info.category_id': 0
    }
  })

  // Sắp xếp theo trường được chỉ định
  const sortOrder = _options.order === ORDER[0] ? 1 : -1
  pipeline.push({
    $sort: {
      [`product_info.${_options.sort}`]: sortOrder
    }
  })

  // Phân trang và đếm tổng số
  pipeline.push({
    $facet: {
      data: [{ $skip: ((_options.page as number) - 1) * (_options.limit as number) }, { $limit: _options.limit }],
      total_count: [{ $count: 'count' }]
    }
  })

  return { pipeline, _options }
}

export function buildConditionsOfProductPipeline(product_id: string, options: any) {
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

  // Match product_id
  pipeline.push({
    $match: {
      product_id: new ObjectId(product_id)
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
                    { description: { $regex: _options.search, $options: 'i' } }
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
