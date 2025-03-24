import { ObjectId } from 'mongodb'

interface ConditionServiceType {
  _id?: ObjectId
  condition_id: ObjectId
  service_id: ObjectId
  note?: string
  created_at?: Date
  updated_at?: Date
}

export default class ConditionService {
  _id?: ObjectId
  condition_id: ObjectId
  service_id: ObjectId
  note: string
  created_at: Date
  updated_at: Date

  constructor({ _id, condition_id, service_id, note, created_at, updated_at }: ConditionServiceType) {
    this._id = _id
    this.condition_id = condition_id
    this.service_id = service_id
    this.note = note || ''
    this.created_at = created_at || new Date()
    this.updated_at = updated_at || new Date()
  }
}
