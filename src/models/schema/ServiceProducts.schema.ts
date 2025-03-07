import { ObjectId } from 'mongodb'

export interface ServiceProductsType {
  _id?: ObjectId
  service_id: ObjectId
  product_id: ObjectId
  created_at?: Date
  updated_at?: Date
}

export default class ServiceProducts {
  _id?: ObjectId
  service_id: ObjectId
  product_id: ObjectId
  created_at: Date
  updated_at: Date
  constructor(serviceProducts: ServiceProductsType) {
    const date = new Date()
    this._id = serviceProducts._id
    this.service_id = serviceProducts.service_id
    this.product_id = serviceProducts.product_id
    this.created_at = serviceProducts.created_at || date
    this.updated_at = serviceProducts.updated_at || date
  }
}
