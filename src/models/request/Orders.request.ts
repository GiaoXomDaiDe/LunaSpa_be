import { ParamsDictionary, Query } from 'express-serve-static-core'
import { OrderStatus, PaymentMethod } from '../schema/Order.schema'
import { ItemType } from '../schema/OrderDetail.schema'
import { Pagination } from './Pagination'

export interface OrderParams extends ParamsDictionary {
  order_id: string
}

export interface OrdersQuery extends Pagination, Query {
  customer_id?: string
  branch_id?: string
  status?: OrderStatus
  start_date?: string
  end_date?: string
}

export interface GetAllOrdersOptions {
  limit?: number
  page?: number
  customer_id?: string
  branch_id?: string
  status?: OrderStatus
  start_date?: Date
  end_date?: Date
}

export interface OrderItemReqBody {
  item_type: ItemType
  item_id: string
  item_name: string
  price: number
  discount_price: number
  quantity: number
  slot_id?: string
  staff_profile_id?: string
  start_time?: string // ISO string
  end_time?: string // ISO string
  note?: string
}

export interface ProductItem {
  item_id: string
  quantity: number
  item_type: ItemType
}

export interface CreateProductOrderReqBody {
  branch_id: string
  items: ProductItem[]
  payment_method?: PaymentMethod
  note?: string
}

export interface ServiceItem {
  item_id: string // service_id
  quantity: number
  note?: string
  item_type: ItemType
  slot_id?: string
}

export interface BookServiceReqBody {
  branch_id: string
  items: ServiceItem[]
  booking_time: string // YYYY-MM-DD HH:mm
  payment_method?: PaymentMethod
  note?: string
  voucher_code?: string
  staff_profile_id?: string
  start_time?: string // ISO string
  end_time?: string // ISO string
}

export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
}

export interface CancelOrderReqBody {
  cancel_reason: string
}

export interface RatingReqBody {
  rating: number // 1-5
  comment?: string
  item_type: ItemType
  item_ids: string[] // ID của sản phẩm hoặc dịch vụ được đánh giá
}

export interface ProcessPaymentReqBody {
  payment_method: PaymentMethod
  payment_data?: Record<string, any> // Dữ liệu bổ sung tùy thuộc vào phương thức thanh toán
}

export interface StripeWebhookBody {
  id: string
  object: string
  data: {
    object: Record<string, any>
  }
  type: string
}
