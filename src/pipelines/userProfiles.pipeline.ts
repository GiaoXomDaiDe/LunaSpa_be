import { GetAllUserProfilesOptions } from '~/models/request/UserProfiles.requests'
import { AccountVerify } from '~/models/schema/Account.schema'

export function buildUserProfilesPipeline(options: GetAllUserProfilesOptions) {
  const defaultOptions: Partial<Required<GetAllUserProfilesOptions>> = {
    limit: 10,
    page: 1
  }
  const _options = {
    limit: options.limit ?? defaultOptions.limit,
    page: options.page ?? defaultOptions.page,
    isAdmin: options.isAdmin ?? defaultOptions.isAdmin
  }
  const pipeline: Record<string, any>[] = []
  pipeline.push({
    $lookup: {
      from: 'accounts',
      let: { accId: '$account_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$accId']
            }
          }
        },
        ...(!_options.isAdmin
          ? [
              {
                $match: {
                  verify: {
                    $in: [AccountVerify.UNVERIFIED, AccountVerify.VERIFIED]
                  }
                }
              }
            ]
          : []),
        {
          $project: {
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0
          }
        }
      ],
      as: 'account'
    }
  })

  pipeline.push({
    $unwind: {
      path: '$account',
      preserveNullAndEmptyArrays: false
    }
  })

  pipeline.push(
    {
      $lookup: {
        from: 'roles',
        let: {
          role_ids: {
            $cond: {
              if: { $isArray: '$account.role_id' },
              then: '$account.role_id',
              else: ['$account.role_id']
            }
          }
        },
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
        as: 'account.roleDetails'
      }
    },
    {
      $addFields: {
        'account.roles': {
          $map: {
            input: '$account.roleDetails',
            as: 'rd',
            in: {
              role_id: '$$rd._id',
              role_name: '$$rd.name'
              // Thêm trường khác nếu cần: $$rd.resources
            }
          }
        }
      }
    },
    {
      $project: {
        roleDetails: 0, // Ẩn trường trung gian
        role_id: 0, // Ẩn mảng role_id gốc
        password: 0,
        email_verify_token: 0,
        forgot_password_token: 0
      }
    }
  )

  pipeline.push({
    $lookup: {
      from: 'conditions',
      localField: 'condition_ids',
      foreignField: '_id',
      as: 'conditions'
    }
  })

  pipeline.push({
    $project: {
      account_id: 0,
      condition_ids: 0,
      'account.roleDetails': 0,
      'account.role_id': 0
    }
  })

  pipeline.push({
    $facet: {
      data: [
        {
          $skip: ((_options.page as number) - 1) * (_options.limit as number)
        },
        {
          $limit: _options.limit
        }
      ],
      total_count: [{ $count: 'count' }]
    }
  })

  return { pipeline, _options }
}
