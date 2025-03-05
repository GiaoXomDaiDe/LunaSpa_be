import axios from 'axios'
import { omitBy } from 'lodash'
import { ObjectId } from 'mongodb'
import { envConfig } from '~/constants/config'
import { TokenType } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { ACCOUNT_MESSAGES, SUCCESS_RESPONSE_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { RegisterReqBody, UpdateMeReqBody } from '~/models/request/Account.requests'
import Account, { AccountVerify } from '~/models/schema/Account.schema'
import RefreshToken from '~/models/schema/RefreshToken.schema'
import { buildUserRolesPipeline } from '~/pipelines/accounts.pipeline'
import databaseService from '~/services/database.services'
import rolesService from '~/services/roles.services'
import { hashPassword } from '~/utils/crypto'
import { sendForgotPasswordEmail, sendVerifyRegisterEmail } from '~/utils/email'
import { signToken, verifyToken } from '~/utils/jwt'

class AccountsService {
  private signAccessToken({ account_id, verify }: { account_id: string; verify: AccountVerify }) {
    return signToken({
      payload: {
        account_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: envConfig.jwtSecretAccessToken as string,
      options: {
        expiresIn: envConfig.accessTokenLife
      }
    })
  }
  private signRefreshToken({ account_id, verify, exp }: { account_id: string; verify: AccountVerify; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          account_id,
          token_type: TokenType.RefreshToken,
          verify,
          exp
        },
        privateKey: envConfig.jwtSecretRefreshToken
      })
    }
    return signToken({
      payload: {
        account_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: envConfig.jwtSecretRefreshToken,
      options: {
        expiresIn: envConfig.refreshTokenLife
      }
    })
  }
  private signEmailVerifyToken({ account_id, verify }: { account_id: string; verify: AccountVerify }) {
    return signToken({
      payload: {
        account_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: envConfig.jwtSecretEmailVerifyToken,
      options: {
        expiresIn: envConfig.emailVerificationTokenLife
      }
    })
  }
  private signForgotPasswordToken({ account_id, verify }: { account_id: string; verify: AccountVerify }) {
    return signToken({
      payload: {
        account_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: envConfig.jwtSecretForgotPasswordToken,
      options: {
        expiresIn: envConfig.forgotPasswordTokenLife
      }
    })
  }
  private signAccessAndRefreshToken({ account_id, verify }: { account_id: string; verify: AccountVerify }) {
    return Promise.all([this.signAccessToken({ account_id, verify }), this.signRefreshToken({ account_id, verify })])
  }
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: envConfig.jwtSecretRefreshToken
    })
  }
  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: envConfig.googleClientId,
      client_secret: envConfig.googleClientSecret,
      redirect_uri: envConfig.googleRedirectUri,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }
  private async getOauthGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
    return data
  }
  private async getOauthFacebookToken(code: string) {
    const body = {
      code,
      client_id: envConfig.facebookClientId,
      client_secret: envConfig.facebookClientSecret,
      redirect_uri: envConfig.facebookRedirectUri
    }
    const { data } = await axios.post('https://graph.facebook.com/v22.0/oauth/access_token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    return data as {
      access_token: string
      token_type: string
      expires_in: number
    }
  }
  private async getOauthFacebookAppAccessToken() {
    const body = {
      client_id: envConfig.facebookClientId,
      client_secret: envConfig.facebookClientSecret,
      grant_type: 'client_credentials'
    }
    const { data } = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
      params: body
    })
    return data
  }
  private async getAccessTokenVerify(access_token: string, app_access_token: string) {
    const { data } = await axios.get('https://graph.facebook.com/v22.0/debug_token', {
      params: {
        input_token: access_token,
        access_token: app_access_token
      }
    })
    return data
  }
  private async getOauthFacebookUserInfo(user_id: string, user_access_token: string) {
    const { data } = await axios.get(`https://graph.facebook.com/v22.0/${user_id}`, {
      params: {
        fields: 'id,name,email,picture',
        access_token: user_access_token
      }
    })
    return data as {
      id: string
      name: string
      email: string
      picture: {
        data: {
          url: string
          is_silhouette: boolean
          width: number
          height: number
        }
      }
    }
  }
  async checkEmailExist(email: string) {
    const account = await databaseService.accounts.findOne({
      email
    })
    return Boolean(account)
  }
  async register(payload: RegisterReqBody) {
    const defaultRole = await rolesService.getDefaultRoles('user')
    const account_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      account_id: account_id.toString(),
      verify: AccountVerify.UNVERIFIED
    })
    const account = await databaseService.accounts.insertOne(
      new Account({
        ...payload,
        _id: account_id,
        email: payload.email,
        name: `user${account_id.toString()}`,
        email_verify_token,
        role_id: defaultRole._id,
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      account_id: account_id.toString(),
      verify: AccountVerify.UNVERIFIED
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ account_id: new ObjectId(account_id), token: refresh_token, exp, iat })
    )
    const addedAccount = await databaseService.accounts.aggregate(buildUserRolesPipeline(account.insertedId)).toArray()
    console.log(addedAccount)
    const cleanedAccount = omitBy(addedAccount[0], (value, key) => {
      return value === '' || value === null
    })
    // Flow verify email
    // 1. Server send email to user
    // 2. User click link in email
    // 3. Client send request to server with email_verify_token
    // 4. Server verify email_verify_token
    // 5. Client receive access_token and refresh_token
    if (cleanedAccount.verify === AccountVerify.UNVERIFIED) {
      await sendVerifyRegisterEmail(payload.email, email_verify_token)
    }
    return {
      access_token,
      refresh_token,
      user: cleanedAccount
    }
  }
  async login({ account_id, verify }: { account_id: string; verify: AccountVerify }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ account_id, verify })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ account_id: new ObjectId(account_id), token: refresh_token, exp, iat })
    )
    const account = await databaseService.accounts.aggregate(buildUserRolesPipeline(new ObjectId(account_id))).toArray()
    const cleanedAccount = omitBy(account[0], (value, key) => {
      return value === '' || value === null
    })
    return {
      access_token,
      refresh_token,
      user: cleanedAccount
    }
  }
  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: SUCCESS_RESPONSE_MESSAGE.LOGOUT_SUCCESS
    }
  }
  async refreshToken({
    account_id,
    verify,
    exp,
    refresh_token
  }: {
    account_id: string
    verify: AccountVerify
    exp: number
    refresh_token: string
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ account_id, verify }),
      this.signRefreshToken({ account_id, verify, exp })
    ])
    const decoded_refresh_token = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        account_id: new ObjectId(account_id),
        token: new_refresh_token,
        exp: decoded_refresh_token.exp,
        iat: decoded_refresh_token.iat
      })
    )
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }
  async verifyEmail(account_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ account_id, verify: AccountVerify.VERIFIED }),
      databaseService.accounts.updateOne({ _id: new ObjectId(account_id) }, [
        {
          $set: {
            email_verify_token: '',
            verify: AccountVerify.VERIFIED,
            updated_at: '$$NOW'
          }
        }
      ])
    ])
    const [access_token, refresh_token] = token
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ account_id: new ObjectId(account_id), token: refresh_token, exp, iat })
    )

    return {
      access_token,
      refresh_token
    }
  }
  async resendVerifyEmail(account_id: string, email: string) {
    const email_verify_token = await this.signEmailVerifyToken({ account_id, verify: AccountVerify.UNVERIFIED })
    await sendVerifyRegisterEmail(email, email_verify_token)
    //Cập nhật lại giá trị email_verify_token
    await databaseService.accounts.updateOne({ _id: new ObjectId(account_id) }, [
      {
        $set: {
          email_verify_token,
          updated_at: '$$NOW'
        }
      }
    ])
    return {
      message: ACCOUNT_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }
  async forgotPassword({ account_id, verify, email }: { account_id: string; verify: AccountVerify; email: string }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      account_id,
      verify
    })
    await databaseService.accounts.updateOne({ _id: new ObjectId(account_id) }, [
      {
        $set: {
          forgot_password_token,
          updated_at: '$$NOW'
        }
      }
    ])
    await sendForgotPasswordEmail(email, forgot_password_token)
    return {
      message: ACCOUNT_MESSAGES.CHECK_EMAIL_FOR_RESET_PASSWORD
    }
  }
  async resetPassword(user_id: string, password: string) {
    databaseService.accounts.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: ''
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: ACCOUNT_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }
  async oauth(code: string) {
    const { access_token: google_access_token, id_token: google_id_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getOauthGoogleUserInfo(google_access_token, google_id_token)
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: ACCOUNT_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const account = await databaseService.accounts.findOne({ email: userInfo.email })
    console.log(account)
    if (!account) {
      const password = hashPassword(Math.random().toString(36).substring(2, 15))
      const data = await this.register({
        email: userInfo.email,
        password,
        conform_password: password
      })
      console.log(data)
      //cap nhật lại thộng tin user sau
      await databaseService.accounts.findOneAndUpdate(
        { _id: data.user._id },
        {
          $set: {
            name: userInfo.name,
            avatar: userInfo.picture
          },
          $currentDate: {
            updated_at: true
          }
        },
        {
          returnDocument: 'after'
        }
      )
      return { ...data, newUser: 1, verify: AccountVerify.UNVERIFIED }
    }
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      account_id: account._id.toString(),
      verify: account.verify
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ account_id: new ObjectId(account._id), token: refresh_token, exp, iat })
    )
    return {
      access_token,
      refresh_token,
      newUser: 0,
      verify: account.verify
    }
  }
  async oauthFacebook(code: string) {
    const { access_token: facebook_access_token } = await this.getOauthFacebookToken(code)
    const { access_token: app_access_token } = await this.getOauthFacebookAppAccessToken()
    const { data } = await this.getAccessTokenVerify(facebook_access_token, app_access_token)
    const userInfo = await this.getOauthFacebookUserInfo(data.user_id, facebook_access_token)
    const account = await databaseService.accounts.findOne({ email: userInfo.email })
    if (!account) {
      const password = hashPassword(Math.random().toString(36).substring(2, 15))
      const accountData = await this.register({
        email: userInfo.email,
        password,
        conform_password: password
      })
      await databaseService.accounts.findOneAndUpdate(
        { _id: accountData.user._id },
        {
          $set: {
            name: userInfo.name,
            avatar: userInfo.picture.data.url,
            verify: AccountVerify.UNVERIFIED
          },
          $currentDate: {
            updated_at: true
          }
        },
        {
          returnDocument: 'after'
        }
      )
      return { ...data, newUser: 1, verify: AccountVerify.UNVERIFIED }
    }
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      account_id: account._id.toString(),
      verify: account.verify
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ account_id: new ObjectId(account._id), token: refresh_token, exp, iat })
    )
    return {
      access_token,
      refresh_token,
      newUser: 0,
      verify: account.verify
    }
  }
  async getMe(account_id: string) {
    const account = await databaseService.accounts.findOne(
      { _id: new ObjectId(account_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return account
  }
  async updateMe(account_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const account = await databaseService.accounts.findOneAndUpdate(
      { _id: new ObjectId(account_id) },
      {
        $set: {
          ...(_payload as UpdateMeReqBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return account
  }
}

const accountsService = new AccountsService()
export default accountsService
