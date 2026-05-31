import { Router } from "express";
import * as keyControler from '../controllers/key.controller'

const router = Router()
router.get('/', keyControler.listkeys)
router.post('/wrap', keyControler.wrapKey)
router.post('/unwrap', keyControler.unwrapKey)
router.post('/:label/rotate', keyControler.rotateKey)

export default router