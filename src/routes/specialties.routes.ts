import { Router } from 'express'
import {
  createSpecialtyController,
  deleteSpecialtyController,
  getAllSpecialtiesController,
  getSpecialtyController,
  getSpecialtyDevicesController,
  getSpecialtyServicesController,
  updateSpecialtyController
} from '~/controllers/specialties.controllers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/accounts.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import {
  paginationValidator,
  specialtyIdValidator,
  specialtyValidator,
  updateSpecialtyValidator
} from '~/middlewares/specialties.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const specialtiesRouter = Router()

// API lấy danh sách chuyên môn
specialtiesRouter.get(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('read', 'Specialties'),
  paginationValidator,
  wrapRequestHandler(getAllSpecialtiesController)
)

// API lấy chi tiết chuyên môn
specialtiesRouter.get(
  '/:specialty_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('read', 'Specialties'),
  specialtyIdValidator,
  wrapRequestHandler(getSpecialtyController)
)

// API tạo chuyên môn mới
specialtiesRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'Specialties'),
  specialtyValidator,
  wrapRequestHandler(createSpecialtyController)
)

// API cập nhật chuyên môn
specialtiesRouter.patch(
  '/:specialty_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'Specialties'),
  specialtyIdValidator,
  updateSpecialtyValidator,
  wrapRequestHandler(updateSpecialtyController)
)

// API xóa chuyên môn
specialtiesRouter.delete(
  '/:specialty_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'Specialties'),
  specialtyIdValidator,
  wrapRequestHandler(deleteSpecialtyController)
)

// API lấy danh sách dịch vụ thuộc chuyên môn
specialtiesRouter.get(
  '/:specialty_id/services',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('read', 'Specialties'),
  specialtyIdValidator,
  wrapRequestHandler(getSpecialtyServicesController)
)

// API lấy danh sách thiết bị thuộc chuyên môn
specialtiesRouter.get(
  '/:specialty_id/devices',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('read', 'Specialties'),
  specialtyIdValidator,
  wrapRequestHandler(getSpecialtyDevicesController)
)

export default specialtiesRouter
