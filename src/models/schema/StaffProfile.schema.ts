import { ObjectId } from 'mongodb'

export enum StaffType {
  RECEPTIONIST = 'receptionist',
  PRACTITIONER = 'practitioner'
}

export interface StaffProfileType {
  _id?: ObjectId
  account_id: ObjectId
  staff_type: StaffType
  specialty_ids?: ObjectId[]
  rating?: number
  year_of_experience?: number
  bio?: string
  created_at?: Date
  updated_at?: Date
}

export default class StaffProfile {
  _id?: ObjectId
  account_id: ObjectId
  staff_type: StaffType
  specialty_ids: ObjectId[]
  rating: number
  year_of_experience: number
  bio: string
  created_at: Date
  updated_at: Date

  constructor(staffProfile: StaffProfileType) {
    const date = new Date()
    this._id = staffProfile._id
    this.account_id = staffProfile.account_id
    this.staff_type = staffProfile.staff_type
    this.specialty_ids = staffProfile.specialty_ids || []
    this.rating = staffProfile.rating || 0
    this.year_of_experience = staffProfile.year_of_experience || 0
    this.bio = staffProfile.bio || ''
    this.created_at = staffProfile.created_at || date
    this.updated_at = staffProfile.updated_at || date
  }
}
