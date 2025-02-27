export const ERROR_RESPONSE_MESSAGES = {
  RESOURCE_NOT_FOUND: 'Resource not found',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
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
  RESOURCE_ADDED_TO_ROLE_SUCCESSFULLY: 'Resource added to role successfully'
} as const
export const ACCOUNT_MESSAGES = {
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_LENGTH_MUST_BE_FROM_10_TO_50: 'Email length must be from 10 to 50',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_5_TO_50: 'Password length must be from 5 to 50',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  PASSWORD_NOT_STRONG:
    'Password must be 5-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_5_TO_50: 'Confirm password length must be from 5 to 50',
  CONFIRM_PASSWORD_NOT_STRONG:
    'Password must be 5-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password'
} as const
export const ROLE_MESSAGES = {
  DEFAULT_ROLE_NOT_FOUND: 'Default role not found'
} as const
export const RESOURCE_MESSAGE = {} as const
