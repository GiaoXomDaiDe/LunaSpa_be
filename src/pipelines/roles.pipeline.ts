import { Document, ObjectId } from 'mongodb'

export interface PaginationOptions {
  limit: number
  page: number
}

export const buildRoleWithResourcePipeline = ({
  role_id,
  option
}: {
  role_id?: string
  option?: PaginationOptions
}) => {
  const pipeline: Document[] = []

  // 1. Match (nếu có role_id)
  if (role_id) {
    pipeline.push({
      $match: { _id: new ObjectId(role_id) }
    })
  }

  // 2. (Nếu cần phân trang trên 'roles' trước khi lookup, ta có thể $skip/$limit ở đây)
  if (option) {
    const skipVal = Math.max(0, (option.page - 1) * option.limit)
    pipeline.push({ $skip: skipVal })
    pipeline.push({ $limit: option.limit })
  }

  // 3. Lookup sử dụng pipeline
  pipeline.push({
    $lookup: {
      from: 'resources',
      let: { roleResources: '$resources' }, // 'resources' ở document role
      pipeline: [
        {
          $match: {
            $expr: {
              $in: [
                '$_id',
                {
                  // Trích mảng resource_id trong role
                  $map: {
                    input: '$$roleResources',
                    as: 'res',
                    in: '$$res.resource_id'
                  }
                }
              ]
            }
          }
        },
        // Có thể $project thêm field cần thiết
        {
          $project: {
            resource_name: 1,
            description: 1
          }
        }
      ],
      as: 'resourceDocs'
    }
  })

  // 4. Kết hợp resourceDocs với mảng resources ban đầu
  //    Mục tiêu: Mỗi phần tử mảng 'resources' có đầy đủ
  //    { resource_id, create, read, update, delete, resource_name, description }
  pipeline.push({
    $addFields: {
      resources: {
        $map: {
          input: '$resources',
          as: 'r',
          in: {
            $mergeObjects: [
              '$$r',
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$resourceDocs',
                      as: 'rd',
                      cond: { $eq: ['$$rd._id', '$$r.resource_id'] }
                    }
                  },
                  0
                ]
              }
            ]
          }
        }
      }
    }
  })

  // 5. Ẩn mảng phụ
  pipeline.push({
    $project: {
      resourceDocs: 0,
      'resources._id': 0
    }
  })

  return pipeline
}
