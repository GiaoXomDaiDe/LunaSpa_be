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
import { addResourceToRoleValidator, createRoleValidator, updateRoleValidator } from '~/middlewares/roles.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const rolesRouter = Router()

/**
 * @route GET /roles
 * @description Lấy danh sách tất cả roles
 * @access Private
 * @returns {Array<Role>} 200 - Danh sách roles
 * @requires access_token
 */
rolesRouter.get('/', accessTokenValidator, wrapRequestHandler(getAllRolesController))

/**
 * @route GET /roles/:id
 * @description Lấy thông tin chi tiết của một role
 * @access Private
 * @param {string} id - Role ID (MongoDB ObjectId)
 * @returns {Role} 200 - Thông tin role
 * @requires access_token
 *
 * @throws {401} - Unauthorized - Token không hợp lệ hoặc hết hạn
 * @throws {403} - Forbidden - Không có quyền truy cập
 * @throws {404} - Not Found - Role không tồn tại
 */
rolesRouter.get('/:id', accessTokenValidator, wrapRequestHandler(getRoleController))

/**
 * @route POST /roles
 * @description Tạo mới một role
 * @access Private
 * @requires access_token
 *
 * @body {Object} request
 * @body {string} request.name
 * @body {Array<ResourcePermission>} request.resources - Danh sách quyền trên resources
 * @body {Object} request.resources[] - kiểm tra isArray
 * @body {string} request.resources[].resource_id - ID của resource
 * @body {boolean} request.resources[].create - Quyền tạo
 * @body {boolean} request.resources[].read - Quyền đọc
 * @body {boolean} request.resources[].update - Quyền cập nhật
 * @body {boolean} request.resources[].delete - Quyền xóa
 *
 * @returns {Role} 201 - Role đã được tạo
 *
 * @validation
 * - Tên role phải là duy nhất trong hệ thống
 * - Ko đc empty
 * - viết hoa chữ đầu
 * - Tên role không được chứa ký tự đặc biệt
 * - Resources không được rỗng
 * - Resources phải là array
 * - Mỗi resource_id trong mảng resources phải tồn tại trong hệ thống
 *
 * @throws {400} - Bad Request - Dữ liệu không hợp lệ
 * @throws {401} - Unauthorized - Token không hợp lệ hoặc hết hạn
 * @throws {403} - Forbidden - Không có quyền tạo role
 * @throws {409} - Conflict - Tên role đã tồn tại
 */
rolesRouter.post('/', accessTokenValidator, createRoleValidator, wrapRequestHandler(createRolesController))

/**
 * @route PUT /roles/:id
 * @description Cập nhật thông tin role
 * @access Private
 * @requires access_token
 *
 * @param {string} id - Role ID
 * @body {Object} request
 * @body {string} request.resource_name - Tên resource (chữ đầu in hoa)
 * @body {string} request.description - Mô tả (tối đa 255 ký tự)
 *
 * @returns {Role} 200 - Role đã được cập nhật
 *
 * @validation
 * - Name role in hoa chữ cái đầu
 * - Không được chỉnh sửa role admin
 * - Tên mới không được trùng với các role khác
 * - Resource không được rỗng
 * - Resource phải là array
 * - Resource_id phải tồn tại trong hệ thống
 * - Resource_id phải được validate
 * - CRUD phải là boolean.
 */
rolesRouter.put('/:id', accessTokenValidator, updateRoleValidator, wrapRequestHandler(updateRoleController))

/**
 * @route DELETE /roles/:id
 * @description Xóa một role
 * @access Private
 * @requires access_token
 *
 * @param {string} id - Role ID
 * @returns {Object} 200 - Thông báo xóa thành công
 *
 * @validation
 */
rolesRouter.delete('/:id', accessTokenValidator, wrapRequestHandler(deleteRoleController))

/**
 * @route POST /roles/:role_id/resources/:resource_id
 * @description Thêm quyền resource vào role
 * @access Private
 * @requires access_token
 *
 * @param {string} role_id - Role ID
 * @param {string} resource_id - Resource ID
 * @body {Object} request
 * @body {('read'|'write'|'delete')} request.permission - Loại quyền
 *
 * @returns {Role} 200 - Role đã được cập nhật
 *
 * @validation
 * - Role và Resource phải tồn tại trong hệ thống
 * - Resource không được tồn tại sẵn trong role
 * - Permission phải thuộc một trong các giá trị: read, write, delete
 */
rolesRouter.post(
  '/:role_id/resources/:resource_id',
  accessTokenValidator,
  addResourceToRoleValidator,
  wrapRequestHandler(addResourceToRoleController)
)

export default rolesRouter
