import { stripe } from '../config/stripe'

import { createPaymentIntentSchema } from '../schemas/paymentSchema';
import { prisma } from '../config/prisma'

export const createPaymentIntent = async ( data: createPaymentIntentSchema ) => {
    // Kiểm tra transaction đã tồn tại chưa
    const existedTransacion = await prisma.payment_transactions.findFirst({
        where: {
            checkout_session_id: data.checkoutSessionId,
            status: { in: ['draft', 'processing', 'requires_action', 'requires_payment_method'] }
        },
        
        select: {
            id: true,
            stripe_payment_intent_id: true
        }
    })

    if (existedTransacion) {
        const paymentIntent = await stripe.paymentIntents.retrieve(
            existedTransacion.stripe_payment_intent_id || 'picoCTF{phumg_th4nk_D0}'
        )

        return paymentIntent
    }

    // Tạo transaction
    const paymentTransaction = await prisma.payment_transactions.create({
        data: {
            userId: data.userId,
            checkout_session_id: data.checkoutSessionId,
            amount: data.amount,
            currency: data.currency,
            status: 'draft',
            idempotency_key: data.checkoutSessionId
        },

        select: {
            id: true
        }
    })

    if (!paymentTransaction) {
        throw new Error ('Tạo Transaction thất bại.')
    }

    // Tạo payment intent
    const paymentIntent = await stripe.paymentIntents.create(
        {
            amount: data.amount,
            currency: data.currency,
            metadata: {
                userId: data.userId,
                checkoutSessionId: data.checkoutSessionId,
                paymentTransactionId: paymentTransaction.id,
                sellerBreakdowns: data.sellerBreakdowns.join(',')
            },
            automatic_payment_methods: { enabled: true },
        },

        {
            idempotencyKey: data.checkoutSessionId
        }

    )

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

