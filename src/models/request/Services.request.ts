import { ParamsDictionary, Query } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { Pagination } from '~/models/request/Pagination'
import { DurationType, ServiceStatus } from '~/models/schema/Service.schema'

export interface ServiceQuery extends Pagination, Query {
  sort?: string
  order?: string
  search?: string
  service_category_id?: string
  device_ids?: string[]
  min_booking_count?: string
  max_booking_count?: string
  min_view_count?: string
  max_view_count?: string
}
export interface GetAllServicesOptions {
  limit?: number
  page?: number
  search?: string
  sort?: string
  order?: string
  service_category_id?: ObjectId
  device_ids?: ObjectId[]
  min_booking_count?: number
  max_booking_count?: number
  min_view_count?: number
  max_view_count?: number
  isAdmin?: boolean
}
export interface ServiceParams extends ParamsDictionary {
  service_id: string
}
export interface ServiceReqBody {
  name: string
  description?: string
  images?: string[]
  status?: ServiceStatus
  booking_count?: number
  service_category_id: string
  view_count?: number
  durations?: DurationType[]
  device_ids?: string[]
}
