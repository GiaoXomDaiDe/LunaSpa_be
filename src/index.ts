import cors from 'cors'
import express, { ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import qs from 'qs'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { envConfig } from '~/constants/config'
import { defaultErrorHandler } from '~/middlewares/error.middleware'
import accountsRouter from '~/routes/accounts.routes'
import bookingsRouter from '~/routes/bookings.routes'
import branchesRouter from '~/routes/branches.routes'
import conditionsRouter from '~/routes/conditions.routes'
import devicesRouter from '~/routes/devices.routes'
import mediasRouter from '~/routes/media.routes'
import productCategoriesRouter from '~/routes/productCategories.routes'
import productsRouter from '~/routes/products.routes'
import resourcesRouter from '~/routes/resources.routes'
import rolesRouter from '~/routes/roles.routes'
import serviceCategoriesRouter from '~/routes/serviceCategories.routes'
import servicesRouter from '~/routes/services.routes'
import servicesProductRouter from '~/routes/servicesProducts.routes'
import staffSlotsRouter from '~/routes/staff-slots.routes'
import staffRouter from '~/routes/staff.routes'
import staticRouter from '~/routes/static.routes'
import userProfilesRouter from '~/routes/userProfiles.routes'
import databaseService from '~/services/database.services'
import { initUploadFolder } from '~/utils/file'

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LunaSpa',
      version: '1.0.0'
    }
  },
  apis: ['./openapi/*.yaml'] // files containing annotations as above
}
const openapiSpecification = swaggerJSDoc(options)
databaseService.connect().then(() => {
  console.log('Connected to MongoDB')
})

const app = express()
const port = process.env.PORT || 4000
app.set('query parser', (queryString: string) =>
  qs.parse(queryString, {
    // Bạn có thể tùy chỉnh options của qs ở đây
    arrayLimit: 1000
  })
)
// Tạo folder upload
initUploadFolder()
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
app.use('/accounts', accountsRouter)
app.use('/resources', resourcesRouter)
app.use('/roles', rolesRouter)
app.use('/medias', mediasRouter)
app.use('/services', servicesRouter)
app.use('/services', servicesProductRouter)
app.use('/products', productsRouter)
app.use('/branches', branchesRouter)
app.use('/staff', staffRouter)
app.use('/staff-slots', staffSlotsRouter)
app.use('/bookings', bookingsRouter)
app.use('/devices', devicesRouter)
app.use('/conditions', conditionsRouter)
app.use('/user-profiles', userProfilesRouter)
app.use('/product-categories', productCategoriesRouter)
app.use('/service-categories', serviceCategoriesRouter)
app.use(defaultErrorHandler as ErrorRequestHandler)
// app.use('/static', express.static(UPLOAD_DIR))
app.use('/static', staticRouter)
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${envConfig.port}`)
})
