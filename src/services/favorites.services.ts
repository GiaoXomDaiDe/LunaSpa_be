import { ObjectId, WithId } from 'mongodb'
import { FavoriteParams, GetFavoritesOfUserOptions, LikeItemReqBody } from '~/models/request/Favorites.request'
import Favorite from '~/models/schema/Favorite.schema'
import { buildFavoritesPipeline } from '~/pipelines/favorites.pipeline'
import databaseService from '~/services/database.services'

class FavoritesService {
  async likeItem({ user_profile_id, item_id, item_type }: LikeItemReqBody) {
    const result = await databaseService.favorites.findOneAndUpdate(
      {
        user_profile_id: new ObjectId(user_profile_id),
        item_id: new ObjectId(item_id),
        item_type
      },
      {
        $setOnInsert: new Favorite({
          _id: new ObjectId(),
          user_profile_id: new ObjectId(user_profile_id),
          item_id: new ObjectId(item_id),
          item_type
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result as WithId<Favorite>
  }
  async unlikeItem({ user_profile_id, item_id }: FavoriteParams) {
    const result = await databaseService.favorites.findOneAndDelete({
      user_profile_id: new ObjectId(user_profile_id),
      item_id: new ObjectId(item_id)
    })

    return result
  }
  async getFavoritesOfUser(options: GetFavoritesOfUserOptions, user_profile_id: string) {
    const { pipeline, _options } = buildFavoritesPipeline(options, user_profile_id)
    const favorites = await databaseService.favorites.aggregate(pipeline).toArray()
    const { data, total_count } = favorites[0]
    const count = total_count?.[0]?.count || 0
    return {
      data,
      total_count: count,
      limit: _options.limit,
      page: _options.page,
      total_pages: Math.ceil(count / (_options.limit as number))
    }
  }
}

const favoritesService = new FavoritesService()

export default favoritesService
