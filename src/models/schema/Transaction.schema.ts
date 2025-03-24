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
  payment_intent_id?: string // Stripe Payment Intent ID
  payment_method_id?: string // Stripe Payment Method ID
  charge_id?: string // Stripe Charge ID
  refund_id?: string // Stripe Refund ID
  session_id?: string
  created_at?: Date
  updated_at?: Date
  metadata?: Record<string, any>
  momo_order_id?: string
  momo_trans_id?: string
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
  momo_order_id?: string
  momo_trans_id?: string
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
    this.momo_order_id = transaction.momo_order_id
    this.momo_trans_id = transaction.momo_trans_id
    this.transaction_note = transaction.transaction_note
  }
}
