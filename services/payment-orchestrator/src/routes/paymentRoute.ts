import { Router } from 'express'

import * as paymentController from '../controllers/paymentController'

const router = Router()
router.post('/payment-intent', paymentController.createPaymentIntent)

export default router