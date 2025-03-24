import { ObjectId } from 'mongodb'

export enum StaffSlotStatus {
  AVAILABLE = 'available',
  PENDING = 'pending',
  RESERVED = 'reserved',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface StaffSlotType {
  _id?: ObjectId
  staff_profile_id: ObjectId
  date: Date
  start_time: Date
  end_time: Date
  status: StaffSlotStatus
  order_id?: ObjectId
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
  order_id?: ObjectId
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
    this.status = staffSlot.status || StaffSlotStatus.AVAILABLE
    this.order_id = staffSlot.order_id
    this.pending_at = staffSlot.pending_at
    this.created_at = staffSlot.created_at || date
    this.updated_at = staffSlot.updated_at || date
  }
}
