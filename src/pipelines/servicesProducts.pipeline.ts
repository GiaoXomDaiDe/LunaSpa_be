// utils/buildProductsFilterStages.ts
import { ObjectId } from 'mongodb'
import { ORDER, SORT_BY } from '~/constants/constants'
import { GetAllProductsOptions } from '~/models/request/Products.requests'
import { ProductStatus } from '~/models/schema/Product.schema'

// Trả về 1 mảng "stage" chủ yếu là $match để lọc product
export function buildProductsFilterStages(options: GetAllProductsOptions) {
  const defaultOptions: Partial<Required<GetAllProductsOptions>> = {
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
    isAdmin: options.isAdmin,
    category_id: options.category_id,
    min_price: options.min_price,
    max_price: options.max_price,
    discount_price: options.discount_price,
    quantity: options.quantity
  }
  const pipeline: Record<string, any>[] = []
  const match: Record<string, any> = {}

  if (!_options.isAdmin) {
    match.status = ProductStatus.ACTIVE
  }

  if (_options.search) {
    match.$or = [
      { name: { $regex: options.search, $options: 'i' } },
      { description: { $regex: options.search, $options: 'i' } }
    ]
  }

  if (_options.min_price) {
    match.price = { ...(match.price || {}), $gte: _options.min_price }
  }
  if (_options.max_price) {
    match.price = { ...(match.price || {}), $lte: _options.max_price }
  }
  if (_options.category_id) {
    match.category_id = new ObjectId(_options.category_id)
  }

  if (_options.discount_price) {
    match.discount_price = { ...(match.discount_price || {}), $lte: _options.discount_price }
  }

  if (_options.quantity) {
    match.quantity = { ...(match.quantity || {}), $lte: _options.quantity }
  }

  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match })
  }

  pipeline.push({
    $lookup: {
      from: 'product_categories',
      localField: 'category_id',
      foreignField: '_id',
      as: 'category'
    }
  })

  pipeline.push({
    $unwind: {
      path: '$category',
      preserveNullAndEmptyArrays: true
    }
  })
  pipeline.push({
    $project: {
      category_id: 0
    }
  })
  // => Lúc này, stages chỉ lọc & lookup category. Chưa phân trang
  return { pipeline, _options }
}

export function buildProductsByServiceIdPipeline(service_id: string, options: GetAllProductsOptions) {
  const pipeline: Record<string, any>[] = []

  pipeline.push({
    $match: {
      service_id: new ObjectId(service_id)
    }
  })
  // 2) $lookup sang products
  // Lấy stages filter product => buildProductsFilterStages(options)
  const { _options, pipeline: productFilterStages } = buildProductsFilterStages(options)
  const sortField = _options.sort || SORT_BY[0]
  const sortOrder = _options.order === ORDER[0] ? 1 : -1
  pipeline.push({
    $lookup: {
      from: 'products',
      let: { pid: '$product_id' }, // doc service_products
      pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pid'] } } }, ...productFilterStages],
      as: 'product_info'
    }
  })

  // 3) unwind product_info => 1 doc ~ 1 product
  pipeline.push({
    $unwind: {
      path: '$product_info',
      preserveNullAndEmptyArrays: false
    }
  })
  pipeline.push({
    $project: {
      product_id: 0
    }
  })

  // 4) sort => sort theo product_info.<field>
  pipeline.push({
    $sort: {
      [`product_info.${sortField}`]: sortOrder
    }
  })

  // 5) phân trang + đếm => facet
  pipeline.push({
    $facet: {
      data: [{ $skip: ((_options.page as number) - 1) * (_options.limit as number) }, { $limit: _options.limit }],
      total_count: [{ $count: 'count' }]
    }
  })

  return pipeline
}
export function buildOneProductOfServicePipeline(service_id: string, product_id: string) {
  const pipeline: Record<string, any>[] = []

  pipeline.push({
    $match: {
      service_id: new ObjectId(service_id),
      product_id: new ObjectId(product_id)
    }
  })

  pipeline.push({
    $lookup: {
      from: 'products',
      let: { pid: '$product_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$pid'] // so khớp product._id == pid
            }
          }
        }
      ],
      as: 'product_info'
    }
  })

  pipeline.push({
    $unwind: {
      path: '$product_info',
      preserveNullAndEmptyArrays: false
    }
  })
  pipeline.push({
    $project: {
      product_id: 0
    }
  })

  // Tuỳ bạn, có thể lookup categories hay project field
  // Ở đây ta giản lược
  return pipeline
}
