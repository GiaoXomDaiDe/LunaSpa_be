import { ObjectId } from 'mongodb'
import { ORDER, SORT_BY } from '~/constants/constants'
import { GetAllProductsOptions } from '~/models/request/Products.requests'
import { buildProductsFilterStages } from '~/pipelines/servicesProducts.pipeline'

export function buildProducsOfConditionPipeline(condition_id: string, options: GetAllProductsOptions) {
  const pipeline: Record<string, any>[] = []

  pipeline.push({
    $match: {
      condition_id: new ObjectId(condition_id)
    }
  })

  const { _options, pipeline: productFilterStages } = buildProductsFilterStages(options)
  const sortField = _options.sort || SORT_BY[0]
  const sortOrder = _options.order === ORDER[0] ? 1 : -1
  pipeline.push({
    $lookup: {
      from: 'products',
      localField: 'product_id',
      foreignField: '_id',
      pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pid'] } } }, ...productFilterStages],
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

  pipeline.push({
    $sort: {
      [`product_info.${sortField}`]: sortOrder
    }
  })

  pipeline.push({
    $facet: {
      products: [{ $skip: ((_options.page as number) - 1) * (_options.limit as number) }, { $limit: _options.limit }],
      total: [{ $count: 'count' }]
    }
  })

  return pipeline
}
