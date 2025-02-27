import { ObjectId } from 'mongodb'

export interface ResourcePermission {
  resource_id?: ObjectId
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

export interface RoleType {
  _id?: ObjectId
  name: string
  resources?: ResourcePermission[]
  created_at?: Date
  updated_at?: Date
}

export default class Roles {
  _id?: ObjectId
  name: string
  resources: ResourcePermission[]
  created_at: Date
  updated_at: Date
  constructor(role: RoleType) {
    const date = new Date()
    this._id = role._id
    this.name = role.name
    this.resources = role.resources || []
    this.created_at = role.created_at ?? date
    this.updated_at = role.updated_at ?? date
  }
}
