import { z } from 'zod'

export const createCheckoutSessionSchema = z.object({
    productId: z.uuidv7(),
    quantity: z.number().int().positive()
}).array()

export type createPaymentIntentSchema = z.infer<typeof createCheckoutSessionSchema>