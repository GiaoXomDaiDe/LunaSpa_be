import { ObjectId } from 'mongodb'
import { BranchServicesStatus } from '~/models/schema/BranchServices.schema'

export const buildProductPipeline = (product_id: string) => {
  const match: Record<string, ObjectId> = {
    _id: new ObjectId(product_id)
  }
  const pipeline = [
    { $match: match },
    {
      $addFields: {
        images: { $ifNull: ['$images', []] }
      }
    },
    {
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
    },
    {
      $addFields: {
        branch_ids: {
          $map: {
            input: '$temp_branch_products',
            as: 'bp',
            in: '$$bp.branch_id'
          }
        }
      }
    },
    {
      $lookup: {
        from: 'branches',
        localField: 'branch_ids',
        foreignField: '_id',
        as: 'branches'
      }
    },
    {
      $addFields: {
        product_status: '$status',
        branch_products_details: {
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
        }
      }
    },
    {
      $lookup: {
        from: 'product_categories',
        localField: 'category_id',
        foreignField: '_id',
        as: 'product_category'
      }
    },
    {
      $unwind: {
        path: '$product_category',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        has_category: { $cond: [{ $ifNull: ['$product_category', false] }, true, false] }
      }
    },
    {
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
        branch_products_details: {
          $map: {
            input: '$temp_branch_products',
            as: 'bp',
            in: {
              branch_products_id: '$$bp._id',
              branch_products_status: '$$bp.status',
              branch_products_price: '$$bp.override_price'
            }
          }
        }
      }
    }
  ]
  return pipeline
}
