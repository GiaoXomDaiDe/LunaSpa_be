import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import { omitBy } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { STAFF_PROFILES_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { Pagination } from '~/models/request/Pagination'
import { SpecialtyParams } from '~/models/request/Specialties.request'
import {
  AccountParams,
  SpecialtyIdsReqBody,
  StaffProfileParams,
  StaffProfileReqBody
} from '~/models/request/StaffProfiles.requests'
import { StaffType } from '~/models/schema/StaffProfile.schema'
import staffProfilesService from '~/services/staffProfiles.services'

export const getStaffProfilesController = async (
  req: Request<ParamsDictionary, any, any, Pagination & Query>,
  res: Response,
  next: NextFunction
) => {
  const { limit, page, staff_type } = req.query
  const role = req.role
  const isAdmin = role?.name === 'Admin'
  const options = {
    limit: Number(limit) || undefined,
    page: Number(page) || undefined,
    isAdmin,
    staff_type: staff_type as StaffType | undefined
  }
  const result = await staffProfilesService.getAllStaffProfiles(options)
  res.status(HTTP_STATUS.OK).json({
    message: STAFF_PROFILES_MESSAGES.GET_ALL_STAFF_PROFILES_SUCCESS,
    result
  })
}

export const getStaffProfileController = async (
  req: Request<StaffProfileParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { staff_profile_id } = req.params
  const result = await staffProfilesService.getStaffProfile(staff_profile_id)
  res.status(HTTP_STATUS.OK).json({
    message: STAFF_PROFILES_MESSAGES.GET_STAFF_PROFILE_SUCCESS,
    result
  })
}

export const getStaffProfileByAccountIdController = async (
  req: Request<AccountParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { account_id } = req.params
  const result = await staffProfilesService.getStaffProfileByAccountId(account_id)
  res.status(HTTP_STATUS.OK).json({
    message: STAFF_PROFILES_MESSAGES.GET_STAFF_PROFILE_SUCCESS,
    result
  })
}

export const createStaffProfileController = async (
  req: Request<ParamsDictionary, any, StaffProfileReqBody>,
  res: Response,
  next: NextFunction
) => {
  const staffProfile = await staffProfilesService.createStaffProfile(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: STAFF_PROFILES_MESSAGES.CREATE_STAFF_PROFILE_SUCCESS,
    result: staffProfile
  })
}

export const updateStaffProfileController = async (
  req: Request<StaffProfileParams, any, StaffProfileReqBody>,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body
  const updateData = omitBy(payload, (value) => value === undefined || value === '')
  if (Object.keys(updateData).length === 0) {
    throw new ErrorWithStatus({
      message: STAFF_PROFILES_MESSAGES.STAFF_PROFILE_NOT_UPDATED,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  const { staff_profile_id } = req.params
  const result = await staffProfilesService.updateStaffProfile(updateData, staff_profile_id)
  res.status(HTTP_STATUS.OK).json({
    message: STAFF_PROFILES_MESSAGES.UPDATE_STAFF_PROFILE_SUCCESS,
    result
  })
}

export const deleteStaffProfileController = async (
  req: Request<StaffProfileParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { staff_profile_id } = req.params
  const result = await staffProfilesService.deleteStaffProfile(staff_profile_id)
  res.status(HTTP_STATUS.OK).json({
    message: STAFF_PROFILES_MESSAGES.DELETE_STAFF_PROFILE_SUCCESS,
    result
  })
}

export const addSpecialtiesToStaffProfileController = async (
  req: Request<StaffProfileParams, any, SpecialtyIdsReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { staff_profile_id } = req.params
  const { specialty_ids } = req.body
  const result = await staffProfilesService.addSpecialtiesToStaffProfile(staff_profile_id, specialty_ids)
  res.status(HTTP_STATUS.OK).json({
    message: STAFF_PROFILES_MESSAGES.ADD_SPECIALTIES_TO_STAFF_PROFILE_SUCCESS,
    result
  })
}

export const addSpecialtyToStaffProfileController = async (
  req: Request<StaffProfileParams & SpecialtyParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { staff_profile_id } = req.params
  const { specialty_id } = req.params
  const result = await staffProfilesService.addSpecialtyToStaffProfile(staff_profile_id, specialty_id)
  res.status(HTTP_STATUS.OK).json({
    message: STAFF_PROFILES_MESSAGES.ADD_SPECIALTY_TO_STAFF_PROFILE_SUCCESS,
    result
  })
}

export const removeSpecialtyFromStaffProfileController = async (
  req: Request<StaffProfileParams & SpecialtyParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { specialty_id, staff_profile_id } = req.params
  const result = await staffProfilesService.removeSpecialty(specialty_id, staff_profile_id)
  res.status(HTTP_STATUS.OK).json({
    message: STAFF_PROFILES_MESSAGES.REMOVE_SPECIALTY_FROM_STAFF_PROFILE_SUCCESS,
    result
  })
}

export const getSpecialtiesOfStaffProfileController = async (
  req: Request<StaffProfileParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { staff_profile_id } = req.params
  const result = await staffProfilesService.getSpecialtiesOfStaffProfile(staff_profile_id)
  res.status(HTTP_STATUS.OK).json({
    message: STAFF_PROFILES_MESSAGES.GET_SPECIALTIES_OF_STAFF_PROFILE_SUCCESS,
    result
  })
}
