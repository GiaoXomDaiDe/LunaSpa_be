import { GetAllStaffProfilesOptions } from '~/models/request/StaffProfiles.requests'

export function buildStaffProfilesPipeline(options: GetAllStaffProfilesOptions) {
  const defaultOptions: Partial<Required<GetAllStaffProfilesOptions>> = {
    limit: 10,
    page: 1,
    isAdmin: false
  }
  const _options = {
    ...defaultOptions,
    ...options
  }
  const { limit, page, isAdmin, staff_type } = _options
  const skip = ((page as number) - 1) * (limit as number)

  const pipeline: any[] = []

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
        }
      ],
      as: 'account'
    }
  })

  pipeline.push({
    $unwind: '$account'
  })

  // Nếu có staff_type, thì thêm $match
  if (staff_type) {
    pipeline.push({
      $match: {
        staff_type
      }
    })
  }

  // Nếu là admin thì lấy tất cả, nếu không thì lấy theo trạng thái = activated
  if (!isAdmin) {
    pipeline.push({
      $match: {
        'account.status': 'activated'
      }
    })
  }

  pipeline.push({
    $lookup: {
      from: 'specialties',
      localField: 'specialty_ids',
      foreignField: '_id',
      as: 'specialties'
    }
  })

  pipeline.push({
    $project: {
      account_id: 0,
      specialty_ids: 0,
      'account.password': 0,
      'account.email_verify_token': 0,
      'account.forgot_password_token': 0
    }
  })

  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: limit as number }],
      total_count: [{ $count: 'count' }]
    }
  })

  return { pipeline, _options }
}
