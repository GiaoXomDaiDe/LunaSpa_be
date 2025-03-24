import { ObjectId } from 'mongodb'

export enum ServiceProductStatus {
  INACTIVE = 0,
  ACTIVE = 1
}

export interface ServiceProductsType {
  _id?: ObjectId
  service_id: ObjectId
  product_id: ObjectId
  status?: number
  recommended?: boolean
  discount_percent?: number
  usage_instruction?: string
  created_at?: Date
  updated_at?: Date
}

export default class ServiceProducts {
  _id?: ObjectId
  service_id: ObjectId
  product_id: ObjectId
  status: number
  recommended: boolean
  discount_percent: number
  usage_instruction: string
  created_at: Date
  updated_at?: Date

  constructor(serviceProduct: ServiceProductsType) {
    const date = new Date()
    this._id = serviceProduct._id
    this.service_id = serviceProduct.service_id
    this.product_id = serviceProduct.product_id
    this.status = serviceProduct.status ?? ServiceProductStatus.ACTIVE
    this.recommended = serviceProduct.recommended ?? false
    this.discount_percent = serviceProduct.discount_percent ?? 0
    this.usage_instruction = serviceProduct.usage_instruction ?? ''
    this.created_at = serviceProduct.created_at || date
    this.updated_at = serviceProduct.updated_at || date
  }
}
