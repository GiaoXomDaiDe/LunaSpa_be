import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { omitBy } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_CATEGORY_MESSAGES, SUCCESS_RESPONSE_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ProductCategoryParams, ProductCategoryReqBody } from '~/models/request/ProductCategory.requests'
import productCategoriesService from '~/services/productCategories.services'

export const getAllProductCategoriesController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const productCategories = await productCategoriesService.getAllProductCategories()
  res.status(HTTP_STATUS.OK).json({
    message: SUCCESS_RESPONSE_MESSAGE.PRODUCT_CATEGORY_FETCHED_SUCCESSFULLY,
    result: {
      categories: productCategories
    }
  })
}

export const getProductCategoryController = async (
  req: Request<ProductCategoryParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const productCategory_id = req.params.product_category_id
  const productCategory = await productCategoriesService.getProductCategory(productCategory_id)
  res.status(HTTP_STATUS.OK).json({
    message: SUCCESS_RESPONSE_MESSAGE.PRODUCT_CATEGORY_FETCHED_SUCCESSFULLY,
    result: productCategory
  })
}

export const createProductCategoryController = async (
  req: Request<ParamsDictionary, any, ProductCategoryReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await productCategoriesService.createProductCategory(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: SUCCESS_RESPONSE_MESSAGE.PRODUCT_CATEGORY_CREATED_SUCCESSFULLY,
    result
  })
}

export const updateProductCategoryController = async (
  req: Request<ProductCategoryParams, any, ProductCategoryReqBody>,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body
  const updateData = omitBy(payload, (value) => value === undefined || value === '')
  if (Object.keys(updateData).length === 0) {
    throw new ErrorWithStatus({
      message: PRODUCT_CATEGORY_MESSAGES.CATEGORY_NOT_UPDATED,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  const productCategory_id = req.params.product_category_id
  const result = await productCategoriesService.updateProductCategory(updateData, productCategory_id)
  res.status(HTTP_STATUS.OK).json({
    message: SUCCESS_RESPONSE_MESSAGE.PRODUCT_CATEGORY_UPDATED_SUCCESSFULLY,
    result
  })
}

export const deleteProductCategoryController = async (
  req: Request<ProductCategoryParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const productCategory_id = req.params.product_category_id
  console.log(productCategory_id)
  await productCategoriesService.deleteProductCategory(productCategory_id)
  res.status(HTTP_STATUS.OK).json({
    message: SUCCESS_RESPONSE_MESSAGE.PRODUCT_CATEGORY_DELETED_SUCCESSFULLY
  })
}
