import { Router } from 'express'
import {
  createResourceController,
  deleteResourceController,
  getAllResourcesController,
  getResourceController,
  updateResourceController
} from '~/controllers/resources.controllers'
import { accessTokenValidator, paginationValidator } from '~/middlewares/accounts.middleware'
import {
  createResourceValidator,
  resourceQueryValidator,
  updateResourceValidator
} from '~/middlewares/resources.middleware'
import { checkPermission } from '~/middlewares/roles.middleware'
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
resourcesRouter.get(
  '/',
  accessTokenValidator,
  checkPermission('read', 'Resources'),
  paginationValidator,
  wrapRequestHandler(getAllResourcesController)
)

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
resourcesRouter.get(
  '/:resource_id',
  accessTokenValidator,
  checkPermission('read', 'Resources'),
  resourceQueryValidator,
  wrapRequestHandler(getResourceController)
)

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
resourcesRouter.post(
  '/',
  accessTokenValidator,
  checkPermission('create', 'Resources'),
  createResourceValidator,
  wrapRequestHandler(createResourceController)
)

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
 *      check description kiểu string, tối đa 255 ký tự
 *      check xem trong resource có thằng nào trùng tên không, nếu có thì trả lỗi,
 *      xong add thằng resource vào request
 *    wrapRequestHandler(getResourceController)
 */
resourcesRouter.put(
  '/:resource_id',
  accessTokenValidator,
  checkPermission('update', 'Resources'),
  resourceQueryValidator,
  updateResourceValidator,
  wrapRequestHandler(updateResourceController)
)

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
resourcesRouter.delete(
  '/:resource_id',
  accessTokenValidator,
  checkPermission('delete', 'Resources'),
  resourceQueryValidator,
  wrapRequestHandler(deleteResourceController)
)

export default resourcesRouter
