import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { omitBy } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { CONDITION_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import {
  ConditionParams,
  ConditionQuery,
  ConditionReqBody,
  GetAllConditionsOptions
} from '~/models/request/Conditons.request'
import conditionsService from '~/services/conditions.services'

export const getAllConditionsController = async (
  req: Request<ParamsDictionary, any, any, ConditionQuery>,
  res: Response,
  next: NextFunction
) => {
  const { limit, page, search } = req.query

  const options: GetAllConditionsOptions = {
    limit: typeof limit === 'string' ? parseInt(limit) : limit,
    page: typeof page === 'string' ? parseInt(page) : page,
    search
  }

  const result = await conditionsService.getAllConditions(options)

  res.status(HTTP_STATUS.OK).json({
    message: CONDITION_MESSAGES.GET_ALL_CONDITIONS_SUCCESS,
    result: {
      conditions: result.conditions,
      total_counts: result.total_counts,
      total_pages: result.total_pages,
      limit: result.limit,
      page: result.page
    }
  })
}

export const getConditionController = async (
  req: Request<ConditionParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { condition_id } = req.params
  const condition = await conditionsService.getCondition(condition_id)

  res.status(HTTP_STATUS.OK).json({
    message: CONDITION_MESSAGES.GET_CONDITION_SUCCESS,
    result: condition
  })
}

export const createConditionController = async (
  req: Request<ParamsDictionary, any, ConditionReqBody>,
  res: Response,
  next: NextFunction
) => {
  const condition = await conditionsService.createCondition(req.body)

  res.status(HTTP_STATUS.CREATED).json({
    message: CONDITION_MESSAGES.CREATE_CONDITION_SUCCESS,
    result: condition
  })
}

export const updateConditionController = async (
  req: Request<ConditionParams, any, ConditionReqBody>,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body
  const { condition_id } = req.params

  const updateData = omitBy(payload, (value) => value === undefined || value === '')

  if (Object.keys(updateData).length === 0) {
    throw new ErrorWithStatus({
      message: CONDITION_MESSAGES.CONDITION_NOT_UPDATED,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }

  const condition = await conditionsService.updateCondition(updateData, condition_id)

  res.status(HTTP_STATUS.OK).json({
    message: CONDITION_MESSAGES.UPDATE_CONDITION_SUCCESS,
    result: condition
  })
}

export const deleteConditionController = async (
  req: Request<ConditionParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { condition_id } = req.params
  const result = await conditionsService.deleteCondition(condition_id)

  res.status(HTTP_STATUS.OK).json({
    message: CONDITION_MESSAGES.DELETE_CONDITION_SUCCESS,
    result
  })
}
