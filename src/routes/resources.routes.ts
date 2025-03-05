import { Router } from 'express'
import {
  createResourceController,
  deleteResourceController,
  getAllResourcesController,
  getResourceController,
  updateResourceController
} from '~/controllers/resources.controllers'
import { accessTokenValidator } from '~/middlewares/accounts.middleware'
import { createResourceValidator, updateResourceValidator } from '~/middlewares/resources.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const resourcesRouter = Router()
/**
 * Description. Get All Resources
 * Path: /
 * Method: GET
 * Headers: access_token: Bearer token
 * Body: <none>
 * Middleware:
 *    accessTokenValidator
 *    checkPermission('get', 'resource')
 *    wrapRequestHandler(getAllResourcesController)
 */
resourcesRouter.get('/', accessTokenValidator, wrapRequestHandler(getAllResourcesController))

/**
 * Description. Get Resource
 * Path: /:id
 * Method: GET
 * Headers: access_token: Bearer token
 * Body: <none>
 * Middleware:
 *    accessTokenValidator
 *    checkPermission('get', 'resource')
 *    resourceParamValidator: check resource_id từ param có không, có phải string không
 *    wrapRequestHandler(getResourceController)
 */
resourcesRouter.get('/:id', accessTokenValidator, wrapRequestHandler(getResourceController))

/**
 * Description. Create Resource
 * Path: /
 * Method: POST
 * Headers: access_token: Bearer token
 * Body: {  resource_name: string, description: string}
 * Middleware:
 *    accessTokenValidator
 *    checkPermission('post', 'resource')
 *    resourceBodyValidator:
 *      check resource_name bắt buộc có, kiểu string, chữ đầu in hoa, không chứa ký tự đặc biệt
 *      check description bắt buộc có, kiểu string, tối đa 255 ký tự,
 *    wrapRequestHandler(getResourceController)
 * */
resourcesRouter.post('/', accessTokenValidator, createResourceValidator, wrapRequestHandler(createResourceController))

/**
 * Description. Update Resource
 * Path: /:id
 * Method: Put
 * Headers: access_token: Bearer token
 * Body: {  resource_name: string, description: string}
 * Middleware:
 *    accessTokenValidator
 *    checkPermission('put', 'resource')
 *    resourceBodyValidator:
 *      check resource_name bắt buộc có, kiểu string, chữ đầu in hoa, không chứa ký tự đặc biệt
 *      check description bắt buộc có, kiểu string, tối đa 255 ký tự
 *      check xem trong resource có thằng nào trùng tên không, nếu có thì trả lỗi,
 *      xong add thằng resource vào request
 *    wrapRequestHandler(getResourceController)
 */
resourcesRouter.put('/:id', accessTokenValidator, updateResourceValidator, wrapRequestHandler(updateResourceController))

/**
 * Description. Delete Resource
 * Path: /:id
 * Method: Delete
 * Headers: access_token: Bearer token
 * Middleware:
 *    accessTokenValidator
 *    checkPermission('delete', 'resource')
 *    wrapRequestHandler(getResourceController)
 */
resourcesRouter.delete('/:id', accessTokenValidator, wrapRequestHandler(deleteResourceController))

export default resourcesRouter
