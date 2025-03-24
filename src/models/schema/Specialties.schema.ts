import { ObjectId } from 'mongodb'

export interface SpecialtyType {
  _id?: ObjectId
  name: string
  description: string
  device_ids?: ObjectId[]
  service_ids?: ObjectId[]
  created_at?: Date
  updated_at?: Date
}

export default class Specialty {
  _id?: ObjectId
  name: string
  description: string
  device_ids?: ObjectId[]
  service_ids?: ObjectId[]
  created_at?: Date
  updated_at?: Date

  constructor(specialty: SpecialtyType) {
    const date = new Date()
    this._id = specialty._id
    this.name = specialty.name || ''
    this.description = specialty.description || ''
    this.device_ids = specialty.device_ids || []
    this.service_ids = specialty.service_ids || []
    this.created_at = specialty.created_at || date
    this.updated_at = specialty.updated_at || date
  }
}
