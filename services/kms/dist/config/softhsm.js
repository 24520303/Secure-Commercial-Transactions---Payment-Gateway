"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softHsmConfig = void 0;
exports.softHsmConfig = {
    modulePath: process.env.PKCS11_MODULE ?? "/usr/lib/softhsm/libsofthsm2.so",
    tokenLabel: process.env.TOKEN_LABEL ?? "kms-token",
    userPin: process.env.USER_PIN ?? "5678",
};
