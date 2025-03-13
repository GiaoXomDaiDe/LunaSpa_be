import { config } from 'dotenv'
import { Collection, Db, MongoClient } from 'mongodb'
import { envConfig } from '~/constants/config'
import Account from '~/models/schema/Account.schema'
import RefreshToken from '~/models/schema/RefreshToken.schema'
import Resource from '~/models/schema/Resource.schema'
import Roles from '~/models/schema/Role.schema'

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
}

const databaseService = new DatabaseService()
export default databaseService
