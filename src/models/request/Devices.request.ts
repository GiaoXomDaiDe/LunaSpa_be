import { ParamsDictionary, Query } from 'express-serve-static-core'
import { Pagination } from '~/models/request/Pagination'
import { DeviceStatus } from '~/models/schema/Device.schema'

export interface DevicesQueryBody extends Pagination, Query {
  search?: string
  status?: string
}

export interface GetAllDevicesOptions {
  limit?: number
  page?: number
  search?: string
  status?: number
  isAdmin?: boolean
}

export interface DeviceParams extends ParamsDictionary {
  device_id: string
}

export interface DeviceReqBody {
  name: string
  description?: string
  status?: DeviceStatus
}
