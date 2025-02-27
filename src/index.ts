import cors from 'cors'
import { config } from 'dotenv'
import express, { ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { defaultErrorHandler } from '~/middlewares/error.middleware'
import accountsRouter from '~/routes/accounts.routes'
import resourcesRouter from '~/routes/resources.routes'
import rolesRouter from '~/routes/roles.routes'
import databaseService from '~/services/database.services'
config()
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
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
app.use('/accounts', accountsRouter)
app.use('/resources', resourcesRouter)
app.use('/roles', rolesRouter)
app.use(defaultErrorHandler as ErrorRequestHandler)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`)
})
