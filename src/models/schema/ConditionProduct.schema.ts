import { ObjectId } from 'mongodb'

export interface ConditionProductType {
  _id?: ObjectId
  condition_id: ObjectId
  product_id: ObjectId
  note?: string
  created_at?: Date
  updated_at?: Date
}
export default class ConditionProduct {
  _id?: ObjectId
  condition_id: ObjectId
  product_id: ObjectId
  note: string
  created_at?: Date
  updated_at?: Date
  constructor(conditionProduct: ConditionProductType) {
    const date = new Date()
    this._id = conditionProduct._id
    this.condition_id = conditionProduct.condition_id
    this.product_id = conditionProduct.product_id
    this.note = conditionProduct.note || ''
    this.created_at = conditionProduct.created_at || date
    this.updated_at = conditionProduct.updated_at || date
  }
}
