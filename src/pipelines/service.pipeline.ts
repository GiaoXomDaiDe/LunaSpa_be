import { ObjectId } from 'mongodb'

export const buildServicePipeline = (service_id: string) => {
  const match: Record<string, ObjectId> = {
    _id: new ObjectId(service_id)
  }
  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'service_categories',
        localField: 'service_category_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'devices',
        localField: 'device_ids',
        foreignField: '_id',
        as: 'devices'
      }
    },
    {
      $project: {
        device_ids: 0,
        service_category_id: 0
      }
    }
  ]
  return pipeline
}
