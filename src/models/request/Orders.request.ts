import { ParamsDictionary, Query } from 'express-serve-static-core'
import { OrderStatus, PaymentMethod } from '../schema/Order.schema'
import { ItemType } from '../schema/OrderDetail.schema'
import { Pagination } from './Pagination'

export interface OrderParams extends ParamsDictionary {
  order_id: string
}

export interface CustomerParams extends ParamsDictionary {
  customer_id: string
}

export interface OrdersQuery extends Pagination, Query {
  customer_id?: string
  branch_id?: string
  status?: OrderStatus
  start_date?: string
  end_date?: string
  order_id?: string
}

export interface GetAllOrdersOptions {
  limit?: number
  page?: number
  customer_id?: string
  branch_id?: string
  status?: OrderStatus
  start_date?: Date
  end_date?: Date
  order_id?: string
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
  product_items: ProductItem[]
  payment_method?: PaymentMethod
  note?: string
  voucher_code?: string
}

export interface ServiceItem {
  item_id: string
  item_type: ItemType
  duration_index: number
  slot_id?: string
  staff_profile_id?: string
  booking_time: string
}

export interface BookServiceReqBody {
  branch_id: string
  service_item: ServiceItem // Thay đổi từ mảng items thành object service_item đơn lẻ
  payment_method?: PaymentMethod
  note?: string
  voucher_code?: string
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
