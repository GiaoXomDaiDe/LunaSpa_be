import { ObjectId } from 'mongodb'

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum TransactionMethod {
  PAYMENT = 'payment',
  REFUND = 'refund'
}

export enum CurrencyUnit {
  VND = 'vnd',
  USD = 'usd'
}

// Metadata cho giao dịch sản phẩm
export interface ProductTransactionMetadata {
  order_type: 'product'
  items: string // Danh sách tên sản phẩm, ngăn cách bằng dấu phẩy
  client_secret: string // Client secret từ Stripe
}

// Metadata cho giao dịch dịch vụ
export interface ServiceTransactionMetadata {
  order_type: 'service'
  service_name: string // Tên dịch vụ
  slot_id: string // ID của slot được đặt
  start_time?: string // Giờ bắt đầu (format HH:MM)
  end_time?: string // Giờ kết thúc (format HH:MM)
  booking_time?: string // Thời gian đặt lịch (ISO string)
  client_secret: string // Client secret từ Stripe
}

// Union type cho metadata
export type TransactionMetadata = ProductTransactionMetadata | ServiceTransactionMetadata

export interface TransactionData {
  _id?: ObjectId
  order_id: ObjectId
  customer_account_id?: ObjectId
  payment_method: string
  payment_provider: string
  amount: number
  currency: CurrencyUnit
  status: TransactionStatus
  type: TransactionMethod
  payment_intent_id?: string
  payment_method_id?: string
  charge_id?: string
  refund_id?: string
  session_id?: string
  created_at?: Date
  updated_at?: Date
  metadata?: Record<string, any>
  transaction_note?: string
}

export default class Transaction {
  _id?: ObjectId
  order_id: ObjectId
  customer_account_id?: ObjectId
  payment_method: string
  payment_provider: string
  amount: number
  currency: CurrencyUnit
  status: TransactionStatus
  type: TransactionMethod
  payment_intent_id?: string
  payment_method_id?: string
  charge_id?: string
  refund_id?: string
  session_id?: string
  created_at: Date
  updated_at: Date
  metadata: Record<string, any>
  transaction_note?: string

  constructor(transaction: TransactionData) {
    const date = new Date()
    this._id = transaction._id
    this.order_id = transaction.order_id
    this.customer_account_id = transaction.customer_account_id
    this.payment_method = transaction.payment_method
    this.payment_provider = transaction.payment_provider || ''
    this.amount = transaction.amount
    this.currency = transaction.currency
    this.status = transaction.status
    this.type = transaction.type
    this.payment_intent_id = transaction.payment_intent_id
    this.payment_method_id = transaction.payment_method_id
    this.charge_id = transaction.charge_id
    this.refund_id = transaction.refund_id
    this.session_id = transaction.session_id
    this.created_at = transaction.created_at || date
    this.updated_at = transaction.updated_at || date
    this.metadata = transaction.metadata || {}
    this.transaction_note = transaction.transaction_note
  }
}
