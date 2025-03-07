import { ObjectId } from 'mongodb'

export enum DeviceStatus {
  ACTIVE = 1,
  INACTIVE = 0,
  BROKEN = 2,
  MAINTENANCE = 3
}

export interface DeviceType {
  _id?: ObjectId
  code: string
  name: string
  description: string
  status?: DeviceStatus
  created_at?: Date
  updated_at?: Date
}

export default class Device {
  _id?: ObjectId
  code: string
  name: string
  description: string
  status?: DeviceStatus
  created_at: Date
  updated_at: Date
  constructor(device: DeviceType) {
    const date = new Date()
    this._id = device._id
    this.code = device.code
    this.name = device.name
    this.description = device.description
    this.status = device.status || DeviceStatus.ACTIVE
    this.created_at = device.created_at || date
    this.updated_at = device.updated_at || date
  }
}
