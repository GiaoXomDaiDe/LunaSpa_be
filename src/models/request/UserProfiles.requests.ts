import { ParamsDictionary, Query } from 'express-serve-static-core'
import { Pagination } from './Pagination'

export interface UserProfilesQuery extends Pagination, Query {
  sort?: string
  order?: string
}

export interface GetAllUserProfilesOptions {
  limit?: number
  page?: number
  isAdmin?: boolean
}

export interface UserProfileParams extends ParamsDictionary {
  user_profile_id: string
}

export interface AccountParams extends ParamsDictionary {
  account_id: string
}

export interface UserProfileReqBody {
  account_id: string
  condition_ids: string[]
}

export interface ConditionIdsReqBody {
  condition_ids: string[]
}
