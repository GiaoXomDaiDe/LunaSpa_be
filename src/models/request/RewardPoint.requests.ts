import { ParamsDictionary } from 'express-serve-static-core'
export interface AddPointsReqBody {
  order_id: string
  points_change: number
  reason: string
}

export interface RedeemPointsReqBody {
  points_to_redeem: number
  discount_percent: number
  expired_days: number
}

export interface ApplyVoucherReqBody {
  voucher_code: string
  order_id: string
}

export interface RewardPointsParams extends ParamsDictionary {
  account_id: string
}

export interface GetVouchersParams extends ParamsDictionary {
  account_id: string
}

export interface GetVoucherParams extends ParamsDictionary {
  voucher_id: string
}

export interface VoucherQuery {
  status?: string
}
