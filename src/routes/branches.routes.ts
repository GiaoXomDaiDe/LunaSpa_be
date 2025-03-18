import { RequestHandler, Router } from 'express'
import {
  createBranchController,
  deleteBranchController,
  getAllBranchesController,
  getBranchController,
  softDeleteBranchController,
  updateBranchController
} from '~/controllers/branchs.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  paginationValidator,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import {
  branchesQueryValidator,
  branchIdValidator,
  branchValidator,
  checkBranchNotInactive,
  updateBranchValidator
} from '~/middlewares/branches.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const branchesRouter = Router()

branchesRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'Branches'),
  paginationValidator,
  branchesQueryValidator,
  wrapRequestHandler(getAllBranchesController as RequestHandler)
)

branchesRouter.get(
  '/:branch_id',
  accessTokenValidatorV2,
  checkPermission('read', 'Branches'),
  branchIdValidator,
  checkBranchNotInactive,
  wrapRequestHandler(getBranchController)
)
branchesRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'Branches'),
  branchValidator,
  wrapRequestHandler(createBranchController)
)

branchesRouter.patch(
  '/:branch_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'Branches'),
  branchIdValidator,
  updateBranchValidator,
  wrapRequestHandler(updateBranchController)
)

branchesRouter.delete(
  '/:branch_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'Branches'),
  branchIdValidator,
  wrapRequestHandler(deleteBranchController)
)

branchesRouter.patch(
  '/:branch_id/soft-delete',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'Branches'),
  branchIdValidator,
  wrapRequestHandler(softDeleteBranchController)
)

export default branchesRouter
