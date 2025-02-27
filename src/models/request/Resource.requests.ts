import { ParamsDictionary } from 'express-serve-static-core'
export interface ResourceReqBody {
  resource_name: string
  description: string
  resource_id?: string
}
export interface ResourceParams extends ParamsDictionary {
  id: string
}
