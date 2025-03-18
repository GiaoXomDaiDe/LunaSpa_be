import { ObjectId } from 'mongodb'
import { BranchServicesStatus } from '~/models/schema/BranchServices.schema'

export const buildServicePipeline = (service_id: string) => {
  const match: Record<string, ObjectId> = {
    _id: new ObjectId(service_id)
  }
  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'branch_services',
        let: { service_id: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$service_id', '$$service_id'] }, { $eq: ['$status', BranchServicesStatus.ACTIVE] }]
              }
            }
          }
        ],
        as: 'temp_branch_services'
      }
    },
    {
      $addFields: {
        branch_ids: {
          $map: {
            input: '$temp_branch_services',
            as: 'bs',
            in: '$$bs.branch_id'
          }
        }
      }
    },
    {
      $lookup: {
        from: 'branches',
        localField: 'branch_ids',
        foreignField: '_id',
        as: 'branches'
      }
    },
    {
      $addFields: {
        service_status: '$status',
        branch_services_details: {
          $map: {
            input: '$temp_branch_services',
            as: 'bs',
            in: {
              branch_services_id: '$$bs._id',
              branch_services_status: '$$bs.status'
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'devices',
        let: { devIds: '$device_ids' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $in: ['$_id', '$$devIds'] }, { $eq: ['$status', 1] }]
              }
            }
          }
        ],
        as: 'devices'
      }
    },
    {
      $lookup: {
        from: 'service_categories',
        localField: 'service_category_id',
        foreignField: '_id',
        as: 'service_category'
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        images: 1,
        service_status: 1,
        booking_count: 1,
        view_count: 1,
        durations: 1,
        device: 1,
        service_category: 1,
        created_at: 1,
        updated_at: 1,
        branches: {
          $map: {
            input: '$branches',
            as: 'branch',
            in: {
              _id: '$$branch._id',
              name: '$$branch.name',
              description: '$$branch.description',
              rating: '$$branch.rating',
              images: '$$branch.images',
              opening_hours: '$$branch.opening_hours',
              contact: '$$branch.contact'
            }
          }
        },
        branch_services_details: 1
      }
    },
    {
      $unwind: {
        path: '$service_category',
        preserveNullAndEmptyArrays: true
      }
    }
  ]
  return pipeline
}
