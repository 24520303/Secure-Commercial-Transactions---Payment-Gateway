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
exports.encryptAesGcm = encryptAesGcm;
exports.decryptAesGcm = decryptAesGcm;
const GraphenePkcs11 = __importStar(require("graphene-pk11"));
const pkcs11_service_1 = require("./pkcs11.service");
const key_manager_1 = require("./key-manager");
function encryptAesGcm(keyLabel, plaintext) {
    const session = (0, pkcs11_service_1.getSession)();
    const key = (0, key_manager_1.findKey)(keyLabel, "secret");
    const iv = Buffer.from(session.generateRandom(12));
    const dec = Buffer.alloc(plaintext.length - 16);
    const cipher = session.createCipher({ name: "AES_GCM", params: new GraphenePkcs11.AesGcmParams(iv, Buffer.alloc(0), 128) }, key);
    cipher.once(plaintext, dec);
    const raw = Buffer.from(cipher.final());
    // GCM: last 16 bytes = auth tag
    const ciphertext = raw.subarray(0, raw.length - 16);
    const tag = raw.subarray(raw.length - 16);
    return { ciphertext, iv, tag };
}
function decryptAesGcm(keyLabel, ciphertext, iv, tag) {
    const session = (0, pkcs11_service_1.getSession)();
    const key = (0, key_manager_1.findKey)(keyLabel, "secret");
    const payload = Buffer.concat([ciphertext, tag]);
    const dec = Buffer.alloc(payload.length);
    const decipher = session.createDecipher({ name: "AES_GCM", params: new GraphenePkcs11.AesGcmParams(iv, Buffer.alloc(0), 128) }, key);
    return Buffer.from(decipher.once(payload, dec));
}
