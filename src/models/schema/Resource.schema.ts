import { ObjectId } from 'mongodb'

export interface ResourceType {
  _id?: ObjectId
  resource_name: string
  description: string
  created_at?: Date
  updated_at?: Date
}

export default class Resource {
  _id?: ObjectId
  resource_name: string
  description: string
  created_at: Date
  updated_at: Date
  constructor(resource: ResourceType) {
    const date = new Date()
    this._id = resource._id
    this.resource_name = resource.resource_name
    this.description = resource.description
    this.created_at = resource.created_at ?? date
    this.updated_at = resource.updated_at ?? date
  }
}
