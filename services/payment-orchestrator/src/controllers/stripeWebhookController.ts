import { Request, Response } from 'express'
import Stripe from 'stripe'

import * as stripeWebhookService from '../services/stripeWebhookService'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'Mì tôm, bò khô, radio'

export const handleStripeWebhook = async ( req: Request, res: Response ) => {
    try {
        const signature = req.headers["stripe-signature"] as string;
        if (!signature) {
            return res.status(400).json({
                message: 'Không có signature'
            })
        }

        const event = stripeWebhookService.constructEvent(
            req.body, 
            signature,
            endpointSecret
        )

        await stripeWebhookService.handleStripeWebhook(event)

        return res.json({
            received: true
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server'
        })
    }
}