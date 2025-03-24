import cors from 'cors'
import express, { ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import qs from 'qs'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { envConfig } from '~/constants/config'
import { defaultErrorHandler } from '~/middlewares/error.middleware'
import accountsRouter from '~/routes/accounts.routes'
import branchProductsRouter from '~/routes/branchProducts.routes'
import branchServicesRouter from '~/routes/branchServices.routes'
import branchesRouter from '~/routes/branches.routes'
import conditionProductsRouter from '~/routes/conditionProducts.routes'
import conditionServicesRouter from '~/routes/conditionServices.routes'
import conditionsRouter from '~/routes/conditions.routes'
import devicesRouter from '~/routes/devices.routes'
import favoritesRouter from '~/routes/favorites.routes'
import mediasRouter from '~/routes/media.routes'
import productCategoriesRouter from '~/routes/productCategories.routes'
import productsRouter from '~/routes/products.routes'
import resourcesRouter from '~/routes/resources.routes'
import reviewsRouter from '~/routes/reviews.routes'
import rolesRouter from '~/routes/roles.routes'
import serviceCategoriesRouter from '~/routes/serviceCategories.routes'
import serviceProductsRouter from '~/routes/serviceProducts.routes'
import servicesRouter from '~/routes/services.routes'
import staffProfilesRouter from '~/routes/staffProfiles.routes'
import staticRouter from '~/routes/static.routes'
import userProfilesRouter from '~/routes/userProfiles.routes'
import databaseService from '~/services/database.services'
import { initUploadFolder } from '~/utils/file'
import ordersRouter from './routes/orders.routes'
import rewardPointsRouter from './routes/rewardPoints.routes'
import specialtiesRouter from './routes/specialties.routes'
import staffSlotsRouter from './routes/staff-slots.routes'
import webhookRouter from './routes/webhook.routes'
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
app.use('/products', productsRouter)
app.use('/branches', branchesRouter)
app.use('/branch-services', branchServicesRouter)
app.use('/branch-products', branchProductsRouter)
app.use('/staff-slots', staffSlotsRouter)
app.use('/staff-profiles', staffProfilesRouter)
app.use('/devices', devicesRouter)
app.use('/conditions', conditionsRouter)
app.use('/user-profiles', userProfilesRouter)
app.use('/product-categories', productCategoriesRouter)
app.use('/service-categories', serviceCategoriesRouter)
app.use('/favorites', favoritesRouter)
app.use('/reviews', reviewsRouter)
app.use('/service-products', serviceProductsRouter)
app.use('/reward-points', rewardPointsRouter)
app.use('/specialties', specialtiesRouter)
app.use('/condition-products', conditionProductsRouter)
app.use('/condition-services', conditionServicesRouter)
app.use('/orders', ordersRouter)
app.use('/webhooks', webhookRouter)
app.use(defaultErrorHandler as ErrorRequestHandler)
// app.use('/static', express.static(UPLOAD_DIR))
app.use('/static', staticRouter)
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${envConfig.port}`)
})
