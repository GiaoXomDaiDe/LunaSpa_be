import { Router } from 'express'
import {
  createServiceProductController,
  deleteServiceProductController,
  getAllServiceProductsController,
  getServiceProductController,
  getServiceProductsByProductIdController,
  getServiceProductsByServiceIdController,
  updateServiceProductController
} from '~/controllers/serviceProducts.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  paginationValidator,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import {
  serviceProductIdValidator,
  serviceProductQueryValidator,
  serviceProductValidator,
  updateServiceProductValidator
} from '~/middlewares/serviceProducts.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const serviceProductsRouter = Router()

// Get all service products
serviceProductsRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'ServiceProducts'),
  paginationValidator,
  serviceProductQueryValidator,
  wrapRequestHandler(getAllServiceProductsController)
)

// Get a specific service product
serviceProductsRouter.get(
  '/:service_product_id',
  accessTokenValidatorV2,
  checkPermission('read', 'ServiceProducts'),
  serviceProductIdValidator,
  wrapRequestHandler(getServiceProductController)
)

// Get all service products for a specific service
serviceProductsRouter.get(
  '/service/:service_id',
  accessTokenValidatorV2,
  checkPermission('read', 'ServiceProducts'),
  wrapRequestHandler(getServiceProductsByServiceIdController)
)

// Get all service products for a specific product
serviceProductsRouter.get(
  '/product/:product_id',
  accessTokenValidatorV2,
  checkPermission('read', 'ServiceProducts'),
  wrapRequestHandler(getServiceProductsByProductIdController)
)

// Create a new service product
serviceProductsRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'ServiceProducts'),
  serviceProductValidator,
  wrapRequestHandler(createServiceProductController)
)

// Update a service product
serviceProductsRouter.patch(
  '/:service_product_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'ServiceProducts'),
  serviceProductIdValidator,
  updateServiceProductValidator,
  wrapRequestHandler(updateServiceProductController)
)

// Delete a service product
serviceProductsRouter.delete(
  '/:service_product_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'ServiceProducts'),
  serviceProductIdValidator,
  wrapRequestHandler(deleteServiceProductController)
)

export default serviceProductsRouter
