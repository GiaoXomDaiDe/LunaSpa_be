import { config } from 'dotenv'
import { Collection, Db, MongoClient } from 'mongodb'
import { envConfig } from '~/constants/config'
import Account from '~/models/schema/Account.schema'
import Condition from '~/models/schema/Condition.schema'
import ConditionProduct from '~/models/schema/ConditionProduct.schema'
import Device from '~/models/schema/Device.schema'
import Product from '~/models/schema/Product.schema'
import ProductCategory from '~/models/schema/ProductCategory.schema'
import RefreshToken from '~/models/schema/RefreshToken.schema'
import Resource from '~/models/schema/Resource.schema'
import Roles from '~/models/schema/Role.schema'
import Service from '~/models/schema/Service.schema'
import ServiceCategoy from '~/models/schema/ServiceCategory.schema'
import ServiceProducts from '~/models/schema/ServiceProducts.schema'

config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.jsjbw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  getClient() {
    return this.client
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error connecting to MongoDB:', error)
      throw error
    }
  }
  get accounts(): Collection<Account> {
    return this.db.collection(envConfig.dbAccountsCollection)
  }
  get resources(): Collection<Resource> {
    return this.db.collection(envConfig.dbResourcesCollection)
  }
  get roles(): Collection<Roles> {
    return this.db.collection(envConfig.dbRolesCollection)
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokensCollection)
  }
  get productCategories(): Collection<ProductCategory> {
    return this.db.collection(envConfig.dbProductCategoriesCollection)
  }
  get serviceCategories(): Collection<ServiceCategoy> {
    return this.db.collection(envConfig.dbServiceCategoriesCollection)
  }
  get devices(): Collection<Device> {
    return this.db.collection(envConfig.dbDevicesCollection)
  }
  get products(): Collection<Product> {
    return this.db.collection(envConfig.dbProductsCollection)
  }
  get services(): Collection<Service> {
    return this.db.collection(envConfig.dbServicesCollection)
  }
  get servicesProducts(): Collection<ServiceProducts> {
    return this.db.collection(envConfig.dbServicesProductsCollection)
  }
  get conditions(): Collection<Condition> {
    return this.db.collection(envConfig.dbConditionsCollection)
  }
  get conditionProducts(): Collection<ConditionProduct> {
    return this.db.collection(envConfig.dbConditionProductsCollection)
  }
}

const databaseService = new DatabaseService()
export default databaseService
