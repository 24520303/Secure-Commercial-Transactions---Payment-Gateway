import {Request, Response} from "express";
import * as healthService from "../services/health.service";


export const healthCheck = async (req: Request, res: Response) => {
    const status = await healthService.healthCheck()
    return res.status(status == 'ok' ? 200 : 503).json({
        status: status
    })
}