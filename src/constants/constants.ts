export const ORDER = ['asc', 'desc']
export const SORT_BY = ['created_at', 'price', 'discount_price', 'quantity']
export const SERVICE_SORT_BY = ['created_at', 'booking_count', 'view_count']
export const BRANCH_SORT_BY = ['created_at', 'rating']
export const REVIEW_SORT_BY = ['created_at', 'rating']

export const RESOURCE_NAME = {
  PRODUCT_CATEGORY: 'Product Categories',
  PRODUCT: 'Products',
  BRANCH: 'Branches',
  SERVICE: 'Services',
  REVIEW: 'Reviews',
  ORDER: 'Orders',
  TRANSACTION: 'Transactions',
  CONDITION: 'Conditions',
  DEVICE: 'Devices'
} as const

export const PERMISSION = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
} as const
