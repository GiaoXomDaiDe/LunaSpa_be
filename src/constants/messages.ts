export const CONFIG_MESSAGES = {
  VALIDATION_ERROR: 'Validation error'
} as const

export const USERS_MESSAGES = {
  DEFAULT_ROLE_NOT_FOUND: 'Default role not found',
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  USER_NOT_FOUND: 'User not found',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be from 6 to 50',
  PASSWORD_MUST_BE_STRONG:
    'Password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password length must be from 6 to 50',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601',
  LOGIN_SUCCESS: 'Login success',
  REGISTER_SUCCESS: 'Register success',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  LOGOUT_SUCCESS: 'Logout success',
  REFRESH_TOKEN_SUCCESS: 'Refresh token success'
} as const

export const PRODUCT_MESSAGES = {
  NAME_IS_REQUIRED: 'Product name is required',
  NAME_CANNOT_BE_EMPTY: 'Product name cannot be empty',
  NAME_MUST_BE_A_STRING: 'Product name must be a string',
  NAME_MUST_BE_BETWEEN_3_AND_100_CHARACTERS: 'Product name must be between 3 and 100 characters',
  PRICE_IS_REQUIRED: 'Price is required',
  PRICE_CANNOT_BE_EMPTY: 'Price cannot be empty',
  PRICE_MUST_BE_A_NUMBER: 'Price must be a number',
  CATEGORY_ID_IS_REQUIRED: 'Category ID is required',
  CATEGORY_ID_CANNOT_BE_EMPTY: 'Category ID cannot be empty',
  CATEGORY_ID_MUST_BE_VALID_OBJECTID: 'Category ID must be a valid ObjectId',
  DESCRIPTION_MUST_BE_A_STRING: 'Description must be a string',
  DESCRIPTION_MUST_NOT_EXCEED_500_CHARACTERS: 'Description must not exceed 500 characters',
  IMAGES_MUST_BE_AN_ARRAY: 'Images must be an array',
  EACH_IMAGE_MUST_BE_A_STRING: 'Each image must be a string',
  PRODUCT_NOT_FOUND: 'Product not found',
  PRODUCT_CREATED_SUCCESSFULLY: 'Product created successfully',
  PRODUCT_RETRIEVED_SUCCESSFULLY: 'Product retrieved successfully',
  PRODUCT_UPDATED_SUCCESSFULLY: 'Product updated successfully',
  PRODUCT_DELETED_SUCCESSFULLY: 'Product deleted successfully',
  PRODUCT_ID_IS_MISMATCHED: 'Product ID is mismatched'
} as const

export const CATEGORY_MESSAGES = {
  NAME_IS_REQUIRED: 'Name is required',
  NAME_CANNOT_BE_EMPTY: 'Name cannot be empty',
  NAME_MUST_BE_BETWEEN_3_AND_50_CHARACTERS: 'Name must be between 3 and 50 characters',
  ID_IS_REQUIRED: 'ID is required',
  ID_CANNOT_BE_EMPTY: 'ID cannot be empty',
  CODE_MUST_BE_IN_THE_FORMAT_C_4_DIGITS: 'Code must be in the format C + 4 digits (e.g., C1234)',
  DESCRIPTION_MUST_BE_A_STRING: 'Description must be a string',
  DESCRIPTION_MUST_NOT_EXCEED_200_CHARACTERS: 'Description must not exceed 200 characters',
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_ID_IS_MISMATCHED: 'Category ID is mismatched',
  CATEGORY_CREATED_SUCCESSFULLY: 'Category created successfully',
  CATEGORY_RETRIEVED_SUCCESSFULLY: 'Category retrieved successfully',
  CATEGORY_UPDATED_SUCCESSFULLY: 'Category updated successfully',
  CATEGORY_DELETED_SUCCESSFULLY: 'Category deleted successfully'
} as const
