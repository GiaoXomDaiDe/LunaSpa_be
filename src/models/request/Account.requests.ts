import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'
import { AccountVerify } from '~/models/schema/Account.schema'
import { StaffType } from '~/models/schema/StaffProfile.schema'

export interface RegisterReqBody {
  email: string
  password: string
  conform_password: string
}

export interface TokenPayload extends JwtPayload {
  account_id: string
  user_id?: string
  token_type: TokenType
  verify: AccountVerify
  role?: string
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

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string
}

export interface ResetPasswordReqBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface UpdateMeReqBody {
  name?: string
  phone_number?: string
  address?: string
  date_of_birth?: Date
  avatar?: string
}

export interface UpdateToStaffReqBody {
  account_id: string
  staff_type: StaffType
  specialty_ids?: string[]
  bio?: string
}
