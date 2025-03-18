import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { BRANCH_SERVICES_MESSAGES } from '~/constants/messages'
import {
  BranchParams,
  BranchServicesParams,
  BranchServicesReqBody,
  GetBranchServicesQuery,
  ServiceParams
} from '~/models/request/BranchServices.request'
import { BranchServicesStatus } from '~/models/schema/BranchServices.schema'
import branchServicesService from '~/services/branchServices.services'

export const getAllBranchServicesController = async (
  req: Request<ParamsDictionary, any, any, GetBranchServicesQuery>,
  res: Response,
  next: NextFunction
) => {
  const { branch_id, service_id, status, page, limit } = req.query

  const options = {
    branch_id: branch_id,
    service_id: service_id,
    status: status ? (parseInt(status) as BranchServicesStatus) : undefined,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined
  }

  const result = await branchServicesService.getAllBranchServices(options)

  res.status(HTTP_STATUS.OK).json({
    message: BRANCH_SERVICES_MESSAGES.GET_ALL_BRANCH_SERVICES_SUCCESS,
    result
  })
}

export const getBranchServicesByBranchIdController = async (
  req: Request<BranchParams, any, any, GetBranchServicesQuery>,
  res: Response,
  next: NextFunction
) => {
  const { branch_id } = req.params
  const { status } = req.query

  const result = await branchServicesService.getBranchServicesByBranchId(
    branch_id,
    status ? (parseInt(status) as BranchServicesStatus) : undefined
  )

  res.status(HTTP_STATUS.OK).json({
    message: BRANCH_SERVICES_MESSAGES.GET_ALL_BRANCH_SERVICES_SUCCESS,
    result
  })
}

export const getBranchServicesByServiceIdController = async (
  req: Request<ServiceParams, any, any, GetBranchServicesQuery>,
  res: Response,
  next: NextFunction
) => {
  const { service_id } = req.params
  const { status } = req.query

  const result = await branchServicesService.getBranchServicesByServiceId(
    service_id,
    status ? (parseInt(status) as BranchServicesStatus) : undefined
  )

  res.status(HTTP_STATUS.OK).json({
    message: BRANCH_SERVICES_MESSAGES.GET_ALL_BRANCH_SERVICES_SUCCESS,
    result
  })
}

export const getBranchServiceController = async (
  req: Request<BranchServicesParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { branch_service_id } = req.params

  const result = await branchServicesService.getBranchService(branch_service_id)

  res.status(HTTP_STATUS.OK).json({
    message: BRANCH_SERVICES_MESSAGES.GET_BRANCH_SERVICE_SUCCESS,
    result
  })
}

export const createBranchServiceController = async (
  req: Request<ParamsDictionary, any, BranchServicesReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await branchServicesService.createBranchService(req.body)

  res.status(HTTP_STATUS.CREATED).json({
    message: BRANCH_SERVICES_MESSAGES.CREATE_BRANCH_SERVICE_SUCCESS,
    result
  })
}

export const updateBranchServiceController = async (
  req: Request<BranchServicesParams, any, Partial<BranchServicesReqBody>>,
  res: Response,
  next: NextFunction
) => {
  const { branch_service_id } = req.params

  const result = await branchServicesService.updateBranchService(branch_service_id, req.body)

  res.status(HTTP_STATUS.OK).json({
    message: BRANCH_SERVICES_MESSAGES.UPDATE_BRANCH_SERVICE_SUCCESS,
    result
  })
}

export const deleteBranchServiceController = async (
  req: Request<BranchServicesParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { branch_service_id } = req.params

  const result = await branchServicesService.deleteBranchService(branch_service_id)

  res.status(HTTP_STATUS.OK).json({
    message: BRANCH_SERVICES_MESSAGES.DELETE_BRANCH_SERVICE_SUCCESS,
    result
  })
}
