import { Router } from 'express'
import cron from 'node-cron'
import {
  addPointsController,
  applyVoucherController,
  checkExpiredVouchersController,
  getBalanceController,
  getHistoryController,
  getVouchersController,
  redeemPointsController
} from '~/controllers/rewardPoints.controllers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/accounts.middleware'
import { addPointsValidator, applyVoucherValidator, redeemPointsValidator } from '~/middlewares/rewardPoints.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { accountIdValidator } from '~/middlewares/userProfiles.middleware'
import rewardPointsService from '~/services/rewardPoints.services'
import { wrapRequestHandler } from '~/utils/handlers'

const rewardPointsRouter = Router()

// API lấy điểm
rewardPointsRouter.get(
  '/balance/:account_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('read', 'RewardPoints'),
  accountIdValidator,
  wrapRequestHandler(getBalanceController)
)

// API lấy lịch sử điểm
rewardPointsRouter.get(
  '/history/:account_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('read', 'RewardPoints'),
  accountIdValidator,
  wrapRequestHandler(getHistoryController)
)

// API thêm điểm
rewardPointsRouter.post(
  '/add',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'RewardPoints'),
  addPointsValidator,
  wrapRequestHandler(addPointsController)
)

// API đổi điểm lấy voucher
rewardPointsRouter.post(
  '/redeem',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'RewardPoints'),
  redeemPointsValidator,
  wrapRequestHandler(redeemPointsController)
)

// API lấy danh sách voucher
rewardPointsRouter.get(
  '/vouchers/:account_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('read', 'RewardPoints'),
  accountIdValidator,

  wrapRequestHandler(getVouchersController)
)

// API áp dụng voucher
rewardPointsRouter.post(
  '/apply-voucher',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'RewardPoints'),
  applyVoucherValidator,
  wrapRequestHandler(applyVoucherController)
)

rewardPointsRouter.post(
  '/check-expired-vouchers',
  accessTokenValidator,
  wrapRequestHandler(checkExpiredVouchersController)
)

// Chạy mỗi ngày lúc 00:00
cron.schedule('0 0 * * *', async () => {
  await rewardPointsService.checkAndUpdateExpiredVouchers()
  console.log('Đã cập nhật voucher hết hạn')
})

export default rewardPointsRouter
