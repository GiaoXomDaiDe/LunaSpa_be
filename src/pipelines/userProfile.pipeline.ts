import { ObjectId } from 'mongodb'

export const buildUserProfilePipeline = (user_profile_id: string) => {
  const match: Record<string, ObjectId> = {
    _id: new ObjectId(user_profile_id)
  }
  const pipeline: Record<string, any>[] = []

  pipeline.push({
    $match: match
  })

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
      preserveNullAndEmptyArrays: true
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
      created_at: 0,
      updated_at: 0,
      'account.roleDetails': 0,
      'account.role_id': 0
    }
  })

  return pipeline
}
export const buildUserProfileByAccountIdPipeline = (account_id: string) => {
  const match: Record<string, ObjectId> = {
    account_id: new ObjectId(account_id)
  }
  const pipeline: Record<string, any>[] = []

  pipeline.push({
    $match: match
  })

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
      preserveNullAndEmptyArrays: true
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
      created_at: 0,
      updated_at: 0,
      'account.roleDetails': 0,
      'account.role_id': 0
    }
  })

  return pipeline
}
