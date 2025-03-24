import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { REWARD_POINT_MESSAGES, VOUCHER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { AddPointsReqBody, RedeemPointsReqBody } from '~/models/request/RewardPoint.requests'
import RewardPoint from '~/models/schema/RewardPoint.schema'
import Voucher, { VoucherStatus } from '~/models/schema/Voucher.schema'
import databaseService from '~/services/database.services'
import { generateRandomString } from '~/utils/common'

class RewardPointsService {
  // Lấy thông tin điểm của người dùng
  async getBalance(account_id: string) {
    const rewardPoint = await databaseService.rewardPoints.findOne({ account_id: new ObjectId(account_id) })
    if (!rewardPoint) {
      // Nếu chưa có, tạo mới
      const newRewardPoint = new RewardPoint({
        account_id: new ObjectId(account_id),
        total_points: 0,
        history: []
      })
      await databaseService.rewardPoints.insertOne(newRewardPoint)
      return newRewardPoint
    }
    return rewardPoint
  }

  // Lấy lịch sử điểm của người dùng
  async getHistory(account_id: string) {
    const rewardPoint = await this.getBalance(account_id)
    return rewardPoint.history.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  // Thêm điểm cho người dùng
  async addPoints(account_id: string, payload: AddPointsReqBody) {
    const { order_id, points_change, reason } = payload
    const pointsChange = Number(points_change)

    await this.getBalance(account_id)
    // Tạo lịch sử
    const historyEntry = {
      order_id: new ObjectId(order_id),
      points_change: pointsChange,
      reason,
      date: new Date()
    }
    // Cập nhật điểm
    const result = await databaseService.rewardPoints.findOneAndUpdate(
      { account_id: new ObjectId(account_id) },
      {
        $inc: { total_points: pointsChange },
        $push: { history: historyEntry },
        $set: { updated_at: new Date() }
      },
      { returnDocument: 'after' }
    )
    if (!result) {
      throw new ErrorWithStatus({
        message: REWARD_POINT_MESSAGES.FAILED_TO_ADD_POINTS,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }

    return result
  }

  // Đổi điểm lấy voucher
  async redeemPoints(account_id: string, payload: RedeemPointsReqBody) {
    const { points_to_redeem, discount_percent, expired_days } = payload
    const pointsToRedeem = Number(points_to_redeem)

    // Kiểm tra số điểm
    const rewardPoint = await this.getBalance(account_id)
    if (rewardPoint.total_points < pointsToRedeem) {
      throw new ErrorWithStatus({
        message: REWARD_POINT_MESSAGES.NOT_ENOUGH_POINTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Tạo mã voucher
    const code = generateRandomString(10).toUpperCase()

    // Tính ngày hết hạn
    const expiredAt = new Date()
    expiredAt.setDate(expiredAt.getDate() + Number(expired_days))

    // Tạo voucher mới
    const voucher = new Voucher({
      account_id: new ObjectId(account_id),
      code,
      discount_percent: Number(discount_percent),
      points_spent: pointsToRedeem,
      expired_at: expiredAt
    })

    // Lưu voucher
    const result = await databaseService.vouchers.insertOne(voucher)

    if (!result.acknowledged) {
      throw new ErrorWithStatus({
        message: REWARD_POINT_MESSAGES.FAILED_TO_REDEEM_POINTS,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }

    // Trừ điểm
    const historyEntry = {
      order_id: new ObjectId(result.insertedId), // Dùng voucher ID làm order ID
      points_change: -pointsToRedeem,
      reason: `Đổi điểm lấy voucher giảm ${discount_percent}%`,
      date: new Date()
    }

    await databaseService.rewardPoints.updateOne(
      { account_id: new ObjectId(account_id) },
      {
        $inc: { total_points: -pointsToRedeem },
        $push: { history: historyEntry },
        $set: { updated_at: new Date() }
      }
    )

    return {
      ...voucher,
      _id: result.insertedId
    }
  }

  // Lấy danh sách voucher của người dùng
  async getVouchers(account_id: string, status?: number) {
    const filter: any = { account_id: new ObjectId(account_id) }

    if (status !== undefined) {
      filter.status = Number(status)
    }

    const vouchers = await databaseService.vouchers.find(filter).toArray()

    // Tính toán thời gian còn lại cho mỗi voucher
    const vouchersWithRemainingTime = vouchers.map((voucher) => {
      const now = new Date()
      const expired = new Date(voucher.expired_at)

      // Tính số ngày còn lại
      const diffTime = expired.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Cập nhật status nếu đã hết hạn nhưng chưa đánh dấu
      if (diffDays <= 0 && voucher.status === VoucherStatus.ACTIVE) {
        // Cập nhật trong DB (optional, có thể để cron job xử lý)
        databaseService.vouchers.updateOne({ _id: voucher._id }, { $set: { status: VoucherStatus.INACTIVE } })

        return {
          ...voucher,
          remaining_days: 0,
          status: VoucherStatus.INACTIVE
        }
      }

      return {
        ...voucher,
        remaining_days: Math.max(0, diffDays)
      }
    })

    return vouchersWithRemainingTime
  }

  // Áp dụng voucher
  async applyVoucher(voucher_code: string, order_id: string) {
    // Tìm voucher
    const voucher = await databaseService.vouchers.findOne({ code: voucher_code })
    if (!voucher) {
      throw new ErrorWithStatus({
        message: VOUCHER_MESSAGES.VOUCHER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Kiểm tra trạng thái
    if (voucher.status === VoucherStatus.USED) {
      throw new ErrorWithStatus({
        message: VOUCHER_MESSAGES.VOUCHER_USED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    if (voucher.status === VoucherStatus.INACTIVE) {
      throw new ErrorWithStatus({
        message: VOUCHER_MESSAGES.VOUCHER_INACTIVE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Kiểm tra hạn sử dụng
    if (new Date() > voucher.expired_at) {
      throw new ErrorWithStatus({
        message: VOUCHER_MESSAGES.VOUCHER_EXPIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Cập nhật trạng thái
    const result = await databaseService.vouchers.findOneAndUpdate(
      { code: voucher_code },
      { $set: { status: VoucherStatus.USED, updated_at: new Date() } },
      { returnDocument: 'after' }
    )

    if (!result) {
      throw new ErrorWithStatus({
        message: VOUCHER_MESSAGES.VOUCHER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Trả về thông tin khuyến mãi
    return {
      discount_percent: result.discount_percent,
      voucher_code: result.code,
      order_id
    }
  }

  // API có thể được gọi từ cron job hoặc khi user mở app
  async checkAndUpdateExpiredVouchers() {
    const result = await databaseService.vouchers.updateMany(
      {
        status: VoucherStatus.ACTIVE,
        expired_at: { $lt: new Date() }
      },
      {
        $set: { status: VoucherStatus.INACTIVE }
      }
    )

    return { updated_count: result.modifiedCount }
  }
  async checkExpiredVouchers() {
    return await this.checkAndUpdateExpiredVouchers()
  }
}

const rewardPointsService = new RewardPointsService()
export default rewardPointsService
