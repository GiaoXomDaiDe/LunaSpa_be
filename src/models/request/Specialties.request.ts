import { ParamsDictionary, Query } from 'express-serve-static-core'
import { Pagination } from './Pagination'

export interface SpecialtyParams extends ParamsDictionary {
  specialty_id: string
}

export interface SpecialtiesQuery extends Pagination, Query {
  sort?: string
  order?: string
}

export interface GetAllSpecialtiesOptions {
  limit?: number
  page?: number
  isAdmin?: boolean
}

export interface SpecialtyReqBody {
  name: string
  description?: string
}
