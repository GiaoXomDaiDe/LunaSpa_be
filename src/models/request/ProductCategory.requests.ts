import { ParamsDictionary } from 'express-serve-static-core'

export interface ProductCategoryReqBody {
  name: string
  description: string
}

export interface ProductCategoryParams extends ParamsDictionary {
  id: string
}
