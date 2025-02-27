import { config } from 'dotenv'
import { StringValue } from 'ms'

config()

export const envConfig = {
  port: (process.env.PORT as string) || '4000',
  dbUsername: process.env.DB_USERNAME as string,
  dbPassword: process.env.DB_PASSWORD as string,
  dbName: process.env.DB_NAME as string,
  dbAccountsCollection: process.env.DB_ACCOUNTS_COLLECTION as string,
  dbResourcesCollection: process.env.DB_RESOURCES_COLLECTION as string,
  dbRolesCollection: process.env.DB_ROLES_COLLECTION as string,
  dbRefreshTokensCollection: process.env.DB_REFRESH_TOKENS_COLLECTION as string,
  jwtSecret: process.env.JWT_SECRET as string,
  passwordSecret: process.env.PASSWORD_SECRET as string,
  accessTokenLife: process.env.ACCESS_TOKEN_EXPIRES_IN as StringValue,
  refreshTokenLife: process.env.REFRESH_TOKEN_EXPIRES_IN as StringValue,
  emailVerificationTokenLife: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as StringValue,
  forgotPasswordTokenLife: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as StringValue,
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  jwtSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
}
