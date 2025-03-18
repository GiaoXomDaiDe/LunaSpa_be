import { ObjectId } from 'mongodb'

export enum ItemType {
  PRODUCT = 'product',
  SERVICE = 'service'
}

export interface FavoriteType {
  _id: ObjectId
  user_profile_id: ObjectId
  item_id: ObjectId
  item_type: ItemType
  created_at?: Date
  updated_at?: Date
}

export default class Favorite {
  _id: ObjectId
  user_profile_id: ObjectId
  item_id: ObjectId
  item_type: ItemType
  created_at?: Date
  updated_at?: Date

  constructor(favorite: FavoriteType) {
    const date = new Date()
    this._id = favorite._id || new ObjectId()
    this.user_profile_id = favorite.user_profile_id
    this.item_id = favorite.item_id
    this.item_type = favorite.item_type
    this.created_at = favorite.created_at || date
    this.updated_at = favorite.updated_at || date
  }
}
