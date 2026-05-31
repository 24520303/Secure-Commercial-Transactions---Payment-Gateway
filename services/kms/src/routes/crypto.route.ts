import { Router } from "express";
import * as cryptoControler from '../controllers/crypto.controller'

const router = Router()

router.post('/encrypt', cryptoControler.encrypt)
router.post('/decrypt', cryptoControler.decrypt)

export default router