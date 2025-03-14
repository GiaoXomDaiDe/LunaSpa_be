import { Router } from 'express'
import {
  createProductCategoryController,
  deleteProductCategoryController,
  getAllProductCategoriesController,
  getProductCategoryController,
  updateProductCategoryController
} from '~/controllers/productCategories.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import {
  productCategoryQueryValidator,
  productCategoryValidator,
  updateProductCategoryValidator
} from '~/middlewares/productCategories.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const productCategoriesRouter = Router()

/**
 * Description: Lấy danh sách danh mục sản phẩm
 * Path: /
 * Method: GET
 * Query: limit, page
 * Headers: access_token: Bearer token
 * Body: <none>
 */
productCategoriesRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'Product Categories'),
  wrapRequestHandler(getAllProductCategoriesController)
)

/**
 * Description: Lấy thông tin chi tiết danh mục sản phẩm
 * Path: /:id
 * Method: GET
 * Headers: access_token: Bearer token
 * Body: <none>
 */
productCategoriesRouter.get(
  '/:product_category_id',
  accessTokenValidatorV2,
  checkPermission('read', 'Product Categories'),
  productCategoryQueryValidator,
  wrapRequestHandler(getProductCategoryController)
)

/**
 * Description: Tạo danh mục sản phẩm mới
 * Path: /
 * Method: POST
 * Headers: access_token: Bearer token
 * Body: {
 *    name: string
 *    description: string
 * }
 */
productCategoriesRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'Product Categories'),
  productCategoryValidator,
  wrapRequestHandler(createProductCategoryController)
)

/**
 * Description: Cập nhật thông tin danh mục sản phẩm
 * Path: /:id
 * Method: PUT
 * Headers: access_token: Bearer token
 * Body: {
 *    name?: string
 *    description?: string
 * }
 */
productCategoriesRouter.put(
  '/:product_category_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'Product Categories'),
  productCategoryQueryValidator,
  updateProductCategoryValidator,
  wrapRequestHandler(updateProductCategoryController)
)

/**
 * Description: Xóa danh mục sản phẩm
 * Path: /:id
 * Method: DELETE
 * Headers: access_token: Bearer token
 * Body: <none>
 */
productCategoriesRouter.delete(
  '/:product_category_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'Product Categories'),
  productCategoryQueryValidator,
  wrapRequestHandler(deleteProductCategoryController)
)

export default productCategoriesRouter
