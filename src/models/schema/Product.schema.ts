import { ObjectId } from 'mongodb'

export enum ProductStatus {
  ACTIVE = 1,
  INACTIVE = 0
}

export interface ProductType {
  _id?: ObjectId
  name: string
  description?: string
  category_id: ObjectId
  price: number
  discount_price?: number
  quantity: number
  status?: ProductStatus
  images?: string[]
  created_at?: Date
  updated_at?: Date
}

export default class Product {
  _id?: ObjectId
  name: string
  description: string
  category_id: ObjectId
  price: number
  discount_price: number
  quantity: number
  status: ProductStatus
  images: string[]
  created_at?: Date
  updated_at?: Date

  constructor(product: ProductType) {
    const date = new Date()
    this._id = product._id
    this.name = product.name
    this.description = product.description || ''
    this.category_id = product.category_id
    this.price = product.price
    this.discount_price = product.discount_price || 0
    this.quantity = product.quantity || 0
    this.status = product.status || ProductStatus.ACTIVE
    this.images = product.images || []
    this.created_at = product.created_at || date
    this.updated_at = product.updated_at || date
  }
}
