export const ERROR_RESPONSE_MESSAGES = {
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
<<<<<<< HEAD
=======
  ACCOUNT_NOT_FOUND: 'Account not found',
  ROLE_NOT_FOUND: 'Role not found',
>>>>>>> main
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
  REFRESH_TOKEN_SUCCESS: 'Refresh token successfully',
  GET_ME_SUCCESS: 'Get my profile successfully',
  UPDATE_ME_SUCCESS: 'Update my profile successfully'
} as const
export const ACCOUNT_MESSAGES = {
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_LENGTH_MUST_BE_FROM_10_TO_50: 'Email length must be from 10 to 50',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',
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
  RESET_PASSWORD_SUCCESS: 'Reset password successfully',
  GMAIL_NOT_VERIFIED: 'Google account not verified',
  EMAIL_NOT_FOUND: 'Email not found',
  ACCOUNT_NOT_VERIFIED: 'Account not verified',
  PHONE_NUMBER_IS_INVALID: 'Phone number is invalid',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601',
  ADDRESS_MUST_BE_A_STRING: 'Address must be a string',
  ADDRESS_LENGTH_MUST_BE_FROM_1_TO_255: 'Address length must be from 1 to 255',
  AVATAR_MUST_BE_A_STRING: 'Avatar must be a string',
  AVATAR_LENGTH_MUST_BE_FROM_1_TO_255: 'Avatar length must be from 1 to 255'
} as const
export const ROLE_MESSAGES = {
  DEFAULT_ROLE_NOT_FOUND: 'Default role not found',
<<<<<<< HEAD
  ROLE_IS_REQUIRE: 'Role is require',
  ROLE_MUST_BE_A_STRING: 'Role must be string',
  ROLE_CANNOT_CONTAIN_SPECIAL_CHARACTER: 'Role cannot contain special character',
  ROLE_IS_EXIST: 'Role is existed',
  ROLE_INVALID_RESOURCE: 'Invalid resource',
  ROLE_RESOURCE_CANNOT_EMPTY: 'Resource cannot empty',
  ROLE_CONTAIN_ADMIN: 'Cannot edit role admin',
  RESOURCE_ALREADY_EXISTS_IN_ROLE: 'Resource already exists in role'
} as const
export const RESOURCE_MESSAGE = {
  RESOURCE_IS_REQUIRE: 'Resource is require',
  RESOURCE_IS_EXISTED: 'Resource is existed',
  RESOURCE_MUST_BE_A_STRING: 'Resource must be string',
  RESSOURCE_CANNOT_CONTAIN_SPECIAL_CHARACTER: 'Resource cannot contain special character',
  RESOURCE_DESCRIPTION_IS_REQUIRE: 'Resource description is require',
  RESOURCE_DESCRIPTION_MUST_BE_A_STRING: 'Resource description must be string',
  RESOURCE_DESCRIPTION_CANNOT_LONGER_THAN_255: 'Resource description cannot longer than 255',
  RESOURCE_IS_ARRAY: 'Resource must be an array',
  RESOURCE_NOT_FOUND: 'Resource not found',
  PERMISSION_MUST_BE_BOOLEAN: 'permission must be boolean'
} as const
=======
  ROLE_IS_REQUIRED: 'Role is required',
  ROLE_MUST_NOT_HAVE_SPECIAL_CHARACTER: 'ROLE_MUST_NOT_HAVE_SPECIAL_CHARACTER'
} as const
export const RESOURCE_MESSAGE = {} as const
export const MEDIAS_MESSAGES = {
  UPLOAD_SUCCESS: 'Upload successfully',
  NOT_FOUND: 'Not found'
} as const
>>>>>>> main
