import { ObjectId } from 'mongodb'

export interface BranchType {
  _id?: ObjectId
  name: string
  description?: string
  rating?: number
  images?: string[]
  status?: BranchStatus
  opening_hours?: OpeningHoursType[]
  contact?: ContactType
  created_at?: Date
  updated_at?: Date
}

export enum BranchStatus {
  ACTIVE = 1,
  INACTIVE = 0
}

export interface ContactType {
  phone: string
  email: string
  address: string
}

export interface OpeningHoursType {
  day: DayType
  open: string
  close: string
}

export enum DayType {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday'
}

export default class Branch {
  _id?: ObjectId
  name: string
  description: string
  rating: number
  images: string[]
  status: BranchStatus
  opening_hours: OpeningHoursType[]
  contact: ContactType
  created_at: Date
  updated_at?: Date
  constructor(branch: BranchType) {
    const date = new Date()
    this._id = branch._id
    this.name = branch.name
    this.description = branch.description || ''
    this.rating = branch.rating || 0
    this.images = branch.images || []
    this.status = branch.status || BranchStatus.ACTIVE
    this.opening_hours = branch.opening_hours || []
    this.contact = branch.contact || {
      phone: '',
      email: '',
      address: ''
    }
    this.created_at = branch.created_at || date
    this.updated_at = branch.updated_at || date
  }
}
