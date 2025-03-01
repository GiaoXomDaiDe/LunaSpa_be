import { Router } from 'express'
import {
  addResourceToRoleController,
  createRolesController,
  deleteRoleController,
  getAllRolesController,
  getRoleController,
  updateRoleController
} from '~/controllers/roles.controllers'
import { accessTokenValidator } from '~/middlewares/accounts.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const rolesRouter = Router()
/**
 * Description. Get All Roles
 * Path: /
 * Method: GET
 * Headers: access_token: Bearer token
 * Body: <none>
 * CheckPermission
 * AccessValidator
 */
rolesRouter.get('/', accessTokenValidator, wrapRequestHandler(getAllRolesController))

/**
 * Description. Get Role
 * Path: /:id
 * Method: GET
 * Headers: access_token: Bearer token
 * Body: <none>
 */
rolesRouter.get('/:id', accessTokenValidator, wrapRequestHandler(getRoleController))

/**
 * Description. Create Role
 * Path: /
 * Method: POST
 * Headers: access_token: Bearer token
 * Body: {  name: string, resources: ResourcePermission[]}
 * Validator:
 * Phải có access_token, done
 * Phải có quyền tác động resource (để Huy)
 * 
 * name bắt buộc có, kiểu string, không chứa ký tự đặc biệt
 * resources bắt buộc có, kiểu mảng, không rỗng
 * Với createRole:
Khi tạo mới role, bạn sẽ kiểm tra xem tên role đã tồn tại trong database hay chưa. Nếu có thì trả về lỗi.
 * chữ đầu in hoa có thể sửa sau khi tạo
 */
rolesRouter.post('/', accessTokenValidator, wrapRequestHandler(createRolesController))

/**
 * Description. Update Role
 * Path: /:id
 * Method: Put
 * Headers: access_token: Bearer token
 * Validator:
 * Phải có access_token,
 * Phải có quyền tác động resource
 *
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
rolesRouter.put('/:id', accessTokenValidator, wrapRequestHandler(updateRoleController))
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
rolesRouter.put('/:id', accessTokenValidator, wrapRequestHandler(updateRoleController))

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

rolesRouter.delete('/:id', accessTokenValidator, wrapRequestHandler(deleteRoleController))

/**
 * Description. Add Resource To Role
 * Path: /
 * Method: POST
 * Headers: access_token: Bearer token
 * Body: { role_id: string, resource_id: string, permission: string }
 *
 * Validator:
 * Phải có access_token,
 * Phải có quyền tác động resource
 * role_id bắt buộc có, kiểu string, ObjectId
 * resource_id bắt buộc có, kiểu string, ObjectId
 * permission bắt buộc có, kiểu string, enum: ['read', 'write', 'delete']
 * Lấy role từ trong db dựa theo role_id, nếu ko tìm thấy trả lỗi
 * Lấy resource từ trong db dựa theo resource_id, nếu ko tìm thấy trả lỗi
 * Kiểm tra xem resource đã tồn tại trong role chưa, nếu có thì trả lỗi
 *
 *  */
rolesRouter.post(
  '/:role_id/resources/:resource_id',
  accessTokenValidator,
  wrapRequestHandler(addResourceToRoleController)
)
export default rolesRouter
