import { ObjectId } from 'mongodb'

export interface BranchType {
  _id?: ObjectId
  code: string
  name: string
  address?: string
  description?: string
  rating?: number
  images?: string[]
  status?: BranchStatus
  opening_hours?: OpeningHoursType[]
  contact?: ContactType
  service_ids?: ObjectId[]
  product_ids?: ObjectId[]
  created_at?: Date
  updated_at?: Date
}

export enum BranchStatus {
  ACTIVE = 1,
  INACTIVE = 2
}

export interface ContactType {
  phone: string
  email: string
  address: string
}

export interface OpeningHoursType {
  day: number
  open: string
  close: string
}
export default class Branch {
  _id?: ObjectId
  code: string
  name: string
  address: string
  description?: string
  rating: number
  images: string[]
  status: BranchStatus
  opening_hours: OpeningHoursType[]
  contact: ContactType
  service_ids: ObjectId[]
  product_ids: ObjectId[]
  created_at?: Date
  updated_at?: Date
  constructor(branch: BranchType) {
    this._id = branch._id
    this.code = branch.code
    this.name = branch.name
    this.address = branch.address || ''
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
    this.service_ids = branch.service_ids || []
    this.product_ids = branch.product_ids || []
    this.created_at = branch.created_at
    this.updated_at = branch.updated_at
  }
}
