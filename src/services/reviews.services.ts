import { ClientSession, ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { REVIEW_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { GetAllReviewsOptions, ReviewReqBody } from '~/models/request/Reviews.request'
import { ItemType } from '~/models/schema/Favorite.schema'
import Review from '~/models/schema/Review.schema'
import { buildReviewPipeline } from '~/pipelines/review.pipeline'
import { buildReviewsPipeline } from '~/pipelines/reviews.pipeline'
import databaseService from '~/services/database.services'

class ReviewsService {
  async getAllReviews(options: GetAllReviewsOptions) {
    const { pipeline, _options } = buildReviewsPipeline(options)
    const [reviews] = await databaseService.reviews.aggregate(pipeline).toArray()
    const { data, total_count } = reviews
    const count = total_count?.[0]?.count || 0
    return {
      data,
      total_count: count,
      page: _options.page,
      limit: _options.limit,
      total_pages: Math.ceil(count / (_options.limit as number))
    }
  }
  async getReview({ review_id, item_type }: { review_id: string; item_type: ItemType }, session?: ClientSession) {
    const pipeline = buildReviewPipeline(review_id, item_type)
    const [review] = await databaseService.reviews.aggregate(pipeline, { session }).toArray()
    if (!review) {
      throw new ErrorWithStatus({
        message: REVIEW_MESSAGES.REVIEW_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return review
  }
  async createReview(body: ReviewReqBody) {
    const reviewData = new Review({
      ...body,
      user_profile_id: new ObjectId(body.user_profile_id),
      item_id: new ObjectId(body.item_id),
      item_type: body.item_type
    })
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.reviews.insertOne(reviewData)
        console.log(result)
        if (!result.insertedId) {
          throw new ErrorWithStatus({
            message: REVIEW_MESSAGES.CREATED_REVIEW_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }
        const review = await this.getReview({ review_id: result.insertedId.toString(), item_type: body.item_type })
        if (!review) {
          throw new ErrorWithStatus({
            message: REVIEW_MESSAGES.REVIEW_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return review
      })
    } finally {
      await session.endSession()
    }
  }
  async updateReview(body: Partial<ReviewReqBody>, review_id: string) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const result = await databaseService.reviews.findOneAndUpdate(
          { _id: new ObjectId(review_id) },
          {
            $set: {
              ...body,
              user_profile_id: new ObjectId(body.user_profile_id),
              item_id: new ObjectId(body.item_id),
              item_type: body.item_type
            },
            $currentDate: { updated_at: true }
          },
          { session, returnDocument: 'after' }
        )
        if (!result) {
          throw new ErrorWithStatus({
            message: REVIEW_MESSAGES.REVIEW_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        const review = await this.getReview({ review_id: result._id.toString(), item_type: result.item_type }, session)
        return review
      })
    } finally {
      await session.endSession()
    }
  }
  async deleteReview({ review_id, item_type }: { review_id: string; item_type: ItemType }) {
    const session = databaseService.getClient().startSession()
    try {
      return await session.withTransaction(async () => {
        const review = await this.getReview({ review_id, item_type }, session)
        const result = await databaseService.reviews.deleteOne({ _id: new ObjectId(review_id) }, { session })
        if (!result.deletedCount) {
          throw new ErrorWithStatus({
            message: REVIEW_MESSAGES.REVIEW_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        return review
      })
    } finally {
      await session.endSession()
    }
  }
}
const reviewsService = new ReviewsService()
export default reviewsService
