import { RequestHandler, Router } from 'express'
import {
  createReviewController,
  deleteReviewController,
  getAllReviewsController,
  getItemReviewsController,
  getReviewController,
  updateReviewController
} from '~/controllers/reviews.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  paginationValidator,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import {
  itemReviewsValidator,
  reviewIdValidator,
  reviewsQueryValidator,
  reviewsValidator
} from '~/middlewares/reviews.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const reviewsRouter = Router()

reviewsRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'Reviews'),
  paginationValidator,
  reviewsQueryValidator,
  wrapRequestHandler(getAllReviewsController as RequestHandler)
)
reviewsRouter.get(
  '/:review_id',
  accessTokenValidatorV2,
  checkPermission('read', 'Reviews'),
  reviewIdValidator,
  wrapRequestHandler(getReviewController)
)
reviewsRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'Reviews'),
  reviewsValidator,
  wrapRequestHandler(createReviewController)
)

reviewsRouter.patch(
  '/:review_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'Reviews'),
  reviewIdValidator,
  reviewsValidator,
  wrapRequestHandler(updateReviewController)
)
reviewsRouter.delete(
  '/:review_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'Reviews'),
  reviewIdValidator,
  wrapRequestHandler(deleteReviewController)
)

reviewsRouter.get(
  '/items/:itemType/:itemId',
  accessTokenValidatorV2,
  checkPermission('read', 'Reviews'),
  paginationValidator,
  itemReviewsValidator,
  reviewsQueryValidator,
  wrapRequestHandler(getItemReviewsController as RequestHandler)
)

export default reviewsRouter
