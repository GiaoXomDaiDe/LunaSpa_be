import { Request } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { Document } from 'mongodb'
import { Pagination } from '~/models/request/Pagination'

export interface ConditionsQuery extends Pagination {
  name?: string
}

export interface ConditionsParams extends ParamsDictionary {
  condition_id: string
}

export interface ConditionsReqBody {
  name: string
  description?: string
  thumbnail?: string
}

export interface UpdateConditionsReqBody {
  name?: string
  description?: string
  thumbnail?: string
}

export interface GetAllConditionsOptions extends Pagination {
  name?: string
  sort_by?: string
  order?: 'asc' | 'desc'
}

// Tạo interface để mở rộng Request
export interface ConditionRequest extends Request {
  condition?: Document
}
