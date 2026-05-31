import { prisma } from "../config/prisma";
import { pkcs11Status } from "./pkcs11/pkcs11.service";

export const healthCheck = async () => {
    const hsm = pkcs11Status();
    console.log(hsm)

    let dbOk = false;

    try {
        await prisma.$queryRaw`SELECT 1`;
        dbOk = true
    } catch (error) {
        
    }

    const status = hsm.ok && dbOk ? "ok" : "degraded";
    return status
}