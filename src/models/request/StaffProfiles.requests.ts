import { ParamsDictionary, Query } from 'express-serve-static-core'
import { StaffType } from '../schema/StaffProfile.schema'
import { Pagination } from './Pagination'

export interface StaffProfilesQuery extends Pagination, Query {
  sort?: string
  order?: string
  staff_type?: StaffType
}

export interface GetAllStaffProfilesOptions {
  limit?: number
  page?: number
  isAdmin?: boolean
  staff_type?: StaffType
}

export interface StaffProfileParams extends ParamsDictionary {
  staff_profile_id: string
}

export interface AccountParams extends ParamsDictionary {
  account_id: string
}

export interface StaffProfileReqBody {
  account_id: string
  staff_type: StaffType
  specialty_ids?: string[]
  rating?: number
  year_of_experience?: number
  bio?: string
}

export interface SpecialtyIdsReqBody {
  specialty_ids: string[]
}
