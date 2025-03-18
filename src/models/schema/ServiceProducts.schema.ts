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
  updated_at?: Date

  constructor(serviceProduct: ServiceProductsType) {
    const date = new Date()
    this._id = serviceProduct._id
    this.service_id = serviceProduct.service_id
    this.product_id = serviceProduct.product_id
    this.created_at = serviceProduct.created_at || date
    this.updated_at = serviceProduct.updated_at || date
  }
}
