import { RequestHandler, Router } from 'express'
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
  '/categories',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getServiceCategoriesController
    res.json({ message: 'Get service categories successfully' })
  })
)

/**
 * @route GET /services/popular
 * @description Lấy danh sách dịch vụ phổ biến
 * @access Public
 *
 * @query {number} [limit=10] - Số lượng dịch vụ
 *
 * @returns {Array<Object>} 200 - Danh sách dịch vụ phổ biến
 */
servicesRouter.get(
  '/popular',
  wrapRequestHandler(async (req, res) => {
    // TODO: Implement getPopularServicesController
    res.json({ message: 'Get popular services successfully' })
  })
)

export default servicesRouter
