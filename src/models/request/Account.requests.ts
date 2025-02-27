import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'
import { AccountVerify } from '~/models/schema/Account.schema'

export interface RegisterReqBody {
  email: string
  password: string
  conform_password: string
}
export interface TokenPayload extends JwtPayload {
  account_id: string
  token_type: TokenType
  verify: AccountVerify
  exp: number
  iat: number
}
export interface LoginReqBody {
  email: string
  password: string
}
export interface LogoutReqBody {
  refresh_token: string
}
export interface RefreshTokenReqBody {
  refresh_token: string
}
