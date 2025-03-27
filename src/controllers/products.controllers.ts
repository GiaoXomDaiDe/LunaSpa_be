import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { omitBy } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { GetAllProductsOptions, ProductParams, ProductQuery, ProductReqBody } from '~/models/request/Products.requests'
import productsService from '~/services/products.services'
import serviceProductsService from '~/services/serviceProducts.services'

/**
 * Lấy danh sách tất cả sản phẩm với phân trang và tìm kiếm
 */
export const getAllProductsController = async (
  req: Request<ParamsDictionary, any, any, ProductQuery>,
  res: Response,
  next: NextFunction
) => {
  const {
    limit,
    page,
    search,
    sort,
    max_price,
    include_branch_products,
    min_price,
    category_id,
    discount_price,
    quantity,
    order
  } = req.query

  const role = req.role
  const isAdmin = role?.name === 'Admin'

  const options: GetAllProductsOptions = {
    limit: typeof limit === 'string' ? parseInt(limit) : limit,
    page: typeof page === 'string' ? parseInt(page) : page,
    search,
    sort,
    order,
    max_price: typeof max_price === 'string' ? parseInt(max_price) : max_price,
    min_price: typeof min_price === 'string' ? parseInt(min_price) : min_price,
    category_id,
    discount_price: typeof discount_price === 'string' ? parseInt(discount_price) : discount_price,
    quantity: typeof quantity === 'string' ? parseInt(quantity) : quantity,
    isAdmin,
    include_branch_products:
      typeof include_branch_products === 'string' ? include_branch_products === 'true' : include_branch_products
  }

  const result = await productsService.getAllProducts(options)
  res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.GET_ALL_PRODUCTS_SUCCESS,
    result
  })
}

/**
 * Lấy thông tin chi tiết của một sản phẩm
 */
export const getProductController = async (
  req: Request<ProductParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { product_id } = req.params
  const product = await productsService.getProduct(product_id)
  res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.GET_PRODUCT_SUCCESS,
    result: product
  })
}

/**
 * Tạo mới một sản phẩm
 */
export const createProductController = async (
  req: Request<ParamsDictionary, any, ProductReqBody>,
  res: Response,
  next: NextFunction
) => {
  const product = await productsService.createProduct(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: PRODUCT_MESSAGES.CREATE_PRODUCT_SUCCESS,
    result: product
  })
}

/**
 * Cập nhật thông tin sản phẩm
 */
export const updateProductController = async (
  req: Request<ProductParams, any, ProductReqBody>,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body
  const updateData = omitBy(payload, (value) => value === undefined || value === '')

  if (Object.keys(updateData).length === 0) {
    throw new ErrorWithStatus({
      message: PRODUCT_MESSAGES.PRODUCT_NOT_UPDATED,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }

  const product_id = req.params.product_id
  const result = await productsService.updateProduct(updateData, product_id)

  res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.UPDATE_PRODUCT_SUCCESS,
    result
  })
}

/**
 * Xóa vĩnh viễn một sản phẩm
 */
export const deleteProductController = async (
  req: Request<ProductParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const product_id = req.params.product_id
  const result = await productsService.deleteProduct(product_id)

  res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.DELETE_PRODUCT_SUCCESS,
    result
  })
}

/**
 * Xóa mềm một sản phẩm (đặt trạng thái thành inactive)
 */
export const softDeleteProductController = async (
  req: Request<ProductParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const product_id = req.params.product_id
  const result = await productsService.softDeleteProduct(product_id)

  res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.DELETE_PRODUCT_SUCCESS,
    result
  })
}

/**
 * Lấy danh sách dịch vụ liên quan đến một sản phẩm
 */
export const getServicesByProductIdController = async (req: Request<{ product_id: string }>, res: Response) => {
  const result = await serviceProductsService.getServicesByProductId(req.params.product_id)

  res.json({
    message: 'Lấy danh sách dịch vụ của sản phẩm thành công',
    data: result
  })
}
