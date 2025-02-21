import { config } from 'dotenv'
import express, { ErrorRequestHandler } from 'express'
import { defaultErrorHandler } from '~/middlewares/error.middleware'
import databaseService from '~/services/database.services'
config()

databaseService.connect().then(() => {
  console.log('Connected to MongoDB')
})

const app = express()
const port = process.env.PORT || 4000
app.use(express.json())

app.use(defaultErrorHandler as ErrorRequestHandler)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`)
})
