

import { prisma } from "../config/prisma"
import { createCheckoutSessionSchema, createPaymentIntentSchema } from "../schemas/checkoutSchema"

const createCartSnapshot = async (
    orderItems: createPaymentIntentSchema
) => {
    // Kiểm tra dữ liệu 
    const cartSnapshot = await prisma.$transaction(async (tx) => {
        let totalAmount = 0
        // Từng order item ứng với seller
        let sellerBreakdowns: {
            [sellerId: string]: {
                orderItem: {
                    productId: string,
                    quantity: number,
                }[],
                totalAmount: number,
                currency: string,
                stripeAccountId: string
            }
        } = {}

        for ( const orderItem of orderItems ) {
            // Kiểm tra sản phẩm còn tồn tại?
            const updatedProduct = await tx.products.update({
                where: {
                    id: orderItem.productId,
                    stock_quantity: { gte: orderItem.quantity }
                },

                data: {
                    // Trừ số hàng
                    stock_quantity: { decrement: orderItem.quantity }, 
                    updated_at: new Date()
                },

                select: {
                    seller_id: true,
                    price: true,
                    currency: true,
                    seller: {
                        select: {
                            stripe_account_id: true
                        }
                    }
                }
            })

            if (!updatedProduct) {
                throw new Error(`Sản phẩm ${orderItem.productId} không tồn tại hoặc không đủ hàng.`);
            }

            const amount = updatedProduct.price * orderItem.quantity
            totalAmount += amount

            // Cập nhật thông tin sellerOrders
            const sellerId = updatedProduct.seller_id
            if (!sellerBreakdowns[sellerId]) {
                sellerBreakdowns[sellerId] = { 
                    orderItem: [], 
                    totalAmount: 0, 
                    currency: 'vnd',
                    stripeAccountId: updatedProduct.seller.stripe_account_id
                }
            }
            sellerBreakdowns[sellerId].orderItem.push({
                productId: orderItem.productId,
                quantity: orderItem.quantity
            })
            sellerBreakdowns[sellerId].totalAmount += amount
        }

        return {
            sellerBreakdowns,
            totalAmount
        }
    })

    return cartSnapshot
}

export const createCheckoutSeesion = async (
    buyerId: string,
    orderItems: {
        productId: string,
        quantity: number
    }[]
) => {   
    const cartSnapshot = await createCartSnapshot(orderItems)

    const checkoutSession = await prisma.checkout_sessions.create({
        data: {
            buyer_id: buyerId,
            total_amount: cartSnapshot.totalAmount,
            currency: 'vnd',
            status: 'pending',
            sellerBreakdowns: cartSnapshot.sellerBreakdowns,
            expires_at: new Date() + '15m'
        },

        select: {
            id: true
        }
    })

    if (!checkoutSession) {
        throw new Error ('Tạo Checkout sesion thất bại.')
    }

    return checkoutSession.id
}

export const callCreatePaymentIntent = async (checkoutSessionId: string) => {
    const checkoutSession = await prisma.checkout_sessions.findFirst({
        where: {id: checkoutSessionId}
    })

    if (!checkoutSession) {
        throw new Error ('Không tìm thấy Checkout sesion.')
    }

    // Build sellerBreakdowns to match payment service schema:
    // [{ stripeAccountId: string, amount: number }, ...]
    const sellerBreakdownsForPayment = Object.values(checkoutSession.sellerBreakdowns || {}).map((s: any) => ({
        stripeAccountId: s.stripeAccountId,
        amount: Math.floor(Number(s.totalAmount))
    }))

    const data = {
        userId: checkoutSession.buyer_id,
        checkoutSessionId: checkoutSession.id,
        amount: Math.floor(Number(checkoutSession.total_amount)),
        currency: checkoutSession.currency,
        sellerBreakdowns: sellerBreakdownsForPayment
    }

    // Gọi sang payment service
    const response = await fetch(`${process.env.PAYMENT_SERVICE_URL}/api/payment/payment-intent`, {
        method: 'POST',
        headers: {
            'Content-Type':  'application/json',
        },
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        const error = await response.json()
        console.log(error.message)
        throw new Error ('Gọi API tạo Payment intent thất bại!')
    }

    return response.json()
}

export const updateCheckoutSessionStatus = async (checkouSessionId: string, status: string) => {
    const updatedCheckoutSession = await prisma.checkout_sessions.update({
        where: {
            id: checkouSessionId,
            status: {not: 'paid'}
        },
        
        data: {
            status: (status || 'canceled') as any
        },

        select: {
            id: true
        }
    })

    if (!updatedCheckoutSession) {
        throw new Error ('Không thấy Checkout sesion')
    }
}