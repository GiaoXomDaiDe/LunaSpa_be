import { Router } from 'express'
import { PERMISSION, RESOURCE_NAME } from '~/constants/constants'
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductController,
  getServicesByProductIdController,
  softDeleteProductController,
  updateProductController
} from '~/controllers/products.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  paginationValidator,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import {
  checkProductNotInactive,
  createProductValidator,
  productIdParamValidator,
  productsQueryValidator,
  updateProductValidator
} from '~/middlewares/products.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const productsRouter = Router()

/**
 * @route GET /products
 * @description Lấy danh sách tất cả sản phẩm với phân trang, tìm kiếm và lọc
 * @query {number} page - Trang hiện tại (mặc định là 1)
 * @query {number} limit - Số lượng sản phẩm trên một trang (mặc định là 10)
 * @query {string} search - Từ khóa tìm kiếm (tùy chọn)
 * @query {string} sort - Tiêu chí sắp xếp (mặc định là created_at)
 * @query {string} order - Thứ tự sắp xếp: asc hoặc desc (mặc định là desc)
 * @query {string} category_id - ID danh mục để lọc (tùy chọn)
 * @query {number} min_price - Giá thấp nhất để lọc (tùy chọn)
 * @query {number} max_price - Giá cao nhất để lọc (tùy chọn)
 * @access Yêu cầu xác thực và quyền đọc sản phẩm
 */
productsRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission(PERMISSION.READ, RESOURCE_NAME.PRODUCT),
  paginationValidator,
  productsQueryValidator,
  wrapRequestHandler(getAllProductsController)
)

/**
 * @route GET /products/:product_id
 * @description Lấy thông tin chi tiết của một sản phẩm
 * @param {string} product_id - ID của sản phẩm cần lấy thông tin
 * @access Yêu cầu xác thực và quyền đọc sản phẩm
 */
productsRouter.get(
  '/:product_id',
  accessTokenValidatorV2,
  checkPermission(PERMISSION.READ, RESOURCE_NAME.PRODUCT),
  productIdParamValidator,
  checkProductNotInactive,
  wrapRequestHandler(getProductController)
)

/**
 * @route POST /products
 * @description Tạo mới một sản phẩm
 * @body {string} name - Tên sản phẩm (bắt buộc)
 * @body {string} description - Mô tả sản phẩm (tùy chọn)
 * @body {number} price - Giá sản phẩm (bắt buộc)
 * @body {number} discount_price - Giá khuyến mãi (tùy chọn)
 * @body {number} quantity - Số lượng trong kho (bắt buộc)
 * @body {string} category_id - ID danh mục sản phẩm (bắt buộc)
 * @body {string[]} images - Danh sách URL hình ảnh (tùy chọn)
 * @body {number} status - Trạng thái sản phẩm (tùy chọn, mặc định là active)
 * @access Yêu cầu xác thực và quyền tạo sản phẩm
 */
productsRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.CREATE, RESOURCE_NAME.PRODUCT),
  createProductValidator,
  wrapRequestHandler(createProductController)
)

/**
 * @route PATCH /products/:product_id
 * @description Cập nhật thông tin sản phẩm
 * @param {string} product_id - ID của sản phẩm cần cập nhật
 * @body {string} name - Tên sản phẩm (tùy chọn)
 * @body {string} description - Mô tả sản phẩm (tùy chọn)
 * @body {number} price - Giá sản phẩm (tùy chọn)
 * @body {number} discount_price - Giá khuyến mãi (tùy chọn)
 * @body {number} quantity - Số lượng trong kho (tùy chọn)
 * @body {string} category_id - ID danh mục sản phẩm (tùy chọn)
 * @body {string[]} images - Danh sách URL hình ảnh (tùy chọn)
 * @body {number} status - Trạng thái sản phẩm (tùy chọn)
 * @access Yêu cầu xác thực và quyền cập nhật sản phẩm
 */
productsRouter.patch(
  '/:product_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.UPDATE, RESOURCE_NAME.PRODUCT),
  productIdParamValidator,
  updateProductValidator,
  wrapRequestHandler(updateProductController)
)

/**
 * @route DELETE /products/:product_id
 * @description Xóa vĩnh viễn một sản phẩm
 * @param {string} product_id - ID của sản phẩm cần xóa
 * @access Yêu cầu xác thực và quyền xóa sản phẩm
 */
productsRouter.delete(
  '/:product_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.DELETE, RESOURCE_NAME.PRODUCT),
  productIdParamValidator,
  wrapRequestHandler(deleteProductController)
)

/**
 * @route PATCH /products/:product_id/soft-delete
 * @description Xóa mềm (đổi trạng thái thành inactive) một sản phẩm
 * @param {string} product_id - ID của sản phẩm cần xóa mềm
 * @access Yêu cầu xác thực và quyền cập nhật sản phẩm
 */
productsRouter.patch(
  '/:product_id/soft-delete',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.UPDATE, RESOURCE_NAME.PRODUCT),
  productIdParamValidator,
  checkProductNotInactive,
  wrapRequestHandler(softDeleteProductController)
)

/**
 * @route GET /products/:product_id/services
 * @description Lấy danh sách dịch vụ liên quan đến sản phẩm
 * @param {string} product_id - ID của sản phẩm cần lấy dịch vụ
 * @access Yêu cầu xác thực và quyền đọc sản phẩm
 */
productsRouter.get(
  '/:product_id/services',
  accessTokenValidatorV2,
  checkPermission(PERMISSION.READ, RESOURCE_NAME.PRODUCT),
  productIdParamValidator,
  wrapRequestHandler(getServicesByProductIdController)
)

export default productsRouter
