import { Response } from "express";

import * as checkoutService from '../services/checkoutService'
import * as orderService from '../services/orderService'
import { createCheckoutSessionSchema } from "../schemas/checkoutSchema";
import { AuthRequest } from "../interfaces/requestInterface";

export const createCheckoutSessionAnd = async ( req: AuthRequest, res: Response ) => {
    try {
        const checkoutSessionData = createCheckoutSessionSchema.parse(req.body)
        const buyerId = req.user.id
        const checkoutSessionId = await checkoutService.createCheckoutSeesion(buyerId, checkoutSessionData)

        await checkoutService.callCreatePaymentIntent(checkoutSessionId)

        return res.status(201).json({
            message: 'Tạo Checkout session thành công!'
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Lỗi server.'
        })
    }
}

export const handlePaymentCall = async ( req: AuthRequest, res: Response ) => {
    try {
        

    } catch (error) {
        
    }
}