import { ObjectId } from 'mongodb'

export enum ServiceStatus {
  ACTIVE = 1,
  INACTIVE = 0
}

export interface DurationType {
  duration_name?: string
  price?: number
  discount_price?: number
  sub_description?: string
  duration_in_minutes?: number
}

export interface ServiceType {
  _id?: ObjectId
  name: string
  description?: string
  images?: string[]
  status?: ServiceStatus
  booking_count?: number
  branch_id?: ObjectId[]
  service_category_id: ObjectId
  view_count?: number
  created_at?: Date
  updated_at?: Date

  durations?: DurationType[]
  device_ids?: ObjectId[]
}

export default class Service {
  _id?: ObjectId
  name: string
  description: string
  images: string[]
  status: ServiceStatus
  view_count: number
  branch_id: ObjectId[]
  booking_count: number
  service_category_id: ObjectId
  created_at: Date
  updated_at: Date
  durations: DurationType[]
  device_ids: ObjectId[]
  constructor(service: ServiceType) {
    const date = new Date()
    this._id = service._id
    this.name = service.name
    this.description = service.description || ''
    this.images = service.images || []
    this.status = service.status || ServiceStatus.ACTIVE
    this.view_count = service.view_count || 0
    this.branch_id = service.branch_id || []
    this.booking_count = service.booking_count || 0
    this.service_category_id = service.service_category_id
    this.created_at = service.created_at || date
    this.updated_at = service.updated_at || date
    this.durations = service.durations || []
    this.device_ids = service.device_ids || []
  }
}
