import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { RESOURCE_MESSAGE, ROLE_MESSAGES } from '~/constants/messages'
import Roles from '~/models/schema/Role.schema'
import rolesRouter from '~/routes/roles.routes'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const createRoleValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: ROLE_MESSAGES.ROLE_IS_REQUIRE
        },
        isString: {
          errorMessage: ROLE_MESSAGES.ROLE_MUST_BE_A_STRING
        },
        matches: {
          options: [/^[A-Za-z0-9_]+$/],
          errorMessage: ROLE_MESSAGES.ROLE_CANNOT_CONTAIN_SPECIAL_CHARACTER
        },
        customSanitizer: {
          options: (value: any) => {
            if (typeof value !== 'string') {
              return value
            }
            return value.replace(/\b\w/, (char) => char.toUpperCase())
          }
        },
        custom: {
          options: async (value: string, { req }) => {
            const role = (await databaseService.roles.findOne({ name: value })) as Roles
            if (role) {
              throw new Error(ROLE_MESSAGES.ROLE_IS_EXIST)
            }
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
        notEmpty: {
          errorMessage: ROLE_MESSAGES.ROLE_IS_REQUIRE
        },
        isString: {
          errorMessage: ROLE_MESSAGES.ROLE_MUST_BE_A_STRING
        },
        matches: {
          options: [/^[A-Za-z0-9_]+$/],
          errorMessage: ROLE_MESSAGES.ROLE_CANNOT_CONTAIN_SPECIAL_CHARACTER
        },
        customSanitizer: {
          options: (value: any) => {
            if (typeof value !== 'string') {
              return value
            }
            return value.replace(/\b\w/, (char) => char.toUpperCase())
          }
        },
        custom: {
          options: async (value: string, { req }) => {
            const role = (await databaseService.roles.findOne({ name: value })) as Roles
            if (role.name === 'admin') {
              throw new Error(ROLE_MESSAGES.ROLE_CONTAIN_ADMIN)
            }
            if (role) {
              throw new Error(ROLE_MESSAGES.ROLE_IS_EXIST)
            }
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
