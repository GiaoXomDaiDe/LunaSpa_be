import { Router } from 'express'
import {
  createConditionServiceController,
  deleteConditionServiceController,
  getAllConditionServicesController,
  getConditionServiceController,
  getConditionsByServiceIdController,
  getServicesByConditionIdController,
  updateConditionServiceController
} from '~/controllers/conditionService.controllers'
import { accessTokenValidator, accessTokenValidatorV2 } from '~/middlewares/accounts.middleware'
import {
  conditionServiceQueryValidator,
  createConditionServiceValidator,
  updateConditionServiceValidator
} from '~/middlewares/conditionServices.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { paginationValidator } from '~/middlewares/specialties.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const conditionServicesRouter = Router()

conditionServicesRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'ConditionServices'),
  paginationValidator,
  conditionServiceQueryValidator,
  wrapRequestHandler(getAllConditionServicesController)
)

conditionServicesRouter.get(
  '/:condition_service_id',
  accessTokenValidator,
  wrapRequestHandler(getConditionServiceController)
)
conditionServicesRouter.get(
  '/condition/:condition_id',
  accessTokenValidator,
  wrapRequestHandler(getServicesByConditionIdController)
)

conditionServicesRouter.get(
  '/service/:service_id',
  accessTokenValidator,
  wrapRequestHandler(getConditionsByServiceIdController)
)

conditionServicesRouter.post(
  '/',
  accessTokenValidator,
  createConditionServiceValidator,
  wrapRequestHandler(createConditionServiceController)
)

conditionServicesRouter.patch(
  '/:condition_service_id',
  accessTokenValidator,
  updateConditionServiceValidator,
  wrapRequestHandler(updateConditionServiceController)
)

conditionServicesRouter.delete(
  '/:condition_service_id',
  accessTokenValidator,
  wrapRequestHandler(deleteConditionServiceController)
)

export default conditionServicesRouter
