import { Request } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { Document } from 'mongodb'
import { Pagination } from '~/models/request/Pagination'

export interface ConditionProductsQuery extends Pagination {
  search?: string
  condition_id?: string
  product_id?: string
}

export interface ConditionProductsParams extends ParamsDictionary {
  condition_product_id: string
}

export interface ConditionProductsReqBody {
  condition_id: string
  product_id: string
  note?: string
}

export interface UpdateConditionProductsReqBody {
  condition_id?: string
  product_id?: string
  note?: string
}

export interface GetAllConditionProductsOptions {
  limit?: number
  page?: number
  search?: string
  condition_id?: string
  product_id?: string
  isAdmin?: boolean
}

// Tạo interface để mở rộng Request
export interface ConditionProductRequest extends Request {
  conditionProduct?: Document
}
