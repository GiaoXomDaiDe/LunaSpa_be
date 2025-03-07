import { ObjectId } from 'mongodb'

export interface History {
  order_id: ObjectId
  points_change: number
  reason: string
  date: Date
}

export interface RewardPointType {
  _id?: ObjectId
  account_id: ObjectId
  total_points?: number
  history?: History[]
  created_at?: Date
  updated_at?: Date
}
export default class RewardPoint {
  _id?: ObjectId
  account_id: ObjectId
  total_points: number
  history: History[]
  created_at?: Date
  updated_at?: Date
  constructor(rewardPoint: RewardPointType) {
    const date = new Date()
    this._id = rewardPoint._id
    this.account_id = rewardPoint.account_id
    this.total_points = rewardPoint.total_points || 0
    this.history = rewardPoint.history || []
    this.created_at = rewardPoint.created_at || date
    this.updated_at = rewardPoint.updated_at || date
  }
}
