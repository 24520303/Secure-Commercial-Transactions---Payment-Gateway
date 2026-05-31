import { Request, Response } from "express";
import { listKeys as listPkcs11Keys } from "../services/pkcs11/key-manager";
import * as pkcs11Wrapper from "../services/pkcs11/wrapper";
import { prisma } from "../config/prisma";

export const listkeys = async (req: Request, res: Response) => {
    try {
        const [dbKeys, hsmObjects] = await Promise.all([
            prisma.keys.findMany({ where: { status: "active" } }),
            listPkcs11Keys(),
        ]);

        return res.status(200).json({
            key: dbKeys,
            hsmObjects
        })

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            message: 'Lỗi server',
        })
    }
}

export const wrapKey =  async (req: Request, res: Response) => {
    try {
        const { targetLabel, kekLabel = "kek" } = req.body;
        const wrapped = pkcs11Wrapper.wrapKey(targetLabel, kekLabel);

        return res.status(200).json({
            wrappedKey: wrapped.toString("base64")
        })

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            message: 'Lỗi server',
        })
    }
}

export const unwrapKey = async (req: Request, res: Response) => {
    try {
        const { wrappedKey, kekLabel = "kek", newLabel } = req.body;
        pkcs11Wrapper.unwrapKey(Buffer.from(wrappedKey, "base64"), kekLabel, newLabel);

        return res.status(200).json({
            ok: true,
            label: newLabel
        })
        
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            message: 'Lỗi server'
        })
    }
}

export const rotateKey = async (req: Request, res: Response) => {
    try {
        const { label } = req.params;
        const labelString = String(label)
        // const actor = (req.user as { sub: string }).sub;

        const key = await prisma.keys.findUniqueOrThrow({
            where: {
                label: labelString
            }
        });

        await prisma.$transaction([
            prisma.keys.update({
                where: { label: labelString },
                data:  { version: { increment: 1 } },
            }),
            prisma.key_rotations.create({
                data: {
                    key_id:      key.id,
                    old_version: key.version,
                    new_version: key.version + 1,
                    reason:     "manual",
                },
            }),
        ]);

        return res.status(200).json({
            ok: true,
            label,
            newVersion: key.version + 1
        })

    } catch (error) {
        console.error(error)
        
        return res.status(500).json({
            message: 'Lỗi server'
        })
    }
}