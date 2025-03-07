import { ObjectId } from 'mongodb'

export interface ConditionType {
  _id?: ObjectId
  name: string
  description: string
  instructions?: string
  created_at?: Date
  updated_at?: Date
}

export default class Condition {
  _id?: ObjectId
  name: string
  description: string
  instructions: string

  created_at: Date
  updated_at: Date
  constructor(condition: ConditionType) {
    const date = new Date()
    this._id = condition._id
    this.name = condition.name
    this.description = condition.description
    this.instructions = condition.instructions || ''
    this.created_at = condition.created_at || date
    this.updated_at = condition.updated_at || date
  }
}
