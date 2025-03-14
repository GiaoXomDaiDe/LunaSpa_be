import { RequestHandler, Router } from 'express'
import {
  addProductToServiceController,
  deleteProductOfServiceController,
  getOneProductOfServiceController,
  getProductsOfServiceController,
  updateProductOfServiceController
} from '~/controllers/servicesProductController'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import { ProductIdBodyValidator, productIdValidator, productsQueryValidator } from '~/middlewares/products.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import {
  serviceIdBodyValidator,
  serviceIdValidator,
  serviceProductIdValidator
} from '~/middlewares/services.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const servicesProductRouter = Router()
// Mô tả: Lấy danh sách product gắn với service_id chỉ định.
servicesProductRouter.get(
  '/:service_id/products',
  accessTokenValidatorV2,
  checkPermission('read', 'ServicesProducts'),
  serviceIdValidator,
  productsQueryValidator,
  wrapRequestHandler(getProductsOfServiceController as RequestHandler)
)

servicesProductRouter.get(
  '/:service_id/products/:product_id',
  accessTokenValidator,
  checkPermission('read', 'ServicesProducts'),
  serviceIdValidator,
  productIdValidator,
  wrapRequestHandler(getOneProductOfServiceController as RequestHandler)
)

servicesProductRouter.post(
  '/:service_id/products',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'ServicesProducts'),
  serviceIdValidator,
  ProductIdBodyValidator,
  wrapRequestHandler(addProductToServiceController as RequestHandler)
)

servicesProductRouter.patch(
  '/products/:service_product_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'ServicesProducts'),
  serviceIdBodyValidator,
  ProductIdBodyValidator,
  wrapRequestHandler(updateProductOfServiceController as RequestHandler)
)

servicesProductRouter.delete(
  '/:service_id/products/:service_product_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'ServicesProducts'),
  serviceIdValidator,
  serviceProductIdValidator,
  wrapRequestHandler(deleteProductOfServiceController as RequestHandler)
)

export default servicesProductRouter
