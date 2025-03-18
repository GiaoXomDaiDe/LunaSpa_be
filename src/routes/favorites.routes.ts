import { RequestHandler, Router } from 'express'
import {
  getFavoritesOfUserController,
  likeItemController,
  unlikeItemController
} from '~/controllers/favorites.controllers'
import { accessTokenValidator, paginationValidator, verifiedAccountValidator } from '~/middlewares/accounts.middleware'
import { DeleteItemValidator, ItemValidator } from '~/middlewares/favorites.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const favoritesRouter = Router()

favoritesRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'Favorites'),
  ItemValidator,
  wrapRequestHandler(likeItemController)
)

favoritesRouter.delete(
  '/:item_id/user-profiles/:user_profile_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'Favorites'),
  DeleteItemValidator,
  wrapRequestHandler(unlikeItemController)
)

favoritesRouter.get(
  '/user-profiles/:user_profile_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('read', 'Favorites'),
  paginationValidator,
  wrapRequestHandler(getFavoritesOfUserController as RequestHandler)
)

export default favoritesRouter
