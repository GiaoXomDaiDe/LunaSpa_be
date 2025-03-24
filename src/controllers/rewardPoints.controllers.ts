import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { REWARD_POINT_MESSAGES, VOUCHER_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/request/Account.requests'
import {
  AddPointsReqBody,
  ApplyVoucherReqBody,
  GetVouchersParams,
  RedeemPointsReqBody,
  RewardPointsParams,
  VoucherQuery
} from '~/models/request/RewardPoint.requests'
import rewardPointsService from '~/services/rewardPoints.services'

// Lấy số điểm hiện có
export const getBalanceController = async (
  req: Request<RewardPointsParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { account_id } = req.params
  const result = await rewardPointsService.getBalance(account_id)
  res.json({
    message: REWARD_POINT_MESSAGES.GET_BALANCE_SUCCESS,
    result
  })
}

// Lấy lịch sử điểm
export const getHistoryController = async (req: Request<RewardPointsParams>, res: Response, next: NextFunction) => {
  const { account_id } = req.params
  const result = await rewardPointsService.getHistory(account_id)
  res.json({
    message: REWARD_POINT_MESSAGES.GET_HISTORY_SUCCESS,
    result
  })
}

// Thêm điểm
export const addPointsController = async (
  req: Request<ParamsDictionary, any, AddPointsReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const result = await rewardPointsService.addPoints(account_id, req.body)
  res.json({
    message: REWARD_POINT_MESSAGES.ADD_POINTS_SUCCESS,
    result
  })
}

// Đổi điểm lấy voucher
export const redeemPointsController = async (
  req: Request<ParamsDictionary, any, RedeemPointsReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const result = await rewardPointsService.redeemPoints(account_id, req.body)
  res.json({
    message: REWARD_POINT_MESSAGES.REDEEM_POINTS_SUCCESS,
    result
  })
}

// Lấy danh sách voucher
export const getVouchersController = async (
  req: Request<GetVouchersParams, any, any, VoucherQuery>,
  res: Response,
  next: NextFunction
) => {
  const { account_id } = req.params
  const { status } = req.query
  const result = await rewardPointsService.getVouchers(account_id, status ? Number(status) : undefined)
  res.json({
    message: VOUCHER_MESSAGES.GET_VOUCHERS_SUCCESS,
    result
  })
}

// Áp dụng voucher
export const applyVoucherController = async (
  req: Request<ParamsDictionary, any, ApplyVoucherReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { voucher_code, order_id } = req.body
  const result = await rewardPointsService.applyVoucher(voucher_code, order_id)
  res.json({
    message: VOUCHER_MESSAGES.APPLY_VOUCHER_SUCCESS,
    result
  })
}

// API có thể được gọi từ cron job hoặc khi user mở app
export const checkExpiredVouchersController = async (req: Request, res: Response) => {
  const result = await rewardPointsService.checkExpiredVouchers()
  res.json({
    message: VOUCHER_MESSAGES.CHECK_EXPIRED_VOUCHERS_SUCCESS,
    result
  })
}
