import { Router } from 'express'
import {
  createBranchServiceController,
  deleteBranchServiceController,
  getAllBranchServicesController,
  getBranchServiceController,
  getBranchServicesByBranchIdController,
  getBranchServicesByServiceIdController,
  updateBranchServiceController
} from '~/controllers/branchServices.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  paginationValidator,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import {
  branchServiceIdValidator,
  branchServiceQueryValidator,
  branchServiceValidator,
  updateBranchServiceValidator
} from '~/middlewares/branchServices.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const branchServicesRouter = Router()

// Get all branch services
branchServicesRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'BranchServices'),
  paginationValidator,
  branchServiceQueryValidator,
  wrapRequestHandler(getAllBranchServicesController)
)

// Get a specific branch service
branchServicesRouter.get(
  '/:branch_service_id',
  accessTokenValidatorV2,
  checkPermission('read', 'BranchServices'),
  branchServiceIdValidator,
  wrapRequestHandler(getBranchServiceController)
)

// Get all branch services for a specific branch
branchServicesRouter.get(
  '/branch/:branch_id',
  accessTokenValidatorV2,
  checkPermission('read', 'BranchServices'),
  wrapRequestHandler(getBranchServicesByBranchIdController)
)

// Get all branch services for a specific service
branchServicesRouter.get(
  '/service/:service_id',
  accessTokenValidatorV2,
  checkPermission('read', 'BranchServices'),
  wrapRequestHandler(getBranchServicesByServiceIdController)
)

// Create a new branch service
branchServicesRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'BranchServices'),
  branchServiceValidator,
  wrapRequestHandler(createBranchServiceController)
)

// Update a branch service
branchServicesRouter.patch(
  '/:branch_service_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'BranchServices'),
  branchServiceIdValidator,
  updateBranchServiceValidator,
  wrapRequestHandler(updateBranchServiceController)
)

// Delete a branch service
branchServicesRouter.delete(
  '/:branch_service_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'BranchServices'),
  branchServiceIdValidator,
  wrapRequestHandler(deleteBranchServiceController)
)

export default branchServicesRouter
