import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { SUCCESS_RESPONSE_MESSAGE } from '~/constants/messages'
import {
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload
} from '~/models/request/Account.requests'
import Account from '~/models/schema/Account.schema'
import accountsService from '~/services/accounts.services'

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await accountsService.register(req.body)
  res.json({
    message: SUCCESS_RESPONSE_MESSAGE.REGISTER_SUCCESS,
    result
  })
}
/* 
Lấy user thông qua req 

*/
export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response,
  next: NextFunction
) => {
  const account = req.account as Account
  const account_id = account._id as ObjectId
  const result = await accountsService.login({ account_id: account_id.toString(), verify: account.verify })
  res.json({
    message: SUCCESS_RESPONSE_MESSAGE.LOGIN_SUCCESS,
    result
  })
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const result = await accountsService.logout(refresh_token)
  res.json({
    message: result.message
  })
}
/* 
Nhận vào account_id, exp, verify từ decoded_refresh_token
=> Dùng để tạo access_token và refresh_token mới
=> exp nhằm để refresh_token mới có hạn sử dụng ngang với refresh_token cũ
Nhận vào refresh_token từ req.body
=> Dùng để xóa refresh_token cũ
add refresh token mới vào database
*/
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const { account_id, verify, exp } = req.decoded_refresh_token as TokenPayload
  const result = await accountsService.refreshToken({ account_id, verify, exp, refresh_token })
  res.json({
    message: SUCCESS_RESPONSE_MESSAGE.REFRESH_TOKEN_SUCCESS,
    result
  })
}
