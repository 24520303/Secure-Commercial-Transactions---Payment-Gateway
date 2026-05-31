"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const prisma_1 = require("../config/prisma");
const pkcs11_service_1 = require("./pkcs11/pkcs11.service");
const healthCheck = async () => {
    const hsm = (0, pkcs11_service_1.pkcs11Status)();
    let dbOk = false;
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
    }
    catch (error) {
    }
    const status = hsm.ok && dbOk ? "ok" : "degraded";
    return status;
};
exports.healthCheck = healthCheck;
