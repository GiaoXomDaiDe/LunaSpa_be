import { ParamsDictionary, Query } from 'express-serve-static-core'
import { Pagination } from './Pagination'

export interface ConditionQuery extends Pagination, Query {
  search?: string
}
export interface GetAllConditionsOptions {
  limit?: number
  page?: number
  search?: string
  isAdmin?: boolean
}
export interface ConditionParams extends ParamsDictionary {
  condition_id: string
}
export interface ConditionReqBody {
  name: string
  description: string
  instructions: string
}
