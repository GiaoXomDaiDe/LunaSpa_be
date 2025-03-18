import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { BRANCH_PRODUCTS_MESSAGES } from '~/constants/messages'
import {
  BranchParams,
  BranchProductsParams,
  BranchProductsReqBody,
  GetBranchProductsQuery,
  ProductParams
} from '~/models/request/BranchProducts.request'
import { BranchProductsStatus } from '~/models/schema/BranchProducts.schema'
import branchProductsService from '~/services/branchProducts.services'

export const getAllBranchProductsController = async (
  req: Request<ParamsDictionary, any, any, GetBranchProductsQuery>,
  res: Response,
  next: NextFunction
) => {
  const { branch_id, product_id, status, page, limit } = req.query

  const options = {
    branch_id: branch_id,
    product_id: product_id,
    status: status ? (parseInt(status) as BranchProductsStatus) : undefined,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined
  }

  const result = await branchProductsService.getAllBranchProducts(options)

  res.status(HTTP_STATUS.OK).json({
    message: BRANCH_PRODUCTS_MESSAGES.GET_ALL_BRANCH_PRODUCTS_SUCCESS,
    result
  })
}

export const getBranchProductsByBranchIdController = async (
  req: Request<BranchParams, any, any, GetBranchProductsQuery>,
  res: Response,
  next: NextFunction
) => {
  const { branch_id } = req.params
  const { status } = req.query

  const result = await branchProductsService.getBranchProductsByBranchId(
    branch_id,
    status ? (parseInt(status) as BranchProductsStatus) : undefined
  )

  res.status(HTTP_STATUS.OK).json({
    message: BRANCH_PRODUCTS_MESSAGES.GET_ALL_BRANCH_PRODUCTS_SUCCESS,
    result
  })
}

export const getBranchProductsByProductIdController = async (
  req: Request<ProductParams, any, any, GetBranchProductsQuery>,
  res: Response,
  next: NextFunction
) => {
  const { product_id } = req.params
  const { status } = req.query

  const result = await branchProductsService.getBranchProductsByProductId(
    product_id,
    status ? (parseInt(status) as BranchProductsStatus) : undefined
  )

  res.status(HTTP_STATUS.OK).json({
    message: BRANCH_PRODUCTS_MESSAGES.GET_ALL_BRANCH_PRODUCTS_SUCCESS,
    result
  })
}

export const getBranchProductController = async (
  req: Request<BranchProductsParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { branch_product_id } = req.params

  const result = await branchProductsService.getBranchProduct(branch_product_id)

  res.status(HTTP_STATUS.OK).json({
    message: BRANCH_PRODUCTS_MESSAGES.GET_BRANCH_PRODUCT_SUCCESS,
    result
  })
}

export const createBranchProductController = async (
  req: Request<ParamsDictionary, any, BranchProductsReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await branchProductsService.createBranchProduct(req.body)

  res.status(HTTP_STATUS.CREATED).json({
    message: BRANCH_PRODUCTS_MESSAGES.CREATE_BRANCH_PRODUCT_SUCCESS,
    result
  })
}

export const updateBranchProductController = async (
  req: Request<BranchProductsParams, any, Partial<BranchProductsReqBody>>,
  res: Response,
  next: NextFunction
) => {
  const { branch_product_id } = req.params

  const result = await branchProductsService.updateBranchProduct(branch_product_id, req.body)

  res.status(HTTP_STATUS.OK).json({
    message: BRANCH_PRODUCTS_MESSAGES.UPDATE_BRANCH_PRODUCT_SUCCESS,
    result
  })
}

export const deleteBranchProductController = async (
  req: Request<BranchProductsParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { branch_product_id } = req.params

  const result = await branchProductsService.deleteBranchProduct(branch_product_id)

  res.status(HTTP_STATUS.OK).json({
    message: BRANCH_PRODUCTS_MESSAGES.DELETE_BRANCH_PRODUCT_SUCCESS,
    result
  })
}
