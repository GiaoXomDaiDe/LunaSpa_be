import { ObjectId } from 'mongodb'

export enum StaffSlotStatus {
  AVAILABLE = 1,
  PENDING = 2,
  BOOKED = 3,
  CANCELLED = 4
}

export interface StaffSlotType {
  _id?: ObjectId
  staff_profile_id: ObjectId
  date: Date
  start_time: Date
  end_time: Date
  status: StaffSlotStatus
  booking_id?: ObjectId
  pending_at?: Date
  created_at?: Date
  updated_at?: Date
}
export default class StaffSlot {
  _id?: ObjectId
  staff_profile_id: ObjectId
  date: Date
  start_time: Date
  end_time: Date
  status: StaffSlotStatus
  booking_id?: ObjectId
  pending_at?: Date
  created_at: Date
  updated_at: Date

  constructor(staffSlot: StaffSlotType) {
    const date = new Date()
    this._id = staffSlot._id
    this.staff_profile_id = staffSlot.staff_profile_id
    this.date = staffSlot.date
    this.start_time = staffSlot.start_time
    this.end_time = staffSlot.end_time
    this.status = staffSlot.status
    this.booking_id = staffSlot.booking_id
    this.pending_at = staffSlot.pending_at || date
    this.created_at = staffSlot.created_at || date
    this.updated_at = staffSlot.updated_at || date
  }
}
