import { checkSchema } from 'express-validator'
import { ROLE_MESSAGES } from '~/constants/messages'
import Roles from '~/models/schema/Role.schema'
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
        custom: {
          options: async (value: string, { req }) => {
            const role = (await databaseService.roles.findOne({ name: value })) as Roles
            if (role) {
              return Promise.reject(ROLE_MESSAGES.ROLE_IS_EXIST)
            }
          }
        }
      }
    },
    ['body']
  )
)
