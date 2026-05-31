import { Request, Response } from "express";
import { encryptAesGcm, decryptAesGcm } from "../services/pkcs11/crypto-engine";

export const encrypt = async (req: Request, res: Response) => {
    try {
        const pt = Buffer.from(req.body.plaintext, "base64");
        const { ciphertext, iv, tag } = encryptAesGcm(req.body.keyLabel, pt);

        return res.status(200).json({
            ciphertext: ciphertext.toString("base64"),
            iv: iv.toString("base64"),
            tag: tag.toString("base64"),
        })

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            message: 'Lỗi server'
        })
    }
}

export const decrypt = async (req: Request, res: Response) => {
    try {
        const plain = decryptAesGcm(
            req.body.keyLabel,
            Buffer.from(req.body.ciphertext, "base64"),
            Buffer.from(req.body.iv,         "base64"),
            Buffer.from(req.body.tag,        "base64"),
        );

        return res.status(200).json({
            plaintext: plain.toString("base64")
        })
        
    } catch (error) {
        console.error(error)
        
        return res.status(500).json({
            message: 'Lỗi server'
        })
    }
}