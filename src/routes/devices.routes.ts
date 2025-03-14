import { RequestHandler, Router } from 'express'
import {
  createDeviceController,
  deleteDeviceController,
  getAllDevicesController,
  getDeviceController,
  softDeleteDeviceController,
  updateDeviceController
} from '~/controllers/devices.controller'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  paginationValidator,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import {
  checkDeviceNotInactive,
  deviceIdValidator,
  devicesQueryValidator,
  deviceValidator,
  updateDeviceValidator
} from '~/middlewares/devices.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const devicesRouter = Router()

devicesRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'Devices'),
  verifiedAccountValidator,
  paginationValidator,
  devicesQueryValidator,
  wrapRequestHandler(getAllDevicesController as RequestHandler)
)

devicesRouter.get(
  '/:device_id',
  accessTokenValidatorV2,
  checkPermission('read', 'Devices'),
  deviceIdValidator,
  checkDeviceNotInactive,
  wrapRequestHandler(getDeviceController as RequestHandler)
)
devicesRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'Devices'),
  deviceValidator,
  wrapRequestHandler(createDeviceController as RequestHandler)
)
devicesRouter.patch(
  '/:device_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'Devices'),
  deviceIdValidator,
  updateDeviceValidator,
  wrapRequestHandler(updateDeviceController as RequestHandler)
)
devicesRouter.delete(
  '/:device_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'Devices'),
  deviceIdValidator,
  wrapRequestHandler(deleteDeviceController as RequestHandler)
)
devicesRouter.patch(
  '/:device_id/soft-delete',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'Devices'),
  deviceIdValidator,
  checkDeviceNotInactive,
  wrapRequestHandler(softDeleteDeviceController as RequestHandler)
)

export default devicesRouter
