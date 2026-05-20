

import { stripe } from "../config/stripe"
import { prisma } from "../config/prisma";

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL!

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
            const updatedTransaction = await prisma.payment_transactions.update({
                where: {
                    stripe_payment_intent_id: paymentIntent.id,
                },

                data: {
                    status: 'succeeded',
                },

                select: {
                    id: true,
                    checkout_session_id: true
                }
            })

            // Gọi Order service để tạo order
            const data = {
                transactionId: updatedTransaction.id,
                checkoutSessionId: updatedTransaction.checkout_session_id
            }

            const response = await fetch(`${PAYMENT_SERVICE_URL}/api/orders/handlePayment`, {
                method: "POST",
                headers: {
                    'Content-Type':  'application/json',
                },
                body: JSON.stringify(data)
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