import { Router } from 'express'
import {
  createBranchProductController,
  deleteBranchProductController,
  getAllBranchProductsController,
  getBranchProductController,
  getBranchProductsByBranchIdController,
  getBranchProductsByProductIdController,
  updateBranchProductController
} from '~/controllers/branchProducts.controllers'
import {
  accessTokenValidator,
  accessTokenValidatorV2,
  paginationValidator,
  verifiedAccountValidator
} from '~/middlewares/accounts.middleware'
import {
  branchProductIdValidator,
  branchProductQueryValidator,
  branchProductValidator,
  updateBranchProductValidator
} from '~/middlewares/branchProducts.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const branchProductsRouter = Router()

// Get all branch products
branchProductsRouter.get(
  '/',
  accessTokenValidatorV2,
  checkPermission('read', 'BranchProducts'),
  paginationValidator,
  branchProductQueryValidator,
  wrapRequestHandler(getAllBranchProductsController)
)

// Get specific branch product
branchProductsRouter.get(
  '/:branch_product_id',
  accessTokenValidatorV2,
  checkPermission('read', 'BranchProducts'),
  branchProductIdValidator,
  wrapRequestHandler(getBranchProductController)
)

// Get all branch products for a specific branch
branchProductsRouter.get(
  '/branch/:branch_id',
  accessTokenValidatorV2,
  checkPermission('read', 'BranchProducts'),
  wrapRequestHandler(getBranchProductsByBranchIdController)
)

// Get all branch products for a specific product
branchProductsRouter.get(
  '/product/:product_id',
  accessTokenValidatorV2,
  checkPermission('read', 'BranchProducts'),
  wrapRequestHandler(getBranchProductsByProductIdController)
)

// Create branch product
branchProductsRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('create', 'BranchProducts'),
  branchProductValidator,
  wrapRequestHandler(createBranchProductController)
)

// Update branch product
branchProductsRouter.patch(
  '/:branch_product_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('update', 'BranchProducts'),
  branchProductIdValidator,
  updateBranchProductValidator,
  wrapRequestHandler(updateBranchProductController)
)

// Delete branch product
branchProductsRouter.delete(
  '/:branch_product_id',
  accessTokenValidator,
  verifiedAccountValidator,
  checkPermission('delete', 'BranchProducts'),
  branchProductIdValidator,
  wrapRequestHandler(deleteBranchProductController)
)

export default branchProductsRouter
