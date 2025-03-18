import { ObjectId } from 'mongodb'
import { BranchProductsStatus } from '~/models/schema/BranchProducts.schema'
import { BranchServicesStatus } from '~/models/schema/BranchServices.schema'

export function buildBranchPipeline(branch_id: string) {
  const pipeline: Record<string, any>[] = []

  pipeline.push({
    $match: {
      _id: new ObjectId(branch_id)
    }
  })

  pipeline.push({
    $lookup: {
      from: 'branch_services',
      localField: '_id',
      foreignField: 'branch_id',
      as: 'branch_services'
    }
  })

  pipeline.push({
    $addFields: {
      service_ids: {
        $map: {
          input: '$branch_services',
          as: 'bs',
          in: '$$bs.service_id'
        }
      }
    }
  })

  pipeline.push({
    $lookup: {
      from: 'services',
      let: {
        serviceIds: '$service_ids'
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ['$_id', '$$serviceIds']
            }
          }
        },
        {
          $lookup: {
            from: 'branch_services',
            let: {
              service_id: '$_id'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$service_id', '$$service_id'] }, { $eq: ['$branch_id', new ObjectId(branch_id)] }]
                  }
                }
              }
            ],
            as: 'branch_service'
          }
        },
        {
          $addFields: {
            branch_service: { $arrayElemAt: ['$branch_service', 0] }
          }
        },
        {
          $addFields: {
            status: '$branch_service.status',
            override_price: '$branch_service.override_price'
          }
        },
        {
          $match: {
            status: BranchServicesStatus.ACTIVE
          }
        },
        {
          $lookup: {
            from: 'service_categories',
            localField: 'service_category_id',
            foreignField: '_id',
            as: 'service_category'
          }
        },
        {
          $unwind: {
            path: '$service_category',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'devices',
            let: {
              devIds: '$device_ids'
            },
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
        }
      ],
      as: 'services'
    }
  })

  // Lookup branch products
  pipeline.push({
    $lookup: {
      from: 'branch_products',
      localField: '_id',
      foreignField: 'branch_id',
      as: 'branch_products'
    }
  })

  // Add product_ids field
  pipeline.push({
    $addFields: {
      product_ids: {
        $map: {
          input: '$branch_products',
          as: 'bp',
          in: '$$bp.product_id'
        }
      }
    }
  })

  // Lookup products
  pipeline.push({
    $lookup: {
      from: 'products',
      let: {
        productIds: '$product_ids'
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ['$_id', '$$productIds']
            }
          }
        },
        {
          $lookup: {
            from: 'branch_products',
            let: {
              product_id: '$_id'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$product_id', '$$product_id'] }, { $eq: ['$branch_id', new ObjectId(branch_id)] }]
                  }
                }
              }
            ],
            as: 'branch_product'
          }
        },
        {
          $addFields: {
            branch_product: { $arrayElemAt: ['$branch_product', 0] }
          }
        },
        {
          $addFields: {
            status: '$branch_product.status',
            override_price: '$branch_product.override_price'
          }
        },
        {
          $match: {
            status: BranchProductsStatus.ACTIVE
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
        }
      ],
      as: 'products'
    }
  })

  pipeline.push({
    $project: {
      branch_services: 0,
      branch_products: 0,
      service_ids: 0,
      product_ids: 0,
      'services.branch_service': 0,
      'services.device_ids': 0,
      'services.service_category_id': 0,
      'products.branch_product': 0,
      'products.category_id': 0
    }
  })

  return pipeline
}
