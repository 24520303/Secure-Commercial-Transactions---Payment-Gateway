import { z } from "zod";

export const createPaymentIntentSchema = z.object({
    userId: z.string(),
    checkoutSessionId: z.string(),
    amount: z.number().int().positive(),
    currency: z.string(),
    sellerBreakdowns: z.object({
        stripeAccountId: z.string(),
        amount: z.number().int().positive(),
    }).array()
})

export type createPaymentIntentSchema = z.infer<typeof createPaymentIntentSchema>