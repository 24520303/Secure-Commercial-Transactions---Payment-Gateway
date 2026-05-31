import { Request, Response } from "express";
import { signEcdsa, verifyEcdsa } from "../services/pkcs11/signer";

const KEY_LABELS = {
  receipt:    "receipt-signing-key",
  settlement: "settlement-signing-key",
} as const;

export const signReceipt = async (req: Request, res: Response) => {
    try {
        const data      = Buffer.from(req.body.payload, "base64");
        const signature = signEcdsa(KEY_LABELS.receipt, data);

        return res.status(200).json({
            signature: signature.toString("base64"),
            keyLabel: KEY_LABELS.receipt
        })

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            message: 'Lỗi server'
        })
    }
}

export const signSettlement = async (req: Request, res: Response) => {
    try {
        const data      = Buffer.from(req.body.payload, "base64");
        const signature = signEcdsa(KEY_LABELS.settlement, data);

        return res.status(200).json({
            signature: signature.toString("base64"),
            keyLabel: KEY_LABELS.settlement
        })

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            message: 'Lỗi server'
        })
    }
}

export const verify = async (req: Request, res: Response) => {
    try {
        const data    = Buffer.from(req.body.payload,   "base64");
        const sig     = Buffer.from(req.body.signature, "base64");
        const valid   = verifyEcdsa(req.body.keyLabel, data, sig);

        return res.status(200).json({
            valid: valid
        })

    } catch (error) {
        console.error(error)
        
        return res.status(500).json({
            message: 'Lỗi server'
        })
    }
}