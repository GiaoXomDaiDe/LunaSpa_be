import { ObjectId } from 'mongodb'
import { GetAllOrdersOptions } from '~/models/request/Orders.request'

export function buildOrderPipeline(order_id: string) {
  const pipeline: Record<string, any>[] = []

  pipeline.push({
    $match: {
      _id: new ObjectId(order_id)
    }
  })

  // Lookup customer
  pipeline.push({
    $lookup: {
      from: 'accounts',
      localField: 'customer_account_id',
      foreignField: '_id',
      as: 'customer'
    }
  })

  pipeline.push({
    $unwind: {
      path: '$customer',
      preserveNullAndEmptyArrays: true
    }
  })

  // Loại bỏ các thông tin nhạy cảm của customer
  pipeline.push({
    $project: {
      'customer.password': 0,
      'customer.email_verify_token': 0,
      'customer.forgot_password_token': 0
    }
  })

  // Lookup branch
  pipeline.push({
    $lookup: {
      from: 'branches',
      localField: 'branch_id',
      foreignField: '_id',
      as: 'branch'
    }
  })

  pipeline.push({
    $unwind: {
      path: '$branch',
      preserveNullAndEmptyArrays: true
    }
  })

  // Lookup order details
  pipeline.push({
    $lookup: {
      from: 'order_details',
      localField: '_id',
      foreignField: 'order_id',
      as: 'items'
    }
  })

  // Lookup transaction
  pipeline.push({
    $lookup: {
      from: 'transactions',
      let: { order_id: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$order_id', '$$order_id']
            }
          }
        },
        {
          $sort: {
            created_at: -1
          }
        },
        {
          $limit: 1
        }
      ],
      as: 'transaction'
    }
  })

  pipeline.push({
    $unwind: {
      path: '$transaction',
      preserveNullAndEmptyArrays: true
    }
  })

  return pipeline
}

export function buildOrdersPipeline(options: GetAllOrdersOptions) {
  const defaultOptions = {
    limit: 10,
    page: 1,
    customer_id: '',
    branch_id: '',
    status: undefined as any,
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    order_id: ''
  }

  const _options = {
    limit: options.limit ?? defaultOptions.limit,
    page: options.page ?? defaultOptions.page,
    customer_id: options.customer_id ?? defaultOptions.customer_id,
    branch_id: options.branch_id ?? defaultOptions.branch_id,
    status: options.status ?? defaultOptions.status,
    start_date: options.start_date ?? defaultOptions.start_date,
    end_date: options.end_date ?? defaultOptions.end_date,
    order_id: options.order_id ?? defaultOptions.order_id
  }

  const { limit, page, customer_id, branch_id, status, start_date, end_date, order_id } = _options
  const skip = (page - 1) * limit

  const pipeline: Record<string, any>[] = []
  const match: Record<string, any> = {}

  // Lọc theo order_id
  if (order_id) {
    try {
      match._id = new ObjectId(order_id)
    } catch (error) {
      // Nếu order_id không phải là ObjectId hợp lệ, sẽ không match với bất kỳ đơn hàng nào
      // Điều này cho phép API trả về mảng rỗng thay vì lỗi
      match._id = new ObjectId('000000000000000000000000')
    }
  }

  // Lọc theo customer_id
  if (customer_id) {
    match.customer_account_id = new ObjectId(customer_id)
  }

  // Lọc theo branch_id
  if (branch_id) {
    match.branch_id = new ObjectId(branch_id)
  }

  // Lọc theo status
  if (status) {
    match.status = status
  }

  // Lọc theo thời gian
  if (start_date && end_date) {
    match.created_at = {
      $gte: start_date,
      $lte: end_date
    }
  } else if (start_date) {
    match.created_at = {
      $gte: start_date
    }
  } else if (end_date) {
    match.created_at = {
      $lte: end_date
    }
  }

  if (Object.keys(match).length > 0) {
    pipeline.push({
      $match: match
    })
  }

  // Lookup customer
  pipeline.push({
    $lookup: {
      from: 'accounts',
      localField: 'customer_account_id',
      foreignField: '_id',
      as: 'customer'
    }
  })

  pipeline.push({
    $unwind: {
      path: '$customer',
      preserveNullAndEmptyArrays: true
    }
  })

  // Loại bỏ các thông tin nhạy cảm của customer
  pipeline.push({
    $project: {
      'customer.password': 0,
      'customer.email_verify_token': 0,
      'customer.forgot_password_token': 0
    }
  })

  // Lookup branch
  pipeline.push({
    $lookup: {
      from: 'branches',
      localField: 'branch_id',
      foreignField: '_id',
      as: 'branch'
    }
  })

  pipeline.push({
    $unwind: {
      path: '$branch',
      preserveNullAndEmptyArrays: true
    }
  })

  // Lookup order details
  pipeline.push({
    $lookup: {
      from: 'order_details',
      localField: '_id',
      foreignField: 'order_id',
      as: 'items'
    }
  })

  // Phân trang
  pipeline.push({
    $facet: {
      data: [
        {
          $sort: {
            created_at: -1
          }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        }
      ],
      total_count: [
        {
          $count: 'count'
        }
      ]
    }
  })

  return { pipeline, _options }
}
