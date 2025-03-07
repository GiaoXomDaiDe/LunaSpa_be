import { ObjectId } from 'mongodb'

export enum BranchServicesStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  PENDING = 2
}

export interface BranchServicesType {
  _id?: ObjectId
  branch_id: ObjectId
  service_id: ObjectId
  status: BranchServicesStatus
  override_price?: number
  created_at?: Date
  updated_at?: Date
}

export default class BranchServices {
  _id?: ObjectId
  branch_id: ObjectId
  service_id: ObjectId
  status: BranchServicesStatus
  override_price?: number
  created_at: Date
  updated_at: Date

  constructor(branchServices: BranchServicesType) {
    const date = new Date()
    this._id = branchServices._id
    this.branch_id = branchServices.branch_id
    this.service_id = branchServices.service_id
    this.status = branchServices.status || BranchServicesStatus.ACTIVE
    this.override_price = branchServices.override_price
    this.created_at = branchServices.created_at || date
    this.updated_at = branchServices.updated_at || date
  }
}
