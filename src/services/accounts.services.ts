import { omitBy } from 'lodash'
import { ObjectId } from 'mongodb'
import { envConfig } from '~/constants/config'
import { TokenType } from '~/constants/enums'
import { SUCCESS_RESPONSE_MESSAGE } from '~/constants/messages'
import { RegisterReqBody } from '~/models/request/Account.requests'
import Account, { AccountVerify } from '~/models/schema/Account.schema'
import RefreshToken from '~/models/schema/RefreshToken.schema'
import { buildUserRolesPipeline } from '~/pipelines/accounts.pipeline'
import databaseService from '~/services/database.services'
import rolesService from '~/services/roles.services'
import { hashPassword } from '~/utils/crypto'
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
  async signEmailVerifyToken({ account_id, verify }: { account_id: string; verify: AccountVerify }) {
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
  private signAccessAndRefreshToken({ account_id, verify }: { account_id: string; verify: AccountVerify }) {
    return Promise.all([this.signAccessToken({ account_id, verify }), this.signRefreshToken({ account_id, verify })])
  }
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: envConfig.jwtSecretRefreshToken
    })
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
        role_id: [defaultRole._id],
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
    const cleanedAccount = omitBy(addedAccount[0], (value, key) => {
      return value === '' || value === null
    })
    //flow cho verify account
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
}

const accountsService = new AccountsService()
export default accountsService
