import { ParamsDictionary, Query } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { ItemType } from '~/models/schema/Favorite.schema'
import { Pagination } from './Pagination'

export interface ReviewQuery extends Pagination, Query {
  item_type?: string
  item_id?: string
  user_profile_id?: string
  sort?: string
  order?: string
  max_rating?: string
  min_rating?: string
}
export interface GetAllReviewsOptions {
  limit?: number
  page?: number
  item_type?: ItemType
  item_id?: ObjectId
  user_profile_id?: ObjectId
  sort?: string
  order?: string
  max_rating?: number
  min_rating?: number
}
export interface ReviewParams extends ParamsDictionary {
  review_id: string
}
export interface ItemReviewsParams extends ParamsDictionary {
  itemType: string
  itemId: string
}
export interface ReviewReqBody {
  user_profile_id: string
  item_type: ItemType
  item_id: string
  rating?: number
  comment?: string
}
