import { ParamsDictionary } from 'express-serve-static-core'
import { ResourcePermission } from '~/models/schema/Role.schema'

export interface RoleReqBody {
  name: string
  resources: ResourcePermission[]
}
export interface RoleParams extends ParamsDictionary {
  id: string
}
export interface RoleResourceParams extends ParamsDictionary {
  role_id: string
  resource_id: string
}
