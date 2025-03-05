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
  jwtSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  jwtSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  awsRegion: process.env.AWS_REGION as string,
  sesFromAddress: process.env.SES_FROM_ADDRESS as string,
  clientUrl: process.env.CLIENT_URL as string,
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI as string,
  clientRedirectGoogleCallback: process.env.CLIENT_REDIRECT_GOOGLE_CALLBACK as string,
  clientRedirectFacebookCallback: process.env.CLIENT_REDIRECT_FACEBOOK_CALLBACK as string,
  facebookClientId: process.env.FACEBOOK_CLIENT_ID as string,
  facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
  facebookRedirectUri: process.env.FACEBOOK_REDIRECT_URI as string,
  facebookAppId: process.env.FACEBOOK_APP_ID as string,
  s3Bucket: process.env.S3_BUCKET as string,
  s3Region: process.env.S3_REGION as string,
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID as string,
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string
}
