import { ObjectId } from 'mongodb'
import { ItemType } from '~/models/schema/OrderDetail.schema'

export interface ReviewType {
  _id?: ObjectId
  user_profile_id: ObjectId
  item_type: ItemType
  item_id: ObjectId
  rating?: number
  comment?: string
  created_at?: Date
  updated_at?: Date
}
export default class Review {
  _id?: ObjectId
  user_profile_id: ObjectId
  item_type: ItemType
  item_id: ObjectId
  rating: number
  comment: string
  created_at?: Date
  updated_at?: Date
  constructor(review: ReviewType) {
    const date = new Date()
    this._id = review._id
    this.user_profile_id = review.user_profile_id
    this.item_type = review.item_type
    this.item_id = review.item_id
    this.rating = review.rating || 0
    this.comment = review.comment || ''
    this.created_at = review.created_at || date
    this.updated_at = review.updated_at || date
  }
}
