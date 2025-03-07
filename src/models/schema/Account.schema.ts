import { ObjectId } from 'mongodb'

export enum AccountVerify {
  UNVERIFIED = 0,
  VERIFIED = 1,
  DELETED = 2,
  BLOCKED = 3
}

export interface AccountType {
  _id?: ObjectId
  email: string
  password: string
  role_id: ObjectId
  name?: string
  phone_number?: string
  address?: string
  date_of_birth?: Date
  avatar?: string
  verify?: AccountVerify
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string
  forgot_password_token?: string
}

export default class Account {
  _id?: ObjectId
  email: string
  role_id: ObjectId
  password: string
  name: string
  phone_number: string
  address: string
  date_of_birth: Date
  avatar: string
  verify: AccountVerify
  created_at: Date
  updated_at: Date
  email_verify_token: string
  forgot_password_token: string
  constructor(account: AccountType) {
    const date = new Date()
    this._id = account._id
    this.email = account.email
    this.password = account.password
    this.role_id = account.role_id
    this.address = account.address || ''
    this.phone_number = account.phone_number || ''
    this.name = account.name || ''
    this.date_of_birth = account.date_of_birth || date
    this.avatar = account.avatar || ''
    this.verify = account.verify || AccountVerify.UNVERIFIED
    this.created_at = account.created_at || date
    this.updated_at = account.updated_at || date
    this.email_verify_token = account.email_verify_token || ''
    this.forgot_password_token = account.forgot_password_token || ''
  }
}
