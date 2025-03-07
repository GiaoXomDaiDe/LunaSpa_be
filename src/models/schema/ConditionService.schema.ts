import { ObjectId } from 'mongodb'
export interface ConditionServiceType {
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
  note?: string
  created_at?: Date
  updated_at?: Date
  constructor(conditionService: ConditionServiceType) {
    this._id = conditionService._id
    this.condition_id = conditionService.condition_id
    this.service_id = conditionService.service_id
    this.note = conditionService.note
    this.created_at = conditionService.created_at
    this.updated_at = conditionService.updated_at
  }
}
