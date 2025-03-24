import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { SPECIALTY_MESSAGES } from '~/constants/messages'
import {
  CreateSpecialtyReqBody,
  SpecialtyParams,
  SpecialtyQuery,
  UpdateSpecialtyReqBody
} from '~/models/request/Specialty.requests'
import specialtiesService from '~/services/specialties.services'

// Lấy danh sách chuyên môn
export const getAllSpecialtiesController = async (
  req: Request<ParamsDictionary, any, any, SpecialtyQuery>,
  res: Response,
  next: NextFunction
) => {
  const result = await specialtiesService.getAllSpecialties(req.query)
  res.json({
    message: SPECIALTY_MESSAGES.GET_ALL_SPECIALTIES_SUCCESS,
    result
  })
}

// Lấy chi tiết chuyên môn
export const getSpecialtyController = async (req: Request<SpecialtyParams>, res: Response, next: NextFunction) => {
  const { specialty_id } = req.params
  const result = await specialtiesService.getSpecialtyById(specialty_id)
  res.json({
    message: SPECIALTY_MESSAGES.GET_SPECIALTY_SUCCESS,
    result
  })
}

// Tạo chuyên môn mới
export const createSpecialtyController = async (
  req: Request<ParamsDictionary, any, CreateSpecialtyReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await specialtiesService.createSpecialty(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: SPECIALTY_MESSAGES.CREATE_SPECIALTY_SUCCESS,
    result
  })
}

// Cập nhật chuyên môn
export const updateSpecialtyController = async (
  req: Request<SpecialtyParams, any, UpdateSpecialtyReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { specialty_id } = req.params
  const result = await specialtiesService.updateSpecialty(specialty_id, req.body)
  res.json({
    message: SPECIALTY_MESSAGES.UPDATE_SPECIALTY_SUCCESS,
    result
  })
}

// Xóa chuyên môn
export const deleteSpecialtyController = async (req: Request<SpecialtyParams>, res: Response, next: NextFunction) => {
  const { specialty_id } = req.params
  const result = await specialtiesService.deleteSpecialty(specialty_id)
  res.json({
    message: SPECIALTY_MESSAGES.DELETE_SPECIALTY_SUCCESS,
    result
  })
}

// Lấy danh sách dịch vụ thuộc chuyên môn
export const getSpecialtyServicesController = async (
  req: Request<SpecialtyParams>,
  res: Response,
  next: NextFunction
) => {
  const { specialty_id } = req.params
  const result = await specialtiesService.getServicesBySpecialtyId(specialty_id)
  res.json({
    message: SPECIALTY_MESSAGES.GET_SPECIALTY_SUCCESS,
    result
  })
}

// Lấy danh sách thiết bị thuộc chuyên môn
export const getSpecialtyDevicesController = async (
  req: Request<SpecialtyParams>,
  res: Response,
  next: NextFunction
) => {
  const { specialty_id } = req.params
  const result = await specialtiesService.getDevicesBySpecialtyId(specialty_id)
  res.json({
    message: SPECIALTY_MESSAGES.GET_SPECIALTY_SUCCESS,
    result
  })
}
