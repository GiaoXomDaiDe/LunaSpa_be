import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { ACCOUNT_MESSAGES, ERROR_RESPONSE_MESSAGES, SUCCESS_RESPONSE_MESSAGE } from '~/constants/messages'
import {
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload,
  VerifyEmailReqBody
} from '~/models/request/Account.requests'
import Account from '~/models/schema/Account.schema'
import accountsService from '~/services/accounts.services'
import databaseService from '~/services/database.services'

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

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { account_id } = req.decoded_email_verify_token as TokenPayload
  const account = await databaseService.accounts.findOne({ _id: new ObjectId(account_id) })
  //Nếu ko tìm thấy user thì mình sẽ báo lỗi
  if (!account) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: ERROR_RESPONSE_MESSAGES.ACCOUNT_NOT_FOUND
    })
  }
  //Đã verify rồi thì mình sẽ ko báo lỗi
  // mà mình sẽ trả về status OK vs message là user đã verify rồi
  if ((account as Account).email_verify_token === '') {
    res.json({
      message: ACCOUNT_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await accountsService.verifyEmail(account_id)
  res.json({
    message: ACCOUNT_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}
