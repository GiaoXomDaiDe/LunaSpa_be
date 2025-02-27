import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: ObjectId
  token: string
  created_at?: Date
  account_id: ObjectId
  iat: number
  exp: number
}
export default class RefreshToken {
  _id?: ObjectId
  token: string
  created_at: Date
  account_id: ObjectId
  iat: Date
  exp: Date
  constructor({ _id, token, created_at, account_id, exp, iat }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.created_at = created_at || new Date()
    this.account_id = account_id
    this.iat = new Date(iat * 1000) // Convert Epoch time to Date
    this.exp = new Date(exp * 1000) // Convert Epoch time to Date
  }
}
