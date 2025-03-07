import { ObjectId } from 'mongodb'

export interface ServiceCategoryType {
  _id?: ObjectId
  name?: string
  description?: string
  created_at?: Date
  updated_at?: Date
}
export default class ServiceCategoy {
  _id?: ObjectId
  name: string
  description: string
  created_at: Date
  updated_at: Date

  constructor(serviceCategory: ServiceCategoryType) {
    const date = new Date()
    this._id = serviceCategory._id
    this.name = serviceCategory.name || ''
    this.description = serviceCategory.description || ''
    this.created_at = serviceCategory.created_at || date
    this.updated_at = serviceCategory.updated_at || date
  }
}
