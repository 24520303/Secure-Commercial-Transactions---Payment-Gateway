import { stripe } from '../config/stripe'

import { createPaymentIntentSchema } from '../schemas/paymentSchema';
import { prisma } from '../config/prisma'

export const createPaymentIntent = async ( data: createPaymentIntentSchema ) => {
    // Tạo transaction
    const paymentTransaction = await prisma.payment_transactions.create({
        data: {
            userId: data.userId,
            amount: data.amount,
            currency: data.currency,
            stripe_payment_method_id: data.paymentMethodId,
            status: 'draft',

        },

        select: {
            id: true
        }
    })

    // Tạo payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        metadata: {
            userId: data.userId,
            paymentTransactionId: paymentTransaction.id,
            orderIds: data.orderIds.join(',')
        },
        automatic_payment_methods: { enabled: true }
    })

    await prisma.payment_transactions.update({
        where: {
            id: paymentTransaction.id
        },

        data: {            
            stripe_payment_intent_id: paymentIntent.id,
            status: 'requires_payment_method',
        }
    })
    
    return paymentIntent;
}

