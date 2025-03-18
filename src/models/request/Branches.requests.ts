import { ParamsDictionary, Query } from 'express-serve-static-core'
import { Pagination } from '~/models/request/Pagination'
import { BranchStatus, ContactType, OpeningHoursType } from '~/models/schema/Branch.schema'

export interface BranchQuery extends Pagination, Query {
  sort?: string
  order?: string
  search?: string
  min_rating?: string
  max_rating?: string
}

export interface GetAllBranchesOptions {
  limit?: number
  page?: number
  search?: string
  sort?: string
  order?: string
  max_rating?: number
  min_rating?: number
  status?: string
  isAdmin?: boolean
}
export interface BranchParams extends ParamsDictionary {
  branch_id: string
}

export interface BranchReqBody {
  name: string
  description?: string
  images?: string[]
  status?: BranchStatus
  rating?: number
  opening_hours?: OpeningHoursType[]
  contact: ContactType
}
