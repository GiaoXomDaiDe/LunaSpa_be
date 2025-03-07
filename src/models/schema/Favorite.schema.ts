import { ObjectId } from 'mongodb'

export enum ItemType {
  PRODUCT = 'product',
  SERVICE = 'service'
}

export interface Items {
  item_id: ObjectId
  item_type: ItemType
  added_at: Date
}

export interface FavoriteType {
  _id?: ObjectId
  user_profile_id: ObjectId
  items?: Items[]
  created_at?: Date
  updated_at?: Date
}

export default class Favorite {
  _id?: ObjectId
  user_profile_id: ObjectId
  items: Items[]
  created_at?: Date
  updated_at?: Date

  constructor(favorite: FavoriteType) {
    const date = new Date()
    this._id = favorite._id
    this.user_profile_id = favorite.user_profile_id
    this.items = favorite.items || []
    this.created_at = favorite.created_at || date
    this.updated_at = favorite.updated_at || date
  }
}
