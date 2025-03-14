import { ObjectId } from 'mongodb'

export const buildProductPipeline = (product_id: string) => {
  const match: Record<string, ObjectId> = {
    _id: new ObjectId(product_id)
  }
  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'product_categories',
        localField: 'category_id',
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
      $project: {
        category_id: 0
      }
    }
  ]
  return pipeline
}
