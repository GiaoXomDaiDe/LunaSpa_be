export const ERROR_RESPONSE_MESSAGES = {
  RESOURCE_NOT_FOUND: 'Resource not found',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  ACCOUNT_NOT_FOUND: 'Account not found',
  ROLE_NOT_FOUND: 'Role not found',
  RESOURCE_CREATION_FAILED: 'Resource creation failed',
  ROLES_CREATION_FAILED: 'Roles creation failed',
  NO_UPDATE_FIELDS_PROVIDED: 'No data to update resource',
  VALIDATION_ERROR: 'Validation error',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_USED_OR_NOT_EXIST: 'Refresh token is used or not exist'
} as const
export const SUCCESS_RESPONSE_MESSAGE = {
  REGISTER_SUCCESS: 'Registered successfully',
  LOGIN_SUCCESS: 'Login successfully',
  LOGOUT_SUCCESS: 'Logout successfully',
  GET_ALL_RESOURCES_SUCCESSFULLY: 'Get all resources successfully',
  GET_RESOURCE_SUCCESSFULLY: 'Get resource successfully',
  RESOURCE_CREATED_SUCCESSFULLY: 'Resource created successfully',
  RESOURCE_UPDATED_SUCCESSFULLY: 'Resource updated successfully',
  RESOURCE_DELETED_SUCCESSFULLY: 'Resource deleted successfully',
  GET_ALL_ROLES_SUCCESSFULLY: 'Get all roles successfully',
  GET_ROLE_SUCCESSFULLY: 'Get role successfully',
  ROLES_CREATED_SUCCESSFULLY: 'Role created successfully',
  ROLES_UPDATED_SUCCESSFULLY: 'Role updated successfully',
  ROLES_DELETED_SUCCESSFULLY: 'Role deleted successfully',
  RESOURCE_ADDED_TO_ROLE_SUCCESSFULLY: 'Resource added to role successfully',
  REFRESH_TOKEN_SUCCESS: 'Refresh token successfully'
} as const
export const ACCOUNT_MESSAGES = {
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_LENGTH_MUST_BE_FROM_10_TO_50: 'Email length must be from 10 to 50',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_5_TO_50: 'Password length must be from 5 to 50',
  EMAIL_IS_INCORRECT: 'Email is incorrect',
  PASSWORD_IS_INCORRECT: 'Password is incorrect',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  PASSWORD_NOT_STRONG: 'Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  EMAIL_VERIFY_SUCCESS: 'Email verify successfully',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_5_TO_50: 'Confirm password length must be from 5 to 50',
  CONFIRM_PASSWORD_NOT_STRONG:
    'Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email successfully',
  CHECK_EMAIL_FOR_RESET_PASSWORD: 'Check email for reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password successfully',
  RESET_PASSWORD_SUCCESS: 'Reset password successfully'
} as const
export const ROLE_MESSAGES = {
  DEFAULT_ROLE_NOT_FOUND: 'Default role not found',
  ROLE_IS_REQUIRED: 'Role is required',
  ROLE_MUST_NOT_HAVE_SPECIAL_CHARACTER: 'ROLE_MUST_NOT_HAVE_SPECIAL_CHARACTER'
} as const
export const RESOURCE_MESSAGE = {} as const
