import { ObjectId } from 'mongodb'
import { GetAllProductsOptions } from '~/models/request/Products.requests'
import { BranchServicesStatus } from '~/models/schema/BranchServices.schema'
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
    quantity: options.quantity,
    include_branch_products: options.include_branch_products
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

  if (_options.include_branch_products) {
    pipeline.push({
      $lookup: {
        from: 'branch_products',
        let: { product_id: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$product_id', '$$product_id'] }, { $eq: ['$status', BranchServicesStatus.ACTIVE] }]
              }
            }
          }
        ],
        as: 'temp_branch_products'
      }
    })

    pipeline.push({
      $addFields: {
        branch_ids: {
          $map: {
            input: '$temp_branch_products',
            as: 'bp',
            in: '$$bp.branch_id'
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
        product_status: '$status',
        branch_products_details: {
          $cond: {
            if: { $eq: [_options.include_branch_products, true] },
            then: {
              $map: {
                input: '$temp_branch_products',
                as: 'bp',
                in: {
                  branch_products_id: '$$bp._id',
                  branch_products_status: '$$bp.status',
                  branch_products_price: '$$bp.override_price',
                  branch_id: '$$bp.branch_id'
                }
              }
            },
            else: '$$REMOVE'
          }
        }
      }
    })
  }

  pipeline.push({
    $lookup: {
      from: 'product_categories',
      localField: 'category_id',
      foreignField: '_id',
      as: 'product_category'
    }
  })

  pipeline.push({
    $unwind: {
      path: '$product_category',
      preserveNullAndEmptyArrays: true
    }
  })

  pipeline.push({
    $addFields: {
      has_category: { $cond: [{ $ifNull: ['$product_category', false] }, true, false] }
    }
  })

  pipeline.push({
    $project: {
      _id: 1,
      name: 1,
      description: 1,
      images: 1,
      product_status: { $ifNull: ['$product_status', '$status'] },
      price: 1,
      discount_price: 1,
      quantity: 1,
      product_category: { $cond: [{ $eq: ['$has_category', true] }, '$product_category', null] },
      created_at: 1,
      updated_at: 1,
      branches: {
        $cond: {
          if: { $eq: [_options.include_branch_products, true] },
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
      branch_products_details: {
        $cond: {
          if: { $eq: [_options.include_branch_products, true] },
          then: {
            $map: {
              input: '$temp_branch_products',
              as: 'bp',
              in: {
                branch_products_id: '$$bp._id',
                branch_products_status: '$$bp.status',
                branch_products_price: '$$bp.override_price'
              }
            }
          },
          else: '$$REMOVE'
        }
      }
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
