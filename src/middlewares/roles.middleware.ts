import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { RESOURCE_MESSAGE, ROLE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/request/Account.requests'
import Account from '~/models/schema/Account.schema'
import Roles from '~/models/schema/Role.schema'
import databaseService from '~/services/database.services'
import rolesService from '~/services/roles.services'
import { validate } from '~/utils/validation'

export const roleQueryValidator = validate(
  checkSchema(
    {
      role_id: {
        trim: true,
        notEmpty: {
          errorMessage: ROLE_MESSAGES.ROLE_IS_REQUIRE
        },
        isMongoId: {
          errorMessage: ROLE_MESSAGES.ROLE_MUST_BE_A_MONGO_ID
        },
        custom: {
          options: async (value: string, { req }) => {
            console.log(value)
            const role = await databaseService.roles.findOne({ _id: new ObjectId(value) })
            if (!role) {
              throw new Error(ROLE_MESSAGES.ROLE_NOT_FOUND)
            }
            req.role = role
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const createRoleValidator = validate(
  checkSchema(
    {
      name: {
        customSanitizer: {
          options: (value: string) => {
            const upperCase = value.split(' ').map((word) => word.toLowerCase().charAt(0).toUpperCase() + word.slice(1))
            return upperCase.join(' ')
          }
        },
        notEmpty: {
          errorMessage: ROLE_MESSAGES.ROLE_IS_REQUIRE
        },
        isString: {
          errorMessage: ROLE_MESSAGES.ROLE_MUST_BE_A_STRING
        },
        matches: {
          options: [/^[A-Za-z0-9_ ]+$/],
          errorMessage: ROLE_MESSAGES.ROLE_CANNOT_CONTAIN_SPECIAL_CHARACTER
        },
        custom: {
          options: async (value: string, { req }) => {
            const role = (await databaseService.roles.findOne({ name: value })) as Roles
            if (role) {
              throw new Error(ROLE_MESSAGES.ROLE_IS_EXIST)
            }
            req.role = role
            return true
          }
        }
      },
      resources: {
        notEmpty: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_IS_REQUIRE
        },
        isArray: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_IS_ARRAY
        },
        custom: {
          options: async (resources: any[]) => {
            resources.forEach((resource: any) => {
              if (!resource.resource_id || !ObjectId.isValid(resource.resource_id)) {
                throw new Error(RESOURCE_MESSAGE.RESOURCE_NOT_FOUND)
              }
              const permissions = ['create', 'read', 'update', 'delete']
              permissions.forEach((permission) => {
                if (typeof resource[permission] !== 'boolean') {
                  throw new Error(
                    resource.resource_id + ' ' + `${permission}` + ' ' + RESOURCE_MESSAGE.PERMISSION_MUST_BE_BOOLEAN
                  )
                }
              })
            })
          }
        }
      }
    },
    ['body']
  )
)

export const updateRoleValidator = validate(
  checkSchema(
    {
      name: {
        customSanitizer: {
          options: (value: string) => {
            return value
              .split(' ')
              .map((word) => word.toLowerCase().charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
          }
        },
        notEmpty: {
          errorMessage: ROLE_MESSAGES.ROLE_IS_REQUIRE
        },
        isString: {
          errorMessage: ROLE_MESSAGES.ROLE_MUST_BE_A_STRING
        },
        matches: {
          options: [/^[A-Za-z0-9_ ]+$/],
          errorMessage: ROLE_MESSAGES.ROLE_CANNOT_CONTAIN_SPECIAL_CHARACTER
        },
        custom: {
          options: async (value: string, { req }) => {
            const currentRole = (req as Request).role as Roles
            if (currentRole && currentRole.name === value) {
              return true
            }
            if (currentRole && currentRole.name === 'admin') {
              throw new Error(ROLE_MESSAGES.ROLE_CONTAIN_ADMIN)
            }
            const existingRole = await databaseService.roles.findOne({
              name: value,
              _id: { $ne: currentRole._id }
            })
            if (existingRole) {
              throw new Error(ROLE_MESSAGES.ROLE_IS_EXIST)
            }
            return true
          }
        }
      },
      resources: {
        notEmpty: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_IS_REQUIRE
        },
        isArray: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_IS_ARRAY
        },
        custom: {
          options: async (resources: any[]) => {
            resources.forEach((resource: any) => {
              if (!resource.resource_id || !ObjectId.isValid(resource.resource_id)) {
                throw new Error(RESOURCE_MESSAGE.RESOURCE_NOT_FOUND)
              }
              const permissions = ['create', 'read', 'update', 'delete']
              permissions.forEach((permission) => {
                if (typeof resource[permission] !== 'boolean') {
                  throw new Error(`${permission.toUpperCase()}_MUST_BE_BOOLEAN`)
                }
              })
            })
          }
        }
      }
    },
    ['body']
  )
)

export const addResourceToRoleValidator = validate(
  checkSchema(
    {
      role_id: {
        notEmpty: {
          errorMessage: ROLE_MESSAGES.ROLE_IS_REQUIRE
        },
        isString: {
          errorMessage: ROLE_MESSAGES.ROLE_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string, { req }) => {
            const role = await databaseService.roles.findOne({ _id: new ObjectId(value) })
            if (!role) {
              throw new Error(ROLE_MESSAGES.DEFAULT_ROLE_NOT_FOUND)
            }
            const resource_id = req.params?.resource_id
            if (
              role.resources.find((resource) => resource.resource_id && resource.resource_id.toString() === resource_id)
            ) {
              throw new Error(ROLE_MESSAGES.RESOURCE_ALREADY_EXISTS_IN_ROLE)
            }
          }
        }
      },
      resource_id: {
        notEmpty: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_IS_REQUIRE
        },
        isString: {
          errorMessage: RESOURCE_MESSAGE.RESOURCE_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: string) => {
            const resource = await databaseService.resources.findOne({ _id: new ObjectId(value) })
            if (!resource) {
              throw new Error(RESOURCE_MESSAGE.RESOURCE_NOT_FOUND)
            }
          }
        }
      }
    },
    ['params']
  )
)

export const checkPermission = (operation: 'create' | 'read' | 'update' | 'delete', resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { account_id } = req.decoded_authorization as TokenPayload
      // Xác định role theo role_name hoặc từ account
      let role_id: string
      let role

      if (req.role_name === 'guest') {
        role = await rolesService.getRole({ role_name: req.role_name })
        role_id = role._id.toString()
      } else {
        const account = await databaseService.accounts.findOne({ _id: new ObjectId(account_id) })
        role_id = (account as Account).role_id.toString()
        role = await rolesService.getRole({ role_id })
      }

      // Kiểm tra quyền nếu role có resources
      if (role?.resources?.length) {
        const result = await databaseService.roles
          .aggregate([
            { $match: { _id: new ObjectId(role_id) } },
            { $unwind: '$resources' },
            {
              $lookup: {
                from: 'resources',
                localField: 'resources.resource_id',
                foreignField: '_id',
                as: 'resource_details'
              }
            },
            { $unwind: '$resource_details' },
            {
              $match: {
                'resource_details.resource_name': resource
              }
            },
            {
              $project: {
                permission: {
                  create: '$resources.create',
                  read: '$resources.read',
                  update: '$resources.update',
                  delete: '$resources.delete'
                }
              }
            }
          ])
          .toArray()

        // Kiểm tra quyền thao tác
        if (result.length > 0 && result[0].permission[operation] === true) {
          req.role = role as Roles
          return next()
        }
      }

      return next(
        new ErrorWithStatus({
          message: 'Permission denied',
          status: HTTP_STATUS.FORBIDDEN
        })
      )
    } catch (error: any) {
      next(
        new ErrorWithStatus({
          message: error.message,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      )
    }
  }
}
