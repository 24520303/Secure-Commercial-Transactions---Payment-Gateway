import { Request, Response } from 'express'

import * as paymentSchema from '../schemas/paymentSchema'
import * as paymentService from '../services/paymentService'

export const createPaymentIntent = async ( req: Request, res: Response ) => {
    try {
        const data = paymentSchema.createPaymentIntentSchema.parse(req.body)
        if (!data) {
            return res.status(400).json({
                message: 'Request body sai định dạng!'
            })
        }

        const paymentIntent = await paymentService.createPaymentIntent(data)

        return res.status(201).json({
            message: 'Tạo Payment intent thành công!',
            clientSecret: paymentIntent.client_secret,
            status: paymentIntent.status
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Lỗi server',
        });
    }
}