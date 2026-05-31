"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.signEcdsa = signEcdsa;
exports.verifyEcdsa = verifyEcdsa;
const GraphenePkcs11 = __importStar(require("graphene-pk11"));
const pkcs11_service_1 = require("./pkcs11.service");
const key_manager_1 = require("./key-manager");
function signEcdsa(keyLabel, data) {
    const session = (0, pkcs11_service_1.getSession)();
    const privKey = (0, key_manager_1.findKey)(keyLabel, "private");
    const mechanism = GraphenePkcs11.MechanismEnum.ECDSA_SHA256;
    const sign = session.createSign(mechanism, privKey);
    return Buffer.from(sign.once(data));
}
function verifyEcdsa(keyLabel, data, signature) {
    const session = (0, pkcs11_service_1.getSession)();
    const pubKey = (0, key_manager_1.findKey)(keyLabel, "public");
    const mechanism = GraphenePkcs11.MechanismEnum.ECDSA_SHA256;
    const verify = session.createVerify(mechanism, pubKey);
    return verify.once(data, signature);
}
