import { ParamsDictionary, Query } from 'express-serve-static-core'
import { StaffSlotStatus } from '../schema/StaffSlot.schema'
import { Pagination } from './Pagination'

export interface StaffSlotParams extends ParamsDictionary {
  staff_slot_id: string
}

export interface StaffProfileParams extends ParamsDictionary {
  staff_profile_id: string
}

export interface StaffSlotQuery extends Pagination, Query {
  staff_profile_id?: string
  date?: string
  start_date?: string
  end_date?: string
  status?: StaffSlotStatus
}

export interface GetStaffSlotsOptions {
  limit?: number
  page?: number
  staff_profile_id?: string
  date?: Date
  start_date?: Date
  end_date?: Date
  status?: StaffSlotStatus
}

export interface GetAvailableSlotsByServiceIdQuery extends Pagination, Query {
  service_id: string
  date?: string
  isHours?: string
}

export interface ServiceParams extends ParamsDictionary {
  service_id: string
}

export interface StaffSlotReqBody {
  staff_profile_id: string
  date: string // ISO string
  start_time: string // ISO string
  end_time: string // ISO string
  status?: StaffSlotStatus
  order_id?: string
}

export interface CreateMultipleStaffSlotsReqBody {
  staff_profile_id: string
  slots: {
    date: string // ISO string
    start_time: string // ISO string
    end_time: string // ISO string
  }[]
}

export interface GenerateStaffSlotsReqBody {
  staff_profile_id: string
  start_date: string // ISO string
  end_date: string // ISO string
  working_days: number[] // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  working_hours: {
    start_time: string // HH:mm format
    end_time: string // HH:mm format
    slot_duration: number // duration in minutes
  }
}

export interface UpdateStaffSlotReqBody {
  date?: string // ISO string
  start_time?: string // ISO string
  end_time?: string // ISO string
  status?: StaffSlotStatus
  order_id?: string
}

export interface UpdateStaffSlotStatusReqBody {
  status: StaffSlotStatus
  order_id?: string
}
