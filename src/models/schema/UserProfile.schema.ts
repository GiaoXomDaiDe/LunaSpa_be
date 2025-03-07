import { ObjectId } from 'mongodb'

export interface UserProfileType {
  _id?: ObjectId
  account_id: ObjectId
  condition_ids: ObjectId[]
  created_at?: Date
  updated_at?: Date
}
export default class UserProfile {
  _id?: ObjectId
  account_id: ObjectId
  condition_ids: ObjectId[]
  created_at?: Date
  updated_at?: Date

  constructor(userProfile: UserProfileType) {
    const date = new Date()
    this._id = userProfile._id
    this.account_id = userProfile.account_id
    this.condition_ids = userProfile.condition_ids || []
    this.created_at = userProfile.created_at || date
    this.updated_at = userProfile.updated_at || date
  }
}
