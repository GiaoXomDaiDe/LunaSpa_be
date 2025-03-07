import { ObjectId } from 'mongodb'

export interface ProductCategoryType {
  _id?: ObjectId
  name: string
  description: string
  created_at?: Date
  updated_at?: Date
}

export default class ProductCategory {
  _id?: ObjectId
  name: string
  description: string
  created_at: Date
  updated_at: Date

  constructor(productCategory: ProductCategoryType) {
    const date = new Date()
    this._id = productCategory._id
    this.name = productCategory.name
    this.description = productCategory.description
    this.created_at = productCategory.created_at || date
    this.updated_at = productCategory.updated_at || date
  }
}
