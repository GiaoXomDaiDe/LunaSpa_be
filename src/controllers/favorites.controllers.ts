import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { FAVORITES_MESSAGES } from '~/constants/messages'
import { FavoriteParams, FavoriteReqQuery, LikeItemReqBody } from '~/models/request/Favorites.request'
import favoritesService from '~/services/favorites.services'

export const likeItemController = async (
  req: Request<ParamsDictionary, any, LikeItemReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await favoritesService.likeItem(req.body)
  res.json({
    message: FAVORITES_MESSAGES.LIKE_SUCCESSFULLY,
    result
  })
}

export const unlikeItemController = async (
  req: Request<FavoriteParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_profile_id, item_id } = req.params
  const result = await favoritesService.unlikeItem({ user_profile_id, item_id })
  res.json({
    message: FAVORITES_MESSAGES.UNLIKE_SUCCESSFULLY,
    result
  })
}

export const getFavoritesOfUserController = async (
  req: Request<ParamsDictionary, any, any, FavoriteReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { user_profile_id } = req.params
  const { limit, page, item_type } = req.query
  const options = {
    limit: Number(limit) || undefined,
    page: Number(page) || undefined,
    item_type: item_type || undefined
  }
  const result = await favoritesService.getFavoritesOfUser(options, user_profile_id)
  res.json({
    message: FAVORITES_MESSAGES.GET_FAVORITES_SUCCESSFULLY,
    result
  })
}
