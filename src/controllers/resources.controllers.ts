import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { omitBy } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ERROR_RESPONSE_MESSAGES, SUCCESS_RESPONSE_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { Pagination } from '~/models/request/Pagination'
import { ResourceParams, ResourceReqBody } from '~/models/request/Resource.requests'
import resourcesService from '~/services/resources.services'

export const getAllResourcesController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { limit, page } = req.query as Pagination
  const resources = await resourcesService.getAllResources({ limit: Number(limit), page: Number(page) })
  res.status(HTTP_STATUS.OK).json({
    message: SUCCESS_RESPONSE_MESSAGE.GET_ALL_RESOURCES_SUCCESSFULLY,
    result: {
      resources: resources
    }
  })
}

export const getResourceController = async (
  req: Request<ResourceParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const resource_id = req.params.resource_id
  const resource = await resourcesService.getResource(resource_id)
  res.status(HTTP_STATUS.OK).json({
    message: SUCCESS_RESPONSE_MESSAGE.GET_RESOURCE_SUCCESSFULLY,
    result: resource
  })
}

export const createResourceController = async (
  req: Request<ParamsDictionary, any, ResourceReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await resourcesService.createResource(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: SUCCESS_RESPONSE_MESSAGE.RESOURCE_CREATED_SUCCESSFULLY,
    result
  })
}

export const updateResourceController = async (
  req: Request<ResourceParams, any, ResourceReqBody>,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body
  const updateData = omitBy(payload, (value) => value === undefined || value === '')
  if (Object.keys(updateData).length === 0) {
    throw new ErrorWithStatus({
      message: ERROR_RESPONSE_MESSAGES.NO_UPDATE_FIELDS_PROVIDED,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  const resource_id = req.params.resource_id
  const result = await resourcesService.updateResource(updateData, resource_id)
  res.status(HTTP_STATUS.CREATED).json({
    message: SUCCESS_RESPONSE_MESSAGE.RESOURCE_UPDATED_SUCCESSFULLY,
    result
  })
}

export const deleteResourceController = async (
  req: Request<ResourceParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const resource_id = req.params.resource_id
  await resourcesService.deleteResource(resource_id)
  res.json({
    message: SUCCESS_RESPONSE_MESSAGE.RESOURCE_DELETED_SUCCESSFULLY
  })
}
