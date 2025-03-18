import { ParamsDictionary, Query } from 'express-serve-static-core'
import { Pagination } from '~/models/request/Pagination'
import { ItemType } from '~/models/schema/Favorite.schema'

export interface LikeItemReqBody {
  user_profile_id: string
  item_id: string
  item_type: ItemType
}

export interface FavoriteParams extends ParamsDictionary {
  item_id: string
  user_profile_id: string
}
export interface FavoriteReqQuery extends Pagination, Query {
  item_type: ItemType
}
export interface GetFavoritesOfUserOptions {
  limit?: number
  page?: number
  item_type?: ItemType
}
