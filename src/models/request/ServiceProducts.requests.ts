import { ParamsDictionary } from 'express-serve-static-core'
import { Pagination } from '~/models/request/Pagination'

export interface ServiceProductsQuery extends Pagination {
  service_id?: string
  product_id?: string
}

export interface ServiceProductsParams extends ParamsDictionary {
  service_product_id: string
}

export interface ServiceProductsReqBody {
  service_id: string
  product_id: string
}
export interface GetAllServiceProductsOptions {
  limit?: number
  page?: number
  service_id?: string
  product_id?: string
  isAdmin?: boolean
}
