import { Router } from 'express'
import {
  createConditionProductController,
  deleteConditionProductController,
  getAllConditionProductsController,
  getConditionProductController,
  getConditionsByProductIdController,
  getProductsByConditionIdController,
  updateConditionProductController
} from '~/controllers/conditionProducts.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  paginationValidator,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import {
  checkConditionProductDuplicate,
  checkConditionProductExists,
  conditionProductIdValidator,
  conditionProductQueryValidator,
  conditionProductValidator,
  updateConditionProductValidator
} from '~/middlewares/conditionProducts.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const conditionProductsRouter = Router()

// Lấy tất cả liên kết condition-product
conditionProductsRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'ConditionProducts'),
  paginationValidator,
  conditionProductQueryValidator,
  wrapRequestHandler(getAllConditionProductsController)
)

// Lấy chi tiết một liên kết condition-product
conditionProductsRouter.get(
  '/:condition_product_id',
  accessTokenValidatorV2,
  checkPermission('read', 'ConditionProducts'),
  conditionProductIdValidator,
  wrapRequestHandler(getConditionProductController)
)

// Lấy danh sách products theo condition_id
conditionProductsRouter.get(
  '/condition/:condition_id',
  accessTokenValidatorV2,
  checkPermission('read', 'ConditionProducts'),
  paginationValidator,
  wrapRequestHandler(getProductsByConditionIdController)
)

// Lấy danh sách conditions theo product_id
conditionProductsRouter.get(
  '/product/:product_id',
  accessTokenValidatorV2,
  checkPermission('read', 'ConditionProducts'),
  paginationValidator,
  wrapRequestHandler(getConditionsByProductIdController)
)

// Tạo một liên kết condition-product mới - yêu cầu đăng nhập
conditionProductsRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'ConditionProducts'),
  conditionProductValidator,
  checkConditionProductDuplicate,
  wrapRequestHandler(createConditionProductController)
)

// Cập nhật một liên kết condition-product - yêu cầu đăng nhập
conditionProductsRouter.patch(
  '/:condition_product_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'ConditionProducts'),
  conditionProductIdValidator,
  checkConditionProductExists,
  updateConditionProductValidator,
  checkConditionProductDuplicate,
  wrapRequestHandler(updateConditionProductController)
)

// Xóa một liên kết condition-product - yêu cầu đăng nhập
conditionProductsRouter.delete(
  '/:condition_product_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'ConditionProducts'),
  conditionProductIdValidator,
  checkConditionProductExists,
  wrapRequestHandler(deleteConditionProductController)
)

export default conditionProductsRouter
