import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { omitBy } from 'lodash'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { DEVICE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { DeviceParams, DeviceReqBody, DevicesQueryBody, GetAllDevicesOptions } from '~/models/request/Devices.request'
import Device from '~/models/schema/Device.schema'
import devicesService from '~/services/devices.services'

export const getAllDevicesController = async (
  req: Request<ParamsDictionary, any, any, DevicesQueryBody>,
  res: Response,
  next: NextFunction
) => {
  const { limit, page, search, status } = req.query
  const role = req.role
  const isAdmin = role?.name === 'Admin'

  const options: GetAllDevicesOptions = {
    limit: typeof limit === 'string' ? parseInt(limit) : limit,
    page: typeof page === 'string' ? parseInt(page) : page,
    search,
    isAdmin
  }

  if (status !== undefined) {
    options.status = Number(status)
  }

  const result = await devicesService.getAllDevices(options)

  res.status(HTTP_STATUS.OK).json({
    message: DEVICE_MESSAGES.GET_ALL_DEVICES_SUCCESS,
    result: {
      devices: result.devices,
      totalDevices: result.totalDevices,
      totalPages: result.totalPages,
      limit: result.limit,
      page: result.page
    }
  })
}

export const getDeviceController = async (req: Request<DeviceParams, any, any>, res: Response, next: NextFunction) => {
  const { device_id } = req.params
  const device = await devicesService.getDevice(device_id)

  res.status(HTTP_STATUS.OK).json({
    message: DEVICE_MESSAGES.GET_DEVICE_SUCCESS,
    result: device
  })
}

export const createDeviceController = async (
  req: Request<ParamsDictionary, any, DeviceReqBody>,
  res: Response,
  next: NextFunction
) => {
  const device = await devicesService.createDevice(req.body)

  res.status(HTTP_STATUS.CREATED).json({
    message: DEVICE_MESSAGES.CREATE_DEVICE_SUCCESS,
    result: device
  })
}

export const updateDeviceController = async (
  req: Request<DeviceParams, any, DeviceReqBody>,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body
  const { device_id } = req.params

  const updateData = omitBy(payload, (value) => value === undefined || value === '')

  if (Object.keys(updateData).length === 0) {
    throw new ErrorWithStatus({
      message: DEVICE_MESSAGES.DEVICE_NOT_UPDATED,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }

  const result = await devicesService.updateDevice(updateData, device_id)

  res.status(HTTP_STATUS.OK).json({
    message: DEVICE_MESSAGES.UPDATE_DEVICE_SUCCESS,
    result
  })
}

export const deleteDeviceController = async (
  req: Request<DeviceParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { device_id } = req.params
  const result = await devicesService.deleteDevice(device_id)

  res.status(HTTP_STATUS.OK).json({
    message: DEVICE_MESSAGES.DELETE_DEVICE_SUCCESS,
    result
  })
}

export const softDeleteDeviceController = async (
  req: Request<DeviceParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const device = req.device as Device
  const result = await devicesService.softDeleteDevice(device._id as ObjectId)

  res.status(HTTP_STATUS.OK).json({
    message: DEVICE_MESSAGES.DELETE_DEVICE_SUCCESS,
    result
  })
}
