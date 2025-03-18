import { ParamsDictionary, Query } from 'express-serve-static-core'
import { BranchServicesStatus } from '../schema/BranchServices.schema'

export interface BranchServicesReqBody {
  branch_id: string
  service_id: string
  status?: BranchServicesStatus
  override_price?: number
}

export interface BranchServicesParams extends ParamsDictionary {
  branch_service_id: string
}

export interface BranchParams extends ParamsDictionary {
  branch_id: string
}

export interface ServiceParams extends ParamsDictionary {
  service_id: string
}

export interface GetBranchServicesQuery extends Query {
  branch_id?: string
  service_id?: string
  status?: string
  page?: string
  limit?: string
}

export interface GetBranchServicesOptions {
  branch_id?: string
  service_id?: string
  status?: BranchServicesStatus
  page?: number
  limit?: number
}
