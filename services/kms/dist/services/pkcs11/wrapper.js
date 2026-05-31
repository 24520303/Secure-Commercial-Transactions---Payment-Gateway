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
exports.wrapKey = wrapKey;
exports.unwrapKey = unwrapKey;
const GraphenePkcs11 = __importStar(require("graphene-pk11"));
const pkcs11_service_1 = require("./pkcs11.service");
const key_manager_1 = require("./key-manager");
function wrapKey(targetLabel, kekLabel) {
    const session = (0, pkcs11_service_1.getSession)();
    const kek = (0, key_manager_1.findKey)(kekLabel, "secret");
    const targetKey = (0, key_manager_1.findKey)(targetLabel, "secret");
    const mechanism = GraphenePkcs11.MechanismEnum.AES_KEY_WRAP_PAD;
    const wrapped = session.wrapKey(mechanism, kek, targetKey);
    return Buffer.from(wrapped);
}
function unwrapKey(wrappedKey, kekLabel, newLabel, keyType = "AES", keyLength = 32) {
    const session = (0, pkcs11_service_1.getSession)();
    const kek = (0, key_manager_1.findKey)(kekLabel, "secret");
    const mechanism = GraphenePkcs11.MechanismEnum.AES_KEY_WRAP_PAD;
    return session.unwrapKey(mechanism, kek, wrappedKey, {
        class: keyType === "AES"
            ? GraphenePkcs11.ObjectClass.SECRET_KEY
            : GraphenePkcs11.ObjectClass.PRIVATE_KEY,
        keyType: keyType === "AES"
            ? GraphenePkcs11.KeyType.AES
            : GraphenePkcs11.KeyType.EC,
        label: newLabel,
        token: false,
        sensitive: true,
        extractable: false,
        valueLen: keyType === "AES" ? keyLength : undefined,
    });
}
