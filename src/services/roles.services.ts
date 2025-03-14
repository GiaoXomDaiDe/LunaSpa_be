import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { ERROR_RESPONSE_MESSAGES, RESOURCE_MESSAGE, ROLE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { RoleReqBody } from '~/models/request/Role.request'
import Roles, { ResourcePermission } from '~/models/schema/Role.schema'
import { buildRoleWithResourcePipeline, PaginationOptions } from '~/pipelines/roles.pipeline'
import databaseService from '~/services/database.services'
import { isRoleChanged } from '~/utils/helpers'

class RolesService {
  async getDefaultRoles(role: string = 'User') {
    const defaultRole = await databaseService.roles.findOne({ name: role })
    if (!defaultRole) {
      throw new Error(ROLE_MESSAGES.DEFAULT_ROLE_NOT_FOUND)
    }
    return defaultRole
  }
  async getAllRoles({ limit, page }: PaginationOptions) {
    const result = await databaseService.roles
      .aggregate(
        buildRoleWithResourcePipeline({
          option: {
            limit,
            page
          }
        })
      )
      .toArray()
    return result
  }
  async getRole({ role_id, role_name }: { role_id?: string; role_name?: string }) {
    const role = await databaseService.roles.aggregate(buildRoleWithResourcePipeline({ role_id, role_name })).toArray()
    if (!role[0]) {
      throw new ErrorWithStatus({
        message: ROLE_MESSAGES.DEFAULT_ROLE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return role[0]
  }
  async createRole(body: RoleReqBody) {
    const resources = (body.resources as ResourcePermission[]).map((item) => ({
      ...item,
      resource_id: new ObjectId(item.resource_id)
    }))
    const rolesData = new Roles({
      name: body.name,
      resources
    })
    const result = await databaseService.roles.insertOne(rolesData)
    if (!result.insertedId) {
      throw new ErrorWithStatus({
        message: ERROR_RESPONSE_MESSAGES.ROLES_CREATION_FAILED,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }
    const role = await databaseService.roles.findOne({
      _id: result.insertedId
    })
    if (!role) {
      throw new ErrorWithStatus({
        message: ROLE_MESSAGES.DEFAULT_ROLE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return role
  }
  async updateRoles(body: Partial<RoleReqBody>, role_id: string) {
    const resources = (body.resources = (body.resources as ResourcePermission[]).map((item) => ({
      ...item,
      resource_id: new ObjectId(item.resource_id)
    })))
    const updated_role = await databaseService.roles.findOneAndUpdate(
      {
        _id: new ObjectId(role_id)
      },
      {
        $set: {
          name: body.name,
          resources: resources
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    if (updated_role === null) {
      throw new ErrorWithStatus({
        message: ROLE_MESSAGES.DEFAULT_ROLE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const updated_role_id = updated_role._id.toString()
    const result = await databaseService.roles
      .aggregate(buildRoleWithResourcePipeline({ role_id: updated_role_id }))
      .toArray()

    return result[0]
  }
  async deleteRole(role_id: string) {
    const result = await databaseService.roles.findOneAndDelete({
      _id: new ObjectId(role_id)
    })
    if (result === null) {
      throw new ErrorWithStatus({
        message: ROLE_MESSAGES.DEFAULT_ROLE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
  }
  async addResourceToRole(role_id: string, resource_id: string) {
    const role = await databaseService.roles.findOne({
      _id: new ObjectId(role_id)
    })
    if (!role) {
      throw new ErrorWithStatus({
        message: ROLE_MESSAGES.DEFAULT_ROLE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const resource = await databaseService.resources.findOne({
      _id: new ObjectId(resource_id)
    })
    if (!resource) {
      throw new ErrorWithStatus({
        message: RESOURCE_MESSAGE.RESOURCE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const result = await databaseService.roles.findOneAndUpdate(
      {
        _id: new ObjectId(role_id)
      },
      {
        $push: {
          resources: {
            resource_id: new ObjectId(resource_id),
            create: false,
            read: false,
            update: false,
            delete: false
          }
        }
      },
      {
        returnDocument: 'after'
      }
    )
    if (result === null) {
      throw new ErrorWithStatus({
        message: ROLE_MESSAGES.DEFAULT_ROLE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return result
  }
  async updateRole(role_id: string, payload: any) {
    // Lấy role hiện tại
    const currentRole = await databaseService.roles.findOne({ _id: new ObjectId(role_id) })
    if (!currentRole) {
      throw new ErrorWithStatus({
        message: ROLE_MESSAGES.ROLE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Kiểm tra xem có thay đổi gì không
    if (!isRoleChanged(currentRole, payload)) {
      return currentRole
    }

    // Nếu có thay đổi thì mới update
    const result = await databaseService.roles.findOneAndUpdate(
      { _id: new ObjectId(role_id) },
      {
        $set: payload,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )

    return result
  }
}

const rolesService = new RolesService()
export default rolesService
