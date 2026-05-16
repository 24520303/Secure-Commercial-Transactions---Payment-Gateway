

import { stripe } from "../config/stripe"
import { prisma } from "../config/prisma";

export const constructEvent = (
    payload: Buffer, 
    signature: string, 
    endpointSecret: string
) => {
  return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
};

/**
 * Định nghĩa kiểu dữ liệu cho Stripe webhook event
 */
type StripeEvent = ReturnType<typeof constructEvent>;

/**
 * Xử lý Stripe webhook
 */
export const handleStripeWebhook = async (event: StripeEvent) => {
    switch(event.type) {
        
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;

            // Cập nhật transaction
            await prisma.payment_transactions.update({
                where: {
                    stripe_payment_intent_id: paymentIntent.id,
                },

                data: {
                    status: 'succeeded',
                }
            })

            break
        }            

        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object;

            // Cập nhật transaction
            await prisma.payment_transactions.update({
                where: {
                    stripe_payment_intent_id: paymentIntent.id,
                },

                data: {
                    status: 'failed',
                }
            })

            break
        }
            
        default: {
            console.log(event.type)
        }
    }
}