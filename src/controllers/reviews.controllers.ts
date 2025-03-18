import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { omitBy } from 'lodash'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { REVIEW_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ItemReviewsParams, ReviewParams, ReviewQuery, ReviewReqBody } from '~/models/request/Reviews.request'
import { ItemType } from '~/models/schema/Favorite.schema'
import reviewsService from '~/services/reviews.services'

export const getAllReviewsController = async (
  req: Request<ParamsDictionary, any, any, ReviewQuery>,
  res: Response,
  next: NextFunction
) => {
  const { limit, page, item_id, item_type, user_profile_id, sort, order, max_rating, min_rating } = req.query
  const options = {
    limit: limit ? Number(limit) : undefined,
    page: page ? Number(page) : undefined,
    item_id: item_id ? new ObjectId(item_id) : undefined,
    item_type: item_type ? (item_type as ItemType) : undefined,
    user_profile_id: user_profile_id ? new ObjectId(user_profile_id) : undefined,
    sort: sort ? (sort as string) : undefined,
    order: order ? (order as string) : undefined,
    max_rating: max_rating ? Number(max_rating) : undefined,
    min_rating: min_rating ? Number(min_rating) : undefined
  }
  const result = await reviewsService.getAllReviews(options)
  res.status(HTTP_STATUS.OK).json({
    message: REVIEW_MESSAGES.GET_ALL_REVIEWS_SUCCESS,
    result
  })
}
export const getReviewController = async (
  req: Request<ReviewParams, any, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { review_id } = req.params
  const { item_type } = req
  const result = await reviewsService.getReview({ review_id, item_type: item_type as ItemType })
  res.status(HTTP_STATUS.OK).json({
    message: REVIEW_MESSAGES.GET_REVIEW_SUCCESS,
    result
  })
}
export const createReviewController = async (
  req: Request<ParamsDictionary, any, ReviewReqBody>,
  res: Response,
  next: NextFunction
) => {
  const review = await reviewsService.createReview(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: REVIEW_MESSAGES.CREATED_REVIEW_SUCCESS,
    result: review
  })
}

export const updateReviewController = async (
  req: Request<ReviewParams, any, ReviewReqBody>,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body
  const updateData = omitBy(payload, (value) => value === undefined || value === '')
  if (Object.keys(updateData).length === 0) {
    throw new ErrorWithStatus({
      message: REVIEW_MESSAGES.REVIEW_NOT_UPDATED,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  const { review_id } = req.params
  const result = await reviewsService.updateReview(updateData, review_id)
  res.status(HTTP_STATUS.OK).json({
    message: REVIEW_MESSAGES.UPDATE_REVIEW_SUCCESS,
    result
  })
}
export const deleteReviewController = async (
  req: Request<ReviewParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { review_id } = req.params
  const { item_type } = req
  const result = await reviewsService.deleteReview({ review_id, item_type: item_type as ItemType })
  res.status(HTTP_STATUS.OK).json({
    message: REVIEW_MESSAGES.DELETE_REVIEW_SUCCESS,
    result
  })
}

export const getItemReviewsController = async (
  req: Request<ItemReviewsParams, any, any, ReviewQuery>,
  res: Response,
  next: NextFunction
) => {
  const { itemType, itemId } = req.params
  const { limit, page, sort, order, max_rating, min_rating } = req.query

  const options = {
    limit: limit ? Number(limit) : undefined,
    page: page ? Number(page) : undefined,
    item_id: new ObjectId(itemId),
    item_type: itemType as ItemType,
    sort: sort ? (sort as string) : undefined,
    order: order ? (order as string) : undefined,
    max_rating: max_rating ? Number(max_rating) : undefined,
    min_rating: min_rating ? Number(min_rating) : undefined
  }

  const result = await reviewsService.getAllReviews(options)

  res.status(HTTP_STATUS.OK).json({
    message: REVIEW_MESSAGES.GET_ITEM_REVIEWS_SUCCESS,
    result
  })
}
