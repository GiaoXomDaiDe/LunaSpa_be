import cors from 'cors'
import express, { ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { envConfig } from '~/constants/config'
import { defaultErrorHandler } from '~/middlewares/error.middleware'
import accountsRouter from '~/routes/accounts.routes'
import bookingsRouter from '~/routes/bookings.routes'
import branchesRouter from '~/routes/branches.routes'
import mediasRouter from '~/routes/media.routes'
import resourcesRouter from '~/routes/resources.routes'
import rolesRouter from '~/routes/roles.routes'
import servicesRouter from '~/routes/services.routes'
import staffSlotsRouter from '~/routes/staff-slots.routes'
import staffRouter from '~/routes/staff.routes'
import staticRouter from '~/routes/static.routes'
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
app.use('/branches', branchesRouter)
app.use('/staff', staffRouter)
app.use('/staff-slots', staffSlotsRouter)
app.use('/bookings', bookingsRouter)
app.use(defaultErrorHandler as ErrorRequestHandler)
// app.use('/static', express.static(UPLOAD_DIR))
app.use('/static', staticRouter)
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${envConfig.port}`)
})
