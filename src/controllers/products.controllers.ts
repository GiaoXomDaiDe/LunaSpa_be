import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { omitBy } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { GetAllProductsOptions, ProductParams, ProductQuery, ProductReqBody } from '~/models/request/Products.requests'
import productsService from '~/services/products.services'
import serviceProductsService from '~/services/serviceProducts.services'

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
    limit: limit ? parseInt(limit) : undefined,
    page: page ? parseInt(page) : undefined,
    search,
    sort,
    order,
    max_price: max_price && max_price !== '' ? Number(max_price) : undefined,
    min_price: min_price && min_price !== '' ? Number(min_price) : undefined,
    category_id: category_id && category_id !== '' ? category_id : undefined,
    discount_price: discount_price && discount_price !== '' ? Number(discount_price) : undefined,
    quantity: quantity && quantity !== '' ? Number(quantity) : undefined,
    isAdmin,
    include_branch_products: include_branch_products ? include_branch_products === 'true' : false
  }
  const result = await productsService.getAllProducts(options)
  res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.GET_ALL_PRODUCTS_SUCCESS,
    result
  })
}
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

export const getServicesByProductIdController = async (req: Request<{ product_id: string }>, res: Response) => {
  const result = await serviceProductsService.getServicesByProductId(req.params.product_id)
  res.json({
    message: 'Lấy danh sách dịch vụ của sản phẩm thành công',
    data: result
  })
}
