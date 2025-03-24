import { ObjectId } from 'mongodb'

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  STRIPE = 'stripe',
  MOMO = 'momo',
  TRANSFER = 'transfer'
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
  booking_time?: Date
  start_time?: Date
  end_time?: Date
  status: OrderStatus
  total_price: number
  discount_amount: number
  final_price: number
  payment_method?: PaymentMethod
  transaction_id?: ObjectId
  note: string

  constructor(order: OrderType) {
    const date = new Date()
    this._id = order._id
    this.customer_account_id = order.customer_account_id
    this.branch_id = order.branch_id
    this.created_at = order.created_at || date
    this.updated_at = order.updated_at || date
    this.booking_time = order.booking_time
    this.start_time = order.start_time
    this.end_time = order.end_time
    this.status = order.status || OrderStatus.PENDING
    this.total_price = order.total_price || 0
    this.discount_amount = order.discount_amount || 0
    this.final_price = order.final_price || 0
    this.payment_method = order.payment_method
    this.transaction_id = order.transaction_id
    this.note = order.note || ''
  }
}
