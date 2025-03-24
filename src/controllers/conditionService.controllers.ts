import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { CONDITION_SERVICES_MESSAGES } from '~/constants/messages'
import {
  ConditionServicesParams,
  ConditionServicesQuery,
  ConditionServicesReqBody,
  UpdateConditionServicesReqBody
} from '~/models/request/ConditionServices.requests'
import conditionServiceService from '~/services/conditionService.services'

export const getAllConditionServicesController = async (
  req: Request<ParamsDictionary, any, any, ConditionServicesQuery>,
  res: Response,
  next: NextFunction
) => {
  const { condition_id, service_id, page, limit, search } = req.query
  const role = req.role
  const isAdmin = role?.name === 'Admin'

  const options = {
    condition_id,
    service_id,
    limit: Number(limit) || undefined,
    page: Number(page) || undefined,
    search: search || undefined,
    isAdmin
  }

  const result = await conditionServiceService.getAllConditionServices(options)
  res.json({
    message: CONDITION_SERVICES_MESSAGES.GET_ALL_CONDITION_SERVICES_SUCCESS,
    result
  })
}

export const getConditionServiceController = async (
  req: Request<ConditionServicesParams>,
  res: Response,
  next: NextFunction
) => {
  const { condition_service_id } = req.params
  const result = await conditionServiceService.getConditionService(condition_service_id)
  res.json({
    message: CONDITION_SERVICES_MESSAGES.GET_CONDITION_SERVICE_SUCCESS,
    result
  })
}

export const getServicesByConditionIdController = async (
  req: Request<{ condition_id: string }, any, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { condition_id } = req.params
  const options = {
    ...req.query,
    isAdmin: res.locals.isAdmin
  }
  const result = await conditionServiceService.getServicesByConditionId(condition_id, options)
  res.json({
    message: CONDITION_SERVICES_MESSAGES.GET_SERVICES_BY_CONDITION_ID_SUCCESS,
    result
  })
}

export const getConditionsByServiceIdController = async (
  req: Request<{ service_id: string }, any, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { service_id } = req.params
  const options = {
    ...req.query,
    isAdmin: res.locals.isAdmin
  }
  const result = await conditionServiceService.getConditionsByServiceId(service_id, options)
  res.json({
    message: CONDITION_SERVICES_MESSAGES.GET_CONDITIONS_BY_SERVICE_ID_SUCCESS,
    result
  })
}

export const createConditionServiceController = async (
  req: Request<ParamsDictionary, any, ConditionServicesReqBody>,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body
  const result = await conditionServiceService.createConditionService(payload)
  res.json({
    message: CONDITION_SERVICES_MESSAGES.CREATE_CONDITION_SERVICE_SUCCESS,
    result
  })
}

export const updateConditionServiceController = async (
  req: Request<ConditionServicesParams, any, UpdateConditionServicesReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { condition_service_id } = req.params
  const payload = req.body
  const result = await conditionServiceService.updateConditionService(condition_service_id, payload)
  res.json({
    message: CONDITION_SERVICES_MESSAGES.UPDATE_CONDITION_SERVICE_SUCCESS,
    result
  })
}

export const deleteConditionServiceController = async (
  req: Request<ConditionServicesParams>,
  res: Response,
  next: NextFunction
) => {
  const { condition_service_id } = req.params
  const result = await conditionServiceService.deleteConditionService(condition_service_id)
  res.json({
    message: CONDITION_SERVICES_MESSAGES.DELETE_CONDITION_SERVICE_SUCCESS,
    result
  })
}
