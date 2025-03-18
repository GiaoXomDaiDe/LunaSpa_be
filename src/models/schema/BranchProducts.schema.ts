import { ObjectId } from 'mongodb'

export enum BranchProductsStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  PENDING = 2
}

export interface BranchProductsType {
  _id?: ObjectId
  branch_id: ObjectId
  product_id: ObjectId
  status: BranchProductsStatus
  override_price?: number
  created_at?: Date
  updated_at?: Date
}

export default class BranchProducts {
  _id?: ObjectId
  branch_id: ObjectId
  product_id: ObjectId
  status: BranchProductsStatus
  override_price?: number
  created_at: Date
  updated_at: Date

  constructor(branchProducts: BranchProductsType) {
    const date = new Date()
    this._id = branchProducts._id
    this.branch_id = branchProducts.branch_id
    this.product_id = branchProducts.product_id
    this.status = branchProducts.status || BranchProductsStatus.ACTIVE
    this.override_price = branchProducts.override_price
    this.created_at = branchProducts.created_at || date
    this.updated_at = branchProducts.updated_at || date
  }
}
