import { RequestHandler, Router } from 'express'
import {
  addSpecialtiesToStaffProfileController,
  addSpecialtyToStaffProfileController,
  createStaffProfileController,
  deleteStaffProfileController,
  getSpecialtiesOfStaffProfileController,
  getStaffProfileByAccountIdController,
  getStaffProfileController,
  getStaffProfilesController,
  removeSpecialtyFromStaffProfileController,
  updateStaffProfileController
} from '~/controllers/staffProfiles.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  paginationValidator,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { specialtyIdValidator } from '~/middlewares/specialties.middleware'
import {
  accountIdValidator,
  staffProfileIdValidator,
  staffProfileValidator,
  updateStaffProfileValidator
} from '~/middlewares/staffProfiles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const staffProfilesRouter = Router()

staffProfilesRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'StaffProfiles'),
  paginationValidator,
  wrapRequestHandler(getStaffProfilesController as RequestHandler)
)

staffProfilesRouter.get(
  '/:staff_profile_id',
  accessTokenValidatorV2,
  checkPermission('read', 'StaffProfiles'),
  staffProfileIdValidator,
  wrapRequestHandler(getStaffProfileController as RequestHandler)
)

staffProfilesRouter.get(
  '/accounts/:account_id',
  accessTokenValidatorV2,
  checkPermission('read', 'StaffProfiles'),
  accountIdValidator,
  wrapRequestHandler(getStaffProfileByAccountIdController as RequestHandler)
)

staffProfilesRouter.post(
  '',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'StaffProfiles'),
  staffProfileValidator,
  wrapRequestHandler(createStaffProfileController as RequestHandler)
)

staffProfilesRouter.patch(
  '/:staff_profile_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'StaffProfiles'),
  staffProfileIdValidator,
  updateStaffProfileValidator,
  wrapRequestHandler(updateStaffProfileController as RequestHandler)
)

staffProfilesRouter.delete(
  '/:staff_profile_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'StaffProfiles'),
  staffProfileIdValidator,
  wrapRequestHandler(deleteStaffProfileController as RequestHandler)
)

staffProfilesRouter.post(
  '/:staff_profile_id/specialties',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'StaffProfiles'),
  staffProfileIdValidator,
  wrapRequestHandler(addSpecialtiesToStaffProfileController as RequestHandler)
)
staffProfilesRouter.post(
  '/:staff_profile_id/specialties/:specialty_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'StaffProfiles'),
  staffProfileIdValidator,
  specialtyIdValidator,
  wrapRequestHandler(addSpecialtyToStaffProfileController as RequestHandler)
)
staffProfilesRouter.delete(
  '/:staff_profile_id/specialties/:specialty_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'StaffProfiles'),
  staffProfileIdValidator,
  specialtyIdValidator,
  wrapRequestHandler(removeSpecialtyFromStaffProfileController as RequestHandler)
)
staffProfilesRouter.get(
  '/:staff_profile_id/specialties',
  accessTokenValidatorV2,
  checkPermission('read', 'StaffProfiles'),
  staffProfileIdValidator,
  wrapRequestHandler(getSpecialtiesOfStaffProfileController as RequestHandler)
)
export default staffProfilesRouter
