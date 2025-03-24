import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Error'
import {
  ConditionProductsReqBody,
  GetAllConditionProductsOptions,
  UpdateConditionProductsReqBody
} from '~/models/request/ConditionProducts.requests'
import { GetAllProductsOptions } from '~/models/request/Products.requests'
import ConditionProduct from '~/models/schema/ConditionProduct.schema'
import {
  buildConditionsOfProductPipeline,
  buildProductsOfConditionPipeline
} from '~/pipelines/conditionProducts.pipeline'
import databaseService from '~/services/database.services'

class ConditionProductService {
  // Lấy tất cả liên kết condition-product
  async getAllConditionProducts(options: GetAllConditionProductsOptions) {
    const defaultOptions = {
      limit: 10,
      page: 1,
      search: ''
    }

    const _options = {
      limit: options.limit ?? defaultOptions.limit,
      page: options.page ?? defaultOptions.page,
      search: options.search ?? defaultOptions.search,
      condition_id: options.condition_id,
      product_id: options.product_id,
      isAdmin: options.isAdmin
    }

    const pipeline: Record<string, any>[] = []
    const match: Record<string, any> = {}

    if (_options.condition_id) {
      match.condition_id = new ObjectId(_options.condition_id)
    }

    if (_options.product_id) {
      match.product_id = new ObjectId(_options.product_id)
    }

    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match })
    }

    // Join với conditions
    pipeline.push({
      $lookup: {
        from: 'conditions',
        localField: 'condition_id',
        foreignField: '_id',
        as: 'condition'
      }
    })

    pipeline.push({
      $unwind: {
        path: '$condition',
        preserveNullAndEmptyArrays: true
      }
    })

    // Join với products
    pipeline.push({
      $lookup: {
        from: 'products',
        localField: 'product_id',
        foreignField: '_id',
        as: 'product'
      }
    })

    pipeline.push({
      $unwind: {
        path: '$product',
        preserveNullAndEmptyArrays: true
      }
    })
    pipeline.push({
      $lookup: {
        from: 'product_categories',
        localField: 'product.category_id',
        foreignField: '_id',
        as: 'product.product_category'
      }
    })

    pipeline.push({
      $unwind: {
        path: '$product.product_category',
        preserveNullAndEmptyArrays: true
      }
    })

    // Tìm kiếm theo tên condition hoặc product
    if (_options.search) {
      pipeline.push({
        $match: {
          $or: [
            { 'condition.name': { $regex: _options.search, $options: 'i' } },
            { 'product.name': { $regex: _options.search, $options: 'i' } },
            { note: { $regex: _options.search, $options: 'i' } }
          ]
        }
      })
    }

    pipeline.push({
      $project: {
        condition_id: 0,
        product_id: 0,
        'product.category_id': 0
      }
    })

    // Đếm tổng số và phân trang
    pipeline.push({
      $facet: {
        data: [{ $skip: (_options.page - 1) * _options.limit }, { $limit: _options.limit }],
        total_count: [{ $count: 'count' }]
      }
    })

    const [result] = await databaseService.conditionProducts.aggregate(pipeline).toArray()

    return {
      data: result.data || [],
      pagination: {
        total: result.total_count[0]?.count || 0,
        page: Number(_options.page),
        limit: Number(_options.limit),
        total_pages: Math.ceil((result.total_count[0]?.count || 0) / Number(_options.limit))
      }
    }
  }

  // Lấy một liên kết condition-product theo ID
  async getConditionProduct(condition_product_id: string) {
    if (!ObjectId.isValid(condition_product_id)) {
      throw new ErrorWithStatus({
        message: 'ID liên kết không hợp lệ',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const conditionProduct = await databaseService.conditionProducts.findOne({
      _id: new ObjectId(condition_product_id)
    })

    if (!conditionProduct) {
      throw new ErrorWithStatus({
        message: 'Không tìm thấy liên kết',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Join với conditions và products để lấy thông tin đầy đủ
    const pipeline = [
      {
        $match: {
          _id: new ObjectId(condition_product_id)
        }
      },
      {
        $lookup: {
          from: 'conditions',
          localField: 'condition_id',
          foreignField: '_id',
          as: 'condition'
        }
      },
      {
        $unwind: {
          path: '$condition',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'product_categories',
          localField: 'product.category_id',
          foreignField: '_id',
          as: 'product.product_category'
        }
      },

      {
        $unwind: {
          path: '$product.product_category',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          condition_id: 0,
          product_id: 0,
          'product.category_id': 0
        }
      }
    ]

    const [result] = await databaseService.conditionProducts.aggregate(pipeline).toArray()
    return result
  }

  // Lấy danh sách products theo condition_id
  async getProductsByConditionId(condition_id: string, options: GetAllProductsOptions) {
    if (!ObjectId.isValid(condition_id)) {
      throw new ErrorWithStatus({
        message: 'ID điều kiện không hợp lệ',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra condition có tồn tại không
    const condition = await databaseService.conditions.findOne({ _id: new ObjectId(condition_id) })
    if (!condition) {
      throw new ErrorWithStatus({
        message: 'Không tìm thấy điều kiện',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const { pipeline, _options } = buildProductsOfConditionPipeline(condition_id, options)
    const [result] = await databaseService.conditionProducts.aggregate(pipeline).toArray()

    return {
      data: result.data || [],
      pagination: {
        total: result.total_count[0]?.count || 0,
        page: Number(_options.page),
        limit: Number(_options.limit),
        total_pages: Math.ceil((result.total_count[0]?.count || 0) / Number(_options.limit))
      }
    }
  }

  // Lấy danh sách conditions theo product_id
  async getConditionsByProductId(product_id: string, options: any) {
    if (!ObjectId.isValid(product_id)) {
      throw new ErrorWithStatus({
        message: 'ID sản phẩm không hợp lệ',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra product có tồn tại không
    const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) })
    if (!product) {
      throw new ErrorWithStatus({
        message: 'Không tìm thấy sản phẩm',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const { pipeline, _options } = buildConditionsOfProductPipeline(product_id, options)
    const [result] = await databaseService.conditionProducts.aggregate(pipeline).toArray()

    return {
      data: result.data || [],
      pagination: {
        total: result.total_count[0]?.count || 0,
        page: Number(_options.page),
        limit: Number(_options.limit),
        total_pages: Math.ceil((result.total_count[0]?.count || 0) / Number(_options.limit))
      }
    }
  }

  // Tạo liên kết mới giữa condition và product
  async createConditionProduct(payload: ConditionProductsReqBody) {
    const { condition_id, product_id, note } = payload

    // Kiểm tra điều kiện và sản phẩm có tồn tại không
    if (!ObjectId.isValid(condition_id)) {
      throw new ErrorWithStatus({
        message: 'ID điều kiện không hợp lệ',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    if (!ObjectId.isValid(product_id)) {
      throw new ErrorWithStatus({
        message: 'ID sản phẩm không hợp lệ',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const condition = await databaseService.conditions.findOne({ _id: new ObjectId(condition_id) })
    if (!condition) {
      throw new ErrorWithStatus({
        message: 'Không tìm thấy điều kiện',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) })
    if (!product) {
      throw new ErrorWithStatus({
        message: 'Không tìm thấy sản phẩm',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Kiểm tra liên kết đã tồn tại chưa
    const existingLink = await databaseService.conditionProducts.findOne({
      condition_id: new ObjectId(condition_id),
      product_id: new ObjectId(product_id)
    })

    if (existingLink) {
      throw new ErrorWithStatus({
        message: 'Liên kết này đã tồn tại',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Tạo liên kết mới
    const conditionProduct = new ConditionProduct({
      condition_id: new ObjectId(condition_id),
      product_id: new ObjectId(product_id),
      note: note || ''
    })

    const result = await databaseService.conditionProducts.insertOne(conditionProduct)

    // Trả về thông tin đầy đủ
    return await this.getConditionProduct(result.insertedId.toString())
  }

  // Cập nhật thông tin liên kết
  async updateConditionProduct(condition_product_id: string, payload: UpdateConditionProductsReqBody) {
    const { condition_id, product_id, note } = payload

    if (!ObjectId.isValid(condition_product_id)) {
      throw new ErrorWithStatus({
        message: 'ID liên kết không hợp lệ',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra liên kết có tồn tại không
    const conditionProduct = await databaseService.conditionProducts.findOne({
      _id: new ObjectId(condition_product_id)
    })

    if (!conditionProduct) {
      throw new ErrorWithStatus({
        message: 'Không tìm thấy liên kết',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Tạo object cập nhật
    const updateData: any = { updated_at: new Date() }

    if (condition_id !== undefined) {
      // Kiểm tra condition mới có tồn tại không
      if (!ObjectId.isValid(condition_id)) {
        throw new ErrorWithStatus({
          message: 'ID điều kiện không hợp lệ',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      const condition = await databaseService.conditions.findOne({ _id: new ObjectId(condition_id) })
      if (!condition) {
        throw new ErrorWithStatus({
          message: 'Không tìm thấy điều kiện',
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      updateData.condition_id = new ObjectId(condition_id)
    }

    if (product_id !== undefined) {
      // Kiểm tra product mới có tồn tại không
      if (!ObjectId.isValid(product_id)) {
        throw new ErrorWithStatus({
          message: 'ID sản phẩm không hợp lệ',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) })
      if (!product) {
        throw new ErrorWithStatus({
          message: 'Không tìm thấy sản phẩm',
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      updateData.product_id = new ObjectId(product_id)
    }

    if (note !== undefined) {
      updateData.note = note
    }

    // Kiểm tra xem liên kết mới đã tồn tại chưa (nếu thay đổi cả condition_id và product_id)
    if (condition_id && product_id) {
      const existingLink = await databaseService.conditionProducts.findOne({
        _id: { $ne: new ObjectId(condition_product_id) },
        condition_id: new ObjectId(condition_id),
        product_id: new ObjectId(product_id)
      })

      if (existingLink) {
        throw new ErrorWithStatus({
          message: 'Liên kết này đã tồn tại',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Kiểm tra có dữ liệu cập nhật không
    if (Object.keys(updateData).length <= 1) {
      throw new ErrorWithStatus({
        message: 'Không có dữ liệu để cập nhật',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Cập nhật
    await databaseService.conditionProducts.updateOne({ _id: new ObjectId(condition_product_id) }, { $set: updateData })

    // Trả về thông tin đầy đủ sau khi cập nhật
    return await this.getConditionProduct(condition_product_id)
  }

  // Xóa liên kết
  async deleteConditionProduct(condition_product_id: string) {
    if (!ObjectId.isValid(condition_product_id)) {
      throw new ErrorWithStatus({
        message: 'ID liên kết không hợp lệ',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra liên kết có tồn tại không
    const conditionProduct = await databaseService.conditionProducts.findOne({
      _id: new ObjectId(condition_product_id)
    })

    if (!conditionProduct) {
      throw new ErrorWithStatus({
        message: 'Không tìm thấy liên kết',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const result = await databaseService.conditionProducts.deleteOne({
      _id: new ObjectId(condition_product_id)
    })

    return { deleted: result.deletedCount > 0 }
  }
}

const conditionProductService = new ConditionProductService()
export default conditionProductService
