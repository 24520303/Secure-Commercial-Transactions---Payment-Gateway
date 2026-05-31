import { Router } from "express";
import * as signingController from '../controllers/signing.controller'

const router = Router()
router.post('/receipt', signingController.signReceipt)
router.post('/settlement', signingController.signSettlement)
router.post('/verify', signingController.verify)

export default router