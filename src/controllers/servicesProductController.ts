import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES } from '~/constants/messages'
import { ProductIdBody, ProductQuery } from '~/models/request/Products.requests'
import { ServiceParams } from '~/models/request/Services.request'
import servicesProductsServices from '~/services/servicesProducts.services'

export const getProductsOfServiceController = async (
  req: Request<ServiceParams, any, any, ProductQuery>,
  res: Response,
  next: NextFunction
) => {
  const { service_id } = req.params
  const { limit, page, search, sort, order, category_id, discount_price, max_price, min_price, quantity } = req.query
  const role = req.role
  const isAdmin = role?.name === 'Admin'
  const options = {
    limit: Number(limit) || undefined,
    page: Number(page) || undefined,
    search: (search as string) || '',
    sort: (sort as string) || undefined,
    order: (order as string) || undefined,
    max_price: max_price && max_price !== '' ? Number(max_price) : undefined,
    min_price: min_price && min_price !== '' ? Number(min_price) : undefined,
    category_id: category_id && category_id !== '' ? category_id : undefined,
    discount_price: discount_price && discount_price !== '' ? Number(discount_price) : undefined,
    quantity: quantity && quantity !== '' ? Number(quantity) : undefined,
    isAdmin
  }
  const result = await servicesProductsServices.getAllProductsByServiceId(service_id, options)
  res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.GET_ALL_PRODUCTS_SUCCESS,
    result
  })
}

export const addProductToServiceController = async (
  req: Request<ServiceParams, any, ProductIdBody>,
  res: Response,
  next: NextFunction
) => {
  const { service_id } = req.params
  const { product_id } = req.body
  const result = await servicesProductsServices.addProductToService(service_id, product_id)
  res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.ADD_PRODUCT_TO_SERVICE_SUCCESS,
    result
  })
}

export const getOneProductOfServiceController = async (
  req: Request<{ service_id: string; product_id: string }>,
  res: Response,
  next: NextFunction
) => {
  const { service_id, product_id } = req.params

  const result = await servicesProductsServices.getOneProductOfService(service_id, product_id)
  if (!result) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND
    })
  }
  res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.GET_ONE_PRODUCT_OF_SERVICE_SUCCESS,
    result
  })
}

export const updateProductOfServiceController = async (
  req: Request<{ service_product_id: string }, any, ProductIdBody & { service_id: string }>,
  res: Response,
  next: NextFunction
) => {
  const { service_product_id } = req.params
  const { product_id, service_id } = req.body
  const result = await servicesProductsServices.updateProductOfService(service_product_id, {
    product_id,
    service_id
  })
  res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.UPDATE_PRODUCT_OF_SERVICE_SUCCESS,
    result
  })
}

export const deleteProductOfServiceController = async (
  req: Request<{ service_id: string; service_product_id: string }>,
  res: Response,
  next: NextFunction
) => {
  const { service_id, service_product_id } = req.params
  const result = await servicesProductsServices.deleteProductOfService(service_id, service_product_id)
  res.status(HTTP_STATUS.OK).json({
    message: PRODUCT_MESSAGES.DELETE_PRODUCT_OF_SERVICE_SUCCESS,
    result
  })
}
