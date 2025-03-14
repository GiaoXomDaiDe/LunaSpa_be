import { Router } from 'express'
import {
  createServiceCategoryController,
  deleteServiceCategoryController,
  getAllServiceCategoriesController,
  getServiceCategoryController,
  updateServiceCategoryController
} from '~/controllers/serviceCategories.controllers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/accounts.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import {
  serviceCategoryQueryValidator,
  serviceCategoryValidator,
  updateServiceCategoryValidator
} from '~/middlewares/serviceCategories.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const serviceCategoriesRouter = Router()

/**
 * Description: Lấy danh sách danh mục dịch vụ
 * Path: /
 * Method: GET
 * Query: limit, page
 * Headers: access_token: Bearer token
 * Body: <none>
 */
serviceCategoriesRouter.get(
  '/',
  accessTokenValidator,
  checkPermission('read', 'Service Categories'),
  wrapRequestHandler(getAllServiceCategoriesController)
)

/**
 * Description: Lấy thông tin chi tiết danh mục dịch vụ
 * Path: /:service_category_id
 * Method: GET
 * Headers: access_token: Bearer token
 * Body: <none>
 */
serviceCategoriesRouter.get(
  '/:service_category_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('read', 'Service Categories'),
  serviceCategoryQueryValidator,
  wrapRequestHandler(getServiceCategoryController)
)

/**
 * Description: Tạo danh mục dịch vụ mới
 * Path: /
 * Method: POST
 * Headers: access_token: Bearer token
 * Body: {
 *    name: string
 *    description: string
 * }
 */
serviceCategoriesRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'Service Categories'),
  serviceCategoryValidator,
  wrapRequestHandler(createServiceCategoryController)
)

/**
 * Description: Cập nhật thông tin danh mục dịch vụ
 * Path: /:service_category_id
 * Method: PATCH
 * Headers: access_token: Bearer token
 * Body: {
 *    name?: string
 *    description?: string
 * }
 */
serviceCategoriesRouter.patch(
  '/:service_category_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'Service Categories'),
  serviceCategoryQueryValidator,
  updateServiceCategoryValidator,
  wrapRequestHandler(updateServiceCategoryController)
)

/**
 * Description: Xóa danh mục dịch vụ
 * Path: /:service_category_id
 * Method: DELETE
 * Headers: access_token: Bearer token
 * Body: <none>
 */
serviceCategoriesRouter.delete(
  '/:service_category_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'Service Categories'),
  serviceCategoryQueryValidator,
  wrapRequestHandler(deleteServiceCategoryController)
)

export default serviceCategoriesRouter
