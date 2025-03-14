import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { omitBy } from 'lodash'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { SERVICE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ServiceParams, ServiceQuery, ServiceReqBody } from '~/models/request/Services.request'
import servicesService from '~/services/services.services'

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
    service_category_id,
    device_ids,
    min_booking_count,
    max_booking_count,
    min_view_count,
    max_view_count,
    order
  } = req.query
  const role = req.role
  const isAdmin = role?.name === 'Admin'
  const options = {
    limit: Number(limit) || undefined,
    page: Number(page) || undefined,
    search: (search as string) || '',
    sort: (sort as string) || undefined,
    order: (order as string) || undefined,
    service_category_id:
      service_category_id && service_category_id !== '' ? new ObjectId(service_category_id) : undefined,
    device_ids: device_ids && device_ids.length > 0 ? device_ids.map((id) => new ObjectId(id)) : undefined,
    min_booking_count: min_booking_count && min_booking_count !== '' ? Number(min_booking_count) : undefined,
    max_booking_count: max_booking_count && max_booking_count !== '' ? Number(max_booking_count) : undefined,
    min_view_count: min_view_count && min_view_count !== '' ? Number(min_view_count) : undefined,
    max_view_count: max_view_count && max_view_count !== '' ? Number(max_view_count) : undefined,
    isAdmin
  }
  const result = await servicesService.getAllServices(options)
  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_MESSAGES.GET_ALL_SERVICES_SUCCESS,
    result
  })
}
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
export const updateServiceController = async (
  req: Request<ServiceParams, any, ServiceReqBody>,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body
  const updateData = omitBy(payload, (value) => value === undefined || value === '')
  if (Object.keys(updateData).length === 0) {
    throw new ErrorWithStatus({
      message: SERVICE_MESSAGES.SERVICE_NOT_UPDATED,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  const service_id = req.params.service_id
  const result = await servicesService.updateService(updateData, service_id)
  res.status(HTTP_STATUS.OK).json({
    message: SERVICE_MESSAGES.UPDATE_SERVICE_SUCCESS,
    result
  })
}
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
