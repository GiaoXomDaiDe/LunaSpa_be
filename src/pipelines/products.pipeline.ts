import { ObjectId } from 'mongodb'
import { GetAllProductsOptions } from '~/models/request/Products.requests'
import { ProductStatus } from '~/models/schema/Product.schema'

export function buildProductsPipeline(options: GetAllProductsOptions) {
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
