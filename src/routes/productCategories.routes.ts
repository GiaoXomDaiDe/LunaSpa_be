import { Router } from 'express'
import { PERMISSION, RESOURCE_NAME } from '~/constants/constants'
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

productCategoriesRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission(PERMISSION.READ, RESOURCE_NAME.PRODUCT_CATEGORY),
  wrapRequestHandler(getAllProductCategoriesController)
)

productCategoriesRouter.get(
  '/:product_category_id',
  accessTokenValidatorV2,
  checkPermission(PERMISSION.READ, RESOURCE_NAME.PRODUCT_CATEGORY),
  productCategoryQueryValidator,
  wrapRequestHandler(getProductCategoryController)
)
productCategoriesRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.CREATE, RESOURCE_NAME.PRODUCT_CATEGORY),
  productCategoryValidator,
  wrapRequestHandler(createProductCategoryController)
)

productCategoriesRouter.patch(
  '/:product_category_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.UPDATE, RESOURCE_NAME.PRODUCT_CATEGORY),
  productCategoryQueryValidator,
  updateProductCategoryValidator,
  wrapRequestHandler(updateProductCategoryController)
)

productCategoriesRouter.delete(
  '/:product_category_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission(PERMISSION.DELETE, RESOURCE_NAME.PRODUCT_CATEGORY),
  productCategoryQueryValidator,
  wrapRequestHandler(deleteProductCategoryController)
)

export default productCategoriesRouter
