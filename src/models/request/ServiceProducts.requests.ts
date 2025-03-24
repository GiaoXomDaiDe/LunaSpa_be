import { ParamsDictionary } from 'express-serve-static-core'
import { Pagination } from '~/models/request/Pagination'

export interface ServiceProductsQuery extends Pagination {
  service_id?: string
  product_id?: string
  status?: string
}

export interface ServiceProductsParams extends ParamsDictionary {
  service_product_id: string
}

export interface ServiceProductsReqBody {
  service_id: string
  product_id: string
  status?: number
  recommended?: boolean
  discount_percent?: number
  usage_instruction?: string
}

export interface UpdateServiceProductsReqBody {
  service_id?: string
  product_id?: string
  status?: number
  recommended?: boolean
  discount_percent?: number
  usage_instruction?: string
}

export interface GetAllServiceProductsOptions {
  limit?: number
  page?: number
  service_id?: string
  product_id?: string
  isAdmin?: boolean
  status?: number
  recommended?: boolean
}

export interface ServiceProductParams extends ParamsDictionary {
  service_product_id: string
}
