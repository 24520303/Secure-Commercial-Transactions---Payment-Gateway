

import { prisma } from "../config/prisma";

export const createOrder = async ( checkoutSessionsId: string ) => {
    const checkoutSession = await prisma.checkout_sessions.findFirst({
        where: {
            id: checkoutSessionsId,
            status: 'paid'
        },

        select: {
            buyer_id: true,
            sellerBreakdowns: true
        }
    })

    if (!checkoutSession) {
        throw new Error ('Checkout session không hợp lệ.')
    }

    const sellerBreakdowns = checkoutSession.sellerBreakdowns as Record<string, {
        orderItem: { productId: string, quantity: number }[]
        totalAmount: number
        currency: string
        stripeAccountId: string
    }>

    // Tạo orders và order_items cho từng seller trong một transaction
    await prisma.$transaction(async (tx) => {
        for (const sellerId of Object.keys(sellerBreakdowns)) {
            const sb = sellerBreakdowns[sellerId]

            const order = await tx.orders.create({
                data: {
                    buyer_id: checkoutSession.buyer_id,
                    seller_id: sellerId,
                    total_amount: Math.floor(Number(sb.totalAmount)),
                    currency: sb.currency
                },

                select: { id: true }
            })

            // Tạo order_items
            for (const item of sb.orderItem) {
                await tx.order_items.create({
                    data: {
                        product_id: item.productId,
                        order_id: order.id,
                        quantity: item.quantity
                    }
                })
            }

            // Liên kết order với checkout session
            await tx.checkout_sessions_orders.create({
                data: {
                    checkout_session_id: checkoutSessionsId,
                    order_id: order.id
                }
            })
        }
    })

    return true
}