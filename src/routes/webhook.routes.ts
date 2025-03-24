import { Router } from 'express'
import webhookController from '~/controllers/webhook.controller'
import { rawBodyMiddleware } from '~/middlewares/webhook.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const webhookRouter = Router()

// Middleware đặc biệt để lấy raw body cho Stripe webhook
webhookRouter.post('/stripe', rawBodyMiddleware, wrapRequestHandler(webhookController.handleStripeWebhook))

// Route xử lý webhook từ MoMo
webhookRouter.post('/momo', wrapRequestHandler(webhookController.handleMomoWebhook))

export default webhookRouter
