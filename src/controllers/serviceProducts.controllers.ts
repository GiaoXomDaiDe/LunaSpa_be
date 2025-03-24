import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { SERVICE_PRODUCTS_MESSAGES } from '~/constants/messages'
import {
  ServiceProductsParams,
  ServiceProductsQuery,
  ServiceProductsReqBody,
  UpdateServiceProductsReqBody
} from '~/models/request/ServiceProducts.requests'
import serviceProductsService from '~/services/serviceProducts.services'

export const getAllServiceProductsController = async (
  req: Request<ParamsDictionary, any, any, ServiceProductsQuery>,
  res: Response,
  next: NextFunction
) => {
  const { service_id, product_id, page, limit, status } = req.query
  const role = req.role
  const isAdmin = role?.name === 'Admin'
  const options = {
    service_id: service_id,
    product_id: product_id,
    limit: Number(limit) || undefined,
    page: Number(page) || undefined,
    isAdmin,
    status: status ? Number(status) : undefined
  }
  const result = await serviceProductsService.getAllServiceProducts(options)
  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_PRODUCTS_MESSAGES.GET_ALL_SERVICE_PRODUCTS_SUCCESS,
    result
  })
}

export const getRecommendedProductsController = async (
  req: Request<{ service_id: string }, any, any, ServiceProductsQuery>,
  res: Response,
  next: NextFunction
) => {
  const { service_id } = req.params
  const { page, limit, product_id, status } = req.query
  const options = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    product_id: product_id,
    status: status ? Number(status) : undefined
  }
  const result = await serviceProductsService.getRecommendedProducts(service_id, options)
  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_PRODUCTS_MESSAGES.GET_RECOMMENDED_PRODUCTS_SUCCESS,
    result
  })
}

export const getServiceProductsByServiceIdController = async (
  req: Request<{ service_id: string }, any, any, ServiceProductsQuery>,
  res: Response,
  next: NextFunction
) => {
  const { service_id } = req.params
  const { page, limit, status } = req.query
  const result = await serviceProductsService.getServiceProductsByServiceId(service_id, { page, limit, status })
  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_PRODUCTS_MESSAGES.GET_SERVICE_PRODUCTS_BY_SERVICE_ID_SUCCESS,
    result
  })
}

export const getServiceProductsByProductIdController = async (
  req: Request<{ product_id: string }, any, any, ServiceProductsQuery>,
  res: Response,
  next: NextFunction
) => {
  const { product_id } = req.params
  const { page, limit, status } = req.query
  const result = await serviceProductsService.getServiceProductsByProductId(product_id, { page, limit, status })
  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_PRODUCTS_MESSAGES.GET_SERVICE_PRODUCTS_BY_PRODUCT_ID_SUCCESS,
    result
  })
}

export const getServiceProductController = async (
  req: Request<ServiceProductsParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { service_product_id } = req.params
  const result = await serviceProductsService.getServiceProduct(service_product_id)
  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_PRODUCTS_MESSAGES.GET_SERVICE_PRODUCT_SUCCESS,
    result
  })
}

export const createServiceProductController = async (
  req: Request<ParamsDictionary, any, ServiceProductsReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await serviceProductsService.createServiceProduct(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: SERVICE_PRODUCTS_MESSAGES.CREATE_SERVICE_PRODUCT_SUCCESS,
    result
  })
}

export const updateServiceProductController = async (
  req: Request<ServiceProductsParams, any, UpdateServiceProductsReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { service_product_id } = req.params
  const result = await serviceProductsService.updateServiceProduct(service_product_id, req.body)
  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_PRODUCTS_MESSAGES.UPDATE_SERVICE_PRODUCT_SUCCESS,
    result
  })
}

export const updateServiceProductStatusController = async (
  req: Request<ServiceProductsParams, any, { status: number }>,
  res: Response,
  next: NextFunction
) => {
  const { service_product_id } = req.params
  const { status } = req.body
  const result = await serviceProductsService.updateServiceProductStatus(service_product_id, status)
  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_PRODUCTS_MESSAGES.UPDATE_SERVICE_PRODUCT_STATUS_SUCCESS,
    result
  })
}

export const deleteServiceProductController = async (
  req: Request<ServiceProductsParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { service_product_id } = req.params
  const result = await serviceProductsService.deleteServiceProduct(service_product_id)
  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_PRODUCTS_MESSAGES.DELETE_SERVICE_PRODUCT_SUCCESS,
    result
  })
}

// Thêm các controller cho API mới
export const getProductsByServiceIdController = async (req: Request<{ service_id: string }>, res: Response) => {
  const result = await serviceProductsService.getProductsByServiceId(req.params.service_id)
  res.json({
    message: SERVICE_PRODUCTS_MESSAGES.GET_SERVICE_PRODUCTS_BY_SERVICE_ID_SUCCESS,
    data: result
  })
}

export const getServicesByProductIdController = async (req: Request<{ product_id: string }>, res: Response) => {
  const result = await serviceProductsService.getServicesByProductId(req.params.product_id)
  res.json({
    message: SERVICE_PRODUCTS_MESSAGES.GET_SERVICE_PRODUCTS_BY_PRODUCT_ID_SUCCESS,
    data: result
  })
}
