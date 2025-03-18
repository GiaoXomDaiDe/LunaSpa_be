import { ParamsDictionary, Query } from 'express-serve-static-core'
import { BranchProductsStatus } from '../schema/BranchProducts.schema'

export interface BranchProductsReqBody {
  branch_id: string
  product_id: string
  status?: BranchProductsStatus
  override_price?: number
}

export interface BranchProductsParams extends ParamsDictionary {
  branch_product_id: string
}

export interface BranchParams extends ParamsDictionary {
  branch_id: string
}

export interface ProductParams extends ParamsDictionary {
  product_id: string
}

export interface GetBranchProductsQuery extends Query {
  branch_id?: string
  product_id?: string
  status?: string
  page?: string
  limit?: string
}

export interface GetBranchProductsOptions {
  branch_id?: string
  product_id?: string
  status?: BranchProductsStatus
  page?: number
  limit?: number
}
