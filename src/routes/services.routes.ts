import { RequestHandler, Router } from 'express'
import { getServiceProductsByServiceIdController } from '~/controllers/serviceProducts.controllers'
import {
  createServiceController,
  deleteServiceController,
  getAllServicesController,
  getServiceController,
  softDeleteServiceController,
  updateServiceController
} from '~/controllers/services.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  paginationValidator,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import {
  checkServiceNotInactive,
  serviceIdValidator,
  servicesQueryValidator,
  serviceValidator,
  updateServiceValidator
} from '~/middlewares/services.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const servicesRouter = Router()

servicesRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'Services'),
  paginationValidator,
  servicesQueryValidator,
  wrapRequestHandler(getAllServicesController as RequestHandler)
)

servicesRouter.get(
  '/:service_id',
  accessTokenValidatorV2,
  checkPermission('read', 'Services'),
  serviceIdValidator,
  checkServiceNotInactive,
  wrapRequestHandler(getServiceController)
)

servicesRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'Services'),
  serviceValidator,
  wrapRequestHandler(createServiceController)
)

servicesRouter.patch(
  '/:service_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'Services'),
  serviceIdValidator,
  updateServiceValidator,
  wrapRequestHandler(updateServiceController)
)

servicesRouter.delete(
  '/:service_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'Services'),
  serviceIdValidator,
  wrapRequestHandler(deleteServiceController)
)

servicesRouter.patch(
  '/:service_id/soft-delete',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'Services'),
  serviceIdValidator,
  wrapRequestHandler(softDeleteServiceController)
)

servicesRouter.get(
  '/:service_id/products',
  accessTokenValidatorV2,
  checkPermission('read', 'Services'),
  serviceIdValidator,
  wrapRequestHandler(getServiceProductsByServiceIdController)
)

export default servicesRouter
