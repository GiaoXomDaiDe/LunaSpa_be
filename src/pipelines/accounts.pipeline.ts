import { Document, ObjectId } from 'mongodb'

export function buildUserRolesPipeline(account_id?: ObjectId) {
  const pipeline: Document[] = []

  if (account_id) {
    pipeline.push({
      $match: {
        _id: account_id
      }
    })
  }

  pipeline.push(
    {
      $lookup: {
        from: 'roles',
        let: { role_ids: ['$role_id'] },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$_id', '$$role_ids']
              }
            }
          },
          {
            $project: {
              name: 1
            }
          }
        ],
        as: 'roleDetails'
      }
    },
    {
      $addFields: {
        roles: {
          $map: {
            input: '$roleDetails',
            as: 'rd',
            in: {
              role_id: '$$rd._id',
              role_name: '$$rd.name'
            }
          }
        }
      }
    },
    {
      $project: {
        roleDetails: 0,
        role_id: 0,
        password: 0,
        email_verify_token: 0,
        forgot_password_token: 0
      }
    }
  )

  return pipeline
}
