import { ParamsDictionary, Query } from 'express-serve-static-core'
import { ORDER, SORT_BY } from '~/constants/constants'
import { Pagination } from '~/models/request/Pagination'
import { ProductStatus } from '~/models/schema/Product.schema'

export interface ProductQuery extends Pagination, Query {
  search?: string
  sort?: string
  max_price?: string
  min_price?: string
  category_id?: string
  discount_price?: string
  quantity?: string
  order?: string
  include_branch_products?: string
}
export interface ProductReqBody {
  name: string
  description?: string
  category_id: string
  price: number
  discount_price?: number
  quantity: number
  images?: string[]
  status?: ProductStatus
}

export interface GetAllProductsOptions {
  limit?: number
  page?: number
  search?: string
  sort?: (typeof SORT_BY)[number]
  max_price?: number
  min_price?: number
  category_id?: string
  discount_price?: number
  quantity?: number
  order?: (typeof ORDER)[number]
  isAdmin?: boolean
  include_branch_products?: boolean
}
export interface ProductParams extends ParamsDictionary {
  product_id: string
}
export interface ProductIdBody {
  product_id: string
}
