import { z } from "zod";

export const createPaymentIntentSchema = z.object({
    userId: z.string(),
    orderIds: z.uuidv7().array(),
    amount: z.number().int().positive(),
    currency: z.string(),
    paymentMethodId: z.string(),
})

export type createPaymentIntentSchema = z.infer<typeof createPaymentIntentSchema>