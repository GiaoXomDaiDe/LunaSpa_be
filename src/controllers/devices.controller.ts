import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { omitBy } from 'lodash'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { DEVICE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { DeviceParams, DeviceReqBody, DevicesQueryBody } from '~/models/request/Devices.request'
import Device from '~/models/schema/Device.schema'
import devicesService from '~/services/devices.services'

export const getAllDevicesController = async (
  req: Request<ParamsDictionary, any, any, DevicesQueryBody>,
  res: Response,
  next: NextFunction
) => {
  const { limit, page, search } = req.query
  const role = req.role
  const isAdmin = role?.name === 'Admin'
  const options = {
    // Nếu có limit hoặc page thì ép kiểu, nếu không thì để undefined
    limit: limit ? Number(limit) : undefined,
    page: page ? Number(page) : undefined,
    search: search ? (search as string) : undefined,
    isAdmin
  }
  const result = await devicesService.getAllDevices(options)
  res.status(HTTP_STATUS.OK).json({
    message: DEVICE_MESSAGES.GET_ALL_DEVICES_SUCCESS,
    result: {
      devices: result.devices,
      totalDevices: result.totalDevices,
      totalPages: result.totalPages,
      limit: options.limit,
      page: options.page
    }
  })
}
export const getDeviceController = async (req: Request<DeviceParams, any, any>, res: Response, next: NextFunction) => {
  const device_id = req.params.device_id
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
  const updateData = omitBy(payload, (value) => value === undefined || value === '')
  if (Object.keys(updateData).length === 0) {
    throw new ErrorWithStatus({
      message: DEVICE_MESSAGES.DEVICE_NOT_UPDATED,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  const device_id = req.params.device_id
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
  const device_id = req.params.device_id
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
