import { ObjectId } from 'mongodb'

export enum UnitType {
  CURRENCY = 'currency',
  WEIGHT = 'weight',
  VOLUME = 'volume',
  LENGTH = 'length'
}

export interface UnitData {
  _id?: ObjectId
  name: string
  code: string
  symbol: string
  type: UnitType
  exchange_rate?: number // Tỷ giá quy đổi so với đơn vị cơ sở (VND với tiền tệ, kg với khối lượng,...)
  is_base?: boolean // Đơn vị cơ sở hay không
  created_at?: Date
  updated_at?: Date
}

export default class Unit {
  _id?: ObjectId
  name: string
  code: string
  symbol: string
  type: UnitType
  exchange_rate: number
  is_base: boolean
  created_at: Date
  updated_at: Date

  constructor(unit: UnitData) {
    const date = new Date()
    this._id = unit._id
    this.name = unit.name
    this.code = unit.code
    this.symbol = unit.symbol
    this.type = unit.type
    this.exchange_rate = unit.exchange_rate || 1
    this.is_base = unit.is_base || false
    this.created_at = unit.created_at || date
    this.updated_at = unit.updated_at || date
  }
}
