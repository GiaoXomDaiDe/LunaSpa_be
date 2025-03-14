import { GetAllProductsOptions } from '~/models/request/Products.requests'
import { buildProducsOfConditionPipeline } from '~/pipelines/conditionProducts.pipeline'
import databaseService from '~/services/database.services'

class ConditionProductService {
  async getAllProductsOfCondition(condition_id: string, options: GetAllProductsOptions) {
    const pipeline = buildProducsOfConditionPipeline(condition_id, options)
    const result = await databaseService.conditionProducts.aggregate(pipeline).toArray()
    const { data, total_count } = result[0]
    const count = total_count?.[0]?.count || 0
    return {
      data
    }
  }
}

const conditionProductService = new ConditionProductService()
export default conditionProductService
