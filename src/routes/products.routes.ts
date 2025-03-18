import { RequestHandler, Router } from 'express'
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
  productIdValidator,
  productsQueryValidator,
  productValidator,
  updateProductValidator
} from '~/middlewares/products.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const productsRouter = Router()

productsRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'Products'),
  paginationValidator,
  productsQueryValidator,
  wrapRequestHandler(getAllProductsController as RequestHandler)
)

productsRouter.get(
  '/:product_id',
  accessTokenValidatorV2,
  checkPermission('read', 'Products'),
  productIdValidator,
  checkProductNotInactive,
  wrapRequestHandler(getProductController)
)

productsRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'Products'),
  productValidator,
  wrapRequestHandler(createProductController)
)

productsRouter.patch(
  '/:product_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'Products'),
  productIdValidator,
  updateProductValidator,
  wrapRequestHandler(updateProductController)
)

productsRouter.delete(
  '/:product_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'Devices'),
  productIdValidator,
  wrapRequestHandler(deleteProductController)
)

productsRouter.patch(
  '/:product_id/soft-delete',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'Products'),
  productIdValidator,
  checkProductNotInactive,
  wrapRequestHandler(softDeleteProductController)
)

productsRouter.get(
  '/:product_id/services',
  accessTokenValidatorV2,
  checkPermission('read', 'Products'),
  productIdValidator,
  wrapRequestHandler(getServicesByProductIdController)
)

export default productsRouter
