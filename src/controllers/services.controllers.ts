import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { omitBy } from 'lodash'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { SERVICE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { GetAllServicesOptions, ServiceParams, ServiceQuery, ServiceReqBody } from '~/models/request/Services.request'
import serviceProductsService from '~/services/serviceProducts.services'
import servicesService from '~/services/services.services'

/**
 * Controller để lấy danh sách tất cả dịch vụ
 */
export const getAllServicesController = async (
  req: Request<ParamsDictionary, any, any, ServiceQuery>,
  res: Response,
  next: NextFunction
) => {
  const {
    limit,
    page,
    search,
    sort,
    order,
    service_category_id,
    device_ids,
    min_booking_count,
    max_booking_count,
    min_view_count,
    max_view_count,
    include_branch_services
  } = req.query

  const role = req.role
  const isAdmin = role?.name === 'Admin'

  const options: GetAllServicesOptions = {
    limit: typeof limit === 'string' ? parseInt(limit) : limit,
    page: typeof page === 'string' ? parseInt(page) : page,
    search,
    sort,
    order,
    service_category_id: service_category_id ? new ObjectId(service_category_id) : undefined,
    device_ids: device_ids
      ? Array.isArray(device_ids)
        ? device_ids.map((id) => new ObjectId(id))
        : [new ObjectId(device_ids)]
      : undefined,
    min_booking_count: typeof min_booking_count === 'string' ? parseInt(min_booking_count) : min_booking_count,
    max_booking_count: typeof max_booking_count === 'string' ? parseInt(max_booking_count) : max_booking_count,
    min_view_count: typeof min_view_count === 'string' ? parseInt(min_view_count) : min_view_count,
    max_view_count: typeof max_view_count === 'string' ? parseInt(max_view_count) : max_view_count,
    isAdmin,
    include_branch_services:
      typeof include_branch_services === 'string' ? include_branch_services === 'true' : include_branch_services
  }

  const result = await servicesService.getAllServices(options)
  const { page: currentPage, limit: currentLimit } = options

  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_MESSAGES.GET_ALL_SERVICES_SUCCESS,
    result: {
      data: result.data,
      totalServices: result.totalServices,
      totalPages: result.totalPages,
      limit: result.limit,
      page: result.page
    }
  })
}

/**
 * Controller để lấy thông tin chi tiết của một dịch vụ
 */
export const getServiceController = async (
  req: Request<ServiceParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { service_id } = req.params
  const service = await servicesService.getService(service_id)

  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_MESSAGES.GET_SERVICE_SUCCESS,
    result: service
  })
}

/**
 * Controller để tạo mới một dịch vụ
 */
export const createServiceController = async (
  req: Request<ParamsDictionary, any, ServiceReqBody>,
  res: Response,
  next: NextFunction
) => {
  const service = await servicesService.createService(req.body)

  res.status(HTTP_STATUS.CREATED).json({
    message: SERVICE_MESSAGES.CREATE_SERVICE_SUCCESS,
    result: service
  })
}

/**
 * Controller để cập nhật thông tin một dịch vụ
 */
export const updateServiceController = async (
  req: Request<ServiceParams, any, ServiceReqBody>,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body
  const { service_id } = req.params

  const updateData = omitBy(payload, (value) => value === undefined || value === '')

  if (Object.keys(updateData).length === 0) {
    throw new ErrorWithStatus({
      message: SERVICE_MESSAGES.SERVICE_NOT_UPDATED,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }

  const result = await servicesService.updateService(updateData, service_id)

  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_MESSAGES.UPDATE_SERVICE_SUCCESS,
    result
  })
}

/**
 * Controller để xóa vĩnh viễn một dịch vụ
 */
export const deleteServiceController = async (
  req: Request<ServiceParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { service_id } = req.params
  const result = await servicesService.deleteService(service_id)

  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_MESSAGES.DELETE_SERVICE_SUCCESS,
    result
  })
}

/**
 * Controller để xóa mềm một dịch vụ
 */
export const softDeleteServiceController = async (
  req: Request<ServiceParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { service_id } = req.params
  const result = await servicesService.softDeleteService(service_id)

  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_MESSAGES.DELETE_SERVICE_SUCCESS,
    result
  })
}

/**
 * Controller để lấy danh sách sản phẩm liên quan đến một dịch vụ
 */
export const getProductsByServiceIdController = async (req: Request<{ service_id: string }>, res: Response) => {
  const result = await serviceProductsService.getProductsByServiceId(req.params.service_id)

  return res.json({
    message: 'Lấy danh sách sản phẩm của dịch vụ thành công',
    data: result
  })
}
