import 'express'
import { TokenPayload } from '~/models/request/Account.requests'
import Account from '~/models/schema/Account.schema'
import Branch from '~/models/schema/Branch.schema'
import BranchServices from '~/models/schema/BranchServices.schema'
import Device from '~/models/schema/Device.schema'
import { ItemType } from '~/models/schema/Favorite.schema'
import Product from '~/models/schema/Product.schema'
import ProductCategory from '~/models/schema/ProductCategory.schema'
import Resource from '~/models/schema/Resource.schema'
import Roles from '~/models/schema/Role.schema'
import Service from '~/models/schema/Service.schema'
import ServiceProducts from '~/models/schema/ServiceProducts.schema'
import ServiceCategoy from './models/schema/ServiceCategory.schema'

declare module 'express' {
  interface Request {
    account?: Account
    decoded_authorization?: TokenPayload | null
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
    role_name?: string
    resource?: Resource
    role?: Roles
    productCategory?: ProductCategory
    serviceCategory?: ServiceCategoy
    device?: Device
    product?: Product
    service?: Service
    branch?: Branch
    item_type?: ItemType
    branch_service?: BranchServices
    serviceProduct?: ServiceProducts
    rawBody?: string
  }
}
