import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { omitBy } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { SERVICE_CATEGORY_MESSAGES, SUCCESS_RESPONSE_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { Pagination } from '~/models/request/Pagination'
import { ServiceCategoryParams, ServiceCategoryReqBody } from '~/models/request/ServiceCategory.requests'
import serviceCategoriesService from '~/services/serviceCategories.services'

export const getAllServiceCategoriesController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { limit, page } = req.query as Pagination
  const serviceCategories = await serviceCategoriesService.getAllServiceCategories({
    limit: Number(limit) || 10,
    page: Number(page) || 1
  })
  res.status(HTTP_STATUS.OK).json({
    message: SUCCESS_RESPONSE_MESSAGE.SERVICE_CATEGORIES_FETCHED_SUCCESSFULLY,
    result: {
      serviceCategories
    }
  })
}

export const getServiceCategoryController = async (
  req: Request<ServiceCategoryParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const serviceCategory_id = req.params.service_category_id
  const serviceCategory = await serviceCategoriesService.getServiceCategory(serviceCategory_id)
  res.status(HTTP_STATUS.OK).json({
    message: SUCCESS_RESPONSE_MESSAGE.SERVICE_CATEGORY_FETCHED_SUCCESSFULLY,
    result: serviceCategory
  })
}

export const createServiceCategoryController = async (
  req: Request<ParamsDictionary, any, ServiceCategoryReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await serviceCategoriesService.createServiceCategory(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: SUCCESS_RESPONSE_MESSAGE.SERVICE_CATEGORY_CREATED_SUCCESSFULLY,
    result
  })
}

export const updateServiceCategoryController = async (
  req: Request<ServiceCategoryParams, any, ServiceCategoryReqBody>,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body
  const updateData = omitBy(payload, (value) => value === undefined || value === '')
  if (Object.keys(updateData).length === 0) {
    throw new ErrorWithStatus({
      message: SERVICE_CATEGORY_MESSAGES.SERVICE_CATEGORY_NOT_UPDATED,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  const serviceCategory_id = req.params.service_category_id
  const result = await serviceCategoriesService.updateServiceCategory(updateData, serviceCategory_id)
  res.status(HTTP_STATUS.OK).json({
    message: SUCCESS_RESPONSE_MESSAGE.SERVICE_CATEGORY_UPDATED_SUCCESSFULLY,
    result
  })
}

export const deleteServiceCategoryController = async (
  req: Request<ServiceCategoryParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const serviceCategory_id = req.params.service_category_id
  console.log(serviceCategory_id)
  await serviceCategoriesService.deleteServiceCategory(serviceCategory_id)
  res.status(HTTP_STATUS.OK).json({
    message: SUCCESS_RESPONSE_MESSAGE.SERVICE_CATEGORY_DELETED_SUCCESSFULLY
  })
}
