import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import { omitBy } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { USER_PROFILES_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ConditionParams } from '~/models/request/Conditons.request'
import { Pagination } from '~/models/request/Pagination'
import {
  AccountParams,
  ConditionIdsReqBody,
  UserProfileParams,
  UserProfileReqBody
} from '~/models/request/UserProfiles.requests'
import userProfilesService from '~/services/userProfiles.services'

export const getUserProfilesController = async (
  req: Request<ParamsDictionary, any, any, Pagination & Query>,
  res: Response,
  next: NextFunction
) => {
  const { limit, page } = req.query
  const role = req.role
  const isAdmin = role?.name === 'Admin'
  const options = {
    limit: Number(limit) || undefined,
    page: Number(page) || undefined,
    isAdmin
  }
  const result = await userProfilesService.getAllUserProfiles(options)
  res.status(HTTP_STATUS.OK).json({
    message: USER_PROFILES_MESSAGES.GET_ALL_USER_PROFILES_SUCCESS,
    result
  })
}

export const getUserProfileController = async (
  req: Request<UserProfileParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_profile_id } = req.params
  const result = await userProfilesService.getUserProfile(user_profile_id)
  res.status(HTTP_STATUS.OK).json({
    message: USER_PROFILES_MESSAGES.GET_USER_PROFILE_SUCCESS,
    result
  })
}

export const getUserProfileByAccountIdController = async (
  req: Request<AccountParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { account_id } = req.params
  const result = await userProfilesService.getUserProfileByAccountId(account_id)
  res.status(HTTP_STATUS.OK).json({
    message: USER_PROFILES_MESSAGES.GET_USER_PROFILE_SUCCESS,
    result
  })
}

export const createUserProfileController = async (
  req: Request<ParamsDictionary, any, UserProfileReqBody>,
  res: Response,
  next: NextFunction
) => {
  const userProfile = await userProfilesService.createUserProfile(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: USER_PROFILES_MESSAGES.CREATE_USER_PROFILE_SUCCESS,
    result: userProfile
  })
}

export const updateUserProfileController = async (
  req: Request<UserProfileParams, any, UserProfileReqBody>,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body
  const updateData = omitBy(payload, (value) => value === undefined || value === '')
  if (Object.keys(updateData).length === 0) {
    throw new ErrorWithStatus({
      message: USER_PROFILES_MESSAGES.USER_PROFILE_NOT_UPDATED,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  const { user_profile_id } = req.params
  const result = await userProfilesService.updateUserProfile(updateData, user_profile_id)
  res.status(HTTP_STATUS.OK).json({
    message: USER_PROFILES_MESSAGES.UPDATE_USER_PROFILE_SUCCESS,
    result
  })
}

export const deleteUserProfileController = async (
  req: Request<UserProfileParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_profile_id } = req.params
  const result = await userProfilesService.deleteUserProfile(user_profile_id)
  res.status(HTTP_STATUS.OK).json({
    message: USER_PROFILES_MESSAGES.DELETE_USER_PROFILE_SUCCESS,
    result
  })
}

export const addConditionsToUserProfileController = async (
  req: Request<UserProfileParams, any, ConditionIdsReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_profile_id } = req.params
  const { condition_ids } = req.body
  const result = await userProfilesService.addConditionsToUserProfile(user_profile_id, condition_ids)
  res.status(HTTP_STATUS.OK).json({
    message: USER_PROFILES_MESSAGES.ADD_CONDITIONS_TO_USER_PROFILE_SUCCESS,
    result
  })
}

export const addConditionToUserProfileController = async (
  req: Request<UserProfileParams & ConditionParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_profile_id } = req.params
  const { condition_id } = req.params
  const result = await userProfilesService.addConditionToUserProfile(user_profile_id, condition_id)
  res.status(HTTP_STATUS.OK).json({
    message: USER_PROFILES_MESSAGES.ADD_CONDITION_TO_USER_PROFILE_SUCCESS,
    result
  })
}

export const removeConditionFromUserProfileController = async (
  req: Request<UserProfileParams & ConditionParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { condition_id, user_profile_id } = req.params
  const result = await userProfilesService.removeCondition(condition_id, user_profile_id)
  res.status(HTTP_STATUS.OK).json({
    message: USER_PROFILES_MESSAGES.REMOVE_CONDITION_FROM_USER_PROFILE_SUCCESS,
    result
  })
}

export const getConditionsOfUserProfileController = async (
  req: Request<UserProfileParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_profile_id } = req.params
  const result = await userProfilesService.getConditionsOfUserProfile(user_profile_id)
  res.status(HTTP_STATUS.OK).json({
    message: USER_PROFILES_MESSAGES.GET_CONDITIONS_OF_USER_PROFILE_SUCCESS,
    result
  })
}
