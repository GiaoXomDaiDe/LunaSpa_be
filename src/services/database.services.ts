import { config } from 'dotenv'
import { Collection, Db, MongoClient } from 'mongodb'
import { envConfig } from '~/constants/config'
import Account from '~/models/schema/Account.schema'
import Branch from '~/models/schema/Branch.schema'
import BranchProducts from '~/models/schema/BranchProducts.schema'
import BranchServices from '~/models/schema/BranchServices.schema'
import Condition from '~/models/schema/Condition.schema'
import ConditionProduct from '~/models/schema/ConditionProduct.schema'
import ConditionService from '~/models/schema/ConditionService.schema'
import Device from '~/models/schema/Device.schema'
import Favorite from '~/models/schema/Favorite.schema'
import Order from '~/models/schema/Order.schema'
import OrderDetail from '~/models/schema/OrderDetail.schema'
import Product from '~/models/schema/Product.schema'
import ProductCategory from '~/models/schema/ProductCategory.schema'
import RefreshToken from '~/models/schema/RefreshToken.schema'
import Resource from '~/models/schema/Resource.schema'
import Review from '~/models/schema/Review.schema'
import RewardPoint from '~/models/schema/RewardPoint.schema'
import Roles from '~/models/schema/Role.schema'
import Service from '~/models/schema/Service.schema'
import ServiceCategoy from '~/models/schema/ServiceCategory.schema'
import ServiceProducts from '~/models/schema/ServiceProducts.schema'
import Specialty from '~/models/schema/Specialties.schema'
import StaffProfile from '~/models/schema/StaffProfile.schema'
import StaffSlot from '~/models/schema/StaffSlot.schema'
import Transaction from '~/models/schema/Transaction.schema'
import UserProfile from '~/models/schema/UserProfile.schema'
import Voucher from '~/models/schema/Voucher.schema'

config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.jsjbw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
//const uri = `mongodb+srv://GiaoXomDaiDe:hhycgXWalDPaUxDC@cluster0.jsjbw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

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
  get userProfiles(): Collection<UserProfile> {
    return this.db.collection(envConfig.dbUserProfilesCollection)
  }
  get favorites(): Collection<Favorite> {
    return this.db.collection(envConfig.dbFavoritesCollection)
  }
  get branches(): Collection<Branch> {
    return this.db.collection(envConfig.dbBranchesCollection)
  }
  get reviews(): Collection<Review> {
    return this.db.collection(envConfig.dbReviewsCollection)
  }
  get branchServices(): Collection<BranchServices> {
    return this.db.collection(envConfig.dbBranchServicesCollection)
  }
  get branchProducts(): Collection<BranchProducts> {
    return this.db.collection(envConfig.dbBranchProductsCollection)
  }
  get serviceProducts(): Collection<ServiceProducts> {
    return this.db.collection(envConfig.dbServicesProductsCollection)
  }
  get rewardPoints(): Collection<RewardPoint> {
    return this.db.collection(envConfig.dbRewardPointsCollection)
  }
  get vouchers(): Collection<Voucher> {
    return this.db.collection(envConfig.dbVouchersCollection)
  }
  get specialties(): Collection<Specialty> {
    return this.db.collection('specialties')
  }
  get conditionServices(): Collection<ConditionService> {
    return this.db.collection(envConfig.dbConditionServicesCollection)
  }
  get staffProfiles(): Collection<StaffProfile> {
    return this.db.collection(envConfig.dbStaffProfilesCollection)
  }
  get staffSlots(): Collection<StaffSlot> {
    return this.db.collection(envConfig.dbStaffSlotsCollection)
  }
  get orders(): Collection<Order> {
    return this.db.collection(envConfig.dbOrdersCollection)
  }
  get orderDetails(): Collection<OrderDetail> {
    return this.db.collection(envConfig.dbOrderDetailsCollection)
  }
  get transactions(): Collection<Transaction> {
    return this.db.collection(envConfig.dbTransactionsCollection)
  }
}

const databaseService = new DatabaseService()
export default databaseService
