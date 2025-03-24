import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { CONDITION_PRODUCTS_MESSAGES } from '~/constants/messages'
import {
  ConditionProductsParams,
  ConditionProductsQuery,
  ConditionProductsReqBody,
  UpdateConditionProductsReqBody
} from '~/models/request/ConditionProducts.requests'
import conditionProductService from '~/services/conditionProduct.services'

// Lấy tất cả các liên kết condition-product
export const getAllConditionProductsController = async (
  req: Request<ParamsDictionary, any, any, ConditionProductsQuery>,
  res: Response,
  next: NextFunction
) => {
  const { condition_id, product_id, page, limit, search } = req.query
  const role = req.role
  const isAdmin = role?.name === 'Admin'

  const options = {
    condition_id,
    product_id,
    limit: Number(limit) || undefined,
    page: Number(page) || undefined,
    search: search || undefined,
    isAdmin
  }

  const result = await conditionProductService.getAllConditionProducts(options)

  res.status(HTTP_STATUS.OK).json({
    message: CONDITION_PRODUCTS_MESSAGES.GET_ALL_CONDITION_PRODUCTS_SUCCESS,
    result
  })
}

// Lấy chi tiết một liên kết condition-product
export const getConditionProductController = async (
  req: Request<ConditionProductsParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { condition_product_id } = req.params
    const result = await conditionProductService.getConditionProduct(condition_product_id)

    res.status(HTTP_STATUS.OK).json({
      message: CONDITION_PRODUCTS_MESSAGES.GET_CONDITION_PRODUCT_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Lấy danh sách sản phẩm theo điều kiện
export const getProductsByConditionIdController = async (
  req: Request<{ condition_id: string }, any, any, ConditionProductsQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { condition_id } = req.params
    const { page, limit, search } = req.query
    const role = req.role
    const isAdmin = role?.name === 'Admin'

    const options = {
      page: Number(page) || undefined,
      limit: Number(limit) || undefined,
      search: search || undefined,
      isAdmin
    }

    const result = await conditionProductService.getProductsByConditionId(condition_id, options)

    res.status(HTTP_STATUS.OK).json({
      message: CONDITION_PRODUCTS_MESSAGES.GET_PRODUCTS_BY_CONDITION_ID_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Lấy danh sách điều kiện theo sản phẩm
export const getConditionsByProductIdController = async (
  req: Request<{ product_id: string }, any, any, ConditionProductsQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { product_id } = req.params
    const { page, limit, search } = req.query

    const options = {
      page: Number(page) || undefined,
      limit: Number(limit) || undefined,
      search: search || undefined
    }

    const result = await conditionProductService.getConditionsByProductId(product_id, options)

    res.status(HTTP_STATUS.OK).json({
      message: CONDITION_PRODUCTS_MESSAGES.GET_CONDITIONS_BY_PRODUCT_ID_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Tạo liên kết mới
export const createConditionProductController = async (
  req: Request<ParamsDictionary, any, ConditionProductsReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await conditionProductService.createConditionProduct(req.body)

    res.status(HTTP_STATUS.CREATED).json({
      message: CONDITION_PRODUCTS_MESSAGES.CREATE_CONDITION_PRODUCT_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Cập nhật liên kết
export const updateConditionProductController = async (
  req: Request<ConditionProductsParams, any, UpdateConditionProductsReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { condition_product_id } = req.params
    const result = await conditionProductService.updateConditionProduct(condition_product_id, req.body)

    res.status(HTTP_STATUS.OK).json({
      message: CONDITION_PRODUCTS_MESSAGES.UPDATE_CONDITION_PRODUCT_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Xóa liên kết
export const deleteConditionProductController = async (
  req: Request<ConditionProductsParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { condition_product_id } = req.params
    const result = await conditionProductService.deleteConditionProduct(condition_product_id)

    res.status(HTTP_STATUS.OK).json({
      message: CONDITION_PRODUCTS_MESSAGES.DELETE_CONDITION_PRODUCT_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}
