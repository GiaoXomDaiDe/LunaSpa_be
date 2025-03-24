import { ObjectId } from 'mongodb'

export enum VoucherStatus {
  INACTIVE = -1,
  USED = 0,
  ACTIVE = 1
}

export interface VoucherType {
  _id?: ObjectId
  account_id: ObjectId
  code: string
  discount_percent: number
  status?: number
  points_spent: number
  created_at?: Date
  expired_at: Date
}

export default class Voucher {
  _id?: ObjectId
  account_id: ObjectId
  code: string
  discount_percent: number
  status: number
  points_spent: number
  created_at: Date
  expired_at: Date

  constructor(voucher: VoucherType) {
    const date = new Date()
    this._id = voucher._id
    this.account_id = voucher.account_id
    this.code = voucher.code
    this.discount_percent = voucher.discount_percent
    this.status = voucher.status || VoucherStatus.ACTIVE
    this.points_spent = voucher.points_spent
    this.created_at = voucher.created_at || date
    this.expired_at = voucher.expired_at
  }
}
