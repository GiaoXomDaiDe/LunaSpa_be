import { RequestHandler, Router } from 'express'
import {
  addConditionsToUserProfileController,
  addConditionToUserProfileController,
  createUserProfileController,
  deleteUserProfileController,
  getConditionsOfUserProfileController,
  getUserProfileByAccountIdController,
  getUserProfileController,
  getUserProfilesController,
  removeConditionFromUserProfileController,
  updateUserProfileController
} from '~/controllers/userProfiles.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  paginationValidator,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import { conditionIdValidator } from '~/middlewares/conditions.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import {
  accountIdValidator,
  updateUserProfileValidator,
  userProfileIdValidator,
  userProfileValidator
} from '~/middlewares/userProfiles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const userProfilesRouter = Router()

userProfilesRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'UserProfiles'),
  paginationValidator,
  wrapRequestHandler(getUserProfilesController as RequestHandler)
)

userProfilesRouter.get(
  '/:user_profile_id',
  accessTokenValidatorV2,
  checkPermission('read', 'UserProfiles'),
  userProfileIdValidator,
  wrapRequestHandler(getUserProfileController as RequestHandler)
)

userProfilesRouter.get(
  '/accounts/:account_id',
  accessTokenValidatorV2,
  checkPermission('read', 'UserProfiles'),
  accountIdValidator,
  wrapRequestHandler(getUserProfileByAccountIdController as RequestHandler)
)

userProfilesRouter.post(
  '',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'UserProfiles'),
  userProfileValidator,
  wrapRequestHandler(createUserProfileController as RequestHandler)
)

userProfilesRouter.patch(
  '/:user_profile_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'UserProfiles'),
  userProfileIdValidator,
  updateUserProfileValidator,
  wrapRequestHandler(updateUserProfileController as RequestHandler)
)

userProfilesRouter.delete(
  '/:user_profile_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'UserProfiles'),
  userProfileIdValidator,
  wrapRequestHandler(deleteUserProfileController as RequestHandler)
)

userProfilesRouter.post(
  '/:user_profile_id/conditions',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'UserProfiles'),
  userProfileIdValidator,
  wrapRequestHandler(addConditionsToUserProfileController as RequestHandler)
)
userProfilesRouter.post(
  '/:user_profile_id/conditions/:condition_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'UserProfiles'),
  userProfileIdValidator,
  conditionIdValidator,
  wrapRequestHandler(addConditionToUserProfileController as RequestHandler)
)
userProfilesRouter.delete(
  '/:user_profile_id/conditions/:condition_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'UserProfiles'),
  userProfileIdValidator,
  conditionIdValidator,
  wrapRequestHandler(removeConditionFromUserProfileController as RequestHandler)
)
userProfilesRouter.get(
  '/:user_profile_id/conditions',
  accessTokenValidatorV2,
  checkPermission('read', 'UserProfiles'),
  userProfileIdValidator,
  wrapRequestHandler(getConditionsOfUserProfileController as RequestHandler)
)
export default userProfilesRouter
