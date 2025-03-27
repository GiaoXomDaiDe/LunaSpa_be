import { ObjectId } from 'mongodb'

export enum TransactionTypeEnum {
  PAYMENT = 'payment',
  REFUND = 'refund',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal'
}

export interface TransactionTypeData {
  _id?: ObjectId
  name: string
  code: TransactionTypeEnum
  description?: string
  created_at?: Date
  updated_at?: Date
}

export default class TransactionType {
  _id?: ObjectId
  name: string
  code: TransactionTypeEnum
  description: string
  created_at: Date
  updated_at: Date

  constructor(transactionType: TransactionTypeData) {
    const date = new Date()
    this._id = transactionType._id
    this.name = transactionType.name
    this.code = transactionType.code
    this.description = transactionType.description || ''
    this.created_at = transactionType.created_at || date
    this.updated_at = transactionType.updated_at || date
  }
}
