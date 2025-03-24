import { ParamsDictionary } from 'express-serve-static-core'

export interface CreateSpecialtyReqBody {
  name: string
  description: string
  device_ids?: string[]
  service_ids?: string[]
}

export interface UpdateSpecialtyReqBody {
  name?: string
  description?: string
  device_ids?: string[]
  service_ids?: string[]
}

export interface SpecialtyParams extends ParamsDictionary {
  specialty_id: string
}

export interface SpecialtyQuery {
  page?: string
  limit?: string
  name?: string
}

export interface GetSpecialtyOptions {
  limit?: number
  page?: number
  name?: string
  specialty_id?: string
  isAdmin?: boolean
}
