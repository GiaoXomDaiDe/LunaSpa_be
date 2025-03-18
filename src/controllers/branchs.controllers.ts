import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { omitBy } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { BRANCHES_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { BranchParams, BranchQuery, BranchReqBody } from '~/models/request/Branches.requests'
import branchesService from '~/services/branches.services'

export const getAllBranchesController = async (
  req: Request<ParamsDictionary, any, any, BranchQuery>,
  res: Response,
  next: NextFunction
) => {
  const { limit, page, search, sort, order, min_rating, max_rating } = req.query
  const role = req.role
  const isAdmin = role?.name === 'Admin'
  const options = {
    limit: Number(limit) || undefined,
    page: Number(page) || undefined,
    search: (search as string) || '',
    sort: (sort as string) || undefined,
    order: (order as string) || undefined,
    min_rating: min_rating && min_rating !== '' ? Number(min_rating) : undefined,
    max_rating: max_rating && max_rating !== '' ? Number(max_rating) : undefined,
    isAdmin
  }
  const result = await branchesService.getAllBranches(options)
  res.status(HTTP_STATUS.OK).json({
    message: BRANCHES_MESSAGES.GET_ALL_BRANCHES_SUCCESS,
    result
  })
}
export const getBranchController = async (req: Request<BranchParams, any, any>, res: Response, next: NextFunction) => {
  const { branch_id } = req.params
  const branch = await branchesService.getBranch(branch_id)
  res.status(HTTP_STATUS.OK).json({
    message: BRANCHES_MESSAGES.GET_BRANCH_SUCCESS,
    result: branch
  })
}
export const createBranchController = async (
  req: Request<ParamsDictionary, any, BranchReqBody>,
  res: Response,
  next: NextFunction
) => {
  const branch = await branchesService.createBranch(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: BRANCHES_MESSAGES.CREATED_BRANCH_SUCCESS,
    result: branch
  })
}
export const updateBranchController = async (
  req: Request<BranchParams, any, BranchReqBody>,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body
  const updateData = omitBy(payload, (value) => value === undefined || value === '')
  if (Object.keys(updateData).length === 0) {
    throw new ErrorWithStatus({
      message: BRANCHES_MESSAGES.BRANCH_NOT_UPDATED,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  const { branch_id } = req.params
  const result = await branchesService.updateBranch(updateData, branch_id)
  res.status(HTTP_STATUS.OK).json({
    message: BRANCHES_MESSAGES.UPDATE_BRANCH_SUCCESS,
    result
  })
}
export const deleteBranchController = async (
  req: Request<BranchParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { branch_id } = req.params
  const result = await branchesService.deleteBranch(branch_id)
  res.status(HTTP_STATUS.OK).json({
    message: BRANCHES_MESSAGES.DELETE_BRANCH_SUCCESS,
    result
  })
}

export const softDeleteBranchController = async (
  req: Request<BranchParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { branch_id } = req.params
  const result = await branchesService.softDeleteBranch(branch_id)
  res.status(HTTP_STATUS.OK).json({
    message: BRANCHES_MESSAGES.DELETE_BRANCH_SUCCESS,
    result
  })
}
