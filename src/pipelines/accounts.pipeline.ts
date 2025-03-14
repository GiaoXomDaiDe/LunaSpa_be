import { Document, ObjectId } from 'mongodb'

/**
 * Hàm buildUserRolesPipeline
 * @param account_id - (tùy chọn) ObjectId của user. Nếu truyền vào, pipeline sẽ match theo account_id
 * @returns một mảng stage (Document[]) cho Aggregation Pipeline
 */
export function buildUserRolesPipeline(account_id?: ObjectId) {
  // Bắt đầu với 1 mảng rỗng
  const pipeline: Document[] = []

  // Nếu có account_id, thêm bước match
  if (account_id) {
    pipeline.push({
      $match: {
        _id: account_id
      }
    })
  }

  // Thêm bước $lookup để join roles (cùng với pipeline con)
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
              // Thêm các trường khác nếu cần
              // e.g. resources: 1
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

  return pipeline
}
