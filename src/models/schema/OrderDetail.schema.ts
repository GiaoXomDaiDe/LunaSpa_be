import { ObjectId } from 'mongodb'

export enum ItemType {
  PRODUCT = 'product',
  SERVICE = 'service'
}

export interface DurationInfo {
  duration_name?: string
  duration_in_minutes: number
  price: number
  discount_price?: number
  sub_description?: string
}

export interface OrderDetailType {
  _id?: ObjectId
  order_id: ObjectId
  item_type: ItemType
  item_id: ObjectId
  item_name: string
  price: number
  discount_price: number
  quantity: number
  slot_id?: ObjectId
  staff_profile_id?: ObjectId
  start_time?: Date
  end_time?: Date
  note?: string
  duration_info?: DurationInfo
}

export default class OrderDetail {
  _id?: ObjectId
  order_id: ObjectId
  item_type: ItemType
  item_id: ObjectId
  item_name: string
  price: number
  discount_price: number
  quantity: number
  slot_id?: ObjectId
  staff_profile_id?: ObjectId
  start_time?: Date
  end_time?: Date
  note: string
  duration_info?: DurationInfo

  constructor(orderDetail: OrderDetailType) {
    this._id = orderDetail._id
    this.order_id = orderDetail.order_id
    this.item_type = orderDetail.item_type
    this.item_id = orderDetail.item_id
    this.item_name = orderDetail.item_name
    this.price = orderDetail.price
    this.discount_price = orderDetail.discount_price
    this.quantity = orderDetail.quantity
    this.slot_id = orderDetail.slot_id
    this.staff_profile_id = orderDetail.staff_profile_id
    this.start_time = orderDetail.start_time
    this.end_time = orderDetail.end_time
    this.note = orderDetail.note || ''
    this.duration_info = orderDetail.duration_info
  }
}
