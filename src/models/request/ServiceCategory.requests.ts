import { ParamsDictionary } from 'express-serve-static-core'

export interface ServiceCategoryReqBody {
  name: string
  description: string
}

export interface ServiceCategoryParams extends ParamsDictionary {
  id: string
}
