import 'express'
import { TokenPayload } from '~/models/request/Account.requests'
import Account from '~/models/schema/Account.schema'

declare module 'express' {
  interface Request {
    account?: Account
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
  }
}
