import { Request } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { Document } from 'mongodb'
import { Pagination } from '~/models/request/Pagination'

export interface ConditionServicesQuery extends Pagination {
  search?: string
  condition_id?: string
  service_id?: string
}

export interface ConditionServicesParams extends ParamsDictionary {
  condition_service_id: string
}

export interface ConditionServicesReqBody {
  condition_id: string
  service_id: string
  note?: string
}

export interface UpdateConditionServicesReqBody {
  condition_id?: string
  service_id?: string
  note?: string
}

export interface GetAllConditionServicesOptions {
  limit?: number
  page?: number
  search?: string
  condition_id?: string
  service_id?: string
  isAdmin?: boolean
}

// Tạo interface để mở rộng Request
export interface ConditionServiceRequest extends Request {
  conditionService?: Document
}
