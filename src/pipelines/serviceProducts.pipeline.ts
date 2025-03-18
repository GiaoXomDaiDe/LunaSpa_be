import { ObjectId } from 'mongodb'
import { GetAllServiceProductsOptions } from '~/models/request/ServiceProducts.requests'
import { ProductStatus } from '~/models/schema/Product.schema'
import { ServiceStatus } from '~/models/schema/Service.schema'

export function buildServiceProductsPipeline(options: GetAllServiceProductsOptions) {
  const defaultOptions: Partial<Required<GetAllServiceProductsOptions>> = {
    limit: 10,
    page: 1
  }
  const _options = {
    limit: options.limit ?? defaultOptions.limit,
    page: options.page ?? defaultOptions.page,
    service_id: options.service_id,
    product_id: options.product_id,
    isAdmin: options.isAdmin
  }

  const pipeline: Record<string, any>[] = []
  const match: Record<string, any> = {}

  // Chỉ áp dụng kiểm tra status nếu không phải admin
  if (!_options.isAdmin) {
    match.status = { $ne: 0 } // Inactive status
  }

  // Thêm điều kiện tìm kiếm nếu có
  if (_options.service_id) {
    match.service_id = new ObjectId(_options.service_id)
  }

  if (_options.product_id) {
    match.product_id = new ObjectId(_options.product_id)
  }

  // Thêm stage match vào pipeline nếu có điều kiện
  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match })
  }

  // Nếu chỉ truyền service_id, tập trung vào lấy products
  if (_options.service_id && !_options.product_id) {
    // Lookup product details
    pipeline.push({
      $lookup: {
        from: 'products',
        let: { product_id: '$product_id' },
        pipeline: [
          {
            $match: {
              $expr: _options.isAdmin
                ? { $eq: ['$_id', '$$product_id'] }
                : {
                    $and: [{ $eq: ['$_id', '$$product_id'] }, { $ne: ['$status', ProductStatus.INACTIVE] }]
                  }
            }
          },
          // Join với product_categories
          {
            $lookup: {
              from: 'product_categories',
              localField: 'category_id',
              foreignField: '_id',
              as: 'product_category'
            }
          },
          // Unwind product_category
          {
            $unwind: {
              path: '$product_category',
              preserveNullAndEmptyArrays: true
            }
          },
          // Join với branch_products để lấy danh sách chi nhánh
          {
            $lookup: {
              from: 'branch_products',
              let: { productId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: _options.isAdmin
                      ? { $eq: ['$product_id', '$$productId'] }
                      : {
                          $and: [{ $eq: ['$product_id', '$$productId'] }, { $eq: ['$status', 1] }]
                        }
                  }
                }
              ],
              as: 'branch_products'
            }
          },
          // Tạo mảng branch_ids từ branch_products
          {
            $addFields: {
              branch_ids: {
                $map: {
                  input: '$branch_products',
                  as: 'bp',
                  in: '$$bp.branch_id'
                }
              }
            }
          },
          // Join với branches thông qua branch_ids
          {
            $lookup: {
              from: 'branches',
              localField: 'branch_ids',
              foreignField: '_id',
              as: 'branches'
            }
          }
        ],
        as: 'product'
      }
    })

    // Unwind product array
    pipeline.push({ $unwind: '$product' })

    // Project để tạo kết quả phù hợp
    pipeline.push({
      $project: {
        _id: 1,
        service_id: 1,
        product_id: 1,
        status: 1,
        created_at: 1,
        updated_at: 1,
        product: {
          _id: '$product._id',
          name: '$product.name',
          description: '$product.description',
          price: '$product.price',
          discount_price: '$product.discount_price',
          quantity: '$product.quantity',
          images: '$product.images',
          created_at: '$product.created_at',
          updated_at: '$product.updated_at',
          product_status: '$product.status',
          branches: {
            $map: {
              input: '$product.branches',
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
              input: '$product.branch_products',
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
    })
  }
  // Nếu chỉ truyền product_id, tập trung vào lấy services
  else if (_options.product_id && !_options.service_id) {
    // Lookup service details
    pipeline.push({
      $lookup: {
        from: 'services',
        let: { service_id: '$service_id' },
        pipeline: [
          {
            $match: {
              $expr: _options.isAdmin
                ? { $eq: ['$_id', '$$service_id'] }
                : {
                    $and: [{ $eq: ['$_id', '$$service_id'] }, { $ne: ['$status', ServiceStatus.INACTIVE] }]
                  }
            }
          },
          // Join với service_categories
          {
            $lookup: {
              from: 'service_categories',
              localField: 'service_category_id',
              foreignField: '_id',
              as: 'service_category'
            }
          },
          // Unwind service_category
          {
            $unwind: {
              path: '$service_category',
              preserveNullAndEmptyArrays: true
            }
          },
          // Join với devices
          {
            $lookup: {
              from: 'devices',
              let: { deviceIds: '$device_ids' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $ne: ['$$deviceIds', null] },
                        { $ne: ['$$deviceIds', undefined] },
                        { $in: ['$_id', '$$deviceIds'] },
                        _options.isAdmin ? {} : { $eq: ['$status', 1] }
                      ]
                    }
                  }
                }
              ],
              as: 'devices'
            }
          },
          // Join với branch_services để lấy danh sách chi nhánh
          {
            $lookup: {
              from: 'branch_services',
              let: { serviceId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: _options.isAdmin
                      ? { $eq: ['$service_id', '$$serviceId'] }
                      : {
                          $and: [{ $eq: ['$service_id', '$$serviceId'] }, { $eq: ['$status', 1] }]
                        }
                  }
                }
              ],
              as: 'branch_services'
            }
          },
          // Tạo mảng branch_ids từ branch_services
          {
            $addFields: {
              branch_ids: {
                $map: {
                  input: '$branch_services',
                  as: 'bs',
                  in: '$$bs.branch_id'
                }
              }
            }
          },
          // Join với branches thông qua branch_ids
          {
            $lookup: {
              from: 'branches',
              localField: 'branch_ids',
              foreignField: '_id',
              as: 'branches'
            }
          }
        ],
        as: 'service'
      }
    })

    // Unwind service array
    pipeline.push({ $unwind: '$service' })

    // Project để tạo kết quả phù hợp
    pipeline.push({
      $project: {
        _id: 1,
        service_id: 1,
        product_id: 1,
        status: 1,
        created_at: 1,
        updated_at: 1,
        service: {
          _id: '$service._id',
          name: '$service.name',
          description: '$service.description',
          status: '$service.status',
          booking_count: '$service.booking_count',
          view_count: '$service.view_count',
          branch_id: '$service.branch_id',
          service_category_id: '$service.service_category_id',
          device_ids: '$service.device_ids',
          durations: '$service.durations',
          images: '$service.images',
          service_category: '$service.service_category',
          devices: '$service.devices',
          branches: {
            $map: {
              input: '$service.branches',
              as: 'branch',
              in: {
                _id: '$$branch._id',
                name: '$$branch.name',
                description: '$$branch.description',
                address: '$$branch.contact.address',
                phone: '$$branch.contact.phone',
                email: '$$branch.contact.email',
                images: '$$branch.images'
              }
            }
          },
          branch_services: {
            $map: {
              input: '$service.branch_services',
              as: 'bs',
              in: {
                branch_id: '$$bs.branch_id',
                status: '$$bs.status',
                override_price: '$$bs.override_price'
              }
            }
          }
        }
      }
    })
  }
  // Nếu truyền cả service_id và product_id, lấy kết quả đầy đủ
  else {
    // Lookup service details
    pipeline.push({
      $lookup: {
        from: 'services',
        let: { service_id: '$service_id' },
        pipeline: [
          {
            $match: {
              $expr: _options.isAdmin
                ? { $eq: ['$_id', '$$service_id'] }
                : {
                    $and: [{ $eq: ['$_id', '$$service_id'] }, { $ne: ['$status', ServiceStatus.INACTIVE] }]
                  }
            }
          },
          // Join với service_categories
          {
            $lookup: {
              from: 'service_categories',
              localField: 'service_category_id',
              foreignField: '_id',
              as: 'service_category'
            }
          },
          // Unwind service_category
          {
            $unwind: {
              path: '$service_category',
              preserveNullAndEmptyArrays: true
            }
          },
          // Join với devices
          {
            $lookup: {
              from: 'devices',
              let: { deviceIds: '$device_ids' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $ne: ['$$deviceIds', null] },
                        { $ne: ['$$deviceIds', undefined] },
                        { $in: ['$_id', '$$deviceIds'] },
                        _options.isAdmin ? {} : { $eq: ['$status', 1] }
                      ]
                    }
                  }
                }
              ],
              as: 'devices'
            }
          },
          // Join với branch_services để lấy danh sách chi nhánh
          {
            $lookup: {
              from: 'branch_services',
              let: { serviceId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: _options.isAdmin
                      ? { $eq: ['$service_id', '$$serviceId'] }
                      : {
                          $and: [{ $eq: ['$service_id', '$$serviceId'] }, { $eq: ['$status', 1] }]
                        }
                  }
                }
              ],
              as: 'branch_services'
            }
          },
          // Tạo mảng branch_ids từ branch_services
          {
            $addFields: {
              branch_ids: {
                $map: {
                  input: '$branch_services',
                  as: 'bs',
                  in: '$$bs.branch_id'
                }
              }
            }
          },
          // Join với branches thông qua branch_ids
          {
            $lookup: {
              from: 'branches',
              localField: 'branch_ids',
              foreignField: '_id',
              as: 'branches'
            }
          }
        ],
        as: 'service'
      }
    })

    // Lookup product details
    pipeline.push({
      $lookup: {
        from: 'products',
        let: { product_id: '$product_id' },
        pipeline: [
          {
            $match: {
              $expr: _options.isAdmin
                ? { $eq: ['$_id', '$$product_id'] }
                : {
                    $and: [{ $eq: ['$_id', '$$product_id'] }, { $ne: ['$status', ProductStatus.INACTIVE] }]
                  }
            }
          },
          // Join với product_categories
          {
            $lookup: {
              from: 'product_categories',
              localField: 'category_id',
              foreignField: '_id',
              as: 'product_category'
            }
          },
          // Unwind product_category
          {
            $unwind: {
              path: '$product_category',
              preserveNullAndEmptyArrays: true
            }
          },
          // Join với branch_products để lấy danh sách chi nhánh
          {
            $lookup: {
              from: 'branch_products',
              let: { productId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: _options.isAdmin
                      ? { $eq: ['$product_id', '$$productId'] }
                      : {
                          $and: [{ $eq: ['$product_id', '$$productId'] }, { $eq: ['$status', 1] }]
                        }
                  }
                }
              ],
              as: 'branch_products'
            }
          },
          // Tạo mảng branch_ids từ branch_products
          {
            $addFields: {
              branch_ids: {
                $map: {
                  input: '$branch_products',
                  as: 'bp',
                  in: '$$bp.branch_id'
                }
              }
            }
          },
          // Join với branches thông qua branch_ids
          {
            $lookup: {
              from: 'branches',
              localField: 'branch_ids',
              foreignField: '_id',
              as: 'branches'
            }
          }
        ],
        as: 'product'
      }
    })

    // Unwind arrays
    pipeline.push({ $unwind: '$service' })
    pipeline.push({ $unwind: '$product' })

    // Project để tạo kết quả đầy đủ
    pipeline.push({
      $project: {
        _id: 1,
        status: 1,
        created_at: 1,
        updated_at: 1,
        service: {
          _id: '$service._id',
          name: '$service.name',
          description: '$service.description',
          images: '$service.images',
          booking_count: '$service.booking_count',
          view_count: '$service.view_count',
          created_at: '$service.created_at',
          updated_at: '$service.updated_at',
          durations: '$service.durations',
          service_category: '$service.service_category',
          devices: '$service.devices',
          branches: {
            $map: {
              input: '$service.branches',
              as: 'branch',
              in: {
                _id: '$$branch._id',
                name: '$$branch.name',
                description: '$$branch.description',
                contact: '$$branch.contact',
                rating: '$$branch.rating',
                opening_hours: '$$branch.opening_hours',
                images: '$$branch.images'
              }
            }
          },
          branch_services: {
            $map: {
              input: '$service.branch_services',
              as: 'bs',
              in: {
                branch_id: '$$bs.branch_id',
                status: '$$bs.status',
                override_price: '$$bs.override_price'
              }
            }
          }
        },
        product: {
          _id: '$product._id',
          name: '$product.name',
          description: '$product.description',
          price: '$product.price',
          discount_price: '$product.discount_price',
          product_category: '$product.product_category',
          quantity: '$product.quantity',
          images: '$product.images',
          created_at: '$product.created_at',
          updated_at: '$product.updated_at',
          product_status: '$product.status',
          branches: {
            $map: {
              input: '$product.branches',
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
              input: '$product.branch_products',
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
    })
  }

  // Add pagination
  pipeline.push({
    $facet: {
      data: [
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
