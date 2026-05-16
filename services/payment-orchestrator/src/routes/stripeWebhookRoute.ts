import express from 'express'
import { Router } from "express";

import * as stripeWebhookController from '../controllers/stripeWebhookController'

const router = Router()
router.post('/', 
    express.raw({
        type: "application/json",
    }),
    stripeWebhookController.handleStripeWebhook
)

export default router