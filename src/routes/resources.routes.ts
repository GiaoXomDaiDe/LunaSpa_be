import { Router } from 'express'
import {
  createResourceController,
  deleteResourceController,
  getAllResourcesController,
  getResourceController,
  updateResourceController
} from '~/controllers/resources.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const resourcesRouter = Router()
/**
 * Description. Get All Resources
 * Path: /
 * Method: GET
 * Headers: access_token: Bearer token
 * Body: <none>
 */
resourcesRouter.get('/', wrapRequestHandler(getAllResourcesController))

/**
 * Description. Get Resource
 * Path: /:id
 * Method: GET
 * Headers: access_token: Bearer token
 * Body: <none>
 */
resourcesRouter.get('/:id', wrapRequestHandler(getResourceController))

/**
 * Description. Create Resource
 * Path: /
 * Method: POST
 * Headers: access_token: Bearer token
 * Body: {  resource_name: string, description: string}
 * Validator:
 * Phải có access_token,
 * Phải có quyền tác động resource
 * resource_name bắt buộc có, kiểu string, chữ đầu in hoa, không chứa ký tự đặc biệt
 * Với createRole:
Khi tạo mới role, bạn sẽ kiểm tra xem tên role đã tồn tại trong database hay chưa. Nếu có thì trả về lỗi.
 * description bắt buộc có, kiểu string, tối đa 255 ký tự
 */
resourcesRouter.post('/', wrapRequestHandler(createResourceController))

/**
 * Description. Update Resource
 * Path: /:id
 * Method: Put
 * Headers: access_token: Bearer token
 * Validator:
 * Phải có access_token,
 * Phải có quyền tác động resource
 * resource_name bắt buộc có, kiểu string, chữ đầu in hoa, không chứa ký tự đặc biệt
 * description bắt buộc có, kiểu string, tối đa 255 ký tự
 * id bắt buộc có, kiểu string, ObjectId
 * Lấy role từ trong db dựa theo param id, nếu ko tìm thấy trả lỗi
 * lấy role hiện tại của đối tượng update
 * Nếu ko có tức là role ko tìm thấy => trả lỗi
 * Nếu role hiện tại là admin thì ko cho chỉnh sửa
 * Nếu người dùng đang cập nhật tên, kiểm tra xem tên mới đã tồn tại trong các role khác chưa
 * Body: {  resource_name: string, description: string}
 */
resourcesRouter.put('/:id', wrapRequestHandler(updateResourceController))
/**
 * Description. Update Resource
 * Path: /:id
 * Method: Put
 * Headers: access_token: Bearer token
 * Validator:
 * Phải có access_token,
 * Phải có quyền tác động resource
 * id bắt buộc có, kiểu string, ObjectId
 * Lấy role từ trong db dựa theo param id, nếu ko tìm thấy trả lỗi
 * lấy role hiện tại của đối tượng update
 * Nếu ko có tức là role ko tìm thấy => trả lỗi
 * Nếu role hiện tại là admin thì ko cho chỉnh sửa
 * Nếu người dùng đang cập nhật tên, kiểm tra xem tên mới đã tồn tại trong các role khác chưa
 * Body: {  resource_name: string, description: string}
 */
resourcesRouter.put('/:id', wrapRequestHandler(updateResourceController))

/**
 * Description. Delete Resource
 * Path: /:id
 * Method: Delete
 * Headers: access_token: Bearer token
 * Validator:
 * Phải có access_token,
 * Phải có quyền tác động resource
 * id bắt buộc có, kiểu string, ObjectId
 * Lấy role từ trong db dựa theo param id, nếu ko tìm thấy trả lỗi
 * lấy role hiện tại của đối tượng update
 * Nếu ko có tức là role ko tìm thấy => trả lỗi
 * Nếu role hiện tại là admin thì ko cho chỉnh sửa
 * Nếu người dùng đang cập nhật tên, kiểm tra xem tên mới đã tồn tại trong các role khác chưa
 */

resourcesRouter.delete('/:id', wrapRequestHandler(deleteResourceController))
export default resourcesRouter
