import { ObjectId } from 'mongodb'

export enum OrderStatus {
  PENDING = 1,
  CONFIRMED = 2,
  CANCELLED = 3,
  COMPLETED = 4
}

export enum PaymentMethod {
  CREDIT_CARD = 1,
  MOMO = 2,
  ZALOPAY = 3,
  VNPAY = 4
}

export interface OrderType {
  _id?: ObjectId
  customer_account_id: ObjectId
  branch_id: ObjectId
  created_at?: Date
  updated_at?: Date
  booking_time?: Date
  start_time?: Date
  end_time?: Date
  status?: OrderStatus
  total_price?: number
  discount_amount?: number
  final_price?: number
  payment_method?: PaymentMethod
  transaction_id?: ObjectId
  note?: string
}

export default class Order {
  _id?: ObjectId
  customer_account_id: ObjectId
  branch_id: ObjectId
  created_at: Date
  updated_at: Date
  booking_time: Date
  start_time: Date
  end_time: Date
  status: OrderStatus
  total_price: number
  discount_amount: number
  final_price: number
  payment_method: PaymentMethod
  transaction_id: ObjectId

  note: string
  constructor(order: OrderType) {
    const date = new Date()
    this._id = order._id
    this.customer_account_id = order.customer_account_id
    this.branch_id = order.branch_id
    this.created_at = order.created_at || date
    this.updated_at = order.updated_at || date
    this.booking_time = order.booking_time || date
    this.start_time = order.start_time || date
    this.end_time = order.end_time || date
    this.status = order.status || OrderStatus.PENDING
    this.total_price = order.total_price || 0
    this.discount_amount = order.discount_amount || 0
    this.final_price = order.final_price || 0
    this.payment_method = order.payment_method || PaymentMethod.CREDIT_CARD
    this.transaction_id = order.transaction_id || new ObjectId()
    this.note = order.note || ''
  }
}
