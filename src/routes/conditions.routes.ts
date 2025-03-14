import { RequestHandler, Router } from 'express'
import {
  createConditionController,
  deleteConditionController,
  getAllConditionsController,
  getConditionController,
  updateConditionController
} from '~/controllers/conditions.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  paginationValidator,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import {
  conditionIdValidator,
  conditionsQueryValidator,
  conditionValidator,
  updateConditionValidator
} from '~/middlewares/conditions.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const conditionsRouter = Router()

conditionsRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'Conditions'),
  paginationValidator,
  conditionsQueryValidator,
  wrapRequestHandler(getAllConditionsController as RequestHandler)
)
conditionsRouter.get(
  '/:condition_id',
  accessTokenValidatorV2,
  checkPermission('read', 'Conditions'),
  conditionIdValidator,
  wrapRequestHandler(getConditionController as RequestHandler)
)
conditionsRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'Conditions'),
  conditionValidator,
  wrapRequestHandler(createConditionController as RequestHandler)
)
conditionsRouter.patch(
  '/:condition_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'Conditions'),
  conditionIdValidator,
  updateConditionValidator,
  wrapRequestHandler(updateConditionController as RequestHandler)
)
conditionsRouter.delete(
  '/:condition_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'Conditions'),
  conditionIdValidator,
  wrapRequestHandler(deleteConditionController as RequestHandler)
)
export default conditionsRouter
