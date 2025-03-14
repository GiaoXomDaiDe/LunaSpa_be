import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { SUCCESS_RESPONSE_MESSAGE } from '~/constants/messages'
import { Pagination } from '~/models/request/Pagination'
import { RoleParams, RoleReqBody, RoleResourceParams } from '~/models/request/Role.request'
import rolesService from '~/services/roles.services'

export const getAllRolesController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { limit, page } = req.query as Pagination
  const roles = await rolesService.getAllRoles({ limit: Number(limit), page: Number(page) })
  res.status(HTTP_STATUS.OK).json({
    message: SUCCESS_RESPONSE_MESSAGE.GET_ALL_ROLES_SUCCESSFULLY,
    result: {
      roles: roles
    }
  })
}

export const getRoleController = async (req: Request<RoleParams, any, any>, res: Response, next: NextFunction) => {
  const role_id = req.params.role_id
  const role = await rolesService.getRole({ role_id: role_id })
  res.status(HTTP_STATUS.OK).json({
    message: SUCCESS_RESPONSE_MESSAGE.GET_ROLE_SUCCESSFULLY,
    result: role
  })
}

export const createRolesController = async (
  req: Request<ParamsDictionary, any, RoleReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await rolesService.createRole(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: SUCCESS_RESPONSE_MESSAGE.ROLES_CREATED_SUCCESSFULLY,
    result
  })
}

export const updateRoleController = async (
  req: Request<RoleParams, any, RoleReqBody>,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body
  const role_id = req.params.role_id
  const result = await rolesService.updateRoles(payload, role_id)
  res.status(HTTP_STATUS.CREATED).json({
    message: SUCCESS_RESPONSE_MESSAGE.ROLES_UPDATED_SUCCESSFULLY,
    result
  })
}

export const deleteRoleController = async (req: Request<RoleParams, any, any>, res: Response, next: NextFunction) => {
  const role_id = req.params.role_id
  await rolesService.deleteRole(role_id)
  res.json({
    message: SUCCESS_RESPONSE_MESSAGE.ROLES_DELETED_SUCCESSFULLY
  })
}

export const addResourceToRoleController = async (
  req: Request<RoleResourceParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { resource_id, role_id } = req.params
  const result = await rolesService.addResourceToRole(role_id, resource_id)
  res.status(HTTP_STATUS.CREATED).json({
    message: SUCCESS_RESPONSE_MESSAGE.RESOURCE_ADDED_TO_ROLE_SUCCESSFULLY,
    result
  })
}

/* 
Thêm role tức là cần có vào là id của role tiếp theo là id của resource 
Tìm roles đó trong database
Nếu không tìm thấy thì throw error
Tìm thấy resource đó trong database
Nếu không tìm thấy thì throw error
Thêm resource đó vào role đó
*/
